import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown,
  Users,
  ChefHat,
  Clock,
  Target,
  Award,
  Activity,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  Filter,
  Download,
  RefreshCw,
  Star,
  Flame,
  Trophy,
  Zap
} from 'lucide-react';
import { userAnalyticsService } from '@/lib/userAnalytics';
import type { 
  UserEngagementMetrics, 
  RecipeAnalytics, 
  CuisineAnalytics, 
  SeasonalTrend, 
  DashboardAnalytics 
} from '@/lib/userAnalytics';

interface UserAnalyticsDashboardProps {
  userId?: string;
  isAdmin?: boolean;
}

export function UserAnalyticsDashboard({ userId, isAdmin = false }: UserAnalyticsDashboardProps) {
  const [dashboardData, setDashboardData] = useState<DashboardAnalytics | null>(null);
  const [userMetrics, setUserMetrics] = useState<UserEngagementMetrics | null>(null);
  const [recipeAnalytics, setRecipeAnalytics] = useState<RecipeAnalytics[]>([]);
  const [cuisineAnalytics, setCuisineAnalytics] = useState<CuisineAnalytics[]>([]);
  const [seasonalTrends, setSeasonalTrends] = useState<SeasonalTrend[]>([]);
  const [cookingFrequency, setCookingFrequency] = useState<Array<{ date: string; count: number; successRate: number }>>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState(true);

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0', '#ffb366'];

  useEffect(() => {
    loadAnalyticsData();
  }, [userId, selectedTimeframe]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const [
        dashboard,
        userMetricsData,
        recipes,
        cuisines,
        trends,
        frequency
      ] = await Promise.all([
        userAnalyticsService.getDashboardAnalytics(),
        userId ? userAnalyticsService.getUserEngagementMetrics(userId, selectedTimeframe) : null,
        userAnalyticsService.getRecipeAnalytics(),
        userAnalyticsService.getCuisineAnalytics(),
        userAnalyticsService.getSeasonalTrends(),
        userId ? userAnalyticsService.getCookingFrequency(userId, selectedTimeframe === 'daily' ? 'week' : selectedTimeframe === 'weekly' ? 'month' : 'year') : []
      ]);

      setDashboardData(dashboard);
      setUserMetrics(userMetricsData);
      setRecipeAnalytics(recipes);
      setCuisineAnalytics(cuisines);
      setSeasonalTrends(trends);
      setCookingFrequency(frequency);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number, decimals = 0): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num);
  };

  const formatPercentage = (num: number): string => {
    return `${formatNumber(num, 1)}%`;
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Activity className="w-4 h-4 text-gray-500" />;
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return 'text-green-500';
    if (change < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="h-20 bg-gray-100 animate-pulse rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {isAdmin ? 'Platform Analytics' : 'Your Cooking Analytics'}
          </h1>
          <p className="text-muted-foreground">
            {isAdmin 
              ? 'Comprehensive platform metrics and user insights'
              : 'Track your cooking journey, success rates, and discover trends'
            }
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedTimeframe} onValueChange={(value: any) => setSelectedTimeframe(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={loadAnalyticsData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      {isAdmin && dashboardData && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{formatNumber(dashboardData.overview.totalUsers)}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
              <div className="mt-2 flex items-center gap-1 text-sm">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <span className="text-green-500">+12%</span>
                <span className="text-muted-foreground">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Cooking Sessions</p>
                  <p className="text-2xl font-bold">{formatNumber(dashboardData.overview.totalCookingSessions)}</p>
                </div>
                <ChefHat className="w-8 h-8 text-orange-500" />
              </div>
              <div className="mt-2 flex items-center gap-1 text-sm">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <span className="text-green-500">+8%</span>
                <span className="text-muted-foreground">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold">{formatPercentage(dashboardData.overview.averageSuccessRate)}</p>
                </div>
                <Target className="w-8 h-8 text-green-500" />
              </div>
              <div className="mt-2 flex items-center gap-1 text-sm">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <span className="text-green-500">+3%</span>
                <span className="text-muted-foreground">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                  <p className="text-2xl font-bold">{formatNumber(dashboardData.overview.activeUsers)}</p>
                </div>
                <Activity className="w-8 h-8 text-purple-500" />
              </div>
              <div className="mt-2 flex items-center gap-1 text-sm">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <span className="text-green-500">+15%</span>
                <span className="text-muted-foreground">from last month</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Personal Metrics for Users */}
      {!isAdmin && userMetrics && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Cooking Frequency</p>
                  <p className="text-2xl font-bold">{formatNumber(userMetrics.metrics.cookingFrequency, 1)}</p>
                  <p className="text-xs text-muted-foreground">per {selectedTimeframe.slice(0, -2)}</p>
                </div>
                <ChefHat className="w-8 h-8 text-orange-500" />
              </div>
              <div className="mt-2 flex items-center gap-1 text-sm">
                {getTrendIcon(userMetrics.trends.cookingFrequencyChange)}
                <span className={getTrendColor(userMetrics.trends.cookingFrequencyChange)}>
                  {formatPercentage(Math.abs(userMetrics.trends.cookingFrequencyChange))}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold">{formatPercentage(userMetrics.metrics.cookingSuccessRate)}</p>
                </div>
                <Target className="w-8 h-8 text-green-500" />
              </div>
              <div className="mt-2">
                <Progress value={userMetrics.metrics.cookingSuccessRate} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Cook Time</p>
                  <p className="text-2xl font-bold">{formatNumber(userMetrics.metrics.averageCookingTime, 0)}m</p>
                </div>
                <Clock className="w-8 h-8 text-blue-500" />
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Total: {formatNumber(userMetrics.metrics.timeSpentCooking / 60, 1)}h
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Cooking Streak</p>
                  <p className="text-2xl font-bold">{userMetrics.metrics.streakLength}</p>
                  <p className="text-xs text-muted-foreground">days</p>
                </div>
                <Flame className="w-8 h-8 text-red-500" />
              </div>
              <div className="mt-2 text-sm text-green-500">
                <Trophy className="w-3 h-3 inline mr-1" />
                {userMetrics.metrics.badgesEarned} badges earned
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="recipes">Recipes</TabsTrigger>
          <TabsTrigger value="cuisines">Cuisines</TabsTrigger>
          <TabsTrigger value="seasonal">Seasonal</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          {/* Cooking Frequency Chart */}
          {cookingFrequency.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Cooking Activity Over Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={cookingFrequency}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="count"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.3}
                      name="Cooking Sessions"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="successRate"
                      stroke="#82ca9d"
                      strokeWidth={2}
                      name="Success Rate %"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Platform Growth (Admin only) */}
          {isAdmin && dashboardData && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={dashboardData.trends.userGrowth.slice(-14)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
                      <YAxis />
                      <Tooltip labelFormatter={(date) => new Date(date).toLocaleDateString()} />
                      <Line
                        type="monotone"
                        dataKey="activeUsers"
                        stroke="#8884d8"
                        strokeWidth={2}
                        name="Active Users"
                      />
                      <Line
                        type="monotone"
                        dataKey="newUsers"
                        stroke="#82ca9d"
                        strokeWidth={2}
                        name="New Users"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Platform Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={dashboardData.trends.cookingActivity.slice(-14)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip labelFormatter={(date) => new Date(date).toLocaleDateString()} />
                      <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="sessions"
                        stroke="#ffc658"
                        fill="#ffc658"
                        fillOpacity={0.3}
                        name="Sessions"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="successRate"
                        stroke="#ff7c7c"
                        strokeWidth={2}
                        name="Success Rate %"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Recipes Tab */}
        <TabsContent value="recipes" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Top Recipes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Most Popular Recipes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recipeAnalytics.slice(0, 8).map((recipe, index) => (
                  <div key={recipe.recipeId} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <div>
                        <h4 className="font-medium">{recipe.recipeName}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{recipe.cuisine}</span>
                          <span>•</span>
                          <span>{recipe.difficulty}</span>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500" />
                            {formatNumber(recipe.averageRating, 1)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{recipe.totalCooks} cooks</div>
                      <div className="text-sm text-green-500">
                        {formatPercentage(recipe.successRate)} success
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recipe Success Rates */}
            <Card>
              <CardHeader>
                <CardTitle>Success Rates by Difficulty</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={[
                    {
                      difficulty: 'Easy',
                      successRate: recipeAnalytics.filter(r => r.difficulty === 'easy').reduce((acc, r) => acc + r.successRate, 0) / recipeAnalytics.filter(r => r.difficulty === 'easy').length || 0,
                      count: recipeAnalytics.filter(r => r.difficulty === 'easy').length
                    },
                    {
                      difficulty: 'Medium',
                      successRate: recipeAnalytics.filter(r => r.difficulty === 'medium').reduce((acc, r) => acc + r.successRate, 0) / recipeAnalytics.filter(r => r.difficulty === 'medium').length || 0,
                      count: recipeAnalytics.filter(r => r.difficulty === 'medium').length
                    },
                    {
                      difficulty: 'Hard',
                      successRate: recipeAnalytics.filter(r => r.difficulty === 'hard').reduce((acc, r) => acc + r.successRate, 0) / recipeAnalytics.filter(r => r.difficulty === 'hard').length || 0,
                      count: recipeAnalytics.filter(r => r.difficulty === 'hard').length
                    }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="difficulty" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="successRate" fill="#8884d8" name="Success Rate %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Cuisines Tab */}
        <TabsContent value="cuisines" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Cuisine Popularity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5" />
                  Cuisine Popularity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={cuisineAnalytics.slice(0, 6)}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="totalCooks"
                      nameKey="cuisine"
                    >
                      {cuisineAnalytics.slice(0, 6).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Cuisine Rankings */}
            <Card>
              <CardHeader>
                <CardTitle>Top Cuisines by Success Rate</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {cuisineAnalytics.slice(0, 8).map((cuisine, index) => (
                  <div key={cuisine.cuisine} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <div>
                        <h4 className="font-medium">{cuisine.cuisine}</h4>
                        <p className="text-sm text-muted-foreground">
                          {cuisine.totalCooks} cooks • {cuisine.totalRecipes} recipes
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-green-500">
                        {formatPercentage(cuisine.averageSuccessRate)}
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        {getTrendIcon(cuisine.growthRate)}
                        <span className={getTrendColor(cuisine.growthRate)}>
                          {formatPercentage(Math.abs(cuisine.growthRate))}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Seasonal Tab */}
        <TabsContent value="seasonal" className="space-y-6">
          {/* Seasonal Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Seasonal Cooking Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={seasonalTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="season" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalCooks" fill="#8884d8" name="Total Cooks" />
                  <Bar dataKey="avgCookingFrequency" fill="#82ca9d" name="Avg Weekly Frequency" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Seasonal Ingredient Trends */}
          <div className="grid gap-4 md:grid-cols-2">
            {seasonalTrends.slice(0, 2).map((season) => (
              <Card key={season.season}>
                <CardHeader>
                  <CardTitle className="capitalize">{season.season} Highlights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Popular Cuisines</h4>
                    <div className="space-y-2">
                      {season.popularCuisines.slice(0, 3).map((cuisine) => (
                        <div key={cuisine.cuisine} className="flex items-center justify-between">
                          <span className="text-sm">{cuisine.cuisine}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {formatPercentage(cuisine.percentage)}
                            </span>
                            {getTrendIcon(cuisine.change)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Top Ingredients</h4>
                    <div className="flex flex-wrap gap-1">
                      {season.popularIngredients.slice(0, 8).map((ingredient) => (
                        <Badge key={ingredient.ingredient} variant="outline" className="text-xs">
                          {ingredient.ingredient}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Engagement Tab */}
        <TabsContent value="engagement" className="space-y-6">
          {userMetrics && (
            <div className="grid gap-4 md:grid-cols-3">
              {/* Cooking Engagement */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Cooking Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Recipes Viewed</span>
                    <span className="font-medium">{userMetrics.metrics.recipeViewCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Recipes Saved</span>
                    <span className="font-medium">{userMetrics.metrics.recipesSaved}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Recipes Shared</span>
                    <span className="font-medium">{userMetrics.metrics.recipesShared}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Time Cooking</span>
                    <span className="font-medium">{formatNumber(userMetrics.metrics.timeSpentCooking / 60, 1)}h</span>
                  </div>
                </CardContent>
              </Card>

              {/* Social Engagement */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Social Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Recipes Rated</span>
                    <span className="font-medium">{userMetrics.metrics.recipesRated}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Reviews Written</span>
                    <span className="font-medium">{userMetrics.metrics.reviewsWritten}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Friends Connected</span>
                    <span className="font-medium">{userMetrics.metrics.friendsConnected}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Community Interactions</span>
                    <span className="font-medium">{userMetrics.metrics.communitInteractions}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Achievements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Badges Earned</span>
                    <div className="flex items-center gap-1">
                      <Award className="w-4 h-4 text-yellow-500" />
                      <span className="font-medium">{userMetrics.metrics.badgesEarned}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Milestones Reached</span>
                    <span className="font-medium">{userMetrics.metrics.milestonesReached}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Current Streak</span>
                    <div className="flex items-center gap-1">
                      <Flame className="w-4 h-4 text-red-500" />
                      <span className="font-medium">{userMetrics.metrics.streakLength} days</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Cuisines Tried</span>
                    <span className="font-medium">{userMetrics.metrics.newCuisinesTried}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Personal Insights */}
          {userMetrics && (
            <Card>
              <CardHeader>
                <CardTitle>Personal Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium mb-2">Favorite Cuisine</h4>
                    <Badge variant="default" className="text-sm">
                      {userMetrics.insights.mostCookedCuisine}
                    </Badge>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Peak Cooking Hours</h4>
                    <div className="flex gap-1">
                      {userMetrics.insights.peakCookingHours.map(hour => (
                        <Badge key={hour} variant="outline" className="text-xs">
                          {hour}:00
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Top Recipes</h4>
                    <div className="space-y-1">
                      {userMetrics.insights.favoriteRecipes.slice(0, 3).map(recipe => (
                        <div key={recipe} className="text-sm text-muted-foreground">
                          • {recipe}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Cooking Patterns</h4>
                    <div className="space-y-1">
                      {userMetrics.insights.cookingPatterns.map(pattern => (
                        <div key={pattern} className="text-sm text-muted-foreground">
                          • {pattern}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {userMetrics.insights.improvementAreas.length > 0 && (
                  <Alert>
                    <Zap className="w-4 h-4" />
                    <AlertDescription>
                      <strong>Suggested improvements:</strong> {userMetrics.insights.improvementAreas.join(', ')}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}