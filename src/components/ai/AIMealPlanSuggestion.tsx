import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Wand2, User, Calendar } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AIMealPlanSuggestionProps {
  onMealPlanSelect: (mealPlan: any) => void;
}

export const AIMealPlanSuggestion = ({ onMealPlanSelect }: AIMealPlanSuggestionProps) => {
  const [activeMode, setActiveMode] = useState<'manual' | 'ai'>('manual');
  const [loading, setLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);

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
        body: { prompt: aiPrompt }
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

    const mealPlan = {
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
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="prompt">Describe your meal plan preferences</Label>
              <Textarea
                id="prompt"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g., Weekly meal plan for family of 4, vegetarian, budget-friendly, quick weekday meals"
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