import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown,
  ChefHat,
  Clock,
  Target,
  Star,
  Flame,
  Calendar,
  BarChart3
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { userAnalyticsService } from '@/lib/userAnalytics';
import type { UserEngagementMetrics } from '@/lib/userAnalytics';

interface CookingAnalyticsWidgetProps {
  userId: string;
  compact?: boolean;
  showTrends?: boolean;
  onViewDetails?: () => void;
}

export function CookingAnalyticsWidget({ 
  userId, 
  compact = false, 
  showTrends = true,
  onViewDetails 
}: CookingAnalyticsWidgetProps) {
  const [metrics, setMetrics] = useState<UserEngagementMetrics | null>(null);
  const [weeklyData, setWeeklyData] = useState<Array<{ date: string; count: number; successRate: number }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [userId]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const [userMetrics, frequency] = await Promise.all([
        userAnalyticsService.getUserEngagementMetrics(userId, 'weekly'),
        userAnalyticsService.getCookingFrequency(userId, 'week')
      ]);

      setMetrics(userMetrics);
      setWeeklyData(frequency.slice(-7));
    } catch (error) {
      console.error('Failed to load analytics:', error);
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

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-3 h-3 text-green-500" />;
    if (change < 0) return <TrendingDown className="w-3 h-3 text-red-500" />;
    return null;
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return 'text-green-500';
    if (change < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  if (isLoading) {
    return (
      <Card className={compact ? 'h-32' : ''}>
        <CardContent className="p-4">
          <div className={`bg-gray-100 animate-pulse rounded ${compact ? 'h-20' : 'h-40'}`}></div>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) {
    return (
      <Card className={compact ? 'h-32' : ''}>
        <CardContent className="p-4 text-center">
          <ChefHat className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">No cooking data yet</p>
          <p className="text-xs text-muted-foreground">Start cooking to see your analytics!</p>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <Card className="h-32">
        <CardContent className="p-4">
          <div className="flex items-center justify-between h-full">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ChefHat className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium">This Week</span>
              </div>
              <div className="text-2xl font-bold">{formatNumber(metrics.metrics.cookingFrequency, 1)}</div>
              <div className="text-xs text-muted-foreground">cooking sessions</div>
            </div>
            <div className="text-right space-y-1">
              <div className="flex items-center gap-1">
                <Target className="w-3 h-3 text-green-500" />
                <span className="text-sm font-medium">{formatNumber(metrics.metrics.cookingSuccessRate, 0)}%</span>
              </div>
              <div className="flex items-center gap-1">
                <Flame className="w-3 h-3 text-red-500" />
                <span className="text-sm">{metrics.metrics.streakLength}d</span>
              </div>
              {onViewDetails && (
                <Button size="sm" variant="ghost" onClick={onViewDetails} className="text-xs h-6 px-2">
                  View All
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Your Cooking Analytics
          </CardTitle>
          {onViewDetails && (
            <Button size="sm" variant="ghost" onClick={onViewDetails}>
              View Details
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key Metrics Row */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <ChefHat className="w-4 h-4 text-orange-500" />
              {getTrendIcon(metrics.trends.cookingFrequencyChange)}
            </div>
            <div className="text-xl font-bold">{formatNumber(metrics.metrics.cookingFrequency, 1)}</div>
            <div className="text-xs text-muted-foreground">Weekly Cooks</div>
            {metrics.trends.cookingFrequencyChange !== 0 && (
              <div className={`text-xs ${getTrendColor(metrics.trends.cookingFrequencyChange)}`}>
                {formatNumber(Math.abs(metrics.trends.cookingFrequencyChange), 1)}%
              </div>
            )}
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target className="w-4 h-4 text-green-500" />
            </div>
            <div className="text-xl font-bold">{formatNumber(metrics.metrics.cookingSuccessRate, 0)}%</div>
            <div className="text-xs text-muted-foreground">Success Rate</div>
            <Progress value={metrics.metrics.cookingSuccessRate} className="h-1 mt-1" />
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-xl font-bold">{formatNumber(metrics.metrics.averageCookingTime, 0)}m</div>
            <div className="text-xs text-muted-foreground">Avg Time</div>
            <div className="text-xs text-muted-foreground">
              {formatNumber(metrics.metrics.timeSpentCooking / 60, 1)}h total
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Flame className="w-4 h-4 text-red-500" />
            </div>
            <div className="text-xl font-bold">{metrics.metrics.streakLength}</div>
            <div className="text-xs text-muted-foreground">Day Streak</div>
            <div className="flex items-center justify-center gap-1 mt-1">
              <Star className="w-3 h-3 text-yellow-500" />
              <span className="text-xs">{metrics.metrics.badgesEarned} badges</span>
            </div>
          </div>
        </div>

        {/* Weekly Trend Chart */}
        {showTrends && weeklyData.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              This Week's Activity
            </h4>
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={weeklyData}>
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString([], { weekday: 'short' })}
                  axisLine={false}
                  tickLine={false}
                  fontSize={11}
                />
                <YAxis hide />
                <Tooltip 
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  formatter={(value: any, name: string) => [
                    name === 'count' ? `${value} sessions` : `${value.toFixed(1)}%`,
                    name === 'count' ? 'Cooking Sessions' : 'Success Rate'
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Quick Insights */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Favorite Cuisine:</span>
            <Badge variant="outline">{metrics.insights.mostCookedCuisine}</Badge>
          </div>
          
          {metrics.insights.favoriteRecipes.length > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Top Recipe:</span>
              <span className="font-medium truncate max-w-32">
                {metrics.insights.favoriteRecipes[0]}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">New Cuisines:</span>
            <span className="font-medium">{metrics.metrics.newCuisinesTried} tried</span>
          </div>

          {metrics.trends.skillProgressionRate > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Skill Growth:</span>
              <div className="flex items-center gap-1 text-green-500">
                <TrendingUp className="w-3 h-3" />
                <span className="font-medium">+{formatNumber(metrics.trends.skillProgressionRate, 1)}%</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}