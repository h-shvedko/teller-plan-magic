import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  Activity,
  Heart,
  Award,
  AlertCircle,
  CheckCircle,
  Lightbulb,
  Target,
} from 'lucide-react';
import {
  MealPlanAnalytics as AnalyticsType,
  AnalyticsInsight,
  advancedPlanningService,
} from '@/lib/advancedPlanningTools';

interface MealPlanAnalyticsProps {
  mealPlanId: string;
}

export const MealPlanAnalytics: React.FC<MealPlanAnalyticsProps> = ({
  mealPlanId,
}) => {
  const [analytics, setAnalytics] = useState<AnalyticsType | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mealPlanId) {
      generateAnalytics();
    }
  }, [mealPlanId, selectedPeriod]);

  const generateAnalytics = async () => {
    setLoading(true);
    try {
      const result = await advancedPlanningService.generateAnalytics(mealPlanId, selectedPeriod);
      setAnalytics(result);
    } catch (error) {
      console.error('Error generating analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'suggestion':
        return <Lightbulb className="w-4 h-4 text-blue-600" />;
      case 'achievement':
        return <Award className="w-4 h-4 text-purple-600" />;
      default:
        return <Target className="w-4 h-4 text-gray-600" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'suggestion':
        return 'border-blue-200 bg-blue-50';
      case 'achievement':
        return 'border-purple-200 bg-purple-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const renderInsight = (insight: AnalyticsInsight) => {
    return (
      <div key={insight.title} className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}>
        <div className="flex items-start gap-3">
          {getInsightIcon(insight.type)}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium">{insight.title}</h4>
              <Badge variant={insight.impact === 'high' ? 'default' : insight.impact === 'medium' ? 'secondary' : 'outline'}>
                {insight.impact} impact
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {insight.description}
            </p>
            {insight.actionable && (
              <div className="flex items-center gap-2 text-sm">
                <Target className="w-3 h-3" />
                <span className="font-medium">Action:</span>
                <span>{insight.actionable}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="text-center">
          <Activity className="w-8 h-8 animate-pulse mx-auto mb-2" />
          <p>Generating analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">Analytics Not Available</h3>
          <p className="text-muted-foreground">
            Unable to generate analytics for this meal plan
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Activity className="w-6 h-6" />
          Meal Plan Analytics
        </h2>
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="quarter">Quarter</SelectItem>
              <SelectItem value="year">Year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={generateAnalytics} disabled={loading}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Total Cost</div>
                <div className="text-2xl font-bold">${analytics.costAnalytics.totalCost.toFixed(0)}</div>
                <div className="flex items-center gap-1 text-xs">
                  {analytics.costAnalytics.comparisonToPreviousPeriod >= 0 ? (
                    <TrendingUp className="w-3 h-3 text-red-500" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-green-500" />
                  )}
                  <span className={analytics.costAnalytics.comparisonToPreviousPeriod >= 0 ? 'text-red-500' : 'text-green-500'}>
                    {Math.abs(analytics.costAnalytics.comparisonToPreviousPeriod).toFixed(1)}%
                  </span>
                </div>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Avg. Calories/Day</div>
                <div className="text-2xl font-bold">{analytics.nutritionAnalytics.averageCaloriesPerDay.toFixed(0)}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Heart className="w-3 h-3" />
                  {analytics.nutritionAnalytics.nutritionalGoalAdherence}% goals met
                </div>
              </div>
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Total Cooking Time</div>
                <div className="text-2xl font-bold">{Math.round(analytics.timeAnalytics.totalCookingTime / 60)}h</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {analytics.timeAnalytics.averageTimePerMeal} min/meal
                </div>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Variety Score</div>
                <div className="text-2xl font-bold">{analytics.preferenceAnalytics.varietyScore}/100</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Award className="w-3 h-3" />
                  Recipe diversity
                </div>
              </div>
              <Award className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="cost" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="cost">Cost Analysis</TabsTrigger>
          <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
          <TabsTrigger value="time">Time Analysis</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="cost" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Cost Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.costAnalytics.costTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => new Date(date).toLocaleDateString()}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(date) => new Date(date).toLocaleDateString()}
                      formatter={(value) => [`$${value}`, 'Cost']}
                    />
                    <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Object.entries(analytics.costAnalytics.costByCategory).map(([key, value]) => ({
                        name: key,
                        value,
                      }))}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, value }) => `${name}: $${value}`}
                    >
                      {Object.entries(analytics.costAnalytics.costByCategory).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${value}`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Most Expensive Ingredients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analytics.costAnalytics.mostExpensiveIngredients.map((item, index) => (
                  <div key={item.ingredient} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs text-white">
                        {index + 1}
                      </div>
                      <span>{item.ingredient}</span>
                    </div>
                    <span className="font-semibold">${item.totalCost.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nutrition" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Calorie Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.nutritionAnalytics.nutritionTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => new Date(date).toLocaleDateString()}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(date) => new Date(date).toLocaleDateString()}
                      formatter={(value) => [`${value} cal`, 'Calories']}
                    />
                    <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Macronutrient Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Object.entries(analytics.nutritionAnalytics.macronutrientDistribution).map(([key, value]) => ({
                        name: key,
                        value,
                      }))}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {Object.entries(analytics.nutritionAnalytics.macronutrientDistribution).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Nutritional Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {analytics.nutritionAnalytics.topNutritionalSources.map((source) => (
                  <div key={source.nutrient}>
                    <h4 className="font-medium mb-2">{source.nutrient}</h4>
                    <div className="space-y-1">
                      {source.topSources.map((food, index) => (
                        <div key={food} className="flex items-center gap-2 text-sm">
                          <div className="w-4 h-4 bg-primary/20 rounded flex items-center justify-center text-xs">
                            {index + 1}
                          </div>
                          <span>{food}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Cooking Time Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.timeAnalytics.timeTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => new Date(date).toLocaleDateString()}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(date) => new Date(date).toLocaleDateString()}
                      formatter={(value) => [`${value} min`, 'Time']}
                    />
                    <Line type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Time by Meal Type</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={Object.entries(analytics.timeAnalytics.timeByMealType).map(([key, value]) => ({
                    name: key,
                    value,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} min`, 'Time']} />
                    <Bar dataKey="value" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Most Time-Consuming Recipes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analytics.timeAnalytics.mostTimeConsumingRecipes.map((recipe, index) => (
                  <div key={recipe.recipe} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-xs text-white">
                        {index + 1}
                      </div>
                      <span>{recipe.recipe}</span>
                    </div>
                    <span className="font-semibold">{recipe.time} min</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Cuisine Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Object.entries(analytics.preferenceAnalytics.cuisineDistribution).map(([key, value]) => ({
                        name: key,
                        value,
                      }))}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {Object.entries(analytics.preferenceAnalytics.cuisineDistribution).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Protein Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={Object.entries(analytics.preferenceAnalytics.proteinSourceDistribution).map(([key, value]) => ({
                    name: key,
                    value,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Bar dataKey="value" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Most Cooked Recipes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analytics.preferenceAnalytics.mostCookedRecipes.map((recipe, index) => (
                  <div key={recipe.recipe} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs text-white">
                        {index + 1}
                      </div>
                      <span>{recipe.recipe}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{recipe.count}x</span>
                      <Badge variant="outline">cooked</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Insights */}
      {analytics.insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Insights & Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.insights.map(renderInsight)}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};