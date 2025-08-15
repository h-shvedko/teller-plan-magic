import { useState, useEffect } from 'react';
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
  Users, 
  ChefHat, 
  ClipboardList, 
  ShoppingCart, 
  Settings, 
  Calendar,
  Loader2
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

  useEffect(() => {
    if (user && isAdmin) {
      loadAdminData();
    }
  }, [user, isAdmin]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadStats(),
        loadUsers(),
        loadRecipes(),
        loadMealPlans(),
        loadShoppingLists()
      ]);
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
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
  };

  const loadUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id, email, first_name, last_name, created_at,
        user_roles (role)
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    const usersWithRoles = data?.map(user => ({
      ...user,
      role: (user.user_roles as any)?.[0]?.role || 'user'
    })) || [];

    setUsers(usersWithRoles);
  };

  const loadRecipes = async () => {
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
  };

  const loadMealPlans = async () => {
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
  };

  const loadShoppingLists = async () => {
    const { data, error } = await supabase
      .from('shopping_lists')
      .select(`
        id, name, is_completed, created_at,
        profiles (email)
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    const shoppingListsWithUserEmail = data?.map(list => ({
      ...list,
      user_email: list.profiles?.email || 'Unknown'
    })) || [];

    setShoppingLists(shoppingListsWithUserEmail);
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
                <CardHeader>
                  <CardTitle>Users</CardTitle>
                  <CardDescription>Recent user registrations and their roles</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
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
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recipes">
              <Card>
                <CardHeader>
                  <CardTitle>Recipes</CardTitle>
                  <CardDescription>Recently created recipes</CardDescription>
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
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="meal-plans">
              <Card>
                <CardHeader>
                  <CardTitle>Meal Plans</CardTitle>
                  <CardDescription>User meal plans and their status</CardDescription>
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
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="shopping-lists">
              <Card>
                <CardHeader>
                  <CardTitle>Shopping Lists</CardTitle>
                  <CardDescription>User shopping lists and completion status</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
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
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};