import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { Loader2, Save, User, Settings, TrendingUp, Calendar, ChefHat, ShoppingCart, Target, Award } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { useUserStats } from '@/hooks/useUserStats';
import { StatCard } from '@/components/dashboard/StatCard';
import { ActivityChart } from '@/components/dashboard/ActivityChart';
import { CuisineChart } from '@/components/dashboard/CuisineChart';
import { RecentActivity } from '@/components/dashboard/RecentActivity';

interface UserPreferences {
  id?: string;
  dietary_restrictions: string[];
  cooking_style: 'quick' | 'elaborate' | 'mixed';
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  household_size: number;
  budget_range: string;
  favorite_cuisines: string[];
  health_goals: string[];
}

// Settings will be loaded from database via useSettings hook

export const Dashboard = () => {
  const { user } = useAuth();
  const { settings, loading: settingsLoading, error: settingsError } = useSettings();
  const { stats, loading: statsLoading, error: statsError } = useUserStats();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>({
    dietary_restrictions: [],
    cooking_style: 'mixed',
    difficulty_level: 'intermediate',
    household_size: 2,
    budget_range: 'moderate',
    favorite_cuisines: [],
    health_goals: []
  });

  const loadPreferences = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setPreferences({
          id: data.id,
          dietary_restrictions: data.dietary_restrictions || [],
          cooking_style: data.cooking_style || 'mixed',
          difficulty_level: data.difficulty_level || 'intermediate',
          household_size: data.household_size || 2,
          budget_range: data.budget_range || 'moderate',
          favorite_cuisines: data.favorite_cuisines || [],
          health_goals: data.health_goals || []
        });
      }
    } catch (error: unknown) {
      console.error('Error loading preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your preferences',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadPreferences();
    }
  }, [user, loadPreferences]);

  const savePreferences = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const preferencesData = {
        user_id: user.id,
        dietary_restrictions: preferences.dietary_restrictions,
        cooking_style: preferences.cooking_style,
        difficulty_level: preferences.difficulty_level,
        household_size: preferences.household_size,
        budget_range: preferences.budget_range,
        favorite_cuisines: preferences.favorite_cuisines,
        health_goals: preferences.health_goals
      };

      const { error } = await supabase
        .from('user_preferences')
        .upsert(preferencesData);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Your preferences have been saved'
      });
    } catch (error: unknown) {
      console.error('Error saving preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to save your preferences',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const updateArrayField = (field: keyof UserPreferences, value: string, checked: boolean) => {
    setPreferences(prev => {
      const currentArray = prev[field] as string[];
      if (checked) {
        return { ...prev, [field]: [...currentArray, value] };
      } else {
        return { ...prev, [field]: currentArray.filter(item => item !== value) };
      }
    });
  };

  if (loading || settingsLoading || statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  if (settingsError || statsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">Error loading data: {settingsError || statsError}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header showGetStarted={false} />
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <User className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Dashboard</h1>
            </div>
            <p className="text-muted-foreground">Your meal planning analytics and preferences</p>
          </div>

          {/* Statistics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Meal Plans"
              value={stats.totalMealPlans}
              description={`${stats.activeMealPlans} active`}
              icon={<Calendar />}
              href="/meal-plans"
            />
            <StatCard
              title="Recipes"
              value={stats.totalRecipes}
              description={`${stats.publicRecipes} public`}
              icon={<ChefHat />}
              href="/recipes"
            />
            <StatCard
              title="Shopping Lists"
              value={stats.totalShoppingLists}
              description={`${Math.round(stats.completionRate)}% completion rate`}
              icon={<ShoppingCart />}
              href="/shopping-lists"
            />
            <StatCard
              title="Current Streak"
              value={`${stats.currentStreak} weeks`}
              description={`Longest: ${stats.longestStreak} weeks`}
              icon={<Award />}
            />
          </div>

          {/* Charts and Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <ActivityChart data={stats.weeklyActivity} />
            <CuisineChart data={stats.cuisineDistribution} />
          </div>

          {/* Recent Activity */}
          <div className="mb-8">
            <RecentActivity data={stats.recentActivity} />
          </div>

          {/* Preferences Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Preferences
              </CardTitle>
              <CardDescription>
                Set your dietary preferences and cooking style to get personalized meal plans
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Settings */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="cooking-style">Cooking Style</Label>
                  <Select
                    value={preferences.cooking_style}
                    onValueChange={(value: 'quick' | 'elaborate' | 'mixed') => setPreferences(prev => ({ ...prev, cooking_style: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select cooking style" />
                    </SelectTrigger>
                    <SelectContent>
                      {settings.cookingStyles.map((style) => (
                        <SelectItem key={style.id} value={style.name}>
                          {style.name.charAt(0).toUpperCase() + style.name.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select
                    value={preferences.difficulty_level}
                    onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') => setPreferences(prev => ({ ...prev, difficulty_level: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="household-size">Household Size</Label>
                  <Input
                    id="household-size"
                    type="number"
                    min="1"
                    max="10"
                    value={preferences.household_size}
                    onChange={(e) => setPreferences(prev => ({ ...prev, household_size: parseInt(e.target.value) || 2 }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget">Budget Range</Label>
                  <Select
                    value={preferences.budget_range}
                    onValueChange={(value) => setPreferences(prev => ({ ...prev, budget_range: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select budget range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Budget</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="high">High Budget</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Dietary Restrictions */}
              <div className="space-y-3">
                <Label>Dietary Restrictions</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {settings.dietaryPreferences.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={option.name}
                        checked={preferences.dietary_restrictions.includes(option.name)}
                        onCheckedChange={(checked) => updateArrayField('dietary_restrictions', option.name, !!checked)}
                      />
                      <Label htmlFor={option.name} className="text-sm">
                        {option.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Favorite Cuisines */}
              <div className="space-y-3">
                <Label>Favorite Cuisines</Label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {settings.cuisines.map((cuisine) => (
                    <div key={cuisine.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={cuisine.name}
                        checked={preferences.favorite_cuisines.includes(cuisine.name)}
                        onCheckedChange={(checked) => updateArrayField('favorite_cuisines', cuisine.name, !!checked)}
                      />
                      <Label htmlFor={cuisine.name} className="text-sm">
                        {cuisine.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Health Goals */}
              <div className="space-y-3">
                <Label>Health Goals</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {settings.healthGoals.map((goal) => (
                    <div key={goal.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={goal.name}
                        checked={preferences.health_goals.includes(goal.name)}
                        onCheckedChange={(checked) => updateArrayField('health_goals', goal.name, !!checked)}
                      />
                      <Label htmlFor={goal.name} className="text-sm">
                        {goal.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-4">
                <Button onClick={savePreferences} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Preferences
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

