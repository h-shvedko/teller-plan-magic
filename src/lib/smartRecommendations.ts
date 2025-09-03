import { Recipe } from '../integrations/supabase/types'

export interface UserTasteProfile {
  userId: string
  cuisinePreferences: Record<string, number>
  flavorProfiles: Record<string, number>
  ingredientAffinities: Record<string, number>
  cookingTimePreference: number
  difficultyPreference: number
  dietaryRestrictions: string[]
  seasonalPreferences: Record<string, number>
  mealTypePreferences: Record<string, number>
  lastUpdated: Date
}

export interface MealPlanSuccess {
  mealPlanId: string
  userId: string
  plannedMeals: string[]
  actuallyCooked: string[]
  partiallyCooked: string[]
  skippedMeals: string[]
  successRate: number
  createdAt: Date
  completedAt?: Date
}

export interface UserInteraction {
  userId: string
  recipeId: string
  interactionType: 'view' | 'like' | 'save' | 'cook' | 'rate' | 'skip'
  rating?: number
  cookingTime?: number
  difficulty?: number
  timestamp: Date
}

export interface RecommendationScore {
  recipeId: string
  score: number
  reasons: string[]
  confidence: number
  category: 'taste_match' | 'seasonal' | 'success_pattern' | 'trending' | 'personalized'
}

export interface SeasonalContext {
  currentSeason: 'spring' | 'summer' | 'fall' | 'winter'
  localIngredients: string[]
  weatherPattern: 'cold' | 'warm' | 'mild'
  holidayContext?: string
}

export class SmartRecommendationEngine {
  private readonly TASTE_PROFILE_WEIGHTS = {
    cuisine: 0.25,
    flavor: 0.20,
    ingredient: 0.15,
    cookingTime: 0.10,
    difficulty: 0.10,
    seasonal: 0.15,
    mealType: 0.05
  }

  private readonly SUCCESS_RATE_THRESHOLD = 0.7
  private readonly MIN_INTERACTIONS_FOR_PROFILE = 10

  async generateRecommendations(
    userId: string,
    recipes: Recipe[],
    limit: number = 10,
    context?: {
      mealType?: string
      timeAvailable?: number
      seasonalContext?: SeasonalContext
    }
  ): Promise<RecommendationScore[]> {
    const tasteProfile = await this.getUserTasteProfile(userId)
    const successHistory = await this.getMealPlanSuccessHistory(userId)
    const interactions = await this.getUserInteractions(userId)
    
    const scoredRecommendations = recipes.map(recipe => {
      const score = this.calculateRecommendationScore(
        recipe,
        tasteProfile,
        successHistory,
        interactions,
        context
      )
      return score
    })

    return scoredRecommendations
      .filter(rec => rec.confidence > 0.3)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  }

