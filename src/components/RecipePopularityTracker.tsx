import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown,
  Trophy,
  Star,
  Clock,
  Users,
  ChefHat,
  Target,
  Calendar,
  Filter,
  ArrowUpDown
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { userAnalyticsService } from '@/lib/userAnalytics';
import type { RecipeAnalytics, CuisineAnalytics } from '@/lib/userAnalytics';

interface RecipePopularityTrackerProps {
  showCuisineAnalytics?: boolean;
  onRecipeClick?: (recipeId: string) => void;
}

export function RecipePopularityTracker({ 
  showCuisineAnalytics = true, 
  onRecipeClick 
}: RecipePopularityTrackerProps) {
  const [recipeAnalytics, setRecipeAnalytics] = useState<RecipeAnalytics[]>([]);
  const [cuisineAnalytics, setCuisineAnalytics] = useState<CuisineAnalytics[]>([]);
  const [sortBy, setSortBy] = useState<'popularity' | 'successRate' | 'totalCooks' | 'rating'>('popularity');
  const [filterDifficulty, setFilterDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [filterCuisine, setFilterCuisine] = useState<string>('all');
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const [recipes, cuisines] = await Promise.all([
        userAnalyticsService.getRecipeAnalytics(),
        userAnalyticsService.getCuisineAnalytics()
      ]);

      setRecipeAnalytics(recipes);
      setCuisineAnalytics(cuisines);
    } catch (error) {
      console.error('Failed to load recipe analytics:', error);
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

  const getDifficultyIcon = (difficulty: string) => {
    const icons = {
      easy: '🟢',
      medium: '🟡',
      hard: '🔴'
    };
    return icons[difficulty as keyof typeof icons] || '⚪';
  };

  const getTrendIcon = (direction: 'up' | 'down' | 'stable') => {
    switch (direction) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <ArrowUpDown className="w-4 h-4 text-gray-500" />;
    }
  };

  // Filter and sort recipes
  const filteredRecipes = recipeAnalytics
    .filter(recipe => {
      if (filterDifficulty !== 'all' && recipe.difficulty !== filterDifficulty) return false;
      if (filterCuisine !== 'all' && recipe.cuisine !== filterCuisine) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popularity':
          return b.popularityScore - a.popularityScore;
        case 'successRate':
          return b.successRate - a.successRate;
        case 'totalCooks':
          return b.totalCooks - a.totalCooks;
        case 'rating':
          return b.averageRating - a.averageRating;
        default:
          return b.popularityScore - a.popularityScore;
      }
    });

  // Get unique cuisines for filter
  const uniqueCuisines = [...new Set(recipeAnalytics.map(r => r.cuisine))].sort();

  // Prepare chart data for top recipes
  const topRecipesChartData = filteredRecipes.slice(0, 10).map(recipe => ({
    name: recipe.recipeName.length > 15 ? recipe.recipeName.substring(0, 15) + '...' : recipe.recipeName,
    fullName: recipe.recipeName,
    cooks: recipe.totalCooks,
    successRate: recipe.successRate,
    rating: recipe.averageRating,
    popularity: recipe.popularityScore
  }));

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="h-64 bg-gray-100 animate-pulse rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Recipe Popularity Analytics
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={timeframe} onValueChange={(value: any) => setTimeframe(value)}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="quarter">Quarter</SelectItem>
                  <SelectItem value="year">Year</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={loadAnalytics} variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="recipes" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="recipes">Recipe Analytics</TabsTrigger>
          {showCuisineAnalytics && <TabsTrigger value="cuisines">Cuisine Analytics</TabsTrigger>}
        </TabsList>

        {/* Recipe Analytics Tab */}
        <TabsContent value="recipes" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <span className="text-sm font-medium">Filters:</span>
                </div>
                
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popularity">Popularity Score</SelectItem>
                    <SelectItem value="totalCooks">Total Cooks</SelectItem>
                    <SelectItem value="successRate">Success Rate</SelectItem>
                    <SelectItem value="rating">Average Rating</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterDifficulty} onValueChange={(value: any) => setFilterDifficulty(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterCuisine} onValueChange={setFilterCuisine}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Cuisines" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cuisines</SelectItem>
                    {uniqueCuisines.map(cuisine => (
                      <SelectItem key={cuisine} value={cuisine}>{cuisine}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Recipe Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top 10 Recipes by {sortBy.replace(/([A-Z])/g, ' $1').toLowerCase()}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topRecipesChartData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={120} />
                  <Tooltip 
                    formatter={(value: any, name: string, props: any) => [
                      name === 'cooks' ? `${value} cooks` :
                      name === 'successRate' ? `${value.toFixed(1)}%` :
                      name === 'rating' ? `${value.toFixed(1)}/5` :
                      `${value.toFixed(1)} pts`,
                      name === 'cooks' ? 'Total Cooks' :
                      name === 'successRate' ? 'Success Rate' :
                      name === 'rating' ? 'Rating' :
                      'Popularity Score'
                    ]}
                    labelFormatter={(label) => topRecipesChartData.find(d => d.name === label)?.fullName || label}
                  />
                  <Bar 
                    dataKey={sortBy === 'totalCooks' ? 'cooks' : sortBy === 'rating' ? 'rating' : sortBy === 'successRate' ? 'successRate' : 'popularity'} 
                    fill="#8884d8" 
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Detailed Recipe List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recipe Performance Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredRecipes.slice(0, 20).map((recipe, index) => (
                <div 
                  key={recipe.recipeId} 
                  className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                    onRecipeClick ? 'cursor-pointer hover:bg-gray-50' : ''
                  }`}
                  onClick={() => onRecipeClick?.(recipe.recipeId)}
                >
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="min-w-[32px] justify-center">
                      #{index + 1}
                    </Badge>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{recipe.recipeName}</h4>
                        <span className="text-sm">{getDifficultyIcon(recipe.difficulty)}</span>
                        {getTrendIcon(recipe.trendDirection)}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Badge variant="secondary" className="text-xs">{recipe.cuisine}</Badge>
                        <span>{recipe.difficulty}</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500" />
                          <span>{formatNumber(recipe.averageRating, 1)} ({recipe.totalRatings})</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-right">
                    <div>
                      <div className="font-medium text-blue-600">{recipe.totalCooks}</div>
                      <div className="text-xs text-muted-foreground">total cooks</div>
                    </div>
                    
                    <div>
                      <div className="font-medium text-green-600">{formatPercentage(recipe.successRate)}</div>
                      <div className="text-xs text-muted-foreground">success rate</div>
                    </div>
                    
                    <div>
                      <div className="font-medium text-orange-600">{formatNumber(recipe.averageCookTime, 0)}m</div>
                      <div className="text-xs text-muted-foreground">avg time</div>
                    </div>
                    
                    <div className="min-w-[80px]">
                      <div className="font-medium text-purple-600">{formatNumber(recipe.popularityScore, 1)}</div>
                      <div className="text-xs text-muted-foreground">popularity</div>
                      <Progress value={(recipe.popularityScore / filteredRecipes[0].popularityScore) * 100} className="h-1 mt-1" />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cuisine Analytics Tab */}
        {showCuisineAnalytics && (
          <TabsContent value="cuisines" className="space-y-6">
            {/* Cuisine Performance Overview */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Most Popular Cuisine</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {cuisineAnalytics[0]?.cuisine || 'N/A'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {cuisineAnalytics[0]?.totalCooks || 0} total cooks
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Highest Success Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {cuisineAnalytics.reduce((max, cuisine) => 
                      cuisine.averageSuccessRate > max.averageSuccessRate ? cuisine : max,
                      cuisineAnalytics[0] || { averageSuccessRate: 0, cuisine: 'N/A' }
                    ).cuisine}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatPercentage(cuisineAnalytics.reduce((max, cuisine) => 
                      cuisine.averageSuccessRate > max.averageSuccessRate ? cuisine : max,
                      cuisineAnalytics[0] || { averageSuccessRate: 0 }
                    ).averageSuccessRate)} success rate
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Fastest Growing</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {cuisineAnalytics.reduce((max, cuisine) => 
                      cuisine.growthRate > max.growthRate ? cuisine : max,
                      cuisineAnalytics[0] || { growthRate: 0, cuisine: 'N/A' }
                    ).cuisine}
                  </div>
                  <div className="text-sm text-green-500">
                    +{formatPercentage(Math.abs(cuisineAnalytics.reduce((max, cuisine) => 
                      cuisine.growthRate > max.growthRate ? cuisine : max,
                      cuisineAnalytics[0] || { growthRate: 0 }
                    ).growthRate))} growth
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Cuisine Ranking List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cuisine Performance Rankings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {cuisineAnalytics.map((cuisine, index) => (
                  <div key={cuisine.cuisine} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="min-w-[32px] justify-center">
                        #{index + 1}
                      </Badge>
                      
                      <div className="space-y-1">
                        <h4 className="font-medium text-lg">{cuisine.cuisine}</h4>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span>{cuisine.totalRecipes} recipes</span>
                          <span>•</span>
                          <span>{cuisine.totalCooks} cooks</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-right">
                      <div>
                        <div className="font-medium text-green-600">{formatPercentage(cuisine.averageSuccessRate)}</div>
                        <div className="text-xs text-muted-foreground">success rate</div>
                      </div>
                      
                      <div>
                        <div className="font-medium text-blue-600">{formatNumber(cuisine.userPreferenceScore, 0)}%</div>
                        <div className="text-xs text-muted-foreground">preference</div>
                      </div>
                      
                      <div className="min-w-[80px]">
                        <div className={`font-medium flex items-center gap-1 ${
                          cuisine.growthRate > 0 ? 'text-green-600' : cuisine.growthRate < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {cuisine.growthRate > 0 ? '+' : ''}{formatNumber(cuisine.growthRate, 1)}%
                          {cuisine.growthRate > 0 ? <TrendingUp className="w-3 h-3" /> : 
                           cuisine.growthRate < 0 ? <TrendingDown className="w-3 h-3" /> : null}
                        </div>
                        <div className="text-xs text-muted-foreground">growth rate</div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}