import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { AIRecipeSuggestion } from '@/components/ai/AIRecipeSuggestion';

interface AIRecipe {
  name?: string;
  description?: string;
  cuisine?: string;
  prep_time?: number;
  cook_time?: number;
  servings?: number;
  difficulty?: string;
  ingredients?: string[];
  instructions?: string[];
  dietary_tags?: string[];
  meal_type?: string;
}

export const CreateRecipe = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showAI, setShowAI] = useState(false);
  
  const [recipe, setRecipe] = useState({
    name: '',
    description: '',
    cuisine: '',
    prep_time: '',
    cook_time: '',
    servings: '2',
    difficulty: 'intermediate',
    ingredients: '',
    instructions: '',
    dietary_tags: [],
    meal_type: 'dinner',
    is_public: true
  });

  const handleAIRecipeSelect = (aiRecipe: AIRecipe) => {
    setRecipe({
      ...recipe,
      name: aiRecipe.name || '',
      description: aiRecipe.description || '',
      cuisine: aiRecipe.cuisine || '',
      prep_time: aiRecipe.prep_time?.toString() || '',
      cook_time: aiRecipe.cook_time?.toString() || '',
      servings: aiRecipe.servings?.toString() || '2',
      difficulty: aiRecipe.difficulty || 'intermediate',
      ingredients: Array.isArray(aiRecipe.ingredients) ? aiRecipe.ingredients.join('\n') : '',
      instructions: Array.isArray(aiRecipe.instructions) ? aiRecipe.instructions.join('\n') : '',
      dietary_tags: aiRecipe.dietary_tags || [],
      meal_type: aiRecipe.meal_type || 'dinner'
    });
    setShowAI(false);
    toast({
      title: 'Recipe Selected',
      description: 'AI recipe has been loaded. You can edit it before saving.'
    });
  };

  const handleSave = async () => {
    if (!recipe.name.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a recipe name',
        variant: 'destructive'
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to create recipes',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      // Save recipe to database
      const { data: recipeData, error: recipeError } = await supabase
        .from('recipes')
        .insert({
          name: recipe.name,
          description: recipe.description || null,
          cuisine: recipe.cuisine || null,
          prep_time: parseInt(recipe.prep_time) || null,
          cook_time: parseInt(recipe.cook_time) || null,
          servings: parseInt(recipe.servings) || 2,
          difficulty: recipe.difficulty as 'beginner' | 'intermediate' | 'advanced',
          instructions: recipe.instructions || null,
          dietary_tags: recipe.dietary_tags,
          meal_type: recipe.meal_type as 'breakfast' | 'lunch' | 'dinner' | 'snack',
          is_public: recipe.is_public,
          created_by: user.id
        })
        .select()
        .single();

      if (recipeError) throw recipeError;

      // Save ingredients if provided
      if (recipe.ingredients.trim()) {
        const ingredientLines = recipe.ingredients.split('\n').filter(line => line.trim());
        const ingredients = ingredientLines.map(line => ({
          recipe_id: recipeData.id,
          ingredient_name: line.trim(),
          quantity: null,
          unit: null,
          aisle_category: null
        }));

        const { error: ingredientsError } = await supabase
          .from('recipe_ingredients')
          .insert(ingredients);

        if (ingredientsError) {
          console.error('Error saving ingredients:', ingredientsError);
          // Don't throw here, recipe is already saved
        }
      }

      toast({
        title: 'Success',
        description: 'Recipe created successfully!'
      });
      
      navigate('/recipes');
    } catch (error) {
      console.error('Error creating recipe:', error);
      toast({
        title: 'Error',
        description: 'Failed to create recipe',
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
              <h1 className="text-3xl font-bold">Create Recipe with AI</h1>
              <p className="text-muted-foreground">Get recipe suggestions from AI or create manually</p>
            </div>
            
            <AIRecipeSuggestion onRecipeSelect={handleAIRecipeSelect} />
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
            <h1 className="text-3xl font-bold">Create New Recipe</h1>
            <p className="text-muted-foreground">Add a new recipe to your collection</p>
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
              <CardTitle>Recipe Details</CardTitle>
              <CardDescription>Enter the details for your new recipe</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Recipe Name</Label>
                  <Input
                    id="name"
                    value={recipe.name}
                    onChange={(e) => setRecipe({ ...recipe, name: e.target.value })}
                    placeholder="e.g., Spaghetti Carbonara"
                  />
                </div>
                <div>
                  <Label htmlFor="cuisine">Cuisine</Label>
                  <Input
                    id="cuisine"
                    value={recipe.cuisine}
                    onChange={(e) => setRecipe({ ...recipe, cuisine: e.target.value })}
                    placeholder="e.g., Italian"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={recipe.description}
                  onChange={(e) => setRecipe({ ...recipe, description: e.target.value })}
                  placeholder="Brief description of the recipe"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="prep_time">Prep Time (min)</Label>
                  <Input
                    id="prep_time"
                    type="number"
                    value={recipe.prep_time}
                    onChange={(e) => setRecipe({ ...recipe, prep_time: e.target.value })}
                    placeholder="15"
                  />
                </div>
                <div>
                  <Label htmlFor="cook_time">Cook Time (min)</Label>
                  <Input
                    id="cook_time"
                    type="number"
                    value={recipe.cook_time}
                    onChange={(e) => setRecipe({ ...recipe, cook_time: e.target.value })}
                    placeholder="30"
                  />
                </div>
                <div>
                  <Label htmlFor="servings">Servings</Label>
                  <Input
                    id="servings"
                    type="number"
                    value={recipe.servings}
                    onChange={(e) => setRecipe({ ...recipe, servings: e.target.value })}
                    placeholder="2"
                  />
                </div>
                <div>
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <select
                    id="difficulty"
                    value={recipe.difficulty}
                    onChange={(e) => setRecipe({ ...recipe, difficulty: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-md"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="ingredients">Ingredients</Label>
                <Textarea
                  id="ingredients"
                  value={recipe.ingredients}
                  onChange={(e) => setRecipe({ ...recipe, ingredients: e.target.value })}
                  placeholder="Enter ingredients, one per line"
                  rows={6}
                />
              </div>

              <div>
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  value={recipe.instructions}
                  onChange={(e) => setRecipe({ ...recipe, instructions: e.target.value })}
                  placeholder="Enter cooking instructions"
                  rows={6}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/recipes')}
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
                      Save Recipe
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