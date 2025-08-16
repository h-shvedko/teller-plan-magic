import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface UserStats {
  // Activity counts
  totalMealPlans: number;
  activeMealPlans: number;
  totalRecipes: number;
  publicRecipes: number;
  totalShoppingLists: number;
  completedShoppingLists: number;
  
  // Time-based analytics
  weeklyActivity: Array<{
    week: string;
    mealPlans: number;
    recipes: number;
    shoppingLists: number;
  }>;
  
  // Cuisine preferences analytics
  cuisineDistribution: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
  
  // Meal type analytics
  mealTypeDistribution: Array<{
    type: string;
    count: number;
  }>;
  
  // Recipe analytics
  averageCookTime: number;
  averagePrepTime: number;
  difficultyDistribution: Array<{
    level: string;
    count: number;
  }>;
  
  // Health progress
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
  
  // Recent activity
  recentActivity: Array<{
    type: 'meal_plan' | 'recipe' | 'shopping_list';
    name: string;
    date: string;
  }>;
}

export const useUserStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    totalMealPlans: 0,
    activeMealPlans: 0,
    totalRecipes: 0,
    publicRecipes: 0,
    totalShoppingLists: 0,
    completedShoppingLists: 0,
    weeklyActivity: [],
    cuisineDistribution: [],
    mealTypeDistribution: [],
    averageCookTime: 0,
    averagePrepTime: 0,
    difficultyDistribution: [],
    completionRate: 0,
    currentStreak: 0,
    longestStreak: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const loadStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch basic counts
        const [mealPlansResult, recipesResult, shoppingListsResult] = await Promise.all([
          supabase
            .from('meal_plans')
            .select('id, is_active, created_at, name')
            .eq('user_id', user.id),
          supabase
            .from('recipes')
            .select('id, is_public, created_at, name, cuisine, cook_time, prep_time, difficulty, meal_type')
            .eq('created_by', user.id),
          supabase
            .from('shopping_lists')
            .select('id, is_completed, created_at, name')
            .eq('user_id', user.id)
        ]);

        if (mealPlansResult.error) throw mealPlansResult.error;
        if (recipesResult.error) throw recipesResult.error;
        if (shoppingListsResult.error) throw shoppingListsResult.error;

        const mealPlans = mealPlansResult.data || [];
        const recipes = recipesResult.data || [];
        const shoppingLists = shoppingListsResult.data || [];

        // Calculate basic stats
        const totalMealPlans = mealPlans.length;
        const activeMealPlans = mealPlans.filter(mp => mp.is_active).length;
        const totalRecipes = recipes.length;
        const publicRecipes = recipes.filter(r => r.is_public).length;
        const totalShoppingLists = shoppingLists.length;
        const completedShoppingLists = shoppingLists.filter(sl => sl.is_completed).length;

        // Calculate completion rate
        const completionRate = totalShoppingLists > 0 ? (completedShoppingLists / totalShoppingLists) * 100 : 0;

        // Calculate weekly activity (last 8 weeks)
        const weeklyActivity = calculateWeeklyActivity(mealPlans, recipes, shoppingLists);

        // Calculate cuisine distribution from recipes
        const cuisineDistribution = calculateCuisineDistribution(recipes);

        // Calculate meal type distribution
        const mealTypeDistribution = calculateMealTypeDistribution(recipes);

        // Calculate recipe analytics
        const averageCookTime = recipes.length > 0 ? 
          recipes.reduce((sum, r) => sum + (r.cook_time || 0), 0) / recipes.length : 0;
        const averagePrepTime = recipes.length > 0 ? 
          recipes.reduce((sum, r) => sum + (r.prep_time || 0), 0) / recipes.length : 0;

        // Calculate difficulty distribution
        const difficultyDistribution = calculateDifficultyDistribution(recipes);

        // Calculate streaks (simplified - based on consistent weekly activity)
        const { currentStreak, longestStreak } = calculateStreaks(weeklyActivity);

        // Get recent activity
        const recentActivity = getRecentActivity(mealPlans, recipes, shoppingLists);

        setStats({
          totalMealPlans,
          activeMealPlans,
          totalRecipes,
          publicRecipes,
          totalShoppingLists,
          completedShoppingLists,
          weeklyActivity,
          cuisineDistribution,
          mealTypeDistribution,
          averageCookTime,
          averagePrepTime,
          difficultyDistribution,
          completionRate,
          currentStreak,
          longestStreak,
          recentActivity
        });

      } catch (err) {
        console.error('Error loading user stats:', err);
        setError('Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [user]);

  return { stats, loading, error };
};

// Helper functions
function calculateWeeklyActivity(mealPlans: any[], recipes: any[], shoppingLists: any[]) {
  const weeks = [];
  const now = new Date();
  
  for (let i = 7; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - (i * 7));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    const weekLabel = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    const mealPlansCount = mealPlans.filter(mp => {
      const date = new Date(mp.created_at);
      return date >= weekStart && date <= weekEnd;
    }).length;
    
    const recipesCount = recipes.filter(r => {
      const date = new Date(r.created_at);
      return date >= weekStart && date <= weekEnd;
    }).length;
    
    const shoppingListsCount = shoppingLists.filter(sl => {
      const date = new Date(sl.created_at);
      return date >= weekStart && date <= weekEnd;
    }).length;
    
    weeks.push({
      week: weekLabel,
      mealPlans: mealPlansCount,
      recipes: recipesCount,
      shoppingLists: shoppingListsCount
    });
  }
  
  return weeks;
}

