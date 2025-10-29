import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Wand2, User, Calendar } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSettings } from '@/hooks/useSettings';
import type { Database } from '@/integrations/supabase/types';

interface MealPlanMeal {
  day: number;
  recipe_name: string;
  meal_type: string;
  recipe_id?: string;
}

interface AISuggestedMealPlan {
  name: string;
  description: string;
  days: number;
  week_start_date?: string;
  is_active?: boolean;
  meals?: MealPlanMeal[];
}

interface ManualMealPlan {
  name: string;
  week_start_date: string;
  days: number;
  is_active: boolean;
  meals: MealPlanMeal[];
}

interface AIMealPlanSuggestionProps {
  onMealPlanSelect: (mealPlan: AISuggestedMealPlan | ManualMealPlan) => void;
}

export const AIMealPlanSuggestion = ({ onMealPlanSelect }: AIMealPlanSuggestionProps) => {
  const [activeMode, setActiveMode] = useState<'manual' | 'ai'>('manual');
  const [loading, setLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [suggestions, setSuggestions] = useState<AISuggestedMealPlan[]>([]);
  const { settings, loading: settingsLoading } = useSettings();

  // AI preferences state
  const [preferences, setPreferences] = useState({
    cuisines: [] as string[],
    dietaryPreferences: [] as string[],
    healthGoals: [] as string[],
    cookingStyle: '',
    householdSize: 2,
    difficultyLevel: 'intermediate',
    budgetRange: 'medium'
  });

  // Manual meal plan form state
  const [manualPlan, setManualPlan] = useState({
    name: '',
    week_start_date: '',
    days: 7
  });

  const handleAISuggestion = async () => {
    if (!aiPrompt.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a prompt for AI meal plan suggestions',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-meal-plan-suggestions', {
        body: { 
          prompt: aiPrompt,
          preferences: preferences
        }
      });

      if (error) throw error;

      setSuggestions(data.suggestions || []);
      
      if (!data.suggestions || data.suggestions.length === 0) {
        toast({
          title: 'No suggestions',
          description: 'AI could not generate meal plan suggestions for this prompt',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
      toast({
        title: 'Error',
        description: 'Failed to get AI meal plan suggestions',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualCreate = () => {
    if (!manualPlan.name.trim() || !manualPlan.week_start_date) {
      toast({
        title: 'Error',
        description: 'Please enter meal plan name and start date',
        variant: 'destructive'
      });
      return;
    }

    const mealPlan: ManualMealPlan = {
      ...manualPlan,
      is_active: true,
      meals: [] // Empty meals array for manual creation
    };

    onMealPlanSelect(mealPlan);
  };

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      <div className="flex gap-4">
        <Button
          variant={activeMode === 'manual' ? 'default' : 'outline'}
          onClick={() => setActiveMode('manual')}
          className="flex-1"
        >
          <User className="h-4 w-4 mr-2" />
          Manual Creation
        </Button>
        <Button
          variant={activeMode === 'ai' ? 'default' : 'outline'}
          onClick={() => setActiveMode('ai')}
          className="flex-1"
        >
          <Wand2 className="h-4 w-4 mr-2" />
          AI Suggestions
        </Button>
      </div>

      {/* Manual Mode */}
      {activeMode === 'manual' && (
        <Card>
          <CardHeader>
            <CardTitle>Create Meal Plan Manually</CardTitle>
            <CardDescription>Set up a new meal plan from scratch</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Meal Plan Name</Label>
              <Input
                id="name"
                value={manualPlan.name}
                onChange={(e) => setManualPlan({ ...manualPlan, name: e.target.value })}
                placeholder="e.g., Week of March 15th"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="week_start_date">Week Start Date</Label>
                <Input
                  id="week_start_date"
                  type="date"
                  value={manualPlan.week_start_date}
                  onChange={(e) => setManualPlan({ ...manualPlan, week_start_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="days">Number of Days</Label>
                <Input
                  id="days"
                  type="number"
                  min="1"
                  max="14"
                  value={manualPlan.days}
                  onChange={(e) => setManualPlan({ ...manualPlan, days: parseInt(e.target.value) || 7 })}
                />
              </div>
            </div>

            <Button onClick={handleManualCreate} className="w-full">
              <Calendar className="h-4 w-4 mr-2" />
              Create Meal Plan
            </Button>
          </CardContent>
        </Card>
      )}

      {/* AI Mode */}
      {activeMode === 'ai' && (
        <Card>
          <CardHeader>
            <CardTitle>AI Meal Plan Suggestions</CardTitle>
            <CardDescription>Get complete meal plan suggestions from AI</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Preferences Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Meal Plan Preferences</h4>
              
              {/* Cuisine Preferences */}
              <div>
                <Label className="text-sm font-medium">Favorite Cuisines</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {!settingsLoading && settings.cuisines.map((cuisine) => (
                    <div key={cuisine.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`cuisine-${cuisine.id}`}
                        checked={preferences.cuisines.includes(cuisine.name)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setPreferences(prev => ({
                              ...prev,
                              cuisines: [...prev.cuisines, cuisine.name]
                            }));
                          } else {
                            setPreferences(prev => ({
                              ...prev,
                              cuisines: prev.cuisines.filter(c => c !== cuisine.name)
                            }));
                          }
                        }}
                      />
                      <Label htmlFor={`cuisine-${cuisine.id}`} className="text-sm">{cuisine.name}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dietary Preferences */}
              <div>
                <Label className="text-sm font-medium">Dietary Preferences</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {!settingsLoading && settings.dietaryPreferences.map((diet) => (
                    <div key={diet.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`diet-${diet.id}`}
                        checked={preferences.dietaryPreferences.includes(diet.name)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setPreferences(prev => ({
                              ...prev,
                              dietaryPreferences: [...prev.dietaryPreferences, diet.name]
                            }));
                          } else {
                            setPreferences(prev => ({
                              ...prev,
                              dietaryPreferences: prev.dietaryPreferences.filter(d => d !== diet.name)
                            }));
                          }
                        }}
                      />
                      <Label htmlFor={`diet-${diet.id}`} className="text-sm">{diet.name}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Health Goals */}
              <div>
                <Label className="text-sm font-medium">Health Goals</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {!settingsLoading && settings.healthGoals.map((goal) => (
                    <div key={goal.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`goal-${goal.id}`}
                        checked={preferences.healthGoals.includes(goal.name)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setPreferences(prev => ({
                              ...prev,
                              healthGoals: [...prev.healthGoals, goal.name]
                            }));
                          } else {
                            setPreferences(prev => ({
                              ...prev,
                              healthGoals: prev.healthGoals.filter(g => g !== goal.name)
                            }));
                          }
                        }}
                      />
                      <Label htmlFor={`goal-${goal.id}`} className="text-sm">{goal.name}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Preferences */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cookingStyle" className="text-sm font-medium">Cooking Style</Label>
                  <Select value={preferences.cookingStyle} onValueChange={(value) => setPreferences(prev => ({ ...prev, cookingStyle: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select cooking style" />
                    </SelectTrigger>
                    <SelectContent>
                      {!settingsLoading && settings.cookingStyles.map((style) => (
                        <SelectItem key={style.id} value={style.name}>{style.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="householdSize" className="text-sm font-medium">Household Size</Label>
                  <Input
                    id="householdSize"
                    type="number"
                    min="1"
                    max="10"
                    value={preferences.householdSize}
                    onChange={(e) => setPreferences(prev => ({ ...prev, householdSize: parseInt(e.target.value) || 2 }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="difficultyLevel" className="text-sm font-medium">Difficulty Level</Label>
                  <Select value={preferences.difficultyLevel} onValueChange={(value) => setPreferences(prev => ({ ...prev, difficultyLevel: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="budgetRange" className="text-sm font-medium">Budget Range</Label>
                  <Select value={preferences.budgetRange} onValueChange={(value) => setPreferences(prev => ({ ...prev, budgetRange: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Budget-friendly</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="prompt">Additional Description (Optional)</Label>
              <Textarea
                id="prompt"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g., Need quick weekday meals, special occasions, specific ingredients to use..."
                rows={3}
              />
            </div>

            <Button
              onClick={handleAISuggestion}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Getting AI Suggestions...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Get AI Meal Plan Suggestions
                </>
              )}
            </Button>

            {/* AI Suggestions */}
            {suggestions.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Suggested Meal Plans</h3>
                <div className="grid gap-4">
                  {suggestions.map((plan, index) => (
                    <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">{plan.name}</h4>
                          <Badge variant="outline">{plan.days} days</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{plan.description}</p>
                        
                        {/* Meal Preview */}
                        {plan.meals && plan.meals.length > 0 && (
                          <div className="mb-3">
                            <h5 className="text-sm font-medium mb-2">Sample Meals:</h5>
                            <div className="grid grid-cols-1 gap-1">
                              {plan.meals.slice(0, 3).map((meal, mealIndex) => (
                                <div key={mealIndex} className="text-xs text-muted-foreground">
                                  Day {meal.day}: {meal.recipe_name} ({meal.meal_type})
                                </div>
                              ))}
                              {plan.meals.length > 3 && (
                                <div className="text-xs text-muted-foreground">
                                  ...and {plan.meals.length - 3} more meals
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        <Button
                          onClick={() => onMealPlanSelect(plan)}
                          className="w-full"
                          size="sm"
                        >
                          Select This Meal Plan
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};