  private calculateRecommendationScore(
    recipe: Recipe,
    tasteProfile: UserTasteProfile | null,
    successHistory: MealPlanSuccess[],
    interactions: UserInteraction[],
    context?: {
      mealType?: string
      timeAvailable?: number
      seasonalContext?: SeasonalContext
    }
  ): RecommendationScore {
    let score = 0
    const reasons: string[] = []
    let confidence = 0.5

    if (!tasteProfile) {
      return this.getDefaultRecommendationScore(recipe, context)
    }

    const cuisineScore = this.calculateCuisineScore(recipe, tasteProfile)
    const flavorScore = this.calculateFlavorScore(recipe, tasteProfile)
    const ingredientScore = this.calculateIngredientScore(recipe, tasteProfile)
    const timeScore = this.calculateTimeScore(recipe, tasteProfile, context)
    const difficultyScore = this.calculateDifficultyScore(recipe, tasteProfile)
    const seasonalScore = this.calculateSeasonalScore(recipe, tasteProfile, context)
    const successPatternScore = this.calculateSuccessPatternScore(recipe, successHistory)
    const interactionScore = this.calculateInteractionScore(recipe, interactions)

    score = (
      cuisineScore * this.TASTE_PROFILE_WEIGHTS.cuisine +
      flavorScore * this.TASTE_PROFILE_WEIGHTS.flavor +
      ingredientScore * this.TASTE_PROFILE_WEIGHTS.ingredient +
      timeScore * this.TASTE_PROFILE_WEIGHTS.cookingTime +
      difficultyScore * this.TASTE_PROFILE_WEIGHTS.difficulty +
      seasonalScore * this.TASTE_PROFILE_WEIGHTS.seasonal
    )

    score = (score * 0.7) + (successPatternScore * 0.2) + (interactionScore * 0.1)

    confidence = Math.min(
      interactions.length / this.MIN_INTERACTIONS_FOR_PROFILE,
      1.0
    )

    if (cuisineScore > 0.8) reasons.push('Matches your cuisine preferences')
    if (flavorScore > 0.8) reasons.push('Perfect flavor profile match')
    if (ingredientScore > 0.8) reasons.push('Uses ingredients you love')
    if (seasonalScore > 0.8) reasons.push('Perfect for the season')
    if (successPatternScore > 0.8) reasons.push('Similar to recipes you actually cook')
    if (interactionScore > 0.8) reasons.push('Based on your recent activity')

    const category = this.determineRecommendationCategory(
      cuisineScore,
      seasonalScore,
      successPatternScore,
      interactionScore
    )

    return {
      recipeId: recipe.id,
      score: Math.max(0, Math.min(1, score)),
      reasons,
      confidence,
      category
    }
  }

  private calculateCuisineScore(recipe: Recipe, profile: UserTasteProfile): number {
    const recipeCuisine = recipe.cuisine_type || 'international'
    return profile.cuisinePreferences[recipeCuisine] || 0.3
  }

  private calculateFlavorScore(recipe: Recipe, profile: UserTasteProfile): number {
    if (!recipe.tags) return 0.5

    const recipeFlavorTags = recipe.tags.filter(tag => 
      ['spicy', 'sweet', 'savory', 'tangy', 'umami', 'bitter'].includes(tag.toLowerCase())
    )

    if (recipeFlavorTags.length === 0) return 0.5

    const scores = recipeFlavorTags.map(flavor => 
      profile.flavorProfiles[flavor.toLowerCase()] || 0.3
    )

    return scores.reduce((sum, score) => sum + score, 0) / scores.length
  }

  private calculateIngredientScore(recipe: Recipe, profile: UserTasteProfile): number {
    if (!recipe.ingredients || recipe.ingredients.length === 0) return 0.5

    const ingredientScores = recipe.ingredients.map(ingredient => {
      const ingredientName = ingredient.name?.toLowerCase() || ''
      return profile.ingredientAffinities[ingredientName] || 0.3
    })

    return ingredientScores.reduce((sum, score) => sum + score, 0) / ingredientScores.length
  }

  private calculateTimeScore(
    recipe: Recipe, 
    profile: UserTasteProfile, 
    context?: { timeAvailable?: number }
  ): number {
    const recipeTime = recipe.prep_time + recipe.cook_time
    const preferredTime = profile.cookingTimePreference

    if (context?.timeAvailable && recipeTime > context.timeAvailable) {
      return 0.1
    }

    const timeDiff = Math.abs(recipeTime - preferredTime) / preferredTime
    return Math.max(0.1, 1 - timeDiff)
  }

  private calculateDifficultyScore(recipe: Recipe, profile: UserTasteProfile): number {
    const recipeDifficulty = recipe.difficulty || 3
    const preferredDifficulty = profile.difficultyPreference

    const difficultyDiff = Math.abs(recipeDifficulty - preferredDifficulty) / 5
    return Math.max(0.1, 1 - difficultyDiff)
  }

