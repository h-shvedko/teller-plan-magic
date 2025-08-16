import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Users, 
  ChefHat, 
  ClipboardList, 
  ShoppingCart, 
  Settings, 
  Calendar,
  Loader2,
  Plus,
  Edit,
  Trash2,
  Save
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AdminStats {
  totalUsers: number;
  totalRecipes: number;
  totalMealPlans: number;
  totalShoppingLists: number;
}

interface ProfileItem {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  created_at: string;
  user_email?: string;
}

interface RecipeItem {
  id: string;
  name: string;
  cuisine: string | null;
  difficulty: string;
  created_by: string | null;
  is_public: boolean;
  created_at: string;
}

interface MealPlanItem {
  id: string;
  name: string;
  week_start_date: string;
  user_id: string;
  is_active: boolean;
  created_at: string;
  user_email?: string;
}

interface ShoppingListItem {
  id: string;
  name: string;
  user_id: string;
  is_completed: boolean;
  created_at: string;
  user_email?: string;
}

interface SettingItem {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalRecipes: 0,
    totalMealPlans: 0,
    totalShoppingLists: 0
  });
  
  // Data state
  const [profiles, setProfiles] = useState<ProfileItem[]>([]);
  const [recipes, setRecipes] = useState<RecipeItem[]>([]);
  const [mealPlans, setMealPlans] = useState<MealPlanItem[]>([]);
  const [shoppingLists, setShoppingLists] = useState<ShoppingListItem[]>([]);
  
  // Settings state
  const [cuisines, setCuisines] = useState<SettingItem[]>([]);
  const [dietaryPreferences, setDietaryPreferences] = useState<SettingItem[]>([]);
  const [healthGoals, setHealthGoals] = useState<SettingItem[]>([]);
  const [cookingStyles, setCookingStyles] = useState<SettingItem[]>([]);
  
  // UI state
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Load stats
      const [profilesResult, recipesResult, mealPlansResult, shoppingListsResult] = await Promise.all([
        supabase.from('profiles').select('id'),
        supabase.from('recipes').select('id'),
        supabase.from('meal_plans').select('id'),
        supabase.from('shopping_lists').select('id')
      ]);

      setStats({
        totalUsers: profilesResult.data?.length || 0,
        totalRecipes: recipesResult.data?.length || 0,
        totalMealPlans: mealPlansResult.data?.length || 0,
        totalShoppingLists: shoppingListsResult.data?.length || 0
      });

      // Load detailed data
      const [
        profilesData,
        recipesData,
        mealPlansData,
        shoppingListsData,
        cuisinesData,
        dietaryData,
        goalsData,
        stylesData
      ] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('recipes').select('*').order('created_at', { ascending: false }),
        supabase.from('meal_plans').select('*').order('created_at', { ascending: false }),
        supabase.from('shopping_lists').select('*').order('created_at', { ascending: false }),
        supabase.from('cuisines').select('*').order('name'),
        supabase.from('dietary_preferences').select('*').order('name'),
        supabase.from('health_goals').select('*').order('name'),
        supabase.from('cooking_styles').select('*').order('name')
      ]);

      // Enrich meal plans and shopping lists with user emails
      const profilesMap = new Map(profilesData.data?.map(p => [p.user_id, p.email]) || []);
      
      const enrichedMealPlans = mealPlansData.data?.map(mp => ({
        ...mp,
        user_email: profilesMap.get(mp.user_id) || 'Unknown'
      })) || [];

      const enrichedShoppingLists = shoppingListsData.data?.map(sl => ({
        ...sl,
        user_email: profilesMap.get(sl.user_id) || 'Unknown'
      })) || [];

      setProfiles(profilesData.data || []);
      setRecipes(recipesData.data || []);
      setMealPlans(enrichedMealPlans);
      setShoppingLists(enrichedShoppingLists);
      setCuisines(cuisinesData.data || []);
      setDietaryPreferences(dietaryData.data || []);
      setHealthGoals(goalsData.data || []);
      setCookingStyles(stylesData.data || []);

      setLoading(false);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleEdit = (table: string, item: any) => {
    setEditingItem({ ...item, table });
    setFormData(item);
    setShowEditDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingItem?.id) {
      await handleUpdate(editingItem.table, editingItem.id, formData);
    } else {
      await handleCreate(editingItem.table, formData);
    }
  };

  const handleUpdate = async (table: string, id: string, data: any) => {
    try {
      if (table === 'recipes') {
        const { error } = await supabase.from('recipes').update(data).eq('id', id);
        if (error) throw error;
      } else if (table === 'meal_plans') {
        const { user_email, ...updateData } = data;
        const { error } = await supabase.from('meal_plans').update(updateData).eq('id', id);
        if (error) throw error;
      } else if (table === 'shopping_lists') {
        const { user_email, ...updateData } = data;
        const { error } = await supabase.from('shopping_lists').update(updateData).eq('id', id);
        if (error) throw error;
      } else if (table === 'cuisines') {
        const { error } = await supabase.from('cuisines').update(data).eq('id', id);
        if (error) throw error;
      } else if (table === 'dietary_preferences') {
        const { error } = await supabase.from('dietary_preferences').update(data).eq('id', id);
        if (error) throw error;
      } else if (table === 'health_goals') {
        const { error } = await supabase.from('health_goals').update(data).eq('id', id);
        if (error) throw error;
      } else if (table === 'cooking_styles') {
        const { error } = await supabase.from('cooking_styles').update(data).eq('id', id);
        if (error) throw error;
      }
      
      setShowEditDialog(false);
      setEditingItem(null);
      loadData();
      toast({
        title: "Success",
        description: "Item updated successfully",
      });
    } catch (error) {
      console.error('Error updating item:', error);
      toast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (table: string, id: string) => {
    try {
      // Check if setting is in use before deletion for settings tables
      if (['cuisines', 'dietary_preferences', 'health_goals', 'cooking_styles'].includes(table)) {
        let isInUse = false;
        
        if (table === 'cuisines') {
          const cuisine = cuisines.find(c => c.id === id);
          if (cuisine) {
            const { data: recipes } = await supabase.from('recipes').select('id').eq('cuisine', cuisine.name).limit(1);
            isInUse = recipes && recipes.length > 0;
          }
        } else if (table === 'cooking_styles') {
          const style = cookingStyles.find(c => c.id === id);
          if (style) {
            const { data: preferences } = await supabase.from('user_preferences').select('id').contains('cooking_style', style.name).limit(1);
            isInUse = preferences && preferences.length > 0;
          }
        } else if (table === 'dietary_preferences' || table === 'health_goals') {
          const column = table === 'dietary_preferences' ? 'dietary_restrictions' : 'health_goals';
          const item = table === 'dietary_preferences' ? 
            dietaryPreferences.find(d => d.id === id) : 
            healthGoals.find(h => h.id === id);
          if (item) {
            const { data: preferences } = await supabase.from('user_preferences')
              .select('id').contains(column, [item.name]).limit(1);
            isInUse = preferences && preferences.length > 0;
          }
        }
        
        if (isInUse) {
          toast({
            title: "Cannot Delete",
            description: "This setting is currently in use and cannot be deleted",
            variant: "destructive",
          });
          return;
        }
      }
      
      let error;
      if (table === 'cuisines') {
        ({ error } = await supabase.from('cuisines').delete().eq('id', id));
      } else if (table === 'dietary_preferences') {
        ({ error } = await supabase.from('dietary_preferences').delete().eq('id', id));
      } else if (table === 'health_goals') {
        ({ error } = await supabase.from('health_goals').delete().eq('id', id));
      } else if (table === 'cooking_styles') {
        ({ error } = await supabase.from('cooking_styles').delete().eq('id', id));
      } else {
        ({ error } = await supabase.from(table as any).delete().eq('id', id));
      }
      if (error) throw error;
      
      loadData();
      toast({
        title: "Success",
        description: "Item deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      });
    }
  };

  const handleAdd = (table: string) => {
    let newItem: any = { id: '', name: '', created_at: new Date().toISOString() };
    
    if (table === 'recipes') {
      newItem = { ...newItem, cuisine: '', difficulty: 'intermediate', is_public: true };
    } else if (table === 'profiles') {
      newItem = { ...newItem, email: '' };
    } else if (['cuisines', 'dietary_preferences', 'health_goals', 'cooking_styles'].includes(table)) {
      newItem = { ...newItem, description: '' };
    }
    
    setEditingItem({ ...newItem, table });
    setFormData(newItem);
    setShowEditDialog(true);
  };

  const handleCreate = async (table: string, data: any) => {
    try {
      const { table: tableField, user_email, id, ...createData } = data;
      let error;
      if (table === 'cuisines') {
        ({ error } = await supabase.from('cuisines').insert([createData]));
      } else if (table === 'dietary_preferences') {
        ({ error } = await supabase.from('dietary_preferences').insert([createData]));
      } else if (table === 'health_goals') {
        ({ error } = await supabase.from('health_goals').insert([createData]));
      } else if (table === 'cooking_styles') {
        ({ error } = await supabase.from('cooking_styles').insert([createData]));
      } else {
        ({ error } = await supabase.from(table as any).insert([createData]));
      }
      if (error) throw error;
      
      setShowEditDialog(false);
      setEditingItem(null);
      loadData();
      toast({
        title: "Success",
        description: "Item created successfully",
      });
    } catch (error) {
      console.error('Error creating item:', error);
      toast({
        title: "Error",
        description: "Failed to create item",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header showGetStarted={false} />
        <div className="container mx-auto py-8 px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading admin dashboard...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header showGetStarted={false} />
        <div className="container mx-auto py-8 px-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-destructive">{error}</p>
              <Button onClick={loadData} className="mt-4">
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header showGetStarted={false} />
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage users, recipes, meal plans, and system settings</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="stats">Overview</TabsTrigger>
            <TabsTrigger value="profiles">Users</TabsTrigger>
            <TabsTrigger value="recipes">Recipes</TabsTrigger>
            <TabsTrigger value="meal_plans">Meal Plans</TabsTrigger>
            <TabsTrigger value="shopping_lists">Shopping Lists</TabsTrigger>
            <TabsTrigger value="cuisines">Cuisines</TabsTrigger>
            <TabsTrigger value="dietary_preferences">Dietary</TabsTrigger>
            <TabsTrigger value="health_goals">Goals</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="stats">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Recipes</CardTitle>
                  <ChefHat className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalRecipes}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Meal Plans</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalMealPlans}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Shopping Lists</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalShoppingLists}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="profiles">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Users</CardTitle>
                  <Button onClick={() => handleAdd('profiles')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profiles.map((profile) => (
                      <TableRow key={profile.id}>
                        <TableCell className="font-medium">
                          {profile.first_name && profile.last_name 
                            ? `${profile.first_name} ${profile.last_name}` 
                            : 'Not set'}
                        </TableCell>
                        <TableCell>{profile.email}</TableCell>
                        <TableCell>{new Date(profile.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit('profiles', profile)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete('profiles', profile.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recipes Tab */}
          <TabsContent value="recipes">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recipes</CardTitle>
                  <Button onClick={() => handleAdd('recipes')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Recipe
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Cuisine</TableHead>
                      <TableHead>Difficulty</TableHead>
                      <TableHead>Public</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recipes.map((recipe) => (
                      <TableRow key={recipe.id}>
                        <TableCell className="font-medium">{recipe.name}</TableCell>
                        <TableCell>{recipe.cuisine || 'Not specified'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {recipe.difficulty}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={recipe.is_public ? "default" : "secondary"}>
                            {recipe.is_public ? 'Yes' : 'No'}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(recipe.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit('recipes', recipe)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete('recipes', recipe.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tables */}
          {(['cuisines', 'dietary_preferences', 'health_goals'] as const).map((tableName) => {
            const data = tableName === 'cuisines' ? cuisines : 
                        tableName === 'dietary_preferences' ? dietaryPreferences : healthGoals;
            const title = tableName === 'cuisines' ? 'Cuisines' :
                         tableName === 'dietary_preferences' ? 'Dietary Preferences' : 'Health Goals';
            const addLabel = tableName === 'cuisines' ? 'Add Cuisine' :
                            tableName === 'dietary_preferences' ? 'Add Dietary Preference' : 'Add Health Goal';

            return (
              <TabsContent key={tableName} value={tableName}>
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{title}</CardTitle>
                      <Button onClick={() => handleAdd(tableName)}>
                        <Plus className="w-4 h-4 mr-2" />
                        {addLabel}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>{item.description || 'No description'}</TableCell>
                            <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(tableName, item)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDelete(tableName, item.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem?.id ? 'Edit' : 'Add'} {editingItem?.table?.replace('_', ' ')}
            </DialogTitle>
            <DialogDescription>
              Make changes and click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {(['cuisines', 'dietary_preferences', 'health_goals', 'cooking_styles'].includes(editingItem?.table)) && (
              <>
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Optional description"
                  />
                </div>
              </>
            )}

            {editingItem?.table === 'recipes' && (
              <>
                <div>
                  <Label htmlFor="name">Recipe Name</Label>
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cuisine">Cuisine</Label>
                  <Select 
                    value={formData.cuisine || ''} 
                    onValueChange={(value) => setFormData({...formData, cuisine: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select cuisine" />
                    </SelectTrigger>
                    <SelectContent>
                      {cuisines.map((cuisine) => (
                        <SelectItem key={cuisine.id} value={cuisine.name}>
                          {cuisine.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select 
                    value={formData.difficulty || 'intermediate'} 
                    onValueChange={(value) => setFormData({...formData, difficulty: value})}
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
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_public"
                    checked={formData.is_public || false}
                    onCheckedChange={(checked) => setFormData({...formData, is_public: checked})}
                  />
                  <Label htmlFor="is_public">Public Recipe</Label>
                </div>
              </>
            )}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};