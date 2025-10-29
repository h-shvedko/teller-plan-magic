import { createClient } from '@/integrations/supabase/client'

// Enhanced AI service with advanced capabilities for recipe analysis and creation
export class EnhancedAIService {
  private supabase = createClient()

  // Fine-tuned OpenAI models for specialized recipe tasks
  private models = {
    recipeCreation: 'ft:gpt-4-0613:teller-plan:recipe-creation:abc123',
    nutritionAnalysis: 'ft:gpt-4-0613:teller-plan:nutrition:def456',
    mealTiming: 'ft:gpt-3.5-turbo-0613:teller-plan:timing:ghi789',
    recipeParser: 'ft:gpt-4-0613:teller-plan:parser:jkl012'
  }

  // Improved OpenAI integration with fine-tuned models
  async generateRecipeWithFineTunedModel(prompt: string, preferences: RecipePreferences): Promise<EnhancedRecipe> {
    try {
      const { data, error } = await this.supabase.functions.invoke('enhanced-ai-recipe-generation', {
        body: {
          model: this.models.recipeCreation,
          prompt,
          preferences,
          temperature: 0.7,
          max_tokens: 2000,
          fine_tuning_data: {
            cuisine_expertise: preferences.cuisine,
            dietary_restrictions: preferences.dietaryRestrictions,
            skill_level: preferences.skillLevel,
            cooking_time_preference: preferences.maxCookingTime
          }
        }
      })

      if (error) throw error

      return this.parseEnhancedRecipeResponse(data.recipe)
    } catch (error) {
      console.error('Fine-tuned recipe generation failed:', error)
      throw new Error('Failed to generate recipe with enhanced AI')
    }
  }

  // Image recognition for recipe creation from photos
  async analyzeRecipeImage(imageFile: File): Promise<RecipeFromImage> {
    try {
      // Convert image to base64 for API transmission
      const base64Image = await this.convertImageToBase64(imageFile)

      const { data, error } = await this.supabase.functions.invoke('ai-image-recipe-analysis', {
        body: {
          image: base64Image,
          model: 'gpt-4-vision-preview',
          analysis_type: 'recipe_extraction',
          detail_level: 'high',
          features: [
            'ingredient_identification',
            'cooking_method_detection',
            'portion_estimation',
            'presentation_analysis',
            'dietary_assessment'
          ]
        }
      })

      if (error) throw error

      return {
        detectedIngredients: data.ingredients || [],
        estimatedRecipe: data.recipe || null,
        cookingMethods: data.cooking_methods || [],
        dietaryInfo: data.dietary_info || {},
        confidenceScore: data.confidence || 0,
        visualElements: data.visual_elements || {},
        suggestions: data.improvement_suggestions || []
      }
    } catch (error) {
      console.error('Image recipe analysis failed:', error)
      throw new Error('Failed to analyze recipe image')
    }
  }

  // Natural language recipe parsing from unstructured text
  async parseNaturalLanguageRecipe(recipeText: string): Promise<ParsedRecipe> {
    try {
      const { data, error } = await this.supabase.functions.invoke('ai-recipe-parser', {
        body: {
          model: this.models.recipeParser,
          recipe_text: recipeText,
          parsing_strategy: 'comprehensive',
          extract_features: [
            'ingredients_with_quantities',
            'step_by_step_instructions',
            'cooking_times',
            'temperatures',
            'equipment_needed',
            'serving_size',
            'difficulty_level',
            'dietary_tags'
          ],
          normalize_units: true,
          detect_substitutions: true
        }
      })

      if (error) throw error

      return {
        title: data.title || '',
        description: data.description || '',
        ingredients: data.ingredients || [],
        instructions: data.instructions || [],
        prepTime: data.prep_time || 0,
        cookTime: data.cook_time || 0,
        servings: data.servings || 1,
        difficulty: data.difficulty || 'medium',
        equipment: data.equipment || [],
        tags: data.tags || [],
        nutritionEstimate: data.nutrition || null,
        parsingConfidence: data.confidence || 0,
        extractedData: {
          temperatures: data.temperatures || [],
          timings: data.timings || [],
          techniques: data.techniques || [],
          substitutions: data.possible_substitutions || []
        }
      }
    } catch (error) {
      console.error('Natural language recipe parsing failed:', error)
      throw new Error('Failed to parse recipe text')
    }
  }

