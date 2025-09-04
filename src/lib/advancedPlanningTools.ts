import { Recipe } from './types';

// Nutritional Goal Tracking Types
export interface NutritionalGoal {
  id: string;
  userId: string;
  goalType: 'daily' | 'weekly' | 'monthly';
  targetCalories?: number;
  targetProtein?: number;
  targetCarbs?: number;
  targetFat?: number;
  targetFiber?: number;
  targetSodium?: number;
  maxSugar?: number;
  maxSaturatedFat?: number;
  dietaryRestrictions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MealBalance {
  mealPlanId: string;
  date: Date;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  totalSodium: number;
  totalSugar: number;
  totalSaturatedFat: number;
  balanceScore: number;
  recommendations: BalanceRecommendation[];
}

export interface BalanceRecommendation {
  type: 'increase' | 'decrease' | 'maintain';
  nutrient: string;
  currentAmount: number;
  targetAmount: number;
  suggestedFoods: string[];
  priority: 'high' | 'medium' | 'low';
}

// Budget Tracking Types
export interface MealPlanBudget {
  id: string;
  mealPlanId: string;
  weeklyBudget: number;
  currency: string;
  allocations: BudgetAllocation[];
  actualSpent: number;
  projectedCost: number;
  savingsOpportunities: SavingsOpportunity[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetAllocation {
  category: 'breakfast' | 'lunch' | 'dinner' | 'snacks' | 'beverages';
  allocatedAmount: number;
  allocatedPercentage: number;
  actualAmount: number;
  variance: number;
}

export interface SavingsOpportunity {
  id: string;
  type: 'bulk_buy' | 'seasonal' | 'substitute' | 'store_brand';
  ingredient: string;
  currentCost: number;
  potentialSaving: number;
  savingPercentage: number;
  recommendation: string;
  effortLevel: 'low' | 'medium' | 'high';
}

// Leftover Management Types
export interface LeftoverItem {
  id: string;
  mealPlanId: string;
  recipeName: string;
  servingsRemaining: number;
  storageLocation: 'fridge' | 'freezer';
  dateStored: Date;
  expirationDate: Date;
  reheatingInstructions: string;
  qualityRating: number; // 1-5 scale for how well it keeps
  usedIn?: string[]; // Recipe IDs where leftover was repurposed
  tags: string[];
}

export interface MealRotation {
  id: string;
  mealPlanId: string;
  rotationType: 'weekly' | 'biweekly' | 'monthly';
  rotationRules: RotationRule[];
  avoidanceList: string[]; // Recipes to avoid repeating
  favoriteRotations: string[][]; // Groups of recipes that work well in rotation
  lastRotationDate: Date;
}

export interface RotationRule {
  ruleType: 'no_repeat_days' | 'cuisine_variety' | 'protein_variety' | 'cooking_method_variety';
  value: number | string;
  enabled: boolean;
  priority: number;
}

// Special Occasion Planning Types
export interface SpecialOccasionPlan {
  id: string;
  userId: string;
  occasionType: 'holiday' | 'birthday' | 'dinner_party' | 'potluck' | 'picnic' | 'custom';
  occasionName: string;
  date: Date;
  guestCount: number;
  budget: number;
  theme?: string;
  dietaryRequirements: DietaryRequirement[];
  courses: CoursePlan[];
  timeline: PreparationTimeline[];
  shoppingList: SpecialShoppingItem[];
  decorationNotes?: string;
  status: 'planning' | 'confirmed' | 'in_progress' | 'completed';
}

export interface DietaryRequirement {
  guestName?: string;
  requirement: string;
  severity: 'allergy' | 'intolerance' | 'preference';
  affectedIngredients: string[];
}

export interface CoursePlan {
  courseType: 'appetizer' | 'salad' | 'soup' | 'main' | 'side' | 'dessert' | 'beverage';
  recipes: Recipe[];
  servingOrder: number;
  prepTimeMinutes: number;
  servingNotes?: string;
}

export interface PreparationTimeline {
  taskId: string;
  taskName: string;
  daysBeforeEvent: number;
  hoursBeforeEvent: number;
  duration: number;
  taskType: 'shopping' | 'prep' | 'cooking' | 'decoration' | 'serving';
  dependencies: string[]; // Other task IDs this depends on
  completed: boolean;
  notes?: string;
}

export interface SpecialShoppingItem {
  ingredient: string;
  quantity: number;
  unit: string;
  category: 'food' | 'decoration' | 'tableware' | 'beverage';
  specialNotes?: string;
  store?: string;
  purchased: boolean;
}

// Meal Plan Analytics Types
export interface MealPlanAnalytics {
  mealPlanId: string;
  period: 'week' | 'month' | 'quarter' | 'year';
  startDate: Date;
  endDate: Date;
  costAnalytics: CostAnalytics;
  nutritionAnalytics: NutritionAnalytics;
  timeAnalytics: TimeAnalytics;
  preferenceAnalytics: PreferenceAnalytics;
  insights: AnalyticsInsight[];
}

export interface CostAnalytics {
  totalCost: number;
  averageCostPerMeal: number;
  averageCostPerServing: number;
  costByCategory: { [key: string]: number };
  costTrend: TrendData[];
  mostExpensiveIngredients: { ingredient: string; totalCost: number }[];
  costSavings: number;
  comparisonToPreviousPeriod: number; // Percentage change
}

export interface NutritionAnalytics {
  averageCaloriesPerDay: number;
  macronutrientDistribution: {
    protein: number;
    carbs: number;
    fat: number;
  };
  nutritionalGoalAdherence: number; // Percentage
  nutritionTrend: TrendData[];
  topNutritionalSources: {
    nutrient: string;
    topSources: string[];
  }[];
  nutritionalBalance: number; // Score 0-100
}

export interface TimeAnalytics {
  totalCookingTime: number;
  averageTimePerMeal: number;
  timeByMealType: { [key: string]: number };
  timeTrend: TrendData[];
  mostTimeConsumingRecipes: { recipe: string; time: number }[];
  timeEfficiency: number; // Score based on batch cooking and prep optimization
  timeSavings: number; // From batch cooking and optimization
}

export interface PreferenceAnalytics {
  mostCookedRecipes: { recipe: string; count: number }[];
  cuisineDistribution: { [key: string]: number };
  proteinSourceDistribution: { [key: string]: number };
  recipeRatings: { recipe: string; rating: number }[];
  dietaryGoalAdherence: { goal: string; adherence: number }[];
  varietyScore: number; // Score 0-100 based on recipe diversity
}

export interface TrendData {
  date: Date;
  value: number;
  label?: string;
}

export interface AnalyticsInsight {
  type: 'success' | 'warning' | 'suggestion' | 'achievement';
  category: 'cost' | 'nutrition' | 'time' | 'preference';
  title: string;
  description: string;
  actionable?: string; // Suggested action
  impact: 'high' | 'medium' | 'low';
  data?: any; // Supporting data for the insight
}

// Service Class for Advanced Planning Tools
export class AdvancedPlanningService {
  // Nutritional Goal Tracking
  async trackNutritionalGoals(
    mealPlan: any,
    goals: NutritionalGoal
  ): Promise<MealBalance> {
    const balance = this.calculateMealBalance(mealPlan);
    const recommendations = this.generateBalanceRecommendations(balance, goals);
    
    return {
      mealPlanId: mealPlan.id,
      date: new Date(),
      ...balance,
      balanceScore: this.calculateBalanceScore(balance, goals),
      recommendations,
    };
  }

  private calculateMealBalance(mealPlan: any): Omit<MealBalance, 'mealPlanId' | 'date' | 'balanceScore' | 'recommendations'> {
    // Aggregate nutritional data from all meals in the plan
    let totals = {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      totalFiber: 0,
      totalSodium: 0,
      totalSugar: 0,
      totalSaturatedFat: 0,
    };

    // This would aggregate from actual meal data
    // Placeholder calculation
    return totals;
  }

  private generateBalanceRecommendations(
    balance: any,
    goals: NutritionalGoal
  ): BalanceRecommendation[] {
    const recommendations: BalanceRecommendation[] = [];
    
    // Check each nutrient against goals
    if (goals.targetProtein && balance.totalProtein < goals.targetProtein * 0.9) {
      recommendations.push({
        type: 'increase',
        nutrient: 'protein',
        currentAmount: balance.totalProtein,
        targetAmount: goals.targetProtein,
        suggestedFoods: ['lean meats', 'legumes', 'dairy', 'nuts'],
        priority: 'high',
      });
    }
    
    if (goals.maxSodium && balance.totalSodium > goals.maxSodium) {
      recommendations.push({
        type: 'decrease',
        nutrient: 'sodium',
        currentAmount: balance.totalSodium,
        targetAmount: goals.maxSodium,
        suggestedFoods: ['fresh vegetables', 'herbs', 'homemade seasonings'],
        priority: 'high',
      });
    }
    
    return recommendations;
  }

  private calculateBalanceScore(balance: any, goals: NutritionalGoal): number {
    let score = 100;
    let deductions = 0;
    
    // Deduct points for being too far from goals
    if (goals.targetCalories) {
      const calorieVariance = Math.abs(balance.totalCalories - goals.targetCalories) / goals.targetCalories;
      deductions += calorieVariance * 20;
    }
    
    if (goals.targetProtein) {
      const proteinVariance = Math.abs(balance.totalProtein - goals.targetProtein) / goals.targetProtein;
      deductions += proteinVariance * 15;
    }
    
    return Math.max(0, score - deductions);
  }

  // Budget Tracking
  async trackBudget(
    mealPlan: any,
    weeklyBudget: number,
    currency: string = 'USD'
  ): Promise<MealPlanBudget> {
    const allocations = this.calculateBudgetAllocations(mealPlan, weeklyBudget);
    const actualSpent = this.calculateActualSpent(mealPlan);
    const projectedCost = this.projectRemainingCost(mealPlan);
    const savingsOpportunities = this.identifySavingsOpportunities(mealPlan);
    
    return {
      id: `budget-${mealPlan.id}`,
      mealPlanId: mealPlan.id,
      weeklyBudget,
      currency,
      allocations,
      actualSpent,
      projectedCost,
      savingsOpportunities,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private calculateBudgetAllocations(
    mealPlan: any,
    weeklyBudget: number
  ): BudgetAllocation[] {
    // Standard allocation percentages
    const standardAllocations = {
      breakfast: 0.15,
      lunch: 0.25,
      dinner: 0.40,
      snacks: 0.10,
      beverages: 0.10,
    };
    
    return Object.entries(standardAllocations).map(([category, percentage]) => ({
      category: category as any,
      allocatedAmount: weeklyBudget * percentage,
      allocatedPercentage: percentage * 100,
      actualAmount: 0, // Would be calculated from actual meal costs
      variance: 0, // Difference between allocated and actual
    }));
  }

  private calculateActualSpent(mealPlan: any): number {
    // Calculate from actual ingredient costs in the meal plan
    return 0; // Placeholder
  }

  private projectRemainingCost(mealPlan: any): number {
    // Project costs for remaining meals in the plan
    return 0; // Placeholder
  }

  private identifySavingsOpportunities(mealPlan: any): SavingsOpportunity[] {
    const opportunities: SavingsOpportunity[] = [];
    
    // Example: Identify bulk buying opportunities
    opportunities.push({
      id: 'bulk-rice',
      type: 'bulk_buy',
      ingredient: 'Rice',
      currentCost: 5.00,
      potentialSaving: 2.00,
      savingPercentage: 40,
      recommendation: 'Buy 10lb bag instead of 2lb packages',
      effortLevel: 'low',
    });
    
    // Example: Seasonal produce savings
    opportunities.push({
      id: 'seasonal-tomatoes',
      type: 'seasonal',
      ingredient: 'Tomatoes',
      currentCost: 3.00,
      potentialSaving: 1.50,
      savingPercentage: 50,
      recommendation: 'Switch to in-season tomatoes or canned alternatives',
      effortLevel: 'low',
    });
    
    return opportunities;
  }

  // Leftover Management
  async manageLeftovers(mealPlan: any): Promise<LeftoverItem[]> {
    const leftovers: LeftoverItem[] = [];
    
    // Example leftover tracking
    leftovers.push({
      id: 'leftover-1',
      mealPlanId: mealPlan.id,
      recipeName: 'Chicken Stir Fry',
      servingsRemaining: 2,
      storageLocation: 'fridge',
      dateStored: new Date(),
      expirationDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      reheatingInstructions: 'Microwave for 2-3 minutes, stirring halfway',
      qualityRating: 4,
      tags: ['lunch', 'quick-meal'],
    });
    
    return leftovers;
  }

  async createMealRotation(
    mealPlan: any,
    rotationType: 'weekly' | 'biweekly' | 'monthly'
  ): Promise<MealRotation> {
    const rules: RotationRule[] = [
      {
        ruleType: 'no_repeat_days',
        value: 3, // Don't repeat recipes within 3 days
        enabled: true,
        priority: 1,
      },
      {
        ruleType: 'cuisine_variety',
        value: 'mixed', // Ensure variety of cuisines
        enabled: true,
        priority: 2,
      },
      {
        ruleType: 'protein_variety',
        value: 'balanced', // Balance protein sources
        enabled: true,
        priority: 3,
      },
    ];
    
    return {
      id: `rotation-${mealPlan.id}`,
      mealPlanId: mealPlan.id,
      rotationType,
      rotationRules: rules,
      avoidanceList: [], // Recipes to avoid
      favoriteRotations: [
        ['Monday Pasta', 'Tuesday Tacos', 'Wednesday Stir Fry'],
        ['Thursday Curry', 'Friday Pizza', 'Saturday BBQ'],
      ],
      lastRotationDate: new Date(),
    };
  }

  // Special Occasion Planning
  async planSpecialOccasion(
    occasionType: SpecialOccasionPlan['occasionType'],
    details: Partial<SpecialOccasionPlan>
  ): Promise<SpecialOccasionPlan> {
    const timeline = this.generatePreparationTimeline(occasionType, details.date!);
    const shoppingList = this.generateSpecialShoppingList(details.courses || []);
    
    return {
      id: `occasion-${Date.now()}`,
      userId: details.userId || '',
      occasionType,
      occasionName: details.occasionName || '',
      date: details.date || new Date(),
      guestCount: details.guestCount || 0,
      budget: details.budget || 0,
      theme: details.theme,
      dietaryRequirements: details.dietaryRequirements || [],
      courses: details.courses || [],
      timeline,
      shoppingList,
      decorationNotes: details.decorationNotes,
      status: 'planning',
    };
  }

  private generatePreparationTimeline(
    occasionType: string,
    eventDate: Date
  ): PreparationTimeline[] {
    const timeline: PreparationTimeline[] = [];
    
    // Standard timeline items
    timeline.push({
      taskId: 'task-1',
      taskName: 'Finalize guest list and dietary requirements',
      daysBeforeEvent: 14,
      hoursBeforeEvent: 336,
      duration: 60,
      taskType: 'prep',
      dependencies: [],
      completed: false,
    });
    
    timeline.push({
      taskId: 'task-2',
      taskName: 'Shop for non-perishables',
      daysBeforeEvent: 7,
      hoursBeforeEvent: 168,
      duration: 120,
      taskType: 'shopping',
      dependencies: ['task-1'],
      completed: false,
    });
    
    timeline.push({
      taskId: 'task-3',
      taskName: 'Shop for perishables',
      daysBeforeEvent: 2,
      hoursBeforeEvent: 48,
      duration: 90,
      taskType: 'shopping',
      dependencies: ['task-2'],
      completed: false,
    });
    
    timeline.push({
      taskId: 'task-4',
      taskName: 'Prep vegetables and marinades',
      daysBeforeEvent: 1,
      hoursBeforeEvent: 24,
      duration: 120,
      taskType: 'prep',
      dependencies: ['task-3'],
      completed: false,
    });
    
    timeline.push({
      taskId: 'task-5',
      taskName: 'Cook main dishes',
      daysBeforeEvent: 0,
      hoursBeforeEvent: 4,
      duration: 180,
      taskType: 'cooking',
      dependencies: ['task-4'],
      completed: false,
    });
    
    return timeline;
  }

  private generateSpecialShoppingList(courses: CoursePlan[]): SpecialShoppingItem[] {
    const items: SpecialShoppingItem[] = [];
    
    // Generate shopping items from courses
    // This is a placeholder implementation
    items.push({
      ingredient: 'Decorative napkins',
      quantity: 20,
      unit: 'pieces',
      category: 'tableware',
      specialNotes: 'Match theme colors',
      purchased: false,
    });
    
    return items;
  }

  // Meal Plan Analytics
  async generateAnalytics(
    mealPlanId: string,
    period: MealPlanAnalytics['period']
  ): Promise<MealPlanAnalytics> {
    const startDate = this.calculatePeriodStart(period);
    const endDate = new Date();
    
    const costAnalytics = await this.analyzeCosts(mealPlanId, startDate, endDate);
    const nutritionAnalytics = await this.analyzeNutrition(mealPlanId, startDate, endDate);
    const timeAnalytics = await this.analyzeTime(mealPlanId, startDate, endDate);
    const preferenceAnalytics = await this.analyzePreferences(mealPlanId, startDate, endDate);
    const insights = this.generateInsights(
      costAnalytics,
      nutritionAnalytics,
      timeAnalytics,
      preferenceAnalytics
    );
    
    return {
      mealPlanId,
      period,
      startDate,
      endDate,
      costAnalytics,
      nutritionAnalytics,
      timeAnalytics,
      preferenceAnalytics,
      insights,
    };
  }

  private calculatePeriodStart(period: string): Date {
    const now = new Date();
    switch (period) {
      case 'week':
        return new Date(now.setDate(now.getDate() - 7));
      case 'month':
        return new Date(now.setMonth(now.getMonth() - 1));
      case 'quarter':
        return new Date(now.setMonth(now.getMonth() - 3));
      case 'year':
        return new Date(now.setFullYear(now.getFullYear() - 1));
      default:
        return new Date(now.setDate(now.getDate() - 7));
    }
  }

  private async analyzeCosts(
    mealPlanId: string,
    startDate: Date,
    endDate: Date
  ): Promise<CostAnalytics> {
    // Placeholder implementation
    const trendData: TrendData[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      trendData.push({
        date,
        value: 50 + Math.random() * 30,
        label: `Day ${i + 1}`,
      });
    }
    
    return {
      totalCost: 350,
      averageCostPerMeal: 8.75,
      averageCostPerServing: 4.38,
      costByCategory: {
        proteins: 140,
        vegetables: 70,
        grains: 35,
        dairy: 45,
        other: 60,
      },
      costTrend: trendData,
      mostExpensiveIngredients: [
        { ingredient: 'Salmon', totalCost: 45 },
        { ingredient: 'Beef', totalCost: 38 },
        { ingredient: 'Cheese', totalCost: 25 },
      ],
      costSavings: 42,
      comparisonToPreviousPeriod: -12.5,
    };
  }

  private async analyzeNutrition(
    mealPlanId: string,
    startDate: Date,
    endDate: Date
  ): Promise<NutritionAnalytics> {
    // Placeholder implementation
    const trendData: TrendData[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      trendData.push({
        date,
        value: 1800 + Math.random() * 400,
        label: `Day ${i + 1}`,
      });
    }
    
    return {
      averageCaloriesPerDay: 2000,
      macronutrientDistribution: {
        protein: 30,
        carbs: 45,
        fat: 25,
      },
      nutritionalGoalAdherence: 85,
      nutritionTrend: trendData,
      topNutritionalSources: [
        {
          nutrient: 'Protein',
          topSources: ['Chicken', 'Fish', 'Legumes'],
        },
        {
          nutrient: 'Fiber',
          topSources: ['Whole grains', 'Vegetables', 'Fruits'],
        },
      ],
      nutritionalBalance: 88,
    };
  }

  private async analyzeTime(
    mealPlanId: string,
    startDate: Date,
    endDate: Date
  ): Promise<TimeAnalytics> {
    // Placeholder implementation
    const trendData: TrendData[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      trendData.push({
        date,
        value: 45 + Math.random() * 30,
        label: `Day ${i + 1}`,
      });
    }
    
    return {
      totalCookingTime: 420,
      averageTimePerMeal: 30,
      timeByMealType: {
        breakfast: 60,
        lunch: 120,
        dinner: 240,
      },
      timeTrend: trendData,
      mostTimeConsumingRecipes: [
        { recipe: 'Slow-cooked Beef Stew', time: 180 },
        { recipe: 'Homemade Pizza', time: 90 },
        { recipe: 'Lasagna', time: 75 },
      ],
      timeEfficiency: 75,
      timeSavings: 60,
    };
  }

  private async analyzePreferences(
    mealPlanId: string,
    startDate: Date,
    endDate: Date
  ): Promise<PreferenceAnalytics> {
    return {
      mostCookedRecipes: [
        { recipe: 'Chicken Stir Fry', count: 4 },
        { recipe: 'Pasta Carbonara', count: 3 },
        { recipe: 'Greek Salad', count: 3 },
      ],
      cuisineDistribution: {
        Italian: 30,
        Asian: 25,
        Mediterranean: 20,
        American: 15,
        Mexican: 10,
      },
      proteinSourceDistribution: {
        Chicken: 35,
        Beef: 20,
        Fish: 15,
        Vegetarian: 20,
        Pork: 10,
      },
      recipeRatings: [
        { recipe: 'Thai Green Curry', rating: 4.8 },
        { recipe: 'Grilled Salmon', rating: 4.6 },
        { recipe: 'Veggie Burger', rating: 4.2 },
      ],
      dietaryGoalAdherence: [
        { goal: 'Low sodium', adherence: 90 },
        { goal: 'High protein', adherence: 85 },
        { goal: 'Vegetable servings', adherence: 75 },
      ],
      varietyScore: 82,
    };
  }

  private generateInsights(
    costAnalytics: CostAnalytics,
    nutritionAnalytics: NutritionAnalytics,
    timeAnalytics: TimeAnalytics,
    preferenceAnalytics: PreferenceAnalytics
  ): AnalyticsInsight[] {
    const insights: AnalyticsInsight[] = [];
    
    // Cost insights
    if (costAnalytics.comparisonToPreviousPeriod < -10) {
      insights.push({
        type: 'success',
        category: 'cost',
        title: 'Great job saving money!',
        description: `You've reduced your meal costs by ${Math.abs(costAnalytics.comparisonToPreviousPeriod)}% compared to last period`,
        impact: 'high',
      });
    }
    
    // Nutrition insights
    if (nutritionAnalytics.nutritionalGoalAdherence > 80) {
      insights.push({
        type: 'achievement',
        category: 'nutrition',
        title: 'Nutrition goals on track',
        description: `You're meeting ${nutritionAnalytics.nutritionalGoalAdherence}% of your nutritional goals`,
        impact: 'high',
      });
    }
    
    // Time insights
    if (timeAnalytics.timeSavings > 30) {
      insights.push({
        type: 'success',
        category: 'time',
        title: 'Efficient meal preparation',
        description: `Batch cooking saved you ${timeAnalytics.timeSavings} minutes this period`,
        actionable: 'Consider batch cooking more recipes',
        impact: 'medium',
      });
    }
    
    // Preference insights
    if (preferenceAnalytics.varietyScore > 80) {
      insights.push({
        type: 'success',
        category: 'preference',
        title: 'Great recipe variety!',
        description: 'Your meal plan has excellent diversity with a variety score of ' + preferenceAnalytics.varietyScore,
        impact: 'medium',
      });
    }
    
    return insights;
  }
}

// Export singleton instance
export const advancedPlanningService = new AdvancedPlanningService();