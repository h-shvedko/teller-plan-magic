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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
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

interface UserData {
  id: string;
  user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
  role?: string;
}

interface RecipeData {
  id: string;
  name: string;
  cuisine: string | null;
  difficulty: string;
  created_by: string;
  is_public: boolean;
  created_at: string;
}

interface MealPlanData {
  id: string;
  name: string;
  week_start_date: string;
  is_active: boolean;
  user_email: string;
  created_at: string;
}

interface ShoppingListData {
  id: string;
  name: string;
  is_completed: boolean;
  user_email: string;
  created_at: string;
}

export const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalRecipes: 0,
    totalMealPlans: 0,
    totalShoppingLists: 0
  });
  const [users, setUsers] = useState<UserData[]>([]);
  const [recipes, setRecipes] = useState<RecipeData[]>([]);
  const [mealPlans, setMealPlans] = useState<MealPlanData[]>([]);
  const [shoppingLists, setShoppingLists] = useState<ShoppingListData[]>([]);
  
  // Edit states
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [currentTable, setCurrentTable] = useState<'recipes' | 'meal_plans' | 'shopping_lists' | 'users' | ''>('');
  const [formData, setFormData] = useState<any>({});
  const [formErrors, setFormErrors] = useState<any>({});

  const loadStats = useCallback(async () => {
    const [usersRes, recipesRes, mealPlansRes, shoppingListsRes] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('recipes').select('id', { count: 'exact', head: true }),
      supabase.from('meal_plans').select('id', { count: 'exact', head: true }),
      supabase.from('shopping_lists').select('id', { count: 'exact', head: true })
    ]);

    setStats({
      totalUsers: usersRes.count || 0,
      totalRecipes: recipesRes.count || 0,
      totalMealPlans: mealPlansRes.count || 0,
      totalShoppingLists: shoppingListsRes.count || 0
    });
  }, []);

  const loadUsers = useCallback(async () => {
    // First get users without roles to avoid foreign key issues
    const { data: usersData, error: usersError } = await supabase
      .from('profiles')
      .select('id, user_id, email, first_name, last_name, created_at')
      .order('created_at', { ascending: false })
      .limit(50);

    if (usersError) throw usersError;

    // Then get their roles separately
    const { data: rolesData, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id, role');

    if (rolesError) throw rolesError;

    // Combine the data - use user_id as the key for matching
    const usersWithRoles = usersData?.map(user => ({
      ...user,
      role: rolesData?.find(role => role.user_id === user.user_id)?.role || 'user'
    })) || [];

    setUsers(usersWithRoles);
  }, []);

  const loadRecipes = useCallback(async () => {
    const { data, error } = await supabase
      .from('recipes')
      .select(`
        id, name, cuisine, difficulty, created_by, is_public, created_at,
        profiles (email)
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    setRecipes(data || []);
  }, []);

  const loadMealPlans = useCallback(async () => {
    const { data, error } = await supabase
      .from('meal_plans')
      .select(`
        id, name, week_start_date, is_active, created_at,
        profiles (email)
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    const mealPlansWithUserEmail = data?.map(plan => ({
      ...plan,
      user_email: plan.profiles?.email || 'Unknown'
    })) || [];

    setMealPlans(mealPlansWithUserEmail);
  }, []);

  const loadShoppingLists = useCallback(async () => {
    const { data, error } = await supabase
      .from('shopping_lists')
      .select(`
        id, name, is_completed, created_at,
        profiles!user_id (email)
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    const shoppingListsWithUserEmail = data?.map(list => ({
      ...list,
      user_email: (list.profiles as any)?.email || 'Unknown'
    })) || [];

    setShoppingLists(shoppingListsWithUserEmail);
  }, []);

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadStats(),
        loadUsers(),
        loadRecipes(),
        loadMealPlans(),
        loadShoppingLists()
      ]);
    } catch (error: unknown) {
      console.error('Error loading admin data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [loadStats, loadUsers, loadRecipes, loadMealPlans, loadShoppingLists]);

  useEffect(() => {
    if (user && isAdmin) {
      loadAdminData();
    }
  }, [user, isAdmin, loadAdminData]);

  // CRUD Operations
  const handleCreate = async (table: 'recipes' | 'meal_plans' | 'shopping_lists' | 'users', data: any) => {
    try {
      setFormErrors({});
      let insertData = { ...data };
      
      // Validate required fields
      if (!insertData.name && table !== 'users') {
        setFormErrors({ name: 'Name is required' });
        return;
      }

      if (table === 'users') {
        if (!insertData.email || !insertData.password) {
          setFormErrors({ 
            email: !insertData.email ? 'Email is required' : '',
            password: !insertData.password ? 'Password is required' : ''
          });
          return;
        }

        // Create user via Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: insertData.email,
          password: insertData.password,
          user_metadata: {
            first_name: insertData.first_name,
            last_name: insertData.last_name
          }
        });

        if (authError) throw authError;

        // The user creation is handled by the trigger, but let's ensure role assignment
        if (insertData.role && insertData.role !== 'user') {
          // Check if role already exists to avoid duplicate key error
          const { data: existingRole } = await supabase
            .from('user_roles')
            .select('id')
            .eq('user_id', authData.user.id)
            .eq('role', insertData.role)
            .single();

          if (!existingRole) {
            const { error: roleError } = await supabase
              .from('user_roles')
              .insert({
                user_id: authData.user.id,
                role: insertData.role
              });
            
            if (roleError) console.error('Role assignment error:', roleError);
          }
        }
      } else if (table === 'recipes') {
        // Get the current user's profile ID to use as created_by
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user?.id)
          .single();
        
        if (profileError) throw profileError;
        
        insertData.created_by = profileData.id;
        insertData.servings = parseInt(insertData.servings) || 2;
        const { error } = await supabase.from('recipes').insert(insertData);
        if (error) throw error;
      } else if (table === 'meal_plans') {
        // Use auth user ID for meal_plans as RLS policy expects auth.uid()
        insertData.user_id = user?.id;
        if (!insertData.week_start_date) {
          insertData.week_start_date = new Date().toISOString().split('T')[0];
        }
        const { error } = await supabase.from('meal_plans').insert(insertData);
        if (error) throw error;
      } else if (table === 'shopping_lists') {
        // Use auth user ID for shopping_lists as RLS policy expects auth.uid()
        insertData.user_id = user?.id;
        const { error } = await supabase.from('shopping_lists').insert(insertData);
        if (error) throw error;
      }
      
      toast({
        title: "Success",
        description: `${table.replace('_', ' ')} created successfully`
      });
      
      await loadAdminData();
      setCreateDialogOpen(false);
      setFormData({});
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleUpdate = async (table: 'recipes' | 'meal_plans' | 'shopping_lists' | 'users', id: string, data: any) => {
    try {
      setFormErrors({});

      if (table === 'users') {
        // Update profile
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email
          })
          .eq('user_id', id);  // Use user_id instead of id
        
        if (profileError) throw profileError;

        // Update role if changed using edge function
        if (data.role) {
          const { data: sessionData } = await supabase.auth.getSession();
          const response = await fetch(`https://hxrppmdwujlfpkcfumpm.supabase.co/functions/v1/manage-user-roles`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${sessionData.session?.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: 'update',
              userId: id,
              role: data.role
            })
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update role');
          }
        }
      } else if (table === 'recipes') {
        data.servings = parseInt(data.servings) || 2;
        const { error } = await supabase.from('recipes').update(data).eq('id', id);
        if (error) throw error;
      } else if (table === 'meal_plans') {
        const { error } = await supabase.from('meal_plans').update(data).eq('id', id);
        if (error) throw error;
      } else if (table === 'shopping_lists') {
        const { error } = await supabase.from('shopping_lists').update(data).eq('id', id);
        if (error) throw error;
      }
      
      toast({
        title: "Success",
        description: `${table.replace('_', ' ')} updated successfully`
      });
      
      await loadAdminData();
      setEditDialogOpen(false);
      setEditingItem(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (table: 'recipes' | 'meal_plans' | 'shopping_lists' | 'users', id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      if (table === 'users') {
        // Delete user via Supabase Auth Admin API
        const { error } = await supabase.auth.admin.deleteUser(id);
        if (error) throw error;
      } else if (table === 'recipes') {
        const { error } = await supabase.from('recipes').delete().eq('id', id);
        if (error) throw error;
      } else if (table === 'meal_plans') {
        const { error } = await supabase.from('meal_plans').delete().eq('id', id);
        if (error) throw error;
      } else if (table === 'shopping_lists') {
        const { error } = await supabase.from('shopping_lists').delete().eq('id', id);
        if (error) throw error;
      }
      
      toast({
        title: "Success",
        description: `${table.replace('_', ' ')} deleted successfully`
      });
      
      await loadAdminData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (item: any, table: 'recipes' | 'meal_plans' | 'shopping_lists' | 'users') => {
    setEditingItem(item);
    setCurrentTable(table);
    setFormData(item);
    setFormErrors({});
    setEditDialogOpen(true);
  };

  const openCreateDialog = (table: 'recipes' | 'meal_plans' | 'shopping_lists' | 'users') => {
    setCurrentTable(table);
    setFormData({});
    setFormErrors({});
    setCreateDialogOpen(true);
  };

  const renderFormFields = (isEdit = false) => {
    const renderFieldError = (field: string) => {
      if (formErrors[field]) {
        return <span className="text-sm text-destructive">{formErrors[field]}</span>;
      }
      return null;
    };

    switch (currentTable) {
      case 'users':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                disabled={isEdit}
              />
              {renderFieldError('email')}
            </div>
            {!isEdit && (
              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password || ''}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
                {renderFieldError('password')}
              </div>
            )}
            <div>
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                value={formData.first_name || ''}
                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={formData.last_name || ''}
                onChange={(e) => setFormData({...formData, last_name: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select 
                value={formData.role || 'user'}
                onValueChange={(value) => setFormData({...formData, role: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="administrator">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case 'recipes':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
              {renderFieldError('name')}
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="cuisine">Cuisine</Label>
              <Input
                id="cuisine"
                value={formData.cuisine || ''}
                onChange={(e) => setFormData({...formData, cuisine: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select 
                value={formData.difficulty || 'intermediate'}
                onValueChange={(value) => setFormData({...formData, difficulty: value})}
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
            <div>
              <Label htmlFor="servings">Servings</Label>
              <Input
                id="servings"
                type="number"
                value={formData.servings || 2}
                onChange={(e) => setFormData({...formData, servings: parseInt(e.target.value)})}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_public"
                checked={formData.is_public !== false}
                onCheckedChange={(checked) => setFormData({...formData, is_public: checked})}
              />
              <Label htmlFor="is_public">Public Recipe</Label>
            </div>
          </div>
        );
      case 'meal_plans':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
              {renderFieldError('name')}
            </div>
            <div>
              <Label htmlFor="week_start_date">Week Start Date</Label>
              <Input
                id="week_start_date"
                type="date"
                value={formData.week_start_date || ''}
                onChange={(e) => setFormData({...formData, week_start_date: e.target.value})}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active !== false}
                onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
          </div>
        );
      case 'shopping_lists':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
              {renderFieldError('name')}
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_completed"
                checked={formData.is_completed || false}
                onCheckedChange={(checked) => setFormData({...formData, is_completed: checked})}
              />
              <Label htmlFor="is_completed">Completed</Label>
            </div>
          </div>
        );
      default:
        return null;
    }
  };


  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading admin dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header showGetStarted={false} />
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Settings className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            </div>
            <p className="text-muted-foreground">Overview of all system data and user activity</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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

          {/* Data Tables */}
          <Tabs defaultValue="users" className="space-y-4">
            <TabsList>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="recipes">Recipes</TabsTrigger>
              <TabsTrigger value="meal-plans">Meal Plans</TabsTrigger>
              <TabsTrigger value="shopping-lists">Shopping Lists</TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Users</CardTitle>
                    <CardDescription>Recent user registrations and their roles</CardDescription>
                  </div>
                  <Button onClick={() => openCreateDialog('users')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.user_id}>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            {user.first_name && user.last_name 
                              ? `${user.first_name} ${user.last_name}` 
                              : 'Not provided'
                            }
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.role === 'administrator' ? 'default' : 'secondary'}>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(user.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditDialog({...user}, 'users')}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete('users', user.user_id)}
                              >
                                <Trash2 className="h-4 w-4" />
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

            <TabsContent value="recipes">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Recipes</CardTitle>
                    <CardDescription>Recently created recipes</CardDescription>
                  </div>
                  <Button onClick={() => openCreateDialog('recipes')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Recipe
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Cuisine</TableHead>
                        <TableHead>Difficulty</TableHead>
                        <TableHead>Visibility</TableHead>
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
                            <Badge variant="outline">{recipe.difficulty}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={recipe.is_public ? 'default' : 'secondary'}>
                              {recipe.is_public ? 'Public' : 'Private'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(recipe.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditDialog(recipe, 'recipes')}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete('recipes', recipe.id)}
                              >
                                <Trash2 className="h-4 w-4" />
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

            <TabsContent value="meal-plans">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Meal Plans</CardTitle>
                    <CardDescription>User meal plans and their status</CardDescription>
                  </div>
                  <Button onClick={() => openCreateDialog('meal_plans')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Meal Plan
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Week Start</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mealPlans.map((plan) => (
                        <TableRow key={plan.id}>
                          <TableCell className="font-medium">{plan.name}</TableCell>
                          <TableCell>{plan.user_email}</TableCell>
                          <TableCell>
                            {new Date(plan.week_start_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant={plan.is_active ? 'default' : 'secondary'}>
                              {plan.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(plan.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditDialog(plan, 'meal_plans')}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete('meal_plans', plan.id)}
                              >
                                <Trash2 className="h-4 w-4" />
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

            <TabsContent value="shopping-lists">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Shopping Lists</CardTitle>
                    <CardDescription>User shopping lists and completion status</CardDescription>
                  </div>
                  <Button onClick={() => openCreateDialog('shopping_lists')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Shopping List
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {shoppingLists.map((list) => (
                        <TableRow key={list.id}>
                          <TableCell className="font-medium">{list.name}</TableCell>
                          <TableCell>{list.user_email}</TableCell>
                          <TableCell>
                            <Badge variant={list.is_completed ? 'default' : 'secondary'}>
                              {list.is_completed ? 'Completed' : 'In Progress'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(list.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditDialog(list, 'shopping_lists')}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete('shopping_lists', list.id)}
                              >
                                <Trash2 className="h-4 w-4" />
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
          </Tabs>

          {/* Create Dialog */}
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New {currentTable.replace('_', ' ')}</DialogTitle>
                <DialogDescription>
                  Add a new {currentTable.replace('_', ' ')} to the system.
                </DialogDescription>
              </DialogHeader>
              {renderFormFields()}
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => currentTable && handleCreate(currentTable as 'recipes' | 'meal_plans' | 'shopping_lists' | 'users', formData)}>
                  <Save className="h-4 w-4 mr-2" />
                  Create
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Dialog */}
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit {currentTable.replace('_', ' ')}</DialogTitle>
                <DialogDescription>
                  Update the {currentTable.replace('_', ' ')} information.
                </DialogDescription>
              </DialogHeader>
              {renderFormFields(true)}
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => currentTable && handleUpdate(currentTable as 'recipes' | 'meal_plans' | 'shopping_lists' | 'users', editingItem?.user_id || editingItem?.id, formData)}>
                  <Save className="h-4 w-4 mr-2" />
                  Update
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};