  // AI-powered nutrition analysis with detailed breakdown
  async analyzeNutrition(recipe: Recipe, servingSize?: number): Promise<DetailedNutritionAnalysis> {
    try {
      const { data, error } = await this.supabase.functions.invoke('ai-nutrition-analysis', {
        body: {
          model: this.models.nutritionAnalysis,
          recipe,
          serving_size: servingSize || recipe.servings || 1,
          analysis_depth: 'comprehensive',
          include_features: [
            'macronutrients',
            'micronutrients',
            'vitamins_minerals',
            'dietary_fiber',
            'antioxidants',
            'glycemic_impact',
            'allergen_analysis',
            'health_score',
            'ingredient_synergies'
          ],
          dietary_context: {
            consider_cooking_methods: true,
            account_for_bioavailability: true,
            include_food_interactions: true
          }
        }
      })

      if (error) throw error

      return {
        perServing: {
          calories: data.calories || 0,
          protein: data.protein || 0,
          carbohydrates: data.carbs || 0,
          fat: data.fat || 0,
          fiber: data.fiber || 0,
          sugar: data.sugar || 0,
          sodium: data.sodium || 0
        },
        vitamins: data.vitamins || {},
        minerals: data.minerals || {},
        antioxidants: data.antioxidants || {},
        healthMetrics: {
          healthScore: data.health_score || 0,
          glycemicIndex: data.glycemic_index || 0,
          inflammatoryScore: data.inflammatory_score || 0,
          nutrientDensity: data.nutrient_density || 0
        },
        dietaryTags: data.dietary_tags || [],
        allergens: data.allergens || [],
        nutritionInsights: data.insights || [],
        ingredientContributions: data.ingredient_breakdown || [],
        recommendedPairings: data.pairing_suggestions || [],
        healthBenefits: data.health_benefits || [],
        nutritionConfidence: data.confidence || 0
      }
    } catch (error) {
      console.error('AI nutrition analysis failed:', error)
      throw new Error('Failed to analyze nutrition with AI')
    }
  }

  // Intelligent meal timing suggestions based on multiple factors
  async generateMealTimingSuggestions(params: MealTimingParams): Promise<MealTimingSuggestions> {
    try {
      const { data, error } = await this.supabase.functions.invoke('ai-meal-timing', {
        body: {
          model: this.models.mealTiming,
          user_profile: params.userProfile,
          recipes: params.recipes,
          preferences: params.preferences,
          constraints: params.constraints,
          analysis_factors: [
            'cooking_complexity',
            'prep_time_optimization',
            'ingredient_freshness',
            'energy_levels',
            'digestive_timing',
            'social_context',
            'seasonal_considerations',
            'nutritional_timing'
          ],
          optimization_goals: params.goals || ['time_efficiency', 'nutritional_balance', 'enjoyment']
        }
      })

      if (error) throw error

      return {
        dailySchedule: data.daily_schedule || {},
        weeklyPattern: data.weekly_pattern || {},
        mealPrepStrategy: data.prep_strategy || {},
        timingInsights: {
          optimalBreakfastTime: data.breakfast_timing || '7:00 AM',
          optimalLunchTime: data.lunch_timing || '12:30 PM',
          optimalDinnerTime: data.dinner_timing || '7:00 PM',
          snackWindows: data.snack_windows || [],
          cookingWindows: data.cooking_windows || []
        },
        prepSchedule: data.prep_schedule || {},
        shoppingTiming: data.shopping_timing || {},
        seasonalAdjustments: data.seasonal_adjustments || {},
        personalizedTips: data.personalized_tips || [],
        energyOptimization: data.energy_optimization || {},
        digestiveConsiderations: data.digestive_timing || {},
        confidenceScore: data.confidence || 0
      }
    } catch (error) {
      console.error('Meal timing AI analysis failed:', error)
      throw new Error('Failed to generate intelligent meal timing suggestions')
    }
  }

  // Advanced recipe suggestions with contextual AI
  async getContextualRecipeSuggestions(context: RecipeContext): Promise<ContextualRecipeSuggestion[]> {
    try {
      const { data, error } = await this.supabase.functions.invoke('ai-contextual-suggestions', {
        body: {
          model: this.models.recipeCreation,
          context,
          suggestion_count: 10,
          personalization_factors: [
            'past_cooking_history',
            'seasonal_preferences',
            'ingredient_availability',
            'skill_progression',
            'dietary_goals',
            'time_constraints',
            'social_context'
          ]
        }
      })

      if (error) throw error

      return data.suggestions || []
    } catch (error) {
      console.error('Contextual recipe suggestions failed:', error)
      return []
    }
  }

  // Image processing helper
  private async convertImageToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1]
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // Enhanced recipe response parser
  private parseEnhancedRecipeResponse(response: any): EnhancedRecipe {
    return {
      id: response.id || crypto.randomUUID(),
      title: response.title || '',
      description: response.description || '',
      ingredients: response.ingredients || [],
      instructions: response.instructions || [],
      prepTime: response.prep_time || 0,
      cookTime: response.cook_time || 0,
      totalTime: (response.prep_time || 0) + (response.cook_time || 0),
      servings: response.servings || 1,
      difficulty: response.difficulty || 'medium',
      cuisine: response.cuisine || '',
      dietaryTags: response.dietary_tags || [],
      equipment: response.equipment || [],
      techniques: response.techniques || [],
      tips: response.tips || [],
      variations: response.variations || [],
      nutritionInfo: response.nutrition || null,
      aiGenerated: true,
      confidenceScore: response.confidence || 0,
      createdAt: new Date().toISOString(),
      enhancedFeatures: {
        flavorProfile: response.flavor_profile || {},
        skillBuilding: response.skill_building || [],
        seasonalRelevance: response.seasonal_relevance || 0,
        customizationOptions: response.customization_options || []
      }
    }
  }
}

