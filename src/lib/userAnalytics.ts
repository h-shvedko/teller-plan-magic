// User Analytics Dashboard Service
// Comprehensive analytics and tracking system for cooking frequency, success rates, and engagement metrics

export interface CookingSession {
  id: string;
  userId: string;
  recipeId: string;
  recipeName: string;
  cuisine: string;
  difficulty: 'easy' | 'medium' | 'hard';
  plannedCookTime: number;
  actualCookTime?: number;
  startedAt: Date;
  completedAt?: Date;
  status: 'planned' | 'in_progress' | 'completed' | 'abandoned';
  successRating?: number; // 1-5 scale
  notes?: string;
  ingredients: string[];
  nutritionGoalsMet: boolean;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  servingsPlanned: number;
  servingsActual?: number;
}

export interface RecipeAnalytics {
  recipeId: string;
  recipeName: string;
  cuisine: string;
  difficulty: 'easy' | 'medium' | 'hard';
  totalCooks: number;
  successfulCooks: number;
  successRate: number;
  averageRating: number;
  totalRatings: number;
  averageCookTime: number;
  popularityScore: number;
  trendDirection: 'up' | 'down' | 'stable';
  seasonalPopularity: Record<string, number>;
  userDemographics: {
    skillLevels: Record<string, number>;
    ageGroups: Record<string, number>;
    regions: Record<string, number>;
  };
  lastCookedAt: Date;
  firstCookedAt: Date;
}

export interface CuisineAnalytics {
  cuisine: string;
  totalRecipes: number;
  totalCooks: number;
  averageSuccessRate: number;
  popularityRank: number;
  seasonalTrends: Array<{
    season: string;
    popularity: number;
    change: number;
  }>;
  topRecipes: Array<{
    recipeId: string;
    name: string;
    cooks: number;
    successRate: number;
  }>;
  userPreferenceScore: number;
  growthRate: number;
}

export interface SeasonalTrend {
  season: 'spring' | 'summer' | 'fall' | 'winter';
  month: number;
  year: number;
  totalMealPlans: number;
  totalCooks: number;
  popularCuisines: Array<{
    cuisine: string;
    percentage: number;
    change: number;
  }>;
  popularIngredients: Array<{
    ingredient: string;
    usage: number;
    change: number;
  }>;
  avgCookingFrequency: number;
  seasonalRecipes: Array<{
    recipeId: string;
    name: string;
    seasonalScore: number;
  }>;
}

export interface UserEngagementMetrics {
  userId: string;
  timeframe: 'daily' | 'weekly' | 'monthly' | 'yearly';
  metrics: {
    // Cooking Engagement
    cookingFrequency: number; // cooks per timeframe
    mealPlanningFrequency: number;
    recipeViewCount: number;
    recipesSaved: number;
    recipesShared: number;
    cookingSuccessRate: number;
    averageCookingTime: number;
    
    // Platform Engagement
    sessionCount: number;
    averageSessionDuration: number;
    pagesViewed: number;
    featuresUsed: string[];
    timeSpentCooking: number;
    timeSpentPlanning: number;
    
    // Social Engagement
    recipesRated: number;
    reviewsWritten: number;
    communitInteractions: number;
    friendsConnected: number;
    recipesSharedWithFriends: number;
    
    // Achievement Progress
    badgesEarned: number;
    milestonesReached: number;
    streakLength: number;
    personalBests: Record<string, number>;
    
    // Learning & Growth
    newCuisinesTried: number;
    skillLevelImprovement: number;
    nutritionalGoalsAchieved: number;
    budgetGoalsAchieved: number;
  };
  trends: {
    cookingFrequencyChange: number;
    engagementChange: number;
    skillProgressionRate: number;
  };
  insights: {
    mostCookedCuisine: string;
    favoriteRecipes: string[];
    peakCookingHours: number[];
    cookingPatterns: string[];
    improvementAreas: string[];
  };
}

export interface DashboardAnalytics {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalCookingSessions: number;
    averageSuccessRate: number;
    totalMealPlans: number;
    totalRecipes: number;
  };
  trends: {
    userGrowth: Array<{
      date: Date;
      newUsers: number;
      activeUsers: number;
    }>;
    cookingActivity: Array<{
      date: Date;
      sessions: number;
      successRate: number;
    }>;
  };
  topPerformers: {
    recipes: RecipeAnalytics[];
    cuisines: CuisineAnalytics[];
    users: Array<{
      userId: string;
      cookingScore: number;
      engagement: number;
    }>;
  };
}

