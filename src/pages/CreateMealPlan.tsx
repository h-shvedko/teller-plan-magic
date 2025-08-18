import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save, ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { AIMealPlanSuggestion } from '@/components/ai/AIMealPlanSuggestion';

export const CreateMealPlan = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showAI, setShowAI] = useState(false);
  
  const [mealPlan, setMealPlan] = useState({
    name: '',
    week_start_date: '',
    is_active: true,
    meals: [] as any[]
  });

  const handleAIMealPlanSelect = (aiMealPlan: any) => {
    setMealPlan({
      name: aiMealPlan.name || '',
      week_start_date: aiMealPlan.week_start_date || '',
      is_active: aiMealPlan.is_active ?? true,
      meals: aiMealPlan.meals || []
    });
    setShowAI(false);
    toast({
      title: 'Meal Plan Selected',
      description: 'AI meal plan has been loaded. You can edit it before saving.'
    });
  };

  const handleSave = async () => {
    if (!mealPlan.name.trim() || !mealPlan.week_start_date) {
      toast({
        title: 'Error',
        description: 'Please enter meal plan name and start date',
        variant: 'destructive'
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to create meal plans',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      // Save meal plan to database
      const { data: mealPlanData, error: mealPlanError } = await supabase
        .from('meal_plans')
        .insert({
          name: mealPlan.name,
          week_start_date: mealPlan.week_start_date,
          is_active: mealPlan.is_active,
          user_id: user.id
        })
        .select()
        .single();

      if (mealPlanError) throw mealPlanError;

      // If we have AI-generated meals, we would save them here
      // For now, we'll just create the meal plan structure
      if (mealPlan.meals.length > 0) {
        // Create placeholder recipes for AI-suggested meals
        const mealRecipes = [];
        for (const meal of mealPlan.meals) {
          const { data: recipeData, error: recipeError } = await supabase
            .from('recipes')
            .insert({
              name: meal.recipe_name,
              description: meal.recipe_description || null,
              cuisine: meal.cuisine || null,
              prep_time: meal.prep_time || null,
              cook_time: meal.cook_time || null,
              difficulty: meal.difficulty || 'intermediate',
              meal_type: meal.meal_type || 'dinner',
              is_public: false,
              created_by: user.id
            })
            .select()
            .single();

          if (recipeError) {
            console.error('Error creating recipe:', recipeError);
            continue;
          }

          mealRecipes.push({
            meal_plan_id: mealPlanData.id,
            recipe_id: recipeData.id,
            day_of_week: meal.day,
            meal_type: meal.meal_type || 'dinner'
          });
        }

        if (mealRecipes.length > 0) {
          const { error: mealsError } = await supabase
            .from('meal_plan_recipes')
            .insert(mealRecipes);

          if (mealsError) {
            console.error('Error saving meal plan recipes:', mealsError);
          }
        }
      }

      toast({
        title: 'Success',
        description: 'Meal plan created successfully!'
      });
      
      navigate('/meal-plans');
    } catch (error) {
      console.error('Error creating meal plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to create meal plan',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (showAI) {
    return (
      <div className="min-h-screen bg-background">
        <Header showGetStarted={false} />
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Button 
                variant="outline" 
                onClick={() => setShowAI(false)}
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Manual Creation
              </Button>
              <h1 className="text-3xl font-bold">Create Meal Plan with AI</h1>
              <p className="text-muted-foreground">Get meal plan suggestions from AI or create manually</p>
            </div>
            
            <AIMealPlanSuggestion onMealPlanSelect={handleAIMealPlanSelect} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header showGetStarted={false} />
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Create New Meal Plan</h1>
            <p className="text-muted-foreground">Plan your meals for the week</p>
          </div>

          <div className="flex gap-4 mb-6">
            <Button 
              variant="outline"
              onClick={() => setShowAI(true)}
              className="flex-1"
            >
              Get AI Suggestions
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Meal Plan Details</CardTitle>
              <CardDescription>Enter the details for your new meal plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Meal Plan Name</Label>
                <Input
                  id="name"
                  value={mealPlan.name}
                  onChange={(e) => setMealPlan({ ...mealPlan, name: e.target.value })}
                  placeholder="e.g., Week of March 15th"
                />
              </div>

              <div>
                <Label htmlFor="week_start_date">Week Start Date</Label>
                <Input
                  id="week_start_date"
                  type="date"
                  value={mealPlan.week_start_date}
                  onChange={(e) => setMealPlan({ ...mealPlan, week_start_date: e.target.value })}
                />
              </div>

              {mealPlan.meals.length > 0 && (
                <div>
                  <Label>AI Generated Meals Preview</Label>
                  <div className="mt-2 space-y-2">
                    {mealPlan.meals.slice(0, 5).map((meal, index) => (
                      <div key={index} className="p-2 border rounded-md">
                        <div className="font-medium">Day {meal.day}: {meal.recipe_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {meal.meal_type} • {meal.cuisine} • {meal.difficulty}
                        </div>
                      </div>
                    ))}
                    {mealPlan.meals.length > 5 && (
                      <div className="text-sm text-muted-foreground">
                        ...and {mealPlan.meals.length - 5} more meals
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/meal-plans')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Meal Plan
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