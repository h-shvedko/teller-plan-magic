import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Leaf,
  Sun,
  TreePine,
  Snowflake,
  TrendingUp,
  TrendingDown,
  Calendar,
  ChefHat,
  Apple,
  Thermometer,
  Clock,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { 
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell
} from 'recharts';
import { userAnalyticsService } from '@/lib/userAnalytics';
import type { SeasonalTrend } from '@/lib/userAnalytics';

interface SeasonalTrendsAnalyzerProps {
  year?: number;
  showIngredientTrends?: boolean;
  onSeasonSelect?: (season: string) => void;
}

export function SeasonalTrendsAnalyzer({ 
  year = new Date().getFullYear(), 
  showIngredientTrends = true,
  onSeasonSelect 
}: SeasonalTrendsAnalyzerProps) {
  const [seasonalTrends, setSeasonalTrends] = useState<SeasonalTrend[]>([]);
  const [ingredientTrends, setIngredientTrends] = useState<Array<{
    ingredient: string;
    usage: number;
    change: number;
    seasonality: number;
    popularRecipes: string[];
  }>>([]);
  const [selectedYear, setSelectedYear] = useState(year);
  const [selectedSeason, setSelectedSeason] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  const seasonIcons = {
    spring: <Leaf className="w-5 h-5 text-green-500" />,
    summer: <Sun className="w-5 h-5 text-yellow-500" />,
    fall: <TreePine className="w-5 h-5 text-orange-500" />,
    winter: <Snowflake className="w-5 h-5 text-blue-500" />
  };

  const seasonColors = {
    spring: '#22c55e',
    summer: '#eab308',
    fall: '#f97316',
    winter: '#3b82f6'
  };

  const chartColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

  useEffect(() => {
    loadSeasonalData();
  }, [selectedYear]);

  const loadSeasonalData = async () => {
    setIsLoading(true);
    try {
      const [trends, ingredients] = await Promise.all([
        userAnalyticsService.getSeasonalTrends(selectedYear),
        showIngredientTrends ? userAnalyticsService.getIngredientTrends('year') : Promise.resolve([])
      ]);

      setSeasonalTrends(trends);
      setIngredientTrends(ingredients);
    } catch (error) {
      console.error('Failed to load seasonal data:', error);
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

  // Prepare chart data
  const seasonalActivityData = seasonalTrends.map(trend => ({
    season: trend.season.charAt(0).toUpperCase() + trend.season.slice(1),
    totalCooks: trend.totalCooks,
    avgFrequency: trend.avgCookingFrequency,
    mealPlans: trend.totalMealPlans
  }));

  // Get seasonal cuisine trends for comparison
  const seasonalCuisineData = seasonalTrends.flatMap(trend =>
    trend.popularCuisines.slice(0, 3).map(cuisine => ({
      season: trend.season.charAt(0).toUpperCase() + trend.season.slice(1),
      cuisine: cuisine.cuisine,
      percentage: cuisine.percentage,
      change: cuisine.change
    }))
  );

  // Get the most seasonal ingredients
  const topSeasonalIngredients = ingredientTrends
    .sort((a, b) => b.seasonality - a.seasonality)
    .slice(0, 12);

  const availableYears = [selectedYear - 2, selectedYear - 1, selectedYear, selectedYear + 1];

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
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Seasonal Trends Analysis
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Discover seasonal cooking patterns and ingredient trends throughout the year
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Select 
                value={selectedYear.toString()} 
                onValueChange={(value) => setSelectedYear(parseInt(value))}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={loadSeasonalData} variant="outline" size="sm">
                <Activity className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Seasonal Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {seasonalTrends.map(trend => (
          <Card 
            key={trend.season}
            className={`transition-all cursor-pointer ${
              selectedSeason === trend.season ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
            }`}
            onClick={() => {
              setSelectedSeason(selectedSeason === trend.season ? 'all' : trend.season);
              onSeasonSelect?.(trend.season);
            }}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {seasonIcons[trend.season as keyof typeof seasonIcons]}
                  <CardTitle className="text-base capitalize">{trend.season}</CardTitle>
                </div>
                <Badge variant="outline">{trend.totalCooks}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Meal Plans:</span>
                <span className="font-medium">{trend.totalMealPlans}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Avg Frequency:</span>
                <span className="font-medium">{formatNumber(trend.avgCookingFrequency, 1)}/week</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Top: {trend.popularCuisines[0]?.cuisine || 'N/A'}
              </div>
              <Progress 
                value={(trend.totalCooks / Math.max(...seasonalTrends.map(t => t.totalCooks))) * 100} 
                className="h-2"
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cuisines">Cuisines</TabsTrigger>
          {showIngredientTrends && <TabsTrigger value="ingredients">Ingredients</TabsTrigger>}
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Seasonal Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Seasonal Cooking Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={seasonalActivityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="season" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="totalCooks"
                    stackId="1"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.3}
                    name="Total Cooks"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="avgFrequency"
                    stroke="#82ca9d"
                    strokeWidth={3}
                    name="Avg Weekly Frequency"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Season Details */}
          <div className="grid gap-4 md:grid-cols-2">
            {selectedSeason === 'all' ? 
              seasonalTrends.slice(0, 2).map(trend => (
                <Card key={trend.season}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 capitalize">
                      {seasonIcons[trend.season as keyof typeof seasonIcons]}
                      {trend.season} Highlights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <ChefHat className="w-4 h-4" />
                        Popular Cuisines
                      </h4>
                      <div className="space-y-2">
                        {trend.popularCuisines.slice(0, 4).map((cuisine, index) => (
                          <div key={cuisine.cuisine} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="w-6 h-6 text-xs p-0 flex items-center justify-center">
                                {index + 1}
                              </Badge>
                              <span className="text-sm">{cuisine.cuisine}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {formatPercentage(cuisine.percentage)}
                              </span>
                              {getTrendIcon(cuisine.change)}
                              <span className={`text-xs ${getTrendColor(cuisine.change)}`}>
                                {Math.abs(cuisine.change).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Apple className="w-4 h-4" />
                        Trending Ingredients
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {trend.popularIngredients.slice(0, 8).map(ingredient => (
                          <Badge 
                            key={ingredient.ingredient} 
                            variant="secondary" 
                            className="text-xs"
                          >
                            {ingredient.ingredient}
                            {ingredient.change > 0 && (
                              <TrendingUp className="w-3 h-3 ml-1 text-green-500" />
                            )}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )) :
              seasonalTrends
                .filter(trend => trend.season === selectedSeason)
                .map(trend => (
                  <Card key={trend.season} className="md:col-span-2">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 capitalize">
                        {seasonIcons[trend.season as keyof typeof seasonIcons]}
                        {trend.season} Deep Dive
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-2">
                      <div>
                        <h4 className="font-medium mb-3">Cuisine Breakdown</h4>
                        <ResponsiveContainer width="100%" height={200}>
                          <RechartsPieChart>
                            <Pie
                              data={trend.popularCuisines.slice(0, 5)}
                              cx="50%"
                              cy="50%"
                              outerRadius={60}
                              dataKey="percentage"
                              nameKey="cuisine"
                            >
                              {trend.popularCuisines.slice(0, 5).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value: any) => `${value.toFixed(1)}%`} />
                            <Legend />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </div>

                      <div>
                        <h4 className="font-medium mb-3">Top Seasonal Recipes</h4>
                        <div className="space-y-2">
                          {trend.seasonalRecipes.map((recipe, index) => (
                            <div key={recipe.recipeId} className="flex items-center justify-between p-2 border rounded">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="w-6 h-6 text-xs p-0 flex items-center justify-center">
                                  {index + 1}
                                </Badge>
                                <span className="text-sm font-medium">{recipe.name}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Thermometer className="w-3 h-3" />
                                <span className="text-xs">{formatNumber(recipe.seasonalScore, 0)}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                          <h5 className="text-sm font-medium text-blue-900">Season Stats</h5>
                          <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-blue-800">
                            <div>Total Cooks: {trend.totalCooks}</div>
                            <div>Meal Plans: {trend.totalMealPlans}</div>
                            <div>Avg Frequency: {formatNumber(trend.avgCookingFrequency, 1)}/week</div>
                            <div>Ingredients: {trend.popularIngredients.length}</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
            }
          </div>
        </TabsContent>

        {/* Cuisines Tab */}
        <TabsContent value="cuisines" className="space-y-6">
          {/* Seasonal Cuisine Trends Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Cuisine Popularity by Season</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={seasonalCuisineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="season" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => `${value.toFixed(1)}%`} />
                  <Legend />
                  {[...new Set(seasonalCuisineData.map(d => d.cuisine))].map((cuisine, index) => (
                    <Bar
                      key={cuisine}
                      dataKey="percentage"
                      data={seasonalCuisineData.filter(d => d.cuisine === cuisine)}
                      fill={chartColors[index % chartColors.length]}
                      name={cuisine}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Cuisine Seasonal Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Cuisine Seasonal Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {[...new Set(seasonalCuisineData.map(d => d.cuisine))].map(cuisine => {
                  const cuisineData = seasonalCuisineData.filter(d => d.cuisine === cuisine);
                  const bestSeason = cuisineData.reduce((max, current) => 
                    current.percentage > max.percentage ? current : max
                  );
                  const avgChange = cuisineData.reduce((sum, d) => sum + d.change, 0) / cuisineData.length;

                  return (
                    <div key={cuisine} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{cuisine}</h4>
                        <p className="text-sm text-muted-foreground">
                          Peak season: {bestSeason.season} ({formatPercentage(bestSeason.percentage)})
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`flex items-center gap-1 ${getTrendColor(avgChange)}`}>
                          {getTrendIcon(avgChange)}
                          <span className="font-medium">{formatPercentage(Math.abs(avgChange))}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">avg change</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ingredients Tab */}
        {showIngredientTrends && (
          <TabsContent value="ingredients" className="space-y-6">
            {/* Most Seasonal Ingredients */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Apple className="w-5 h-5" />
                  Most Seasonal Ingredients
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Ingredients with the highest seasonal variation in usage
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {topSeasonalIngredients.map((ingredient, index) => (
                    <div key={ingredient.ingredient} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="w-8 h-8 text-sm p-0 flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <div>
                          <h4 className="font-medium capitalize">{ingredient.ingredient}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Used in {ingredient.popularRecipes.length} popular recipes</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-right">
                        <div>
                          <div className="font-medium">{ingredient.usage}</div>
                          <div className="text-xs text-muted-foreground">total usage</div>
                        </div>
                        
                        <div>
                          <div className={`font-medium flex items-center gap-1 ${getTrendColor(ingredient.change)}`}>
                            {getTrendIcon(ingredient.change)}
                            {formatPercentage(Math.abs(ingredient.change))}
                          </div>
                          <div className="text-xs text-muted-foreground">change</div>
                        </div>
                        
                        <div className="min-w-[100px]">
                          <div className="font-medium text-purple-600">{formatNumber(ingredient.seasonality, 0)}</div>
                          <div className="text-xs text-muted-foreground">seasonality score</div>
                          <Progress value={ingredient.seasonality} className="h-1 mt-1" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Popular Recipes by Ingredient */}
            <div className="grid gap-4 md:grid-cols-2">
              {topSeasonalIngredients.slice(0, 4).map(ingredient => (
                <Card key={ingredient.ingredient}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base capitalize">{ingredient.ingredient} Recipes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {ingredient.popularRecipes.map((recipe, index) => (
                        <div key={recipe} className="flex items-center gap-2 text-sm">
                          <Badge variant="outline" className="w-5 h-5 text-xs p-0 flex items-center justify-center">
                            {index + 1}
                          </Badge>
                          <span>{recipe}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 p-2 bg-gray-50 rounded text-center">
                      <div className="text-sm font-medium text-gray-700">
                        Seasonality: {formatNumber(ingredient.seasonality, 0)}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {ingredient.change > 0 ? '+' : ''}{formatPercentage(ingredient.change)} vs last period
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        )}

        {/* Patterns Tab */}
        <TabsContent value="patterns" className="space-y-6">
          {/* Seasonal Pattern Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Seasonal Cooking Patterns
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Cooking Frequency Pattern */}
              <div>
                <h4 className="font-medium mb-3">Weekly Cooking Frequency by Season</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={seasonalActivityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="season" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="avgFrequency"
                      stroke="#8884d8"
                      strokeWidth={3}
                      dot={{ r: 6 }}
                      name="Avg Weekly Frequency"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Pattern Insights */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Peak Cooking Season
                  </h4>
                  <div className="space-y-2">
                    {seasonalTrends
                      .sort((a, b) => b.totalCooks - a.totalCooks)
                      .slice(0, 2)
                      .map((trend, index) => (
                        <div key={trend.season} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {seasonIcons[trend.season as keyof typeof seasonIcons]}
                            <span className="capitalize">{trend.season}</span>
                            {index === 0 && <Badge variant="default" className="text-xs">Peak</Badge>}
                          </div>
                          <span className="font-medium">{trend.totalCooks} cooks</span>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <PieChart className="w-4 h-4" />
                    Most Consistent Season
                  </h4>
                  <div className="space-y-2">
                    {seasonalTrends
                      .sort((a, b) => b.avgCookingFrequency - a.avgCookingFrequency)
                      .slice(0, 2)
                      .map((trend, index) => (
                        <div key={trend.season} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {seasonIcons[trend.season as keyof typeof seasonIcons]}
                            <span className="capitalize">{trend.season}</span>
                            {index === 0 && <Badge variant="secondary" className="text-xs">Consistent</Badge>}
                          </div>
                          <span className="font-medium">{formatNumber(trend.avgCookingFrequency, 1)}/week</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* Seasonal Insights */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">🏆 Top Seasonal Insight</h4>
                  <p className="text-sm text-blue-800">
                    {seasonalTrends.reduce((max, current) => 
                      current.totalCooks > max.totalCooks ? current : max
                    ).season.charAt(0).toUpperCase() + seasonalTrends.reduce((max, current) => 
                      current.totalCooks > max.totalCooks ? current : max
                    ).season.slice(1)} shows the highest cooking activity with{' '}
                    {seasonalTrends.reduce((max, current) => 
                      current.totalCooks > max.totalCooks ? current : max
                    ).totalCooks} total cooking sessions.
                  </p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">🌱 Growth Opportunity</h4>
                  <p className="text-sm text-green-800">
                    {seasonalTrends.reduce((min, current) => 
                      current.totalCooks < min.totalCooks ? current : min
                    ).season.charAt(0).toUpperCase() + seasonalTrends.reduce((min, current) => 
                      current.totalCooks < min.totalCooks ? current : min
                    ).season.slice(1)} has the most room for growth with only{' '}
                    {seasonalTrends.reduce((min, current) => 
                      current.totalCooks < min.totalCooks ? current : min
                    ).totalCooks} cooking sessions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}