class UserAnalyticsService {
  // Mock data for development
  private mockSessions: CookingSession[] = [
    {
      id: 'session-1',
      userId: 'user-1',
      recipeId: 'recipe-pasta-carbonara',
      recipeName: 'Classic Pasta Carbonara',
      cuisine: 'Italian',
      difficulty: 'medium',
      plannedCookTime: 30,
      actualCookTime: 35,
      startedAt: new Date('2024-01-15T18:00:00'),
      completedAt: new Date('2024-01-15T18:35:00'),
      status: 'completed',
      successRating: 4,
      ingredients: ['pasta', 'eggs', 'bacon', 'parmesan', 'black pepper'],
      nutritionGoalsMet: true,
      mealType: 'dinner',
      servingsPlanned: 2,
      servingsActual: 2,
      notes: 'Delicious! Will make again.'
    },
    {
      id: 'session-2',
      userId: 'user-1',
      recipeId: 'recipe-chicken-stir-fry',
      recipeName: 'Asian Chicken Stir Fry',
      cuisine: 'Asian',
      difficulty: 'easy',
      plannedCookTime: 20,
      actualCookTime: 18,
      startedAt: new Date('2024-01-16T19:00:00'),
      completedAt: new Date('2024-01-16T19:18:00'),
      status: 'completed',
      successRating: 5,
      ingredients: ['chicken', 'broccoli', 'bell peppers', 'soy sauce', 'garlic'],
      nutritionGoalsMet: true,
      mealType: 'dinner',
      servingsPlanned: 3,
      servingsActual: 3
    },
    {
      id: 'session-3',
      userId: 'user-2',
      recipeId: 'recipe-beef-tacos',
      recipeName: 'Spicy Beef Tacos',
      cuisine: 'Mexican',
      difficulty: 'easy',
      plannedCookTime: 25,
      actualCookTime: 30,
      startedAt: new Date('2024-01-17T17:30:00'),
      completedAt: new Date('2024-01-17T18:00:00'),
      status: 'completed',
      successRating: 4,
      ingredients: ['ground beef', 'taco shells', 'lettuce', 'tomatoes', 'cheese'],
      nutritionGoalsMet: false,
      mealType: 'dinner',
      servingsPlanned: 4,
      servingsActual: 4
    }
  ];

  async trackCookingSession(session: Partial<CookingSession>): Promise<string> {
    // In a real implementation, this would save to database
    const newSession: CookingSession = {
      id: `session-${Date.now()}`,
      userId: session.userId!,
      recipeId: session.recipeId!,
      recipeName: session.recipeName!,
      cuisine: session.cuisine!,
      difficulty: session.difficulty!,
      plannedCookTime: session.plannedCookTime!,
      startedAt: new Date(),
      status: 'planned',
      ingredients: session.ingredients || [],
      nutritionGoalsMet: false,
      mealType: session.mealType!,
      servingsPlanned: session.servingsPlanned!,
      ...session
    };

    this.mockSessions.push(newSession);
    return newSession.id;
  }

  async updateCookingSession(sessionId: string, updates: Partial<CookingSession>): Promise<void> {
    const sessionIndex = this.mockSessions.findIndex(s => s.id === sessionId);
    if (sessionIndex !== -1) {
      this.mockSessions[sessionIndex] = { ...this.mockSessions[sessionIndex], ...updates };
    }
  }

