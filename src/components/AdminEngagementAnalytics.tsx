import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AlertTriangle, TrendingUp, TrendingDown, Users, Activity, Target, Award } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AdminBusinessIntelligenceService } from '../lib/adminBusinessIntelligence';

const AdminEngagementAnalytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30');
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAnalyticsData = async () => {
      setIsLoading(true);
      try {
        const service = new AdminBusinessIntelligenceService();
        const data = await service.getUserEngagementAnalytics(selectedTimeRange, selectedSegment);
        setAnalyticsData(data);
      } catch (error) {
        console.error('Failed to load engagement analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalyticsData();
  }, [selectedTimeRange, selectedSegment]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading engagement analytics...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Analytics Data Available</h3>
            <p className="text-muted-foreground">Unable to load engagement analytics at this time.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { overview, segmentation, trends, cohorts, features } = analyticsData;

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">User Engagement Analytics</h1>
          <p className="text-muted-foreground">Monitor user engagement patterns and behavior</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedSegment} onValueChange={setSelectedSegment}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="new">New Users</SelectItem>
              <SelectItem value="returning">Returning Users</SelectItem>
              <SelectItem value="premium">Premium Users</SelectItem>
              <SelectItem value="at_risk">At Risk Users</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{overview.activeUsers.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
            <div className="flex items-center mt-2">
              {overview.activeUsersChange > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm ${overview.activeUsersChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {Math.abs(overview.activeUsersChange)}%
              </span>
              <span className="text-sm text-muted-foreground ml-1">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Engagement Score</p>
                <p className="text-2xl font-bold">{overview.engagementScore}</p>
              </div>
              <Activity className="h-8 w-8 text-primary" />
            </div>
            <div className="flex items-center mt-2">
              <Badge variant={overview.engagementTrend === 'up' ? 'default' : 'secondary'}>
                {overview.engagementTrend === 'up' ? 'Improving' : 'Stable'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Session Duration</p>
                <p className="text-2xl font-bold">{Math.round(overview.avgSessionDuration / 60)}m</p>
              </div>
              <Target className="h-8 w-8 text-primary" />
            </div>
            <div className="flex items-center mt-2">
              <span className="text-sm text-muted-foreground">
                {overview.sessionDurationChange > 0 ? '+' : ''}
                {overview.sessionDurationChange}% change
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Feature Adoption</p>
                <p className="text-2xl font-bold">{Math.round(overview.featureAdoptionRate * 100)}%</p>
              </div>
              <Award className="h-8 w-8 text-primary" />
            </div>
            <div className="flex items-center mt-2">
              <Badge variant="default">
                {overview.topFeature}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="trends" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends">Engagement Trends</TabsTrigger>
          <TabsTrigger value="segmentation">User Segmentation</TabsTrigger>
          <TabsTrigger value="cohorts">Cohort Analysis</TabsTrigger>
          <TabsTrigger value="features">Feature Usage</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Active Users</CardTitle>
                <CardDescription>User activity over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={trends.dailyActiveUsers}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="users"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Session Duration Trends</CardTitle>
                <CardDescription>Average session length over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trends.sessionDuration}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="duration"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Page Views per Session</CardTitle>
                <CardDescription>User navigation patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={trends.pageViewsPerSession}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="pageViews" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Action Completion Rate</CardTitle>
                <CardDescription>Percentage of successful user actions</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trends.actionCompletionRate}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="completionRate"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="segmentation" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Segments</CardTitle>
                <CardDescription>Distribution of user types</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={segmentation.userTypes}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {segmentation.userTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement by Segment</CardTitle>
                <CardDescription>Average engagement score by user type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={segmentation.engagementBySegment}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="segment" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="engagement" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Behavioral Patterns</CardTitle>
                <CardDescription>Key behaviors by user segment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {segmentation.behavioralPatterns.map((pattern, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{pattern.segment}</h4>
                        <p className="text-sm text-muted-foreground">{pattern.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{pattern.primaryBehavior}</p>
                        <Badge variant="outline">{pattern.users} users</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cohorts" className="space-y-4">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Retention Cohorts</CardTitle>
                <CardDescription>Retention rates by signup period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Cohort</th>
                        <th className="text-center p-2">Users</th>
                        <th className="text-center p-2">Week 1</th>
                        <th className="text-center p-2">Week 2</th>
                        <th className="text-center p-2">Week 4</th>
                        <th className="text-center p-2">Week 8</th>
                        <th className="text-center p-2">Week 12</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cohorts.retentionCohorts.map((cohort, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2 font-medium">{cohort.period}</td>
                          <td className="text-center p-2">{cohort.users}</td>
                          {cohort.retention.map((rate, rIndex) => (
                            <td key={rIndex} className="text-center p-2">
                              <Badge
                                variant={rate > 50 ? 'default' : rate > 25 ? 'secondary' : 'outline'}
                              >
                                {rate}%
                              </Badge>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cohort Engagement Trends</CardTitle>
                <CardDescription>How engagement changes over user lifecycle</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={cohorts.engagementTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {cohorts.engagementTrends.length > 0 && Object.keys(cohorts.engagementTrends[0]).filter(key => key !== 'week').map((cohort, index) => (
                      <Line
                        key={cohort}
                        type="monotone"
                        dataKey={cohort}
                        stroke={`hsl(${(index * 60) % 360}, 70%, 50%)`}
                        strokeWidth={2}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Feature Usage Distribution</CardTitle>
                <CardDescription>Most and least used features</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={features.usageDistribution} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="feature" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="usage" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Feature Adoption Timeline</CardTitle>
                <CardDescription>When users first discover features</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={features.adoptionTimeline}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="newUsers"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Feature Performance Metrics</CardTitle>
                <CardDescription>Detailed analytics for each feature</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {features.performanceMetrics.map((metric, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{metric.feature}</h4>
                        <p className="text-sm text-muted-foreground">{metric.category}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{metric.usageCount.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">Total Uses</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{metric.adoptionRate}%</p>
                        <p className="text-sm text-muted-foreground">Adoption</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{metric.satisfactionScore}</p>
                        <p className="text-sm text-muted-foreground">Satisfaction</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminEngagementAnalytics;