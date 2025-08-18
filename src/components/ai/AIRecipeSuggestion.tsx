import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Wand2, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AIRecipeSuggestionProps {
  onRecipeSelect: (recipe: any) => void;
}

export const AIRecipeSuggestion = ({ onRecipeSelect }: AIRecipeSuggestionProps) => {
  const [activeMode, setActiveMode] = useState<'manual' | 'ai'>('manual');
  const [loading, setLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);

  // Manual recipe form state
  const [manualRecipe, setManualRecipe] = useState({
    name: '',
    cuisine: '',
    description: '',
    prep_time: '',
    cook_time: '',
    difficulty: 'intermediate',
    ingredients: '',
    instructions: ''
  });

  const handleAISuggestion = async () => {
    if (!aiPrompt.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a prompt for AI suggestions',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-recipe-suggestions', {
        body: { prompt: aiPrompt }
      });

      if (error) throw error;

      setSuggestions(data.suggestions || []);
      
      if (!data.suggestions || data.suggestions.length === 0) {
        toast({
          title: 'No suggestions',
          description: 'AI could not generate recipe suggestions for this prompt',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
      toast({
        title: 'Error',
        description: 'Failed to get AI recipe suggestions',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualCreate = () => {
    if (!manualRecipe.name.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a recipe name',
        variant: 'destructive'
      });
      return;
    }

    const recipe = {
      ...manualRecipe,
      prep_time: parseInt(manualRecipe.prep_time) || 0,
      cook_time: parseInt(manualRecipe.cook_time) || 0,
      dietary_tags: [],
      meal_type: 'dinner',
      servings: 2
    };

    onRecipeSelect(recipe);
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
            <CardTitle>Create Recipe Manually</CardTitle>
            <CardDescription>Enter recipe details manually</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Recipe Name</Label>
                <Input
                  id="name"
                  value={manualRecipe.name}
                  onChange={(e) => setManualRecipe({ ...manualRecipe, name: e.target.value })}
                  placeholder="e.g., Spaghetti Carbonara"
                />
              </div>
              <div>
                <Label htmlFor="cuisine">Cuisine</Label>
                <Input
                  id="cuisine"
                  value={manualRecipe.cuisine}
                  onChange={(e) => setManualRecipe({ ...manualRecipe, cuisine: e.target.value })}
                  placeholder="e.g., Italian"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={manualRecipe.description}
                onChange={(e) => setManualRecipe({ ...manualRecipe, description: e.target.value })}
                placeholder="Brief description of the recipe"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="prep_time">Prep Time (min)</Label>
                <Input
                  id="prep_time"
                  type="number"
                  value={manualRecipe.prep_time}
                  onChange={(e) => setManualRecipe({ ...manualRecipe, prep_time: e.target.value })}
                  placeholder="15"
                />
              </div>
              <div>
                <Label htmlFor="cook_time">Cook Time (min)</Label>
                <Input
                  id="cook_time"
                  type="number"
                  value={manualRecipe.cook_time}
                  onChange={(e) => setManualRecipe({ ...manualRecipe, cook_time: e.target.value })}
                  placeholder="30"
                />
              </div>
              <div>
                <Label htmlFor="difficulty">Difficulty</Label>
                <select
                  id="difficulty"
                  value={manualRecipe.difficulty}
                  onChange={(e) => setManualRecipe({ ...manualRecipe, difficulty: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <Button onClick={handleManualCreate} className="w-full">
              Create Recipe
            </Button>
          </CardContent>
        </Card>
      )}

      {/* AI Mode */}
      {activeMode === 'ai' && (
        <Card>
          <CardHeader>
            <CardTitle>AI Recipe Suggestions</CardTitle>
            <CardDescription>Get recipe suggestions from AI based on your preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="prompt">Describe what you want to cook</Label>
              <Textarea
                id="prompt"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g., Quick Italian pasta dish with chicken, healthy vegetarian dinner under 30 minutes"
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
                  Get AI Suggestions
                </>
              )}
            </Button>

            {/* AI Suggestions */}
            {suggestions.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Suggested Recipes</h3>
                <div className="grid gap-4">
                  {suggestions.map((recipe, index) => (
                    <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">{recipe.name}</h4>
                          <Badge variant="outline">{recipe.cuisine}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{recipe.description}</p>
                        <div className="flex gap-4 text-sm text-muted-foreground mb-3">
                          <span>Prep: {recipe.prep_time}min</span>
                          <span>Cook: {recipe.cook_time}min</span>
                          <span>Difficulty: {recipe.difficulty}</span>
                        </div>
                        <Button
                          onClick={() => onRecipeSelect(recipe)}
                          className="w-full"
                          size="sm"
                        >
                          Select This Recipe
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