  async getCookingFrequency(userId: string, timeframe: 'week' | 'month' | 'year' = 'month'): Promise<Array<{ date: string; count: number; successRate: number }>> {
    const userSessions = this.mockSessions.filter(s => s.userId === userId);
    const now = new Date();
    const startDate = new Date();
    
    switch (timeframe) {
      case 'week':
        startDate.setDate(now.getDate() - 30); // Last 30 days for weekly view
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 12); // Last 12 months
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 3); // Last 3 years
        break;
    }

    // Generate mock frequency data
    const frequencyData = [];
    const current = new Date(startDate);
    
    while (current <= now) {
      const dateStr = current.toISOString().split('T')[0];
      const sessionsOnDate = userSessions.filter(s => 
        s.startedAt.toDateString() === current.toDateString()
      );
      
      const completedSessions = sessionsOnDate.filter(s => s.status === 'completed');
      const successRate = sessionsOnDate.length > 0 
        ? (completedSessions.length / sessionsOnDate.length) * 100 
        : 0;

      frequencyData.push({
        date: dateStr,
        count: sessionsOnDate.length,
        successRate
      });

      if (timeframe === 'week') {
        current.setDate(current.getDate() + 1);
      } else if (timeframe === 'month') {
        current.setMonth(current.getMonth() + 1);
      } else {
        current.setFullYear(current.getFullYear() + 1);
      }
    }

    return frequencyData;
  }

  async getRecipeAnalytics(recipeId?: string): Promise<RecipeAnalytics[]> {
    const recipes = new Map<string, RecipeAnalytics>();

    // Generate analytics for each recipe
    this.mockSessions.forEach(session => {
      if (recipeId && session.recipeId !== recipeId) return;

      if (!recipes.has(session.recipeId)) {
        recipes.set(session.recipeId, {
          recipeId: session.recipeId,
          recipeName: session.recipeName,
          cuisine: session.cuisine,
          difficulty: session.difficulty,
          totalCooks: 0,
          successfulCooks: 0,
          successRate: 0,
          averageRating: 0,
          totalRatings: 0,
          averageCookTime: 0,
          popularityScore: 0,
          trendDirection: 'stable',
          seasonalPopularity: {},
          userDemographics: {
            skillLevels: {},
            ageGroups: {},
            regions: {}
          },
          lastCookedAt: new Date(0),
          firstCookedAt: new Date()
        });
      }

      const recipe = recipes.get(session.recipeId)!;
      recipe.totalCooks++;
      
      if (session.status === 'completed') {
        recipe.successfulCooks++;
      }
      
      if (session.successRating) {
        recipe.totalRatings++;
        recipe.averageRating = (recipe.averageRating * (recipe.totalRatings - 1) + session.successRating) / recipe.totalRatings;
      }
      
      if (session.actualCookTime) {
        recipe.averageCookTime = (recipe.averageCookTime * (recipe.totalCooks - 1) + session.actualCookTime) / recipe.totalCooks;
      }

      recipe.successRate = (recipe.successfulCooks / recipe.totalCooks) * 100;
      recipe.popularityScore = recipe.totalCooks * (recipe.successRate / 100) * (recipe.averageRating / 5);

      if (session.startedAt > recipe.lastCookedAt) {
        recipe.lastCookedAt = session.startedAt;
      }
      if (session.startedAt < recipe.firstCookedAt) {
        recipe.firstCookedAt = session.startedAt;
      }
    });

    return Array.from(recipes.values()).sort((a, b) => b.popularityScore - a.popularityScore);
  }

  async getCuisineAnalytics(): Promise<CuisineAnalytics[]> {
    const cuisines = new Map<string, CuisineAnalytics>();

    // Aggregate data by cuisine
    this.mockSessions.forEach(session => {
      if (!cuisines.has(session.cuisine)) {
        cuisines.set(session.cuisine, {
          cuisine: session.cuisine,
          totalRecipes: 0,
          totalCooks: 0,
          averageSuccessRate: 0,
          popularityRank: 0,
          seasonalTrends: [
            { season: 'Spring', popularity: Math.random() * 100, change: (Math.random() - 0.5) * 20 },
            { season: 'Summer', popularity: Math.random() * 100, change: (Math.random() - 0.5) * 20 },
            { season: 'Fall', popularity: Math.random() * 100, change: (Math.random() - 0.5) * 20 },
            { season: 'Winter', popularity: Math.random() * 100, change: (Math.random() - 0.5) * 20 }
          ],
          topRecipes: [],
          userPreferenceScore: 0,
          growthRate: 0
        });
      }

      const cuisine = cuisines.get(session.cuisine)!;
      cuisine.totalCooks++;
      
      const recipes = new Set(this.mockSessions
        .filter(s => s.cuisine === session.cuisine)
        .map(s => s.recipeId)
      );
      cuisine.totalRecipes = recipes.size;

      const successfulCooks = this.mockSessions
        .filter(s => s.cuisine === session.cuisine && s.status === 'completed')
        .length;
      cuisine.averageSuccessRate = (successfulCooks / cuisine.totalCooks) * 100;
    });

    // Calculate popularity ranks
    const sortedCuisines = Array.from(cuisines.values()).sort((a, b) => b.totalCooks - a.totalCooks);
    sortedCuisines.forEach((cuisine, index) => {
      cuisine.popularityRank = index + 1;
      cuisine.userPreferenceScore = (cuisine.totalCooks / sortedCuisines[0].totalCooks) * 100;
      cuisine.growthRate = (Math.random() - 0.3) * 50; // Mock growth rate
    });

    return sortedCuisines;
  }

  async getSeasonalTrends(year: number = new Date().getFullYear()): Promise<SeasonalTrend[]> {
    const seasons = ['spring', 'summer', 'fall', 'winter'] as const;
    const trends: SeasonalTrend[] = [];

    seasons.forEach((season, index) => {
      const startMonth = index * 3 + 3; // March, June, Sept, Dec
      const seasonSessions = this.mockSessions.filter(session => {
        const sessionMonth = session.startedAt.getMonth() + 1;
        return sessionMonth >= startMonth && sessionMonth < startMonth + 3;
      });

      const cuisineCounts = new Map<string, number>();
      const ingredientCounts = new Map<string, number>();

      seasonSessions.forEach(session => {
        cuisineCounts.set(session.cuisine, (cuisineCounts.get(session.cuisine) || 0) + 1);
        session.ingredients.forEach(ingredient => {
          ingredientCounts.set(ingredient, (ingredientCounts.get(ingredient) || 0) + 1);
        });
      });

      const popularCuisines = Array.from(cuisineCounts.entries())
        .map(([cuisine, count]) => ({
          cuisine,
          percentage: (count / seasonSessions.length) * 100,
          change: (Math.random() - 0.5) * 20
        }))
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, 5);

      const popularIngredients = Array.from(ingredientCounts.entries())
        .map(([ingredient, usage]) => ({
          ingredient,
          usage,
          change: (Math.random() - 0.5) * 20
        }))
        .sort((a, b) => b.usage - a.usage)
        .slice(0, 10);

      trends.push({
        season,
        month: startMonth,
        year,
        totalMealPlans: Math.floor(seasonSessions.length * 1.5), // Estimate
        totalCooks: seasonSessions.length,
        popularCuisines,
        popularIngredients,
        avgCookingFrequency: seasonSessions.length / 7, // Per week
        seasonalRecipes: seasonSessions
          .slice(0, 5)
          .map(session => ({
            recipeId: session.recipeId,
            name: session.recipeName,
            seasonalScore: Math.random() * 100
          }))
      });
    });

    return trends;
  }

  async getUserEngagementMetrics(userId: string, timeframe: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly'): Promise<UserEngagementMetrics> {
    const userSessions = this.mockSessions.filter(s => s.userId === userId);
    const completedSessions = userSessions.filter(s => s.status === 'completed');
    
    // Calculate timeframe multiplier
    const timeframeMultipliers = { daily: 365, weekly: 52, monthly: 12, yearly: 1 };
    const multiplier = timeframeMultipliers[timeframe];

    const cookingFrequency = userSessions.length / multiplier;
    const successRate = userSessions.length > 0 ? (completedSessions.length / userSessions.length) * 100 : 0;

    const cuisines = [...new Set(userSessions.map(s => s.cuisine))];
    const mostCookedCuisine = cuisines.reduce((prev, current) => {
      const prevCount = userSessions.filter(s => s.cuisine === prev).length;
      const currentCount = userSessions.filter(s => s.cuisine === current).length;
      return currentCount > prevCount ? current : prev;
    }, cuisines[0] || 'None');

    return {
      userId,
      timeframe,
      metrics: {
        // Cooking Engagement
        cookingFrequency,
        mealPlanningFrequency: cookingFrequency * 1.2,
        recipeViewCount: Math.floor(cookingFrequency * 5),
        recipesSaved: Math.floor(cookingFrequency * 2),
        recipesShared: Math.floor(cookingFrequency * 0.3),
        cookingSuccessRate: successRate,
        averageCookingTime: userSessions.reduce((acc, s) => acc + (s.actualCookTime || s.plannedCookTime), 0) / userSessions.length || 0,
        
        // Platform Engagement
        sessionCount: Math.floor(cookingFrequency * 3),
        averageSessionDuration: 15 + Math.random() * 20,
        pagesViewed: Math.floor(cookingFrequency * 8),
        featuresUsed: ['meal-planning', 'recipes', 'shopping-lists', 'analytics'],
        timeSpentCooking: userSessions.reduce((acc, s) => acc + (s.actualCookTime || 0), 0),
        timeSpentPlanning: Math.floor(cookingFrequency * 10),
        
        // Social Engagement
        recipesRated: completedSessions.filter(s => s.successRating).length,
        reviewsWritten: Math.floor(cookingFrequency * 0.4),
        communitInteractions: Math.floor(cookingFrequency * 0.6),
        friendsConnected: Math.floor(Math.random() * 10) + 1,
        recipesSharedWithFriends: Math.floor(cookingFrequency * 0.2),
        
        // Achievement Progress
        badgesEarned: Math.floor(successRate / 20),
        milestonesReached: Math.floor(userSessions.length / 10),
        streakLength: Math.floor(Math.random() * 14) + 1,
        personalBests: {
          fastest_cook: Math.min(...userSessions.map(s => s.actualCookTime || s.plannedCookTime)),
          most_complex_recipe: Math.max(...userSessions.map(s => s.difficulty === 'hard' ? 3 : s.difficulty === 'medium' ? 2 : 1))
        },
        
        // Learning & Growth
        newCuisinesTried: cuisines.length,
        skillLevelImprovement: Math.floor(successRate / 10),
        nutritionalGoalsAchieved: Math.floor(userSessions.filter(s => s.nutritionGoalsMet).length / userSessions.length * 100),
        budgetGoalsAchieved: Math.floor(Math.random() * 80) + 60
      },
      trends: {
        cookingFrequencyChange: (Math.random() - 0.3) * 20,
        engagementChange: (Math.random() - 0.2) * 15,
        skillProgressionRate: Math.max(0, (Math.random() - 0.1) * 10)
      },
      insights: {
        mostCookedCuisine,
        favoriteRecipes: [...new Set(completedSessions.filter(s => s.successRating && s.successRating >= 4).map(s => s.recipeName))].slice(0, 5),
        peakCookingHours: [18, 19, 20], // 6-8 PM
        cookingPatterns: ['Weekend meal prep', 'Quick weeknight dinners'],
        improvementAreas: successRate < 70 ? ['Time management', 'Recipe following'] : ['Advanced techniques', 'New cuisines']
      }
    };
  }

  async getDashboardAnalytics(): Promise<DashboardAnalytics> {
    const allSessions = this.mockSessions;
    const uniqueUsers = [...new Set(allSessions.map(s => s.userId))];
    const completedSessions = allSessions.filter(s => s.status === 'completed');
    
    const recipeAnalytics = await this.getRecipeAnalytics();
    const cuisineAnalytics = await this.getCuisineAnalytics();

    // Generate mock trend data
    const userGrowthTrend = [];
    const cookingActivityTrend = [];
    const now = new Date();
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      userGrowthTrend.push({
        date,
        newUsers: Math.floor(Math.random() * 5) + 1,
        activeUsers: uniqueUsers.length + Math.floor(Math.random() * 10)
      });
      
      cookingActivityTrend.push({
        date,
        sessions: Math.floor(Math.random() * 15) + 5,
        successRate: 70 + Math.random() * 25
      });
    }

    return {
      overview: {
        totalUsers: uniqueUsers.length,
        activeUsers: Math.floor(uniqueUsers.length * 0.7),
        totalCookingSessions: allSessions.length,
        averageSuccessRate: (completedSessions.length / allSessions.length) * 100,
        totalMealPlans: Math.floor(allSessions.length * 1.3),
        totalRecipes: [...new Set(allSessions.map(s => s.recipeId))].length
      },
      trends: {
        userGrowth: userGrowthTrend,
        cookingActivity: cookingActivityTrend
      },
      topPerformers: {
        recipes: recipeAnalytics.slice(0, 10),
        cuisines: cuisineAnalytics.slice(0, 10),
        users: uniqueUsers.slice(0, 10).map((userId, index) => ({
          userId,
          cookingScore: 85 + Math.random() * 15,
          engagement: 75 + Math.random() * 25
        }))
      }
    };
  }

  async getIngredientTrends(timeframe: 'month' | 'quarter' | 'year' = 'month'): Promise<Array<{
    ingredient: string;
    usage: number;
    change: number;
    seasonality: number;
    popularRecipes: string[];
  }>> {
    const ingredientData = new Map<string, {
      usage: number;
      recipes: Set<string>;
    }>();

    this.mockSessions.forEach(session => {
      session.ingredients.forEach(ingredient => {
        if (!ingredientData.has(ingredient)) {
          ingredientData.set(ingredient, { usage: 0, recipes: new Set() });
        }
        const data = ingredientData.get(ingredient)!;
        data.usage++;
        data.recipes.add(session.recipeName);
      });
    });

    return Array.from(ingredientData.entries())
      .map(([ingredient, data]) => ({
        ingredient,
        usage: data.usage,
        change: (Math.random() - 0.4) * 30,
        seasonality: Math.random() * 100,
        popularRecipes: Array.from(data.recipes).slice(0, 3)
      }))
      .sort((a, b) => b.usage - a.usage)
      .slice(0, 20);
  }
}

export const userAnalyticsService = new UserAnalyticsService();