  private calculateSeasonalScore(
    recipe: Recipe, 
    profile: UserTasteProfile, 
    context?: { seasonalContext?: SeasonalContext }
  ): number {
    const currentSeason = context?.seasonalContext?.currentSeason || this.getCurrentSeason()
    const seasonalPreference = profile.seasonalPreferences[currentSeason] || 0.5

    if (!recipe.tags) return seasonalPreference

    const seasonalTags = recipe.tags.filter(tag => 
      ['spring', 'summer', 'fall', 'winter', 'seasonal'].includes(tag.toLowerCase())
    )

    if (seasonalTags.includes(currentSeason)) {
      return Math.min(1, seasonalPreference * 1.5)
    }

    if (context?.seasonalContext?.localIngredients && recipe.ingredients) {
      const localIngredientMatch = recipe.ingredients.some(ingredient =>
        context.seasonalContext!.localIngredients.includes(ingredient.name?.toLowerCase() || '')
      )
      if (localIngredientMatch) {
        return Math.min(1, seasonalPreference * 1.2)
      }
    }

    return seasonalPreference
  }

  private calculateSuccessPatternScore(recipe: Recipe, successHistory: MealPlanSuccess[]): number {
    if (successHistory.length === 0) return 0.5

    const avgSuccessRate = successHistory.reduce((sum, history) => sum + history.successRate, 0) / successHistory.length

    const similarRecipes = successHistory.flatMap(history => history.actuallyCooked)
    const cuisineMatches = similarRecipes.filter(cookedRecipeId => {
      return recipe.cuisine_type === recipe.cuisine_type
    }).length

    const patternScore = (avgSuccessRate * 0.7) + (cuisineMatches / similarRecipes.length * 0.3)
    return Math.min(1, Math.max(0.1, patternScore))
  }

  private calculateInteractionScore(recipe: Recipe, interactions: UserInteraction[]): number {
    const recentInteractions = interactions
      .filter(interaction => {
        const daysSince = (Date.now() - interaction.timestamp.getTime()) / (1000 * 60 * 60 * 24)
        return daysSince <= 30
      })
      .slice(0, 20)

    if (recentInteractions.length === 0) return 0.5

    const interactionWeights = {
      view: 0.1,
      like: 0.3,
      save: 0.4,
      cook: 0.8,
      rate: 0.6,
      skip: -0.2
    }

    const recipeInteractions = recentInteractions.filter(i => i.recipeId === recipe.id)
    if (recipeInteractions.length === 0) return 0.5

    const interactionScore = recipeInteractions.reduce((sum, interaction) => {
      const baseWeight = interactionWeights[interaction.interactionType]
      const ratingMultiplier = interaction.rating ? interaction.rating / 5 : 1
      return sum + (baseWeight * ratingMultiplier)
    }, 0) / recipeInteractions.length

    return Math.max(0, Math.min(1, (interactionScore + 1) / 2))
  }

  private determineRecommendationCategory(
    cuisineScore: number,
    seasonalScore: number,
    successPatternScore: number,
    interactionScore: number
  ): RecommendationScore['category'] {
    const scores = {
      taste_match: cuisineScore,
      seasonal: seasonalScore,
      success_pattern: successPatternScore,
      personalized: interactionScore,
      trending: 0.5
    }

    const maxCategory = Object.entries(scores).reduce((max, [category, score]) => 
      score > max.score ? { category: category as RecommendationScore['category'], score } : max,
      { category: 'trending' as RecommendationScore['category'], score: 0 }
    )

    return maxCategory.category
  }

  private getDefaultRecommendationScore(
    recipe: Recipe, 
    context?: { mealType?: string; timeAvailable?: number }
  ): RecommendationScore {
    let score = 0.5
    const reasons = ['Popular recipe']

    if (context?.timeAvailable && recipe.prep_time + recipe.cook_time <= context.timeAvailable) {
      score += 0.2
      reasons.push('Fits your available time')
    }

    if (context?.mealType && recipe.meal_type === context.mealType) {
      score += 0.1
      reasons.push(`Perfect for ${context.mealType}`)
    }

    return {
      recipeId: recipe.id,
      score: Math.min(1, score),
      reasons,
      confidence: 0.3,
      category: 'trending'
    }
  }

