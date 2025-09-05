import { createClient } from '@/integrations/supabase/client';
import { differenceInDays, format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

export interface UserBehaviorData {
  userId: string;
  sessionId: string;
  timestamp: Date;
  action: 'view' | 'click' | 'cook' | 'save' | 'share' | 'rate' | 'search' | 'filter' | 'export';
  targetType: 'recipe' | 'meal_plan' | 'shopping_list' | 'user_profile' | 'analytics';
  targetId: string;
  metadata?: {
    duration?: number;
    scrollDepth?: number;
    searchQuery?: string;
    filterCriteria?: string[];
    deviceType?: 'mobile' | 'tablet' | 'desktop';
    location?: string;
  };
}

export interface RecipeSuccessMetrics {
  recipeId: string;
  totalAttempts: number;
  successfulCooks: number;
  successRate: number;
  averageRating: number;
  totalRatings: number;
  avgCookingTime: number;
  difficultyRating: number;
  popularityScore: number;
  completionRate: number;
  repeatCookRate: number;
}

export interface SeasonalPreference {
  userId: string;
  season: 'spring' | 'summer' | 'fall' | 'winter';
  cuisinePreferences: {
    cuisine: string;
    preference: number; // 0-1
    frequency: number;
  }[];
  ingredientPreferences: {
    ingredient: string;
    preference: number;
    seasonality: number;
  }[];
  cookingMethodPreferences: {
    method: string;
    preference: number;
    frequency: number;
  }[];
  averagePrice: number;
  healthScore: number;
  preparationTime: number;
}

export interface CostOptimization {
  optimizationId: string;
  userId: string;
  mealPlanId: string;
  originalCost: number;
  optimizedCost: number;
  savings: number;
  savingsPercentage: number;
  optimizations: {
    type: 'ingredient_substitution' | 'bulk_buying' | 'seasonal_ingredient' | 'store_selection' | 'portion_adjustment';
    description: string;
    savings: number;
    confidence: number;
  }[];
  implementationDifficulty: 'easy' | 'medium' | 'hard';
  nutritionalImpact: number; // -1 to 1
  tasteImpact: number; // -1 to 1
}

export interface AnalyticsInsight {
  id: string;
  type: 'behavior' | 'success' | 'seasonal' | 'cost' | 'trend';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  recommendations: string[];
  confidence: number;
  dataPoints: number;
  timestamp: Date;
}

class DataAnalyticsService {
  private supabase = createClient();

  // User Behavior Tracking
  async trackUserBehavior(data: UserBehaviorData): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('user_behavior_logs')
        .insert({
          user_id: data.userId,
          session_id: data.sessionId,
          timestamp: data.timestamp.toISOString(),
          action: data.action,
          target_type: data.targetType,
          target_id: data.targetId,
          metadata: data.metadata || {}
        });

      if (error) {
        console.error('Error tracking user behavior:', error);
      }

      // Update real-time analytics if session is active
      await this.updateRealtimeAnalytics(data);
    } catch (error) {
      console.error('Error in trackUserBehavior:', error);
    }
  }

  private async updateRealtimeAnalytics(data: UserBehaviorData): Promise<void> {
    // Update session analytics in real-time
    const sessionData = {
      session_id: data.sessionId,
      user_id: data.userId,
      last_activity: data.timestamp.toISOString(),
      total_actions: 1,
      page_views: data.action === 'view' ? 1 : 0,
      interactions: data.action !== 'view' ? 1 : 0
    };

    await this.supabase
      .from('session_analytics')
      .upsert(sessionData, { 
        onConflict: 'session_id',
        ignoreDuplicates: false 
      });
  }

  async getUserBehaviorAnalytics(userId: string, timeRange: 'day' | 'week' | 'month' | 'year'): Promise<{
    totalActions: number;
    topActions: { action: string; count: number }[];
    topTargets: { targetType: string; count: number }[];
    engagementScore: number;
    sessionDuration: number;
    deviceUsage: { device: string; percentage: number }[];
    peakHours: { hour: number; activity: number }[];
  }> {
    const { data, error } = await this.supabase
      .from('user_behavior_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('timestamp', this.getTimeRangeStart(timeRange).toISOString())
      .order('timestamp', { ascending: false });

    if (error || !data) {
      throw new Error(`Error fetching user behavior analytics: ${error?.message}`);
    }

    return this.analyzeUserBehavior(data);
  }

  private analyzeUserBehavior(behaviorLogs: any[]): {
    totalActions: number;
    topActions: { action: string; count: number }[];
    topTargets: { targetType: string; count: number }[];
    engagementScore: number;
    sessionDuration: number;
    deviceUsage: { device: string; percentage: number }[];
    peakHours: { hour: number; activity: number }[];
  } {
    const totalActions = behaviorLogs.length;
    
    // Top actions analysis
    const actionCounts = behaviorLogs.reduce((acc, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1;
      return acc;
    }, {});
    const topActions = Object.entries(actionCounts)
      .map(([action, count]) => ({ action, count: count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Top targets analysis
    const targetCounts = behaviorLogs.reduce((acc, log) => {
      acc[log.target_type] = (acc[log.target_type] || 0) + 1;
      return acc;
    }, {});
    const topTargets = Object.entries(targetCounts)
      .map(([targetType, count]) => ({ targetType, count: count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Engagement score calculation
    const engagementWeights = {
      view: 1,
      click: 2,
      save: 3,
      share: 4,
      cook: 5,
      rate: 4
    };
    const engagementScore = behaviorLogs.reduce((total, log) => {
      return total + (engagementWeights[log.action as keyof typeof engagementWeights] || 1);
    }, 0) / Math.max(totalActions, 1);

    // Session duration analysis
    const sessions = behaviorLogs.reduce((acc, log) => {
      if (!acc[log.session_id]) {
        acc[log.session_id] = [];
      }
      acc[log.session_id].push(new Date(log.timestamp));
      return acc;
    }, {} as Record<string, Date[]>);

    const sessionDurations = Object.values(sessions).map(timestamps => {
      const sorted = timestamps.sort((a, b) => a.getTime() - b.getTime());
      return sorted.length > 1 ? 
        (sorted[sorted.length - 1].getTime() - sorted[0].getTime()) / 1000 / 60 : 0;
    });
    const sessionDuration = sessionDurations.reduce((sum, duration) => sum + duration, 0) / Math.max(sessionDurations.length, 1);

    // Device usage analysis
    const deviceCounts = behaviorLogs.reduce((acc, log) => {
      const device = log.metadata?.deviceType || 'unknown';
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {});
    const totalDeviceActions = Object.values(deviceCounts).reduce((sum: number, count) => sum + (count as number), 0);
    const deviceUsage = Object.entries(deviceCounts).map(([device, count]) => ({
      device,
      percentage: Math.round((count as number) / totalDeviceActions * 100)
    }));

    // Peak hours analysis
    const hourCounts = Array(24).fill(0);
    behaviorLogs.forEach(log => {
      const hour = new Date(log.timestamp).getHours();
      hourCounts[hour]++;
    });
    const peakHours = hourCounts.map((activity, hour) => ({ hour, activity }))
      .sort((a, b) => b.activity - a.activity)
      .slice(0, 6);

    return {
      totalActions,
      topActions,
      topTargets,
      engagementScore,
      sessionDuration,
      deviceUsage,
      peakHours
    };
  }

  // Recipe Success Rate Analytics
  async getRecipeSuccessAnalytics(recipeId?: string): Promise<RecipeSuccessMetrics[]> {
    const query = this.supabase
      .from('recipe_cooking_logs')
      .select(`
        recipe_id,
        success,
        rating,
        actual_cooking_time,
        difficulty_rating
      `);

    if (recipeId) {
      query.eq('recipe_id', recipeId);
    }

    const { data: cookingLogs, error } = await query;

    if (error) {
      throw new Error(`Error fetching recipe success data: ${error.message}`);
    }

    // Group by recipe and calculate metrics
    const recipeGroups = cookingLogs?.reduce((acc, log) => {
      if (!acc[log.recipe_id]) {
        acc[log.recipe_id] = [];
      }
      acc[log.recipe_id].push(log);
      return acc;
    }, {} as Record<string, any[]>) || {};

    return Object.entries(recipeGroups).map(([recipeId, logs]) => 
      this.calculateRecipeSuccessMetrics(recipeId, logs)
    );
  }

  private calculateRecipeSuccessMetrics(recipeId: string, logs: any[]): RecipeSuccessMetrics {
    const totalAttempts = logs.length;
    const successfulCooks = logs.filter(log => log.success).length;
    const successRate = totalAttempts > 0 ? successfulCooks / totalAttempts : 0;
    
    const ratings = logs.filter(log => log.rating).map(log => log.rating);
    const averageRating = ratings.length > 0 ? 
      ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : 0;
    
    const cookingTimes = logs.filter(log => log.actual_cooking_time).map(log => log.actual_cooking_time);
    const avgCookingTime = cookingTimes.length > 0 ?
      cookingTimes.reduce((sum, time) => sum + time, 0) / cookingTimes.length : 0;
    
    const difficultyRatings = logs.filter(log => log.difficulty_rating).map(log => log.difficulty_rating);
    const difficultyRating = difficultyRatings.length > 0 ?
      difficultyRatings.reduce((sum, rating) => sum + rating, 0) / difficultyRatings.length : 0;
    
    // Calculate popularity score based on attempts, success rate, and recency
    const recentAttempts = logs.filter(log => 
      differenceInDays(new Date(), new Date(log.created_at)) <= 30
    ).length;
    const popularityScore = (totalAttempts * 0.4) + (successRate * 0.4) + (recentAttempts * 0.2);
    
    // Calculate completion rate (users who finished vs started)
    const completionRate = successRate; // Simplified - in real implementation would track start/finish events
    
    // Calculate repeat cook rate
    const userCounts = logs.reduce((acc, log) => {
      acc[log.user_id] = (acc[log.user_id] || 0) + 1;
      return acc;
    }, {});
    const usersWithMultipleCooks = Object.values(userCounts).filter(count => (count as number) > 1).length;
    const totalUsers = Object.keys(userCounts).length;
    const repeatCookRate = totalUsers > 0 ? usersWithMultipleCooks / totalUsers : 0;

    return {
      recipeId,
      totalAttempts,
      successfulCooks,
      successRate,
      averageRating,
      totalRatings: ratings.length,
      avgCookingTime,
      difficultyRating,
      popularityScore,
      completionRate,
      repeatCookRate
    };
  }

  // Seasonal Preference Analysis
  async getSeasonalPreferenceAnalysis(userId?: string): Promise<SeasonalPreference[]> {
    const query = this.supabase
      .from('user_meal_history')
      .select(`
        user_id,
        recipe_id,
        cooked_date,
        recipe:recipes (
          cuisine,
          ingredients,
          cooking_method,
          estimated_cost,
          health_score,
          preparation_time
        )
      `);

    if (userId) {
      query.eq('user_id', userId);
    }

    const { data: mealHistory, error } = await query;

    if (error) {
      throw new Error(`Error fetching meal history: ${error.message}`);
    }

    // Group by user and season
    const userSeasonGroups = mealHistory?.reduce((acc, meal) => {
      const season = this.getSeason(new Date(meal.cooked_date));
      const key = `${meal.user_id}-${season}`;
      
      if (!acc[key]) {
        acc[key] = {
          userId: meal.user_id,
          season,
          meals: []
        };
      }
      acc[key].meals.push(meal);
      return acc;
    }, {} as Record<string, any>) || {};

    return Object.values(userSeasonGroups).map(group => 
      this.analyzeSeasonalPreferences(group)
    );
  }

  private getSeason(date: Date): 'spring' | 'summer' | 'fall' | 'winter' {
    const month = date.getMonth() + 1;
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'fall';
    return 'winter';
  }

  private analyzeSeasonalPreferences(seasonData: any): SeasonalPreference {
    const { userId, season, meals } = seasonData;
    
    // Cuisine preferences
    const cuisineCounts = meals.reduce((acc: any, meal: any) => {
      const cuisine = meal.recipe?.cuisine || 'unknown';
      acc[cuisine] = (acc[cuisine] || 0) + 1;
      return acc;
    }, {});
    
    const totalMeals = meals.length;
    const cuisinePreferences = Object.entries(cuisineCounts).map(([cuisine, count]) => ({
      cuisine,
      preference: (count as number) / totalMeals,
      frequency: count as number
    }));

    // Ingredient preferences
    const ingredientCounts = meals.reduce((acc: any, meal: any) => {
      const ingredients = meal.recipe?.ingredients || [];
      ingredients.forEach((ingredient: string) => {
        acc[ingredient] = (acc[ingredient] || 0) + 1;
      });
      return acc;
    }, {});
    
    const ingredientPreferences = Object.entries(ingredientCounts).map(([ingredient, count]) => ({
      ingredient,
      preference: (count as number) / totalMeals,
      seasonality: this.getIngredientSeasonality(ingredient, season)
    }));

    // Cooking method preferences
    const methodCounts = meals.reduce((acc: any, meal: any) => {
      const method = meal.recipe?.cooking_method || 'unknown';
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {});
    
    const cookingMethodPreferences = Object.entries(methodCounts).map(([method, count]) => ({
      method,
      preference: (count as number) / totalMeals,
      frequency: count as number
    }));

    // Calculate averages
    const costs = meals.filter((m: any) => m.recipe?.estimated_cost).map((m: any) => m.recipe.estimated_cost);
    const averagePrice = costs.length > 0 ? costs.reduce((sum: number, cost: number) => sum + cost, 0) / costs.length : 0;
    
    const healthScores = meals.filter((m: any) => m.recipe?.health_score).map((m: any) => m.recipe.health_score);
    const healthScore = healthScores.length > 0 ? healthScores.reduce((sum: number, score: number) => sum + score, 0) / healthScores.length : 0;
    
    const prepTimes = meals.filter((m: any) => m.recipe?.preparation_time).map((m: any) => m.recipe.preparation_time);
    const preparationTime = prepTimes.length > 0 ? prepTimes.reduce((sum: number, time: number) => sum + time, 0) / prepTimes.length : 0;

    return {
      userId,
      season,
      cuisinePreferences,
      ingredientPreferences,
      cookingMethodPreferences,
      averagePrice,
      healthScore,
      preparationTime
    };
  }

  private getIngredientSeasonality(ingredient: string, season: 'spring' | 'summer' | 'fall' | 'winter'): number {
    // Simplified seasonality scoring - in real implementation would use comprehensive ingredient database
    const seasonalIngredients = {
      spring: ['asparagus', 'peas', 'strawberries', 'artichokes', 'spring onions'],
      summer: ['tomatoes', 'corn', 'zucchini', 'berries', 'peppers'],
      fall: ['pumpkin', 'squash', 'apples', 'brussels sprouts', 'sweet potatoes'],
      winter: ['root vegetables', 'citrus', 'cabbage', 'potatoes', 'onions']
    };

    return seasonalIngredients[season].some(seasonal => 
      ingredient.toLowerCase().includes(seasonal.toLowerCase())
    ) ? 1.0 : 0.5;
  }

  // Cost Optimization Algorithms
  async generateCostOptimizations(mealPlanId: string, userId: string): Promise<CostOptimization> {
    // Fetch meal plan data
    const { data: mealPlan, error } = await this.supabase
      .from('meal_plans')
      .select(`
        *,
        meal_plan_items (
          recipe_id,
          quantity,
          recipe:recipes (*)
        )
      `)
      .eq('id', mealPlanId)
      .eq('user_id', userId)
      .single();

    if (error || !mealPlan) {
      throw new Error(`Error fetching meal plan: ${error?.message}`);
    }

    const originalCost = this.calculateOriginalCost(mealPlan);
    const optimizations = await this.findOptimizations(mealPlan);
    
    const optimizedCost = originalCost - optimizations.reduce((sum, opt) => sum + opt.savings, 0);
    const savings = originalCost - optimizedCost;
    const savingsPercentage = originalCost > 0 ? (savings / originalCost) * 100 : 0;

    const nutritionalImpact = this.calculateNutritionalImpact(optimizations);
    const tasteImpact = this.calculateTasteImpact(optimizations);
    const implementationDifficulty = this.calculateImplementationDifficulty(optimizations);

    return {
      optimizationId: `opt_${Date.now()}`,
      userId,
      mealPlanId,
      originalCost,
      optimizedCost,
      savings,
      savingsPercentage,
      optimizations,
      implementationDifficulty,
      nutritionalImpact,
      tasteImpact
    };
  }

  private calculateOriginalCost(mealPlan: any): number {
    return mealPlan.meal_plan_items.reduce((total: number, item: any) => {
      const recipeCost = item.recipe?.estimated_cost || 0;
      return total + (recipeCost * item.quantity);
    }, 0);
  }

  private async findOptimizations(mealPlan: any): Promise<CostOptimization['optimizations']> {
    const optimizations: CostOptimization['optimizations'] = [];

    // Ingredient substitution optimizations
    for (const item of mealPlan.meal_plan_items) {
      const substitutions = await this.findIngredientSubstitutions(item.recipe);
      optimizations.push(...substitutions);
    }

    // Bulk buying optimizations
    const bulkOptimizations = this.findBulkBuyingOpportunities(mealPlan);
    optimizations.push(...bulkOptimizations);

    // Seasonal ingredient optimizations
    const seasonalOptimizations = this.findSeasonalOptimizations(mealPlan);
    optimizations.push(...seasonalOptimizations);

    // Store selection optimizations
    const storeOptimizations = await this.findStoreOptimizations(mealPlan);
    optimizations.push(...storeOptimizations);

    // Portion adjustment optimizations
    const portionOptimizations = this.findPortionOptimizations(mealPlan);
    optimizations.push(...portionOptimizations);

    return optimizations.sort((a, b) => b.savings - a.savings);
  }

  private async findIngredientSubstitutions(recipe: any): Promise<CostOptimization['optimizations']> {
    const substitutions: CostOptimization['optimizations'] = [];
    
    // Mock ingredient substitution logic
    const expensiveIngredients = ['saffron', 'truffle oil', 'wagyu beef', 'organic'];
    const ingredients = recipe.ingredients || [];
    
    ingredients.forEach((ingredient: string) => {
      expensiveIngredients.forEach(expensive => {
        if (ingredient.toLowerCase().includes(expensive.toLowerCase())) {
          substitutions.push({
            type: 'ingredient_substitution',
            description: `Replace ${ingredient} with cost-effective alternative`,
            savings: Math.random() * 5 + 1, // $1-6 savings
            confidence: 0.8
          });
        }
      });
    });

    return substitutions;
  }

  private findBulkBuyingOpportunities(mealPlan: any): CostOptimization['optimizations'] {
    const bulkOptimizations: CostOptimization['optimizations'] = [];
    
    // Analyze ingredient frequency across meal plan
    const ingredientFrequency: Record<string, number> = {};
    
    mealPlan.meal_plan_items.forEach((item: any) => {
      const ingredients = item.recipe?.ingredients || [];
      ingredients.forEach((ingredient: string) => {
        ingredientFrequency[ingredient] = (ingredientFrequency[ingredient] || 0) + item.quantity;
      });
    });

    // Find ingredients used multiple times that could benefit from bulk buying
    Object.entries(ingredientFrequency).forEach(([ingredient, frequency]) => {
      if (frequency >= 3) {
        bulkOptimizations.push({
          type: 'bulk_buying',
          description: `Buy ${ingredient} in bulk (used ${frequency} times)`,
          savings: Math.random() * 3 + 0.5, // $0.5-3.5 savings
          confidence: 0.9
        });
      }
    });

    return bulkOptimizations;
  }

  private findSeasonalOptimizations(mealPlan: any): CostOptimization['optimizations'] {
    const seasonalOptimizations: CostOptimization['optimizations'] = [];
    const currentSeason = this.getSeason(new Date());
    
    // Mock seasonal optimization logic
    const seasonalIngredients = {
      spring: ['asparagus', 'peas', 'strawberries'],
      summer: ['tomatoes', 'corn', 'zucchini'],
      fall: ['pumpkin', 'squash', 'apples'],
      winter: ['citrus', 'root vegetables', 'cabbage']
    };

    const currentSeasonalIngredients = seasonalIngredients[currentSeason];
    
    mealPlan.meal_plan_items.forEach((item: any) => {
      const ingredients = item.recipe?.ingredients || [];
      ingredients.forEach((ingredient: string) => {
        const isCurrentlySeasonal = currentSeasonalIngredients.some(seasonal => 
          ingredient.toLowerCase().includes(seasonal.toLowerCase())
        );
        
        if (!isCurrentlySeasonal) {
          seasonalOptimizations.push({
            type: 'seasonal_ingredient',
            description: `Replace ${ingredient} with seasonal alternative`,
            savings: Math.random() * 2 + 0.5, // $0.5-2.5 savings
            confidence: 0.7
          });
        }
      });
    });

    return seasonalOptimizations;
  }

  private async findStoreOptimizations(mealPlan: any): Promise<CostOptimization['optimizations']> {
    // Mock store optimization logic
    return [{
      type: 'store_selection',
      description: 'Shop at discount grocery store for 30% savings',
      savings: this.calculateOriginalCost(mealPlan) * 0.15, // 15% average savings
      confidence: 0.85
    }];
  }

  private findPortionOptimizations(mealPlan: any): CostOptimization['optimizations'] {
    const portionOptimizations: CostOptimization['optimizations'] = [];
    
    mealPlan.meal_plan_items.forEach((item: any) => {
      if (item.quantity > 1) {
        portionOptimizations.push({
          type: 'portion_adjustment',
          description: `Reduce portion size for ${item.recipe?.title || 'recipe'} by 10%`,
          savings: (item.recipe?.estimated_cost || 0) * 0.1 * item.quantity,
          confidence: 0.6
        });
      }
    });

    return portionOptimizations;
  }

  private calculateNutritionalImpact(optimizations: CostOptimization['optimizations']): number {
    // Calculate average nutritional impact (simplified)
    const impacts = optimizations.map(opt => {
      switch (opt.type) {
        case 'ingredient_substitution': return -0.1;
        case 'bulk_buying': return 0;
        case 'seasonal_ingredient': return 0.1;
        case 'store_selection': return 0;
        case 'portion_adjustment': return -0.2;
        default: return 0;
      }
    });
    
    return impacts.length > 0 ? impacts.reduce((sum, impact) => sum + impact, 0) / impacts.length : 0;
  }

  private calculateTasteImpact(optimizations: CostOptimization['optimizations']): number {
    // Calculate average taste impact (simplified)
    const impacts = optimizations.map(opt => {
      switch (opt.type) {
        case 'ingredient_substitution': return -0.2;
        case 'bulk_buying': return 0;
        case 'seasonal_ingredient': return 0.1;
        case 'store_selection': return 0;
        case 'portion_adjustment': return -0.1;
        default: return 0;
      }
    });
    
    return impacts.length > 0 ? impacts.reduce((sum, impact) => sum + impact, 0) / impacts.length : 0;
  }

  private calculateImplementationDifficulty(optimizations: CostOptimization['optimizations']): 'easy' | 'medium' | 'hard' {
    const difficultyScores = optimizations.map(opt => {
      switch (opt.type) {
        case 'ingredient_substitution': return 2;
        case 'bulk_buying': return 1;
        case 'seasonal_ingredient': return 2;
        case 'store_selection': return 3;
        case 'portion_adjustment': return 1;
        default: return 2;
      }
    });
    
    const avgDifficulty = difficultyScores.reduce((sum, score) => sum + score, 0) / difficultyScores.length;
    
    if (avgDifficulty <= 1.5) return 'easy';
    if (avgDifficulty <= 2.5) return 'medium';
    return 'hard';
  }

  // Analytics Insights Generation
  async generateAnalyticsInsights(userId: string): Promise<AnalyticsInsight[]> {
    const insights: AnalyticsInsight[] = [];

    // Behavior insights
    const behaviorAnalytics = await this.getUserBehaviorAnalytics(userId, 'month');
    if (behaviorAnalytics.engagementScore < 3) {
      insights.push({
        id: `insight_${Date.now()}_behavior`,
        type: 'behavior',
        title: 'Low Engagement Detected',
        description: 'Your engagement score is below average. Consider exploring new recipes or meal planning features.',
        impact: 'medium',
        actionable: true,
        recommendations: [
          'Try new cuisine types',
          'Use meal plan templates',
          'Explore seasonal recipes'
        ],
        confidence: 0.85,
        dataPoints: behaviorAnalytics.totalActions,
        timestamp: new Date()
      });
    }

    // Recipe success insights
    const recipeMetrics = await this.getRecipeSuccessAnalytics();
    const userRecipes = recipeMetrics.filter(recipe => recipe.totalAttempts > 0);
    const avgSuccessRate = userRecipes.length > 0 ? 
      userRecipes.reduce((sum, recipe) => sum + recipe.successRate, 0) / userRecipes.length : 0;
    
    if (avgSuccessRate < 0.7) {
      insights.push({
        id: `insight_${Date.now()}_success`,
        type: 'success',
        title: 'Recipe Success Rate Could Improve',
        description: `Your average recipe success rate is ${Math.round(avgSuccessRate * 100)}%. Consider focusing on easier recipes.`,
        impact: 'medium',
        actionable: true,
        recommendations: [
          'Filter by difficulty level',
          'Watch cooking tutorial videos',
          'Start with 5-star rated recipes'
        ],
        confidence: 0.9,
        dataPoints: userRecipes.length,
        timestamp: new Date()
      });
    }

    // Seasonal insights
    const seasonalPrefs = await this.getSeasonalPreferenceAnalysis(userId);
    const currentSeason = this.getSeason(new Date());
    const currentSeasonPrefs = seasonalPrefs.find(pref => pref.season === currentSeason);
    
    if (currentSeasonPrefs && currentSeasonPrefs.averagePrice > 20) {
      insights.push({
        id: `insight_${Date.now()}_seasonal`,
        type: 'seasonal',
        title: 'High Seasonal Spending',
        description: `Your ${currentSeason} meal costs are above average. Consider seasonal ingredient alternatives.`,
        impact: 'low',
        actionable: true,
        recommendations: [
          'Use seasonal ingredient suggestions',
          'Try cost optimization features',
          'Explore budget-friendly meal plans'
        ],
        confidence: 0.75,
        dataPoints: seasonalPrefs.length,
        timestamp: new Date()
      });
    }

    return insights.sort((a, b) => {
      const impactScore = { high: 3, medium: 2, low: 1 };
      return (impactScore[b.impact] * b.confidence) - (impactScore[a.impact] * a.confidence);
    });
  }

  // Utility methods
  private getTimeRangeStart(range: 'day' | 'week' | 'month' | 'year'): Date {
    const now = new Date();
    switch (range) {
      case 'day':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
      case 'week':
        return startOfWeek(now);
      case 'month':
        return startOfMonth(now);
      case 'year':
        return startOfYear(now);
      default:
        return now;
    }
  }
}

export const dataAnalyticsService = new DataAnalyticsService();