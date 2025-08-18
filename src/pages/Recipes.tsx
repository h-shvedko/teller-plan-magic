import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Loader2, Plus, Edit, Trash2, ChefHat, Clock, Users } from 'lucide-react';
import { format } from 'date-fns';
import { useSettings } from '@/hooks/useSettings';

interface Recipe {
  id: string;
  name: string;
  description: string;
  cuisine: string;
  difficulty: string;
  meal_type: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  is_public: boolean;
  instructions: string;
  created_at: string;
  updated_at: string;
}

export const Recipes = () => {
  const { user } = useAuth();
  const { settings, loading: settingsLoading } = useSettings();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cuisine: '',
    difficulty: 'intermediate' as 'beginner' | 'intermediate' | 'advanced',
    meal_type: 'dinner' as 'breakfast' | 'lunch' | 'dinner' | 'snack',
    prep_time: 15,
    cook_time: 30,
    servings: 2,
    is_public: true,
    instructions: ''
  });
  const [saving, setSaving] = useState(false);

  const loadRecipes = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecipes(data || []);
    } catch (error) {
      console.error('Error loading recipes:', error);
      toast({
        title: 'Error',
        description: 'Failed to load recipes',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadRecipes();
  }, [loadRecipes]);

  const handleSave = async () => {
    if (!user || !formData.name) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSaving(true);
      
      if (editingRecipe) {
        const { error } = await supabase
          .from('recipes')
          .update(formData)
          .eq('id', editingRecipe.id);
        
        if (error) throw error;
        toast({ title: 'Success', description: 'Recipe updated successfully' });
      } else {
        const { error } = await supabase
          .from('recipes')
          .insert({ ...formData, created_by: user.id });
        
        if (error) throw error;
        toast({ title: 'Success', description: 'Recipe created successfully' });
      }

      setDialogOpen(false);
      resetForm();
      loadRecipes();
    } catch (error) {
      console.error('Error saving recipe:', error);
      toast({
        title: 'Error',
        description: 'Failed to save recipe',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setFormData({
      name: recipe.name,
      description: recipe.description || '',
      cuisine: recipe.cuisine || '',
      difficulty: (recipe.difficulty || 'intermediate') as 'beginner' | 'intermediate' | 'advanced',
      meal_type: (recipe.meal_type || 'dinner') as 'breakfast' | 'lunch' | 'dinner' | 'snack',
      prep_time: recipe.prep_time || 15,
      cook_time: recipe.cook_time || 30,
      servings: recipe.servings || 2,
      is_public: recipe.is_public,
      instructions: recipe.instructions || ''
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recipe?')) return;

    try {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Success', description: 'Recipe deleted successfully' });
      loadRecipes();
    } catch (error) {
      console.error('Error deleting recipe:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete recipe',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      cuisine: '',
      difficulty: 'intermediate' as 'beginner' | 'intermediate' | 'advanced',
      meal_type: 'dinner' as 'breakfast' | 'lunch' | 'dinner' | 'snack',
      prep_time: 15,
      cook_time: 30,
      servings: 2,
      is_public: true,
      instructions: ''
    });
    setEditingRecipe(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  if (loading || settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading recipes...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header showGetStarted={false} />
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <ChefHat className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold">Recipes</h1>
              </div>
              <p className="text-muted-foreground">Create and manage your recipe collection</p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Recipe
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingRecipe ? 'Edit Recipe' : 'Create New Recipe'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingRecipe ? 'Update your recipe details' : 'Add a new recipe to your collection'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="name">Recipe Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Chicken Teriyaki"
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Brief description of the recipe"
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cuisine">Cuisine</Label>
                      <Select
                        value={formData.cuisine}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, cuisine: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select cuisine" />
                        </SelectTrigger>
                        <SelectContent>
                          {settings.cuisines.map((cuisine) => (
                            <SelectItem key={cuisine.id} value={cuisine.name}>
                              {cuisine.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="difficulty">Difficulty</Label>
                      <Select
                        value={formData.difficulty}
                        onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') => setFormData(prev => ({ ...prev, difficulty: value }))}
                      >
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
                    <div className="space-y-2">
                      <Label htmlFor="meal_type">Meal Type</Label>
                      <Select
                        value={formData.meal_type}
                        onValueChange={(value: 'breakfast' | 'lunch' | 'dinner' | 'snack') => setFormData(prev => ({ ...prev, meal_type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="breakfast">Breakfast</SelectItem>
                          <SelectItem value="lunch">Lunch</SelectItem>
                          <SelectItem value="dinner">Dinner</SelectItem>
                          <SelectItem value="snack">Snack</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="servings">Servings</Label>
                      <Input
                        id="servings"
                        type="number"
                        min="1"
                        value={formData.servings}
                        onChange={(e) => setFormData(prev => ({ ...prev, servings: parseInt(e.target.value) || 2 }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="prep_time">Prep Time (minutes)</Label>
                      <Input
                        id="prep_time"
                        type="number"
                        min="0"
                        value={formData.prep_time}
                        onChange={(e) => setFormData(prev => ({ ...prev, prep_time: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cook_time">Cook Time (minutes)</Label>
                      <Input
                        id="cook_time"
                        type="number"
                        min="0"
                        value={formData.cook_time}
                        onChange={(e) => setFormData(prev => ({ ...prev, cook_time: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="instructions">Instructions</Label>
                      <Textarea
                        id="instructions"
                        value={formData.instructions}
                        onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                        placeholder="Step-by-step cooking instructions"
                        rows={4}
                      />
                    </div>
                    <div className="col-span-2 flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="is_public"
                        checked={formData.is_public}
                        onChange={(e) => setFormData(prev => ({ ...prev, is_public: e.target.checked }))}
                        className="rounded"
                      />
                      <Label htmlFor="is_public">Make this recipe public</Label>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      editingRecipe ? 'Update' : 'Create'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Recipes Table */}
          <Card>
            <CardHeader>
              <CardTitle>Your Recipes</CardTitle>
              <CardDescription>
                {recipes.length} recipe{recipes.length !== 1 ? 's' : ''} in your collection
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recipes.length === 0 ? (
                <div className="text-center py-8">
                  <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No recipes yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Add your first recipe to start building your collection
                  </p>
                  <Button onClick={openCreateDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Recipe
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Cuisine</TableHead>
                      <TableHead>Difficulty</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Servings</TableHead>
                      <TableHead>Visibility</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recipes.map((recipe) => (
                      <TableRow key={recipe.id}>
                        <TableCell className="font-medium">{recipe.name}</TableCell>
                        <TableCell>{recipe.cuisine || 'Not specified'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {recipe.difficulty?.charAt(0).toUpperCase() + recipe.difficulty?.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {(recipe.prep_time || 0) + (recipe.cook_time || 0)}m
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {recipe.servings}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={recipe.is_public ? 'default' : 'secondary'}>
                            {recipe.is_public ? 'Public' : 'Private'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(recipe)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(recipe.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};