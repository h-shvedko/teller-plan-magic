import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Target, DollarSign, Clock, Users, 
  ChefHat, Calendar, Lightbulb, AlertCircle, CheckCircle, Star
} from 'lucide-react';
import { dataAnalyticsService, RecipeSuccessMetrics, SeasonalPreference, CostOptimization, AnalyticsInsight } from '@/lib/dataAnalytics';

interface DataAnalyticsDashboardProps {
  userId: string;
}

export function DataAnalyticsDashboard({ userId }: DataAnalyticsDashboardProps) {
  const [behaviorAnalytics, setBehaviorAnalytics] = useState<any>(null);
  const [recipeMetrics, setRecipeMetrics] = useState<RecipeSuccessMetrics[]>([]);
  const [seasonalPreferences, setSeasonalPreferences] = useState<SeasonalPreference[]>([]);
  const [costOptimizations, setCostOptimizations] = useState<CostOptimization[]>([]);
  const [insights, setInsights] = useState<AnalyticsInsight[]>([]);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, [userId, timeRange]);

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);
      
      const [
        behaviorData,
        recipeData,
        seasonalData,
        insightsData
      ] = await Promise.all([
        dataAnalyticsService.getUserBehaviorAnalytics(userId, timeRange),
        dataAnalyticsService.getRecipeSuccessAnalytics(),
        dataAnalyticsService.getSeasonalPreferenceAnalysis(userId),
        dataAnalyticsService.generateAnalyticsInsights(userId)
      ]);

      setBehaviorAnalytics(behaviorData);
      setRecipeMetrics(recipeData);
      setSeasonalPreferences(seasonalData);
      setInsights(insightsData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockCostOptimization = async () => {
    // Mock meal plan ID for demo
    const mockOptimization = await dataAnalyticsService.generateCostOptimizations('mock-meal-plan', userId);
    setCostOptimizations([mockOptimization]);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'behavior': return <Users className="h-4 w-4" />;
      case 'success': return <Target className="h-4 w-4" />;
      case 'seasonal': return <Calendar className="h-4 w-4" />;
      case 'cost': return <DollarSign className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Data Analytics & Insights</h1>
          <p className="text-muted-foreground">
            Comprehensive analysis of your cooking patterns and optimization opportunities
          </p>
        </div>
        <div className="flex gap-2">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="border rounded px-3 py-2"
          >
            <option value="day">Last 24 Hours</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
          </select>
          <Button onClick={loadAnalyticsData} variant="outline">
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Insights Summary */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              AI-Powered Insights
            </CardTitle>
            <CardDescription>
              Personalized recommendations based on your cooking data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {insights.slice(0, 3).map((insight) => (
              <Alert key={insight.id}>
                <div className="flex items-start gap-3">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1">
                    <AlertTitle className="flex items-center gap-2">
                      {insight.title}
                      <Badge variant={getImpactColor(insight.impact)}>
                        {insight.impact} impact
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {Math.round(insight.confidence * 100)}% confidence
                      </span>
                    </AlertTitle>
                    <AlertDescription className="mt-1">
                      {insight.description}
                    </AlertDescription>
                    {insight.recommendations.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium">Recommendations:</p>
                        <ul className="text-sm text-muted-foreground list-disc list-inside">
                          {insight.recommendations.map((rec, index) => (
                            <li key={index}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="behavior" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="behavior">User Behavior</TabsTrigger>
          <TabsTrigger value="success">Recipe Success</TabsTrigger>
          <TabsTrigger value="seasonal">Seasonal Trends</TabsTrigger>
          <TabsTrigger value="cost">Cost Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="behavior" className="space-y-6">
          {behaviorAnalytics && (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Total Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{behaviorAnalytics.totalActions}</div>
                    <p className="text-xs text-muted-foreground">
                      in selected period
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Engagement Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {behaviorAnalytics.engagementScore.toFixed(1)}
                    </div>
                    <Progress 
                      value={Math.min(behaviorAnalytics.engagementScore * 20, 100)} 
                      className="mt-2" 
                    />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Avg Session</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.round(behaviorAnalytics.sessionDuration)}m
                    </div>
                    <p className="text-xs text-muted-foreground">
                      session duration
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Peak Hour</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {behaviorAnalytics.peakHours[0]?.hour || 0}:00
                    </div>
                    <p className="text-xs text-muted-foreground">
                      most active time
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Actions</CardTitle>
                    <CardDescription>Your most common activities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={behaviorAnalytics.topActions}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="action" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Device Usage</CardTitle>
                    <CardDescription>Breakdown by device type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={behaviorAnalytics.deviceUsage}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="percentage"
                          label={({ device, percentage }) => `${device}: ${percentage}%`}
                        >
                          {behaviorAnalytics.deviceUsage.map((_: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Activity Throughout the Day</CardTitle>
                    <CardDescription>Your usage patterns by hour</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={behaviorAnalytics.peakHours}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="activity" stroke="#8884d8" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="success" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recipe Success Metrics</CardTitle>
                  <CardDescription>
                    Performance analysis of your recipe attempts
                  </CardDescription>
                </div>
                <ChefHat className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recipeMetrics.slice(0, 5).map((recipe) => (
                    <div key={recipe.recipeId} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Recipe {recipe.recipeId}</h4>
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span>{recipe.averageRating.toFixed(1)}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Success Rate</p>
                          <div className="flex items-center gap-2">
                            <Progress value={recipe.successRate * 100} className="flex-1" />
                            <span className="font-medium">
                              {Math.round(recipe.successRate * 100)}%
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Attempts</p>
                          <p className="font-medium">{recipe.totalAttempts}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Avg Time</p>
                          <p className="font-medium">{Math.round(recipe.avgCookingTime)}m</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Popularity</p>
                          <p className="font-medium">{recipe.popularityScore.toFixed(1)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {recipeMetrics.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Success Rate Distribution</CardTitle>
                  <CardDescription>Recipe success rates across your cooking attempts</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={recipeMetrics.slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="recipeId" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="successRate" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="seasonal" className="space-y-6">
          {seasonalPreferences.length > 0 && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Seasonal Cooking Preferences</CardTitle>
                  <CardDescription>
                    Your cooking patterns across different seasons
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {seasonalPreferences.map((preference) => (
                      <Card key={`${preference.userId}-${preference.season}`}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base capitalize">
                            {preference.season}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <p className="text-sm text-muted-foreground">Avg Cost</p>
                            <p className="font-medium">${preference.averagePrice.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Health Score</p>
                            <div className="flex items-center gap-2">
                              <Progress value={preference.healthScore * 10} className="flex-1" />
                              <span className="text-sm">
                                {preference.healthScore.toFixed(1)}
                              </span>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Prep Time</p>
                            <p className="font-medium">{Math.round(preference.preparationTime)}m</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Top Cuisines</p>
                            <div className="space-y-1">
                              {preference.cuisinePreferences
                                .sort((a, b) => b.preference - a.preference)
                                .slice(0, 3)
                                .map((cuisine, index) => (
                                  <div key={index} className="text-xs">
                                    <span className="capitalize">{cuisine.cuisine}</span>
                                    <span className="text-muted-foreground ml-1">
                                      ({Math.round(cuisine.preference * 100)}%)
                                    </span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Seasonal Spending Analysis</CardTitle>
                  <CardDescription>Cost comparison across seasons</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={seasonalPreferences}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="season" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="averagePrice" fill="#f59e0b" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="cost" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Cost Optimization</CardTitle>
                <CardDescription>
                  AI-powered recommendations to reduce meal costs
                </CardDescription>
              </div>
              <Button onClick={generateMockCostOptimization}>
                Generate Optimization
              </Button>
            </CardHeader>
            <CardContent>
              {costOptimizations.length === 0 ? (
                <div className="text-center py-8">
                  <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Click "Generate Optimization" to analyze your meal plan costs
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {costOptimizations.map((optimization) => (
                    <div key={optimization.optimizationId} className="border rounded-lg p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Potential Savings</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                              ${optimization.savings.toFixed(2)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {optimization.savingsPercentage.toFixed(1)}% reduction
                            </p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Implementation</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <Badge variant={
                              optimization.implementationDifficulty === 'easy' ? 'default' :
                              optimization.implementationDifficulty === 'medium' ? 'secondary' : 'destructive'
                            }>
                              {optimization.implementationDifficulty}
                            </Badge>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Impact Scores</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>Nutrition:</span>
                              <span className={optimization.nutritionalImpact >= 0 ? 'text-green-600' : 'text-red-600'}>
                                {optimization.nutritionalImpact > 0 ? '+' : ''}{optimization.nutritionalImpact.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Taste:</span>
                              <span className={optimization.tasteImpact >= 0 ? 'text-green-600' : 'text-red-600'}>
                                {optimization.tasteImpact > 0 ? '+' : ''}{optimization.tasteImpact.toFixed(2)}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <div>
                        <h4 className="font-medium mb-3">Optimization Recommendations</h4>
                        <div className="space-y-3">
                          {optimization.optimizations
                            .sort((a, b) => b.savings - a.savings)
                            .map((opt, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                <div className="flex-1">
                                  <p className="font-medium capitalize">
                                    {opt.type.replace('_', ' ')}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {opt.description}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Progress value={opt.confidence * 100} className="w-20 h-2" />
                                    <span className="text-xs text-muted-foreground">
                                      {Math.round(opt.confidence * 100)}% confidence
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium text-green-600">
                                    ${opt.savings.toFixed(2)}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    savings
                                  </p>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}