// Type definitions for enhanced AI capabilities
export interface RecipePreferences {
  cuisine: string[]
  dietaryRestrictions: string[]
  skillLevel: 'beginner' | 'intermediate' | 'advanced'
  maxCookingTime: number
  preferredIngredients: string[]
  avoidedIngredients: string[]
  equipment: string[]
}

export interface EnhancedRecipe {
  id: string
  title: string
  description: string
  ingredients: Ingredient[]
  instructions: Instruction[]
  prepTime: number
  cookTime: number
  totalTime: number
  servings: number
  difficulty: string
  cuisine: string
  dietaryTags: string[]
  equipment: string[]
  techniques: string[]
  tips: string[]
  variations: RecipeVariation[]
  nutritionInfo: NutritionInfo | null
  aiGenerated: boolean
  confidenceScore: number
  createdAt: string
  enhancedFeatures: {
    flavorProfile: FlavorProfile
    skillBuilding: string[]
    seasonalRelevance: number
    customizationOptions: CustomizationOption[]
  }
}

export interface RecipeFromImage {
  detectedIngredients: DetectedIngredient[]
  estimatedRecipe: Recipe | null
  cookingMethods: string[]
  dietaryInfo: DietaryInfo
  confidenceScore: number
  visualElements: VisualElements
  suggestions: string[]
}

export interface DetectedIngredient {
  name: string
  confidence: number
  estimatedQuantity: string
  freshness: number
  preparation: string
}

export interface VisualElements {
  presentation: string
  cookingStage: string
  portionSize: string
  colorProfile: string[]
  texture: string
}

export interface ParsedRecipe {
  title: string
  description: string
  ingredients: Ingredient[]
  instructions: Instruction[]
  prepTime: number
  cookTime: number
  servings: number
  difficulty: string
  equipment: string[]
  tags: string[]
  nutritionEstimate: NutritionInfo | null
  parsingConfidence: number
  extractedData: {
    temperatures: string[]
    timings: string[]
    techniques: string[]
    substitutions: Substitution[]
  }
}

export interface DetailedNutritionAnalysis {
  perServing: MacroNutrients
  vitamins: Record<string, number>
  minerals: Record<string, number>
  antioxidants: Record<string, number>
  healthMetrics: HealthMetrics
  dietaryTags: string[]
  allergens: string[]
  nutritionInsights: string[]
  ingredientContributions: IngredientNutrition[]
  recommendedPairings: string[]
  healthBenefits: string[]
  nutritionConfidence: number
}

export interface HealthMetrics {
  healthScore: number
  glycemicIndex: number
  inflammatoryScore: number
  nutrientDensity: number
}

export interface MealTimingParams {
  userProfile: UserProfile
  recipes: Recipe[]
  preferences: TimingPreferences
  constraints: TimeConstraint[]
  goals?: string[]
}

export interface MealTimingSuggestions {
  dailySchedule: Record<string, MealSlot>
  weeklyPattern: Record<string, DayPlan>
  mealPrepStrategy: PrepStrategy
  timingInsights: TimingInsights
  prepSchedule: PrepSchedule
  shoppingTiming: ShoppingSchedule
  seasonalAdjustments: SeasonalTiming
  personalizedTips: string[]
  energyOptimization: EnergyTiming
  digestiveConsiderations: DigestiveTiming
  confidenceScore: number
}

export interface TimingInsights {
  optimalBreakfastTime: string
  optimalLunchTime: string
  optimalDinnerTime: string
  snackWindows: TimeWindow[]
  cookingWindows: TimeWindow[]
}

export interface RecipeContext {
  currentSeason: string
  weather: WeatherInfo
  occasion: string
  guestCount: number
  availableTime: number
  kitchenEquipment: string[]
  pantryItems: string[]
  dietaryRestrictions: string[]
  moodPreference: string
  energyLevel: number
}

export interface ContextualRecipeSuggestion {
  recipe: Recipe
  relevanceScore: number
  reasoning: string
  adaptations: string[]
  timingSuggestion: string
  difficultyMatch: number
  ingredientAvailability: number
  contextualFit: string
}

// Additional supporting interfaces
export interface Ingredient {
  name: string
  quantity: string
  unit: string
  preparation?: string
  category?: string
  substitutions?: string[]
}

export interface Instruction {
  step: number
  description: string
  duration?: number
  temperature?: string
  techniques?: string[]
  tips?: string[]
}

export interface NutritionInfo {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  sugar: number
  sodium: number
}

export interface MacroNutrients extends NutritionInfo {
  saturatedFat?: number
  cholesterol?: number
  potassium?: number
}

export interface Recipe {
  id: string
  title: string
  description: string
  ingredients: Ingredient[]
  instructions: Instruction[]
  prepTime: number
  cookTime: number
  servings: number
  difficulty: string
  cuisine?: string
  tags?: string[]
}

// Export singleton instance
export const enhancedAI = new EnhancedAIService()