function calculateCuisineDistribution(recipes: any[]) {
  const cuisineCounts: Record<string, number> = {};
  const total = recipes.length;
  
  recipes.forEach(recipe => {
    if (recipe.cuisine) {
      cuisineCounts[recipe.cuisine] = (cuisineCounts[recipe.cuisine] || 0) + 1;
    }
  });
  
  return Object.entries(cuisineCounts)
    .map(([name, count]) => ({
      name,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // Top 5 cuisines
}

function calculateMealTypeDistribution(recipes: any[]) {
  const mealTypeCounts: Record<string, number> = {};
  
  recipes.forEach(recipe => {
    if (recipe.meal_type) {
      mealTypeCounts[recipe.meal_type] = (mealTypeCounts[recipe.meal_type] || 0) + 1;
    }
  });
  
  return Object.entries(mealTypeCounts).map(([type, count]) => ({
    type: type.charAt(0).toUpperCase() + type.slice(1),
    count
  }));
}

function calculateDifficultyDistribution(recipes: any[]) {
  const difficultyCounts: Record<string, number> = {};
  
  recipes.forEach(recipe => {
    if (recipe.difficulty) {
      difficultyCounts[recipe.difficulty] = (difficultyCounts[recipe.difficulty] || 0) + 1;
    }
  });
  
  return Object.entries(difficultyCounts).map(([level, count]) => ({
    level: level.charAt(0).toUpperCase() + level.slice(1),
    count
  }));
}

function calculateStreaks(weeklyActivity: any[]) {
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  
  // Calculate from most recent week backwards
  for (let i = weeklyActivity.length - 1; i >= 0; i--) {
    const hasActivity = weeklyActivity[i].mealPlans > 0 || 
                       weeklyActivity[i].recipes > 0 || 
                       weeklyActivity[i].shoppingLists > 0;
    
    if (hasActivity) {
      tempStreak++;
      if (i === weeklyActivity.length - 1) {
        currentStreak = tempStreak;
      }
    } else {
      if (i === weeklyActivity.length - 1) {
        currentStreak = 0;
      }
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 0;
    }
  }
  
  longestStreak = Math.max(longestStreak, tempStreak);
  
  return { currentStreak, longestStreak };
}

function getRecentActivity(mealPlans: any[], recipes: any[], shoppingLists: any[]) {
  const allActivity = [
    ...mealPlans.map(mp => ({
      type: 'meal_plan' as const,
      name: mp.name,
      date: mp.created_at
    })),
    ...recipes.map(r => ({
      type: 'recipe' as const,
      name: r.name,
      date: r.created_at
    })),
    ...shoppingLists.map(sl => ({
      type: 'shopping_list' as const,
      name: sl.name,
      date: sl.created_at
    }))
  ];
  
  return allActivity
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
}