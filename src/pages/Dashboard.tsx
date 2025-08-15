import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { Loader2, Save, User, Settings } from 'lucide-react';

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

const DIETARY_OPTIONS = [
  'vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free', 'low-carb', 'keto', 'paleo'
];

const CUISINE_OPTIONS = [
  'italian', 'mexican', 'asian', 'mediterranean', 'indian', 'american', 'french', 'thai', 'chinese', 'japanese'
];

const HEALTH_GOALS = [
  'weight-loss', 'muscle-gain', 'heart-health', 'diabetes-friendly', 'high-protein', 'low-sodium'
];

export const Dashboard = () => {
  const { user } = useAuth();
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

  useEffect(() => {
    if (user) {
      loadPreferences();
    }
  }, [user]);

  const loadPreferences = async () => {
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
    } catch (error) {
      console.error('Error loading preferences:', error);
      toast({
        title: "Error",
        description: "Failed to load your preferences",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

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
        title: "Success",
        description: "Your preferences have been saved"
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error",
        description: "Failed to save your preferences",
        variant: "destructive"
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading your preferences...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <User className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Dashboard</h1>
            </div>
            <p className="text-muted-foreground">Customize your meal planning preferences</p>
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
                    onValueChange={(value: any) => setPreferences(prev => ({ ...prev, cooking_style: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select cooking style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quick">Quick & Easy</SelectItem>
                      <SelectItem value="elaborate">Elaborate & Detailed</SelectItem>
                      <SelectItem value="mixed">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select 
                    value={preferences.difficulty_level} 
                    onValueChange={(value: any) => setPreferences(prev => ({ ...prev, difficulty_level: value }))}
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
                  {DIETARY_OPTIONS.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={option}
                        checked={preferences.dietary_restrictions.includes(option)}
                        onCheckedChange={(checked) => updateArrayField('dietary_restrictions', option, !!checked)}
                      />
                      <Label htmlFor={option} className="text-sm capitalize">
                        {option.replace('-', ' ')}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Favorite Cuisines */}
              <div className="space-y-3">
                <Label>Favorite Cuisines</Label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {CUISINE_OPTIONS.map((cuisine) => (
                    <div key={cuisine} className="flex items-center space-x-2">
                      <Checkbox
                        id={cuisine}
                        checked={preferences.favorite_cuisines.includes(cuisine)}
                        onCheckedChange={(checked) => updateArrayField('favorite_cuisines', cuisine, !!checked)}
                      />
                      <Label htmlFor={cuisine} className="text-sm capitalize">
                        {cuisine}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Health Goals */}
              <div className="space-y-3">
                <Label>Health Goals</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {HEALTH_GOALS.map((goal) => (
                    <div key={goal} className="flex items-center space-x-2">
                      <Checkbox
                        id={goal}
                        checked={preferences.health_goals.includes(goal)}
                        onCheckedChange={(checked) => updateArrayField('health_goals', goal, !!checked)}
                      />
                      <Label htmlFor={goal} className="text-sm capitalize">
                        {goal.replace('-', ' ')}
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