  private getCurrentSeason(): 'spring' | 'summer' | 'fall' | 'winter' {
    const month = new Date().getMonth()
    if (month >= 2 && month <= 4) return 'spring'
    if (month >= 5 && month <= 7) return 'summer'
    if (month >= 8 && month <= 10) return 'fall'
    return 'winter'
  }

  async updateTasteProfile(userId: string, interaction: UserInteraction): Promise<void> {
  }

  async trackMealPlanSuccess(success: MealPlanSuccess): Promise<void> {
  }

  async getUserTasteProfile(userId: string): Promise<UserTasteProfile | null> {
    return null
  }

  async getMealPlanSuccessHistory(userId: string): Promise<MealPlanSuccess[]> {
    return []
  }

  async getUserInteractions(userId: string): Promise<UserInteraction[]> {
    return []
  }

  async learnFromUserFeedback(
    userId: string,
    recipeId: string,
    feedback: {
      liked: boolean
      actualCookingTime?: number
      actualDifficulty?: number
      wouldCookAgain: boolean
    }
  ): Promise<void> {
    const interaction: UserInteraction = {
      userId,
      recipeId,
      interactionType: feedback.liked ? 'like' : 'skip',
      cookingTime: feedback.actualCookingTime,
      difficulty: feedback.actualDifficulty,
      rating: feedback.wouldCookAgain ? 5 : 2,
      timestamp: new Date()
    }

    await this.updateTasteProfile(userId, interaction)
  }

  async adaptSeasonalPreferences(userId: string, currentSeason: string): Promise<void> {
    const profile = await this.getUserTasteProfile(userId)
    if (!profile) return

    const recentInteractions = await this.getUserInteractions(userId)
    const seasonalInteractions = recentInteractions.filter(interaction => {
      const interactionSeason = this.getSeasonFromDate(interaction.timestamp)
      return interactionSeason === currentSeason
    })

    if (seasonalInteractions.length < 5) return

    const seasonalCookingPatterns = this.analyzeCookingPatterns(seasonalInteractions)
    
    profile.seasonalPreferences[currentSeason] = Math.min(1, 
      profile.seasonalPreferences[currentSeason] * 0.8 + 
      seasonalCookingPatterns.avgRating * 0.2
    )
  }

  private getSeasonFromDate(date: Date): string {
    const month = date.getMonth()
    if (month >= 2 && month <= 4) return 'spring'
    if (month >= 5 && month <= 7) return 'summer'
    if (month >= 8 && month <= 10) return 'fall'
    return 'winter'
  }

  private analyzeCookingPatterns(interactions: UserInteraction[]): { avgRating: number; mostCooked: string[] } {
    const ratings = interactions.filter(i => i.rating).map(i => i.rating!)
    const avgRating = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : 3

    const cookedRecipes = interactions.filter(i => i.interactionType === 'cook')
    const recipeCounts = cookedRecipes.reduce((counts, interaction) => {
      counts[interaction.recipeId] = (counts[interaction.recipeId] || 0) + 1
      return counts
    }, {} as Record<string, number>)

    const mostCooked = Object.entries(recipeCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([recipeId]) => recipeId)

    return { avgRating, mostCooked }
  }

  async getPersonalizedMealPlan(
    userId: string,
    daysCount: number,
    preferences: {
      targetCalories?: number
      dietaryRestrictions?: string[]
      excludeIngredients?: string[]
      mealTypes: string[]
    }
  ): Promise<{ day: number; mealType: string; recommendedRecipes: RecommendationScore[] }[]> {
    const recommendations: { day: number; mealType: string; recommendedRecipes: RecommendationScore[] }[] = []

    for (let day = 1; day <= daysCount; day++) {
      for (const mealType of preferences.mealTypes) {
        const mealRecommendations = await this.generateRecommendations(
          userId,
          [], 
          3,
          { mealType }
        )

        recommendations.push({
          day,
          mealType,
          recommendedRecipes: mealRecommendations
        })
      }
    }

    return recommendations
  }
}

export const smartRecommendationEngine = new SmartRecommendationEngine()