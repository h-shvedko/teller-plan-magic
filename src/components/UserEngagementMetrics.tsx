import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity,
  Users,
  Heart,
  Share2,
  Eye,
  BookOpen,
  Clock,
  Zap,
  Trophy,
  Target,
  TrendingUp,
  TrendingDown,
  Calendar,
  MousePointer,
  MessageSquare,
  Star,
  Award,
  Flame,
  BarChart3
} from 'lucide-react';
import { 
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { userAnalyticsService } from '@/lib/userAnalytics';
import type { UserEngagementMetrics } from '@/lib/userAnalytics';

interface UserEngagementMetricsProps {
  userId: string;
  isAdmin?: boolean;
  compact?: boolean;
  onViewFullDashboard?: () => void;
}

export function UserEngagementMetrics({ 
  userId, 
  isAdmin = false, 
  compact = false,
  onViewFullDashboard 
}: UserEngagementMetricsProps) {
  const [engagementData, setEngagementData] = useState<UserEngagementMetrics | null>(null);
  const [historicalData, setHistoricalData] = useState<UserEngagementMetrics[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [selectedCategory, setSelectedCategory] = useState<'cooking' | 'platform' | 'social' | 'achievement'>('cooking');
  const [isLoading, setIsLoading] = useState(true);

  const engagementColors = {
    cooking: '#f97316',
    platform: '#3b82f6',
    social: '#10b981',
    achievement: '#8b5cf6'
  };

  useEffect(() => {
    loadEngagementData();
  }, [userId, selectedTimeframe]);

  const loadEngagementData = async () => {
    setIsLoading(true);
    try {
      // Load current period metrics
      const currentMetrics = await userAnalyticsService.getUserEngagementMetrics(userId, selectedTimeframe);
      setEngagementData(currentMetrics);

      // Load historical data for trend analysis
      const timeframes: Array<'daily' | 'weekly' | 'monthly' | 'yearly'> = ['weekly', 'monthly'];
      const historical = await Promise.all(
        timeframes.map(tf => userAnalyticsService.getUserEngagementMetrics(userId, tf))
      );
      setHistoricalData(historical);
    } catch (error) {
      console.error('Failed to load engagement metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number, decimals = 0): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num);
  };

  const formatPercentage = (num: number): string => {
    return `${formatNumber(num, 1)}%`;
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${Math.round(minutes)}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${Math.round(mins)}m` : `${hours}h`;
  };

  const getTrendIcon = (change: number) => {
    if (change > 5) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (change < -5) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Activity className="w-4 h-4 text-gray-500" />;
  };

  const getTrendColor = (change: number) => {
    if (change > 5) return 'text-green-500';
    if (change < -5) return 'text-red-500';
    return 'text-gray-500';
  };

  const getEngagementLevel = (metrics: UserEngagementMetrics) => {
    const cookingScore = (metrics.metrics.cookingFrequency / 10) * 100;
    const socialScore = (metrics.metrics.communitInteractions / 20) * 100;
    const platformScore = (metrics.metrics.sessionCount / 30) * 100;
    
    const overallScore = (cookingScore + socialScore + platformScore) / 3;
    
    if (overallScore >= 80) return { level: 'Expert Chef', color: 'text-purple-600', badge: 'default' };
    if (overallScore >= 60) return { level: 'Active Cook', color: 'text-blue-600', badge: 'secondary' };
    if (overallScore >= 40) return { level: 'Learning Cook', color: 'text-green-600', badge: 'outline' };
    return { level: 'New Cook', color: 'text-gray-600', badge: 'outline' };
  };

  // Prepare engagement breakdown data
  const engagementBreakdown = engagementData ? [
    {
      category: 'Cooking',
      score: Math.min((engagementData.metrics.cookingFrequency / 10) * 100, 100),
      color: engagementColors.cooking
    },
    {
      category: 'Platform',
      score: Math.min((engagementData.metrics.sessionCount / 30) * 100, 100),
      color: engagementColors.platform
    },
    {
      category: 'Social',
      score: Math.min((engagementData.metrics.communitInteractions / 20) * 100, 100),
      color: engagementColors.social
    },
    {
      category: 'Achievement',
      score: Math.min((engagementData.metrics.badgesEarned / 10) * 100, 100),
      color: engagementColors.achievement
    }
  ] : [];

  if (isLoading) {
    return (
      <Card className={compact ? 'h-48' : ''}>
        <CardContent className="p-4">
          <div className={`bg-gray-100 animate-pulse rounded ${compact ? 'h-36' : 'h-64'}`}></div>
        </CardContent>
      </Card>
    );
  }

  if (!engagementData) {
    return (
      <Card className={compact ? 'h-48' : ''}>
        <CardContent className="p-4 text-center">
          <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No engagement data available</p>
        </CardContent>
      </Card>
    );
  }

  const engagementLevel = getEngagementLevel(engagementData);

  if (compact) {
    return (
      <Card className="h-48">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Engagement
            </CardTitle>
            <Badge variant={engagementLevel.badge as any} className="text-xs">
              {engagementLevel.level}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center">
              <div className="text-xl font-bold text-orange-500">
                {formatNumber(engagementData.metrics.cookingFrequency, 1)}
              </div>
              <div className="text-xs text-muted-foreground">Cooks/{selectedTimeframe.slice(0, -2)}</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-blue-500">
                {formatDuration(engagementData.metrics.averageSessionDuration)}
              </div>
              <div className="text-xs text-muted-foreground">Avg Session</div>
            </div>
          </div>
          
          <div className="space-y-2">
            {engagementBreakdown.slice(0, 2).map(item => (
              <div key={item.category} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>{item.category}</span>
                  <span>{formatNumber(item.score, 0)}%</span>
                </div>
                <Progress value={item.score} className="h-1" />
              </div>
            ))}
          </div>

          {onViewFullDashboard && (
            <Button size="sm" variant="ghost" onClick={onViewFullDashboard} className="w-full text-xs">
              View Details
            </Button>
          )}
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
                <Activity className="w-5 h-5" />
                User Engagement Metrics
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Track cooking activity, platform usage, and community involvement
              </p>
            </div>
            <div className="flex items-center gap-2">
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
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Engagement Level & Overview */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-pink-600 flex items-center justify-center text-white text-2xl font-bold">
                {engagementData.metrics.cookingFrequency.toFixed(0)}
              </div>
              <div>
                <h3 className={`text-xl font-bold ${engagementLevel.color}`}>
                  {engagementLevel.level}
                </h3>
                <p className="text-muted-foreground">
                  {formatNumber(engagementData.metrics.cookingFrequency, 1)} cooks per {selectedTimeframe.slice(0, -2)}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Flame className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium">{engagementData.metrics.streakLength} day streak</span>
                </div>
              </div>
            </div>

            <div className="text-right space-y-2">
              <div className="flex items-center gap-2">
                {getTrendIcon(engagementData.trends.engagementChange)}
                <span className={`font-medium ${getTrendColor(engagementData.trends.engagementChange)}`}>
                  {Math.abs(engagementData.trends.engagementChange).toFixed(1)}%
                </span>
              </div>
              <div className="text-sm text-muted-foreground">vs last period</div>
            </div>
          </div>

          {/* Engagement Categories Radial Chart */}
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-3">Engagement Breakdown</h4>
              <ResponsiveContainer width="100%" height={200}>
                <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="80%" data={engagementBreakdown}>
                  <RadialBar dataKey="score" cornerRadius={10} />
                  <Tooltip formatter={(value: any) => `${value.toFixed(1)}%`} />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Key Metrics</h4>
              <div className="grid gap-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <div>
                      <div className="font-medium">Session Time</div>
                      <div className="text-sm text-muted-foreground">Average per visit</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-blue-600">
                      {formatDuration(engagementData.metrics.averageSessionDuration)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Eye className="w-5 h-5 text-green-500" />
                    <div>
                      <div className="font-medium">Recipe Views</div>
                      <div className="text-sm text-muted-foreground">Per {selectedTimeframe.slice(0, -2)}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">
                      {formatNumber(engagementData.metrics.recipeViewCount)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Share2 className="w-5 h-5 text-purple-500" />
                    <div>
                      <div className="font-medium">Social Activity</div>
                      <div className="text-sm text-muted-foreground">Interactions</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-purple-600">
                      {formatNumber(engagementData.metrics.communitInteractions)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={selectedCategory} onValueChange={(value: any) => setSelectedCategory(value)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="cooking">Cooking</TabsTrigger>
          <TabsTrigger value="platform">Platform</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="achievement">Achievements</TabsTrigger>
        </TabsList>

        {/* Cooking Engagement Tab */}
        <TabsContent value="cooking" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Cooking Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {formatDuration(engagementData.metrics.timeSpentCooking)}
                </div>
                <div className="text-sm text-muted-foreground">Total this {selectedTimeframe.slice(0, -2)}</div>
                <div className="mt-2">
                  <div className="text-xs text-muted-foreground mb-1">
                    Avg per cook: {formatDuration(engagementData.metrics.averageCookingTime)}
                  </div>
                  <Progress 
                    value={(engagementData.metrics.timeSpentCooking / (engagementData.metrics.cookingFrequency * 60)) * 100} 
                    className="h-2" 
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Success Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatPercentage(engagementData.metrics.cookingSuccessRate)}
                </div>
                <div className="text-sm text-muted-foreground">Completed recipes</div>
                <div className="mt-2">
                  <Progress value={engagementData.metrics.cookingSuccessRate} className="h-2" />
                  <div className="text-xs text-muted-foreground mt-1">
                    {engagementData.metrics.cookingSuccessRate >= 80 ? 'Excellent!' : 
                     engagementData.metrics.cookingSuccessRate >= 60 ? 'Good progress' : 'Keep practicing'}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Recipe Interaction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Viewed</span>
                    <span className="font-medium">{formatNumber(engagementData.metrics.recipeViewCount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Saved</span>
                    <span className="font-medium">{formatNumber(engagementData.metrics.recipesSaved)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Shared</span>
                    <span className="font-medium">{formatNumber(engagementData.metrics.recipesShared)}</span>
                  </div>
                  <div className="mt-3 text-xs text-muted-foreground">
                    Conversion rate: {formatPercentage((engagementData.metrics.recipesSaved / engagementData.metrics.recipeViewCount) * 100)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cooking Activity Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h4 className="font-medium text-orange-900 mb-2">Most Active Time</h4>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <span className="font-medium">
                      {engagementData.insights.peakCookingHours.join(':00, ')}:00
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Favorite Cuisine</h4>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-green-600" />
                    <span className="font-medium">{engagementData.insights.mostCookedCuisine}</span>
                  </div>
                </div>
              </div>

              {engagementData.insights.cookingPatterns.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Cooking Patterns</h4>
                  <div className="flex flex-wrap gap-2">
                    {engagementData.insights.cookingPatterns.map(pattern => (
                      <Badge key={pattern} variant="secondary">{pattern}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Platform Engagement Tab */}
        <TabsContent value="platform" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <MousePointer className="w-4 h-4" />
                  Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatNumber(engagementData.metrics.sessionCount)}
                </div>
                <div className="text-sm text-muted-foreground">This {selectedTimeframe.slice(0, -2)}</div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Avg duration: {formatDuration(engagementData.metrics.averageSessionDuration)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Page Views
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatNumber(engagementData.metrics.pagesViewed)}
                </div>
                <div className="text-sm text-muted-foreground">Pages viewed</div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Avg per session: {formatNumber(engagementData.metrics.pagesViewed / engagementData.metrics.sessionCount, 1)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Planning Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {formatDuration(engagementData.metrics.timeSpentPlanning)}
                </div>
                <div className="text-sm text-muted-foreground">Planning meals</div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {formatNumber(engagementData.metrics.mealPlanningFrequency, 1)} plans created
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Feature Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {engagementData.metrics.featuresUsed.map((feature, index) => (
                  <div key={feature} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{index + 1}</Badge>
                      <span className="font-medium capitalize">{feature.replace('-', ' ')}</span>
                    </div>
                    <div className="w-24">
                      <Progress value={100 - (index * 15)} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Engagement Tab */}
        <TabsContent value="social" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Connections
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatNumber(engagementData.metrics.friendsConnected)}
                </div>
                <div className="text-sm text-muted-foreground">Friends connected</div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {formatNumber(engagementData.metrics.recipesSharedWithFriends)} recipes shared
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Community
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatNumber(engagementData.metrics.communitInteractions)}
                </div>
                <div className="text-sm text-muted-foreground">Interactions</div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {formatNumber(engagementData.metrics.reviewsWritten)} reviews written
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Reviews & Ratings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {formatNumber(engagementData.metrics.recipesRated)}
                </div>
                <div className="text-sm text-muted-foreground">Recipes rated</div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Helpfulness score: {formatNumber((engagementData.metrics.recipesRated / Math.max(engagementData.metrics.reviewsWritten, 1)) * 100, 0)}%
                </div>
              </CardContent>
            </Card>
          </div>

          <Alert>
            <Users className="w-4 h-4" />
            <AlertDescription>
              <strong>Social Engagement Tip:</strong> Users with more social connections cook{' '}
              {formatNumber(25, 0)}% more frequently and have higher success rates!
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* Achievement Tab */}
        <TabsContent value="achievement" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Badges Earned
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {formatNumber(engagementData.metrics.badgesEarned)}
                </div>
                <div className="text-sm text-muted-foreground">Total badges</div>
                <div className="mt-2">
                  <Progress value={(engagementData.metrics.badgesEarned / 20) * 100} className="h-2" />
                  <div className="text-xs text-muted-foreground mt-1">
                    {20 - engagementData.metrics.badgesEarned} more to unlock next tier
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  Milestones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {formatNumber(engagementData.metrics.milestonesReached)}
                </div>
                <div className="text-sm text-muted-foreground">Milestones reached</div>
                <div className="mt-2 text-xs text-green-600">
                  <TrendingUp className="w-3 h-3 inline mr-1" />
                  {formatNumber(engagementData.trends.skillProgressionRate, 1)}% skill growth
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Flame className="w-4 h-4" />
                  Current Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatNumber(engagementData.metrics.streakLength)}
                </div>
                <div className="text-sm text-muted-foreground">Days in a row</div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Personal best: {formatNumber(engagementData.metrics.personalBests.fastest_cook || 0)} min cook
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Learning Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-3">Goal Achievement</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Nutritional Goals</span>
                        <span>{formatPercentage(engagementData.metrics.nutritionalGoalsAchieved)}</span>
                      </div>
                      <Progress value={engagementData.metrics.nutritionalGoalsAchieved} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Budget Goals</span>
                        <span>{formatPercentage(engagementData.metrics.budgetGoalsAchieved)}</span>
                      </div>
                      <Progress value={engagementData.metrics.budgetGoalsAchieved} className="h-2" />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Skill Development</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">New Cuisines Tried</span>
                      <span className="font-medium">{engagementData.metrics.newCuisinesTried}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Skill Level Improvement</span>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">+{engagementData.metrics.skillLevelImprovement}</span>
                        <TrendingUp className="w-3 h-3 text-green-500" />
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Growth Rate</span>
                      <span className={`font-medium ${getTrendColor(engagementData.trends.skillProgressionRate)}`}>
                        +{formatPercentage(engagementData.trends.skillProgressionRate)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {engagementData.insights.improvementAreas.length > 0 && (
                <Alert>
                  <Target className="w-4 h-4" />
                  <AlertDescription>
                    <strong>Focus Areas:</strong> {engagementData.insights.improvementAreas.join(', ')}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}