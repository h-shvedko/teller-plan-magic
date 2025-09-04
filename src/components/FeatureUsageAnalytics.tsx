import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
import { Input } from './ui/input';
import { Activity, TrendingUp, TrendingDown, Users, Target, Clock, Star, MousePointer, Eye, Zap } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, Treemap, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AdminBusinessIntelligenceService, FeatureUsageAnalytics as FeatureData } from '../lib/adminBusinessIntelligence';

const FeatureUsageAnalytics: React.FC = () => {
  const [featureData, setFeatureData] = useState<FeatureData | null>(null);
  const [selectedFeature, setSelectedFeature] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('30');
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const service = new AdminBusinessIntelligenceService();

  useEffect(() => {
    loadFeatureData();
  }, [selectedFeature, selectedTimeframe, selectedSegment]);

  const loadFeatureData = async () => {
    setIsLoading(true);
    try {
      const data = await service.getFeatureUsageAnalytics(selectedTimeframe, selectedSegment);
      setFeatureData(data);
    } catch (error) {
      console.error('Failed to load feature usage data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading feature analytics...</p>
        </div>
      </div>
    );
  }

  if (!featureData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <Activity className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Feature Data Available</h3>
            <p className="text-muted-foreground">Unable to load feature usage analytics at this time.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { overview, features, adoption, engagement, performance, cohorts } = featureData;

  const getUsageColor = (usage: number) => {
    if (usage > 80) return '#10b981';
    if (usage > 60) return '#3b82f6';
    if (usage > 40) return '#f59e0b';
    if (usage > 20) return '#f97316';
    return '#ef4444';
  };

  const getFeatureIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'core': return <Star className="h-4 w-4" />;
      case 'engagement': return <Activity className="h-4 w-4" />;
      case 'conversion': return <Target className="h-4 w-4" />;
      case 'retention': return <Users className="h-4 w-4" />;
      default: return <MousePointer className="h-4 w-4" />;
    }
  };

  const filteredFeatures = features.filter(feature =>
    feature.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Feature Usage Analytics</h1>
          <p className="text-muted-foreground">Track feature adoption, engagement, and performance</p>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Search features..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-40"
          />
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedSegment} onValueChange={setSelectedSegment}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="new">New Users</SelectItem>
              <SelectItem value="active">Active Users</SelectItem>
              <SelectItem value="premium">Premium Users</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Features</p>
                <p className="text-2xl font-bold">{overview.totalFeatures}</p>
              </div>
              <Activity className="h-8 w-8 text-primary" />
            </div>
            <div className="mt-2">
              <Badge variant="outline">
                {overview.activeFeatures} active
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Adoption Rate</p>
                <p className="text-2xl font-bold">{overview.averageAdoptionRate.toFixed(1)}%</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
            <div className="flex items-center mt-2">
              {overview.adoptionTrend > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm ${overview.adoptionTrend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {Math.abs(overview.adoptionTrend)}% vs last period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Most Used Feature</p>
                <p className="text-lg font-bold">{overview.mostUsedFeature}</p>
              </div>
              <Star className="h-8 w-8 text-primary" />
            </div>
            <div className="mt-2">
              <Progress value={overview.mostUsedFeatureUsage} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {overview.mostUsedFeatureUsage.toFixed(1)}% adoption
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Feature Stickiness</p>
                <p className="text-2xl font-bold">{overview.averageStickiness.toFixed(1)}</p>
              </div>
              <Target className="h-8 w-8 text-primary" />
            </div>
            <div className="mt-2">
              <Badge variant={overview.averageStickiness > 0.3 ? 'default' : 'secondary'}>
                {overview.averageStickiness > 0.3 ? 'Sticky' : 'Needs Work'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="adoption">Adoption</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="funnel">User Funnel</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Feature Usage Heatmap</CardTitle>
                <CardDescription>Visual representation of feature usage intensity</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <Treemap
                    data={features.map(f => ({
                      name: f.name,
                      size: f.usageCount,
                      fill: getUsageColor(f.adoptionRate)
                    }))}
                    dataKey="size"
                    aspectRatio={4/3}
                    stroke="#fff"
                    fill="#8884d8"
                  />
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Feature Categories</CardTitle>
                <CardDescription>Usage distribution by feature category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Core', value: 35, color: '#3b82f6' },
                        { name: 'Engagement', value: 25, color: '#10b981' },
                        { name: 'Conversion', value: 20, color: '#f59e0b' },
                        { name: 'Retention', value: 15, color: '#8b5cf6' },
                        { name: 'Other', value: 5, color: '#6b7280' }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[
                        { name: 'Core', value: 35, color: '#3b82f6' },
                        { name: 'Engagement', value: 25, color: '#10b981' },
                        { name: 'Conversion', value: 20, color: '#f59e0b' },
                        { name: 'Retention', value: 15, color: '#8b5cf6' },
                        { name: 'Other', value: 5, color: '#6b7280' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Feature Performance Matrix</CardTitle>
                <CardDescription>All features ranked by adoption rate and usage frequency</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredFeatures.map((feature, index) => (
                    <div key={feature.name} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                          {getFeatureIcon(feature.category)}
                        </div>
                        <div>
                          <h4 className="font-medium">{feature.name}</h4>
                          <p className="text-sm text-muted-foreground">{feature.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Adoption Rate</p>
                          <Progress value={feature.adoptionRate} className="w-20 h-2" />
                          <p className="text-xs">{feature.adoptionRate.toFixed(1)}%</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Usage Count</p>
                          <p className="text-sm font-medium">{feature.usageCount.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Stickiness</p>
                          <Badge variant={feature.stickiness > 0.3 ? 'default' : 'outline'}>
                            {feature.stickiness.toFixed(2)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="adoption" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Adoption Rate Trends</CardTitle>
                <CardDescription>Feature adoption over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={adoption.trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="overallAdoption" stroke="#3b82f6" strokeWidth={2} name="Overall" />
                    <Line type="monotone" dataKey="newFeatureAdoption" stroke="#10b981" strokeWidth={2} name="New Features" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Time to Adoption</CardTitle>
                <CardDescription>How long users take to discover features</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={adoption.timeToAdoption}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="feature" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} days`, 'Time to Adopt']} />
                    <Bar dataKey="avgDays" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Adoption by User Segment</CardTitle>
                <CardDescription>Feature adoption rates across different user types</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={adoption.bySegment}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="segment" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => [`${value}%`, 'Adoption Rate']} />
                    <Legend />
                    <Bar dataKey="adoptionRate" fill="#3b82f6" name="Adoption Rate" />
                    <Bar dataKey="averageTimeToAdopt" fill="#10b981" name="Avg Time (days)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Feature Discovery Methods</CardTitle>
                <CardDescription>How users find and adopt new features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {adoption.discoveryMethods.map((method, index) => (
                    <div key={method.method} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{method.method}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress value={method.percentage} className="w-20 h-2" />
                        <span className="text-sm text-muted-foreground">{method.percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Active Feature Usage</CardTitle>
                <CardDescription>Feature usage patterns throughout the day</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={engagement.dailyPatterns}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="usage" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Feature Engagement Depth</CardTitle>
                <CardDescription>How deeply users engage with features</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={engagement.depth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="feature" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="shallow" stackId="1" stroke="#ef4444" fill="#ef4444" name="Shallow" />
                    <Area type="monotone" dataKey="medium" stackId="1" stroke="#f97316" fill="#f97316" name="Medium" />
                    <Area type="monotone" dataKey="deep" stackId="1" stroke="#10b981" fill="#10b981" name="Deep" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Feature Retention</CardTitle>
                <CardDescription>User retention rates by feature after first use</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {engagement.retention.map((feature) => (
                    <div key={feature.feature} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{feature.feature}</span>
                        <span className="text-sm text-muted-foreground">
                          Day 1: {feature.day1}% | Day 7: {feature.day7}% | Day 30: {feature.day30}%
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <Progress value={feature.day1} className="h-1" />
                        <Progress value={feature.day7} className="h-1" />
                        <Progress value={feature.day30} className="h-1" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Feature Satisfaction Scores</CardTitle>
                <CardDescription>User satisfaction ratings for each feature</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={engagement.satisfaction} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 5]} />
                    <YAxis dataKey="feature" type="category" width={100} />
                    <Tooltip formatter={(value) => [`${value}/5`, 'Satisfaction Score']} />
                    <Bar dataKey="score" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Feature Performance Score</CardTitle>
                <CardDescription>Composite score based on adoption, usage, and satisfaction</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performance.scores}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="feature" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="score" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Feature Impact on Business Metrics</CardTitle>
                <CardDescription>Correlation between feature usage and key metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {performance.businessImpact.map((impact, index) => (
                    <div key={impact.feature} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{impact.feature}</h4>
                        <p className="text-sm text-muted-foreground">
                          Primary Impact: {impact.primaryMetric}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {impact.impact > 0 ? '+' : ''}{impact.impact.toFixed(1)}%
                        </p>
                        <Badge variant={impact.impact > 0 ? 'default' : 'destructive'}>
                          {impact.impact > 0 ? 'Positive' : 'Negative'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Feature ROI Analysis</CardTitle>
                <CardDescription>Return on investment for feature development</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performance.roi}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="feature" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}x`, 'ROI Multiplier']} />
                    <Area type="monotone" dataKey="roi" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Feature Development Priorities</CardTitle>
                <CardDescription>Recommended focus areas based on performance data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { feature: 'Recipe Scaling', priority: 'High', reason: 'High demand, low adoption', action: 'Improve discoverability' },
                    { feature: 'Meal Planning', priority: 'High', reason: 'High usage, poor retention', action: 'Enhance UX' },
                    { feature: 'Social Sharing', priority: 'Medium', reason: 'Good ROI potential', action: 'Feature expansion' },
                    { feature: 'Shopping Lists', priority: 'Medium', reason: 'Stable performance', action: 'Incremental improvements' },
                    { feature: 'Recipe Reviews', priority: 'Low', reason: 'Limited impact', action: 'Maintain current state' }
                  ].map((item, index) => (
                    <div key={item.feature} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{item.feature}</h4>
                        <p className="text-sm text-muted-foreground">{item.reason}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={
                          item.priority === 'High' ? 'destructive' :
                          item.priority === 'Medium' ? 'secondary' : 'outline'
                        }>
                          {item.priority}
                        </Badge>
                        <Button size="sm" variant="outline">
                          {item.action}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="funnel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Discovery Funnel</CardTitle>
              <CardDescription>User journey from feature discovery to regular usage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  { stage: 'Feature Seen', users: 10000, percentage: 100, color: '#3b82f6' },
                  { stage: 'Feature Clicked', users: 6500, percentage: 65, color: '#10b981' },
                  { stage: 'Feature Used', users: 4200, percentage: 42, color: '#f59e0b' },
                  { stage: 'Used Again (Day 7)', users: 2100, percentage: 21, color: '#f97316' },
                  { stage: 'Regular User (Day 30)', users: 1250, percentage: 12.5, color: '#ef4444' }
                ].map((stage, index) => (
                  <div key={stage.stage} className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{stage.stage}</h4>
                      <div className="text-right">
                        <span className="text-2xl font-bold">{stage.users.toLocaleString()}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          ({stage.percentage}%)
                        </span>
                      </div>
                    </div>
                    <div 
                      className="h-12 rounded flex items-center justify-center text-white font-medium"
                      style={{ 
                        backgroundColor: stage.color,
                        width: `${stage.percentage}%`,
                        minWidth: '120px'
                      }}
                    >
                      {stage.percentage}%
                    </div>
                    {index < 4 && (
                      <div className="absolute right-0 top-16 text-sm text-muted-foreground">
                        Drop-off: {(100 - ([6500, 4200, 2100, 1250][index] / [10000, 6500, 4200, 2100][index]) * 100).toFixed(1)}%
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Funnel Performance by Feature</CardTitle>
                <CardDescription>Conversion rates at each funnel stage</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={[
                    { feature: 'Recipe Search', seen: 100, clicked: 75, used: 60, retained: 45 },
                    { feature: 'Meal Planning', seen: 100, clicked: 68, used: 42, retained: 28 },
                    { feature: 'Shopping List', seen: 100, clicked: 72, used: 55, retained: 38 },
                    { feature: 'Recipe Scaling', seen: 100, clicked: 45, used: 35, retained: 25 },
                    { feature: 'Social Sharing', seen: 100, clicked: 38, used: 25, retained: 15 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="feature" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="clicked" stroke="#3b82f6" name="Click Rate %" />
                    <Line type="monotone" dataKey="used" stroke="#10b981" name="Usage Rate %" />
                    <Line type="monotone" dataKey="retained" stroke="#f59e0b" name="Retention Rate %" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conversion Optimization Opportunities</CardTitle>
                <CardDescription>Features with the biggest improvement potential</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { feature: 'Recipe Scaling', stage: 'Discovery', improvement: '32% potential lift', priority: 'High' },
                    { feature: 'Social Sharing', stage: 'First Use', improvement: '28% potential lift', priority: 'High' },
                    { feature: 'Meal Planning', stage: 'Retention', improvement: '25% potential lift', priority: 'Medium' },
                    { feature: 'Shopping List', stage: 'Engagement', improvement: '18% potential lift', priority: 'Medium' },
                    { feature: 'Recipe Search', stage: 'Optimization', improvement: '12% potential lift', priority: 'Low' }
                  ].map((opp, index) => (
                    <div key={opp.feature} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{opp.feature}</h4>
                        <p className="text-sm text-muted-foreground">Focus on: {opp.stage}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-green-600">{opp.improvement}</span>
                        <Badge variant={
                          opp.priority === 'High' ? 'destructive' :
                          opp.priority === 'Medium' ? 'secondary' : 'outline'
                        }>
                          {opp.priority}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Key Insights</CardTitle>
                <CardDescription>AI-generated insights from feature usage data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      type: 'opportunity',
                      title: 'Recipe Scaling Underutilized',
                      description: 'Despite high user interest (78% click rate), only 35% actually use the recipe scaling feature. This suggests a UX issue.',
                      action: 'Simplify the scaling interface and add onboarding tooltip',
                      impact: 'Could increase usage by 40%'
                    },
                    {
                      type: 'warning',
                      title: 'Social Features Low Adoption',
                      description: 'Social sharing and community features have <20% adoption rate, much lower than industry benchmarks.',
                      action: 'Redesign social features with better integration into core workflows',
                      impact: 'Potential 60% increase in engagement'
                    },
                    {
                      type: 'success',
                      title: 'Meal Planning Shows Strong Stickiness',
                      description: 'Users who adopt meal planning have 2.3x higher retention rates and use the app 40% more frequently.',
                      action: 'Promote meal planning more prominently in onboarding',
                      impact: 'Could improve overall retention by 25%'
                    }
                  ].map((insight, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          insight.type === 'opportunity' ? 'bg-blue-500' :
                          insight.type === 'warning' ? 'bg-orange-500' : 'bg-green-500'
                        }`}></div>
                        <div className="flex-1">
                          <h4 className="font-medium mb-1">{insight.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                          <div className="space-y-1">
                            <p className="text-sm"><strong>Recommended Action:</strong> {insight.action}</p>
                            <p className="text-sm text-green-600"><strong>Expected Impact:</strong> {insight.impact}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Feature Usage Correlations</CardTitle>
                <CardDescription>Features that are commonly used together</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { features: ['Meal Planning', 'Shopping Lists'], correlation: 0.87, users: '2.3k users' },
                    { features: ['Recipe Search', 'Recipe Scaling'], correlation: 0.72, users: '1.8k users' },
                    { features: ['Recipe Reviews', 'Social Sharing'], correlation: 0.68, users: '945 users' },
                    { features: ['Meal Planning', 'Recipe Collections'], correlation: 0.64, users: '1.2k users' },
                    { features: ['Shopping Lists', 'Price Comparison'], correlation: 0.58, users: '856 users' }
                  ].map((corr, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{corr.features.join(' + ')}</h4>
                        <p className="text-sm text-muted-foreground">{corr.users} use both features</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">Correlation: {corr.correlation}</p>
                        <Progress value={corr.correlation * 100} className="w-20 h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Recommended Actions</CardTitle>
                <CardDescription>Prioritized action items based on feature analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      priority: 'Critical',
                      action: 'Fix Recipe Scaling UX Issues',
                      timeline: '1 week',
                      effort: 'Medium',
                      impact: 'High',
                      description: 'Address the 50% drop-off between feature interest and actual usage'
                    },
                    {
                      priority: 'High',
                      action: 'Redesign Social Feature Integration',
                      timeline: '3 weeks',
                      effort: 'High',
                      impact: 'High',
                      description: 'Integrate social features more naturally into core user workflows'
                    },
                    {
                      priority: 'High',
                      action: 'Promote Meal Planning in Onboarding',
                      timeline: '1 week',
                      effort: 'Low',
                      impact: 'Medium',
                      description: 'Leverage meal planning\'s high retention impact by promoting it earlier'
                    },
                    {
                      priority: 'Medium',
                      action: 'Create Feature Bundling Strategy',
                      timeline: '2 weeks',
                      effort: 'Medium',
                      impact: 'Medium',
                      description: 'Package highly correlated features together to increase adoption'
                    },
                    {
                      priority: 'Medium',
                      action: 'Implement Feature Discovery Improvements',
                      timeline: '4 weeks',
                      effort: 'High',
                      impact: 'Medium',
                      description: 'Add contextual feature suggestions and improved navigation'
                    }
                  ].map((action, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={action.priority === 'Critical' ? 'destructive' : action.priority === 'High' ? 'secondary' : 'outline'}>
                            {action.priority}
                          </Badge>
                          <Badge variant="outline">{action.timeline}</Badge>
                          <Badge variant="outline">Effort: {action.effort}</Badge>
                          <Badge variant="outline">Impact: {action.impact}</Badge>
                        </div>
                        <h4 className="font-medium mb-1">{action.action}</h4>
                        <p className="text-sm text-muted-foreground">{action.description}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Plan Action
                      </Button>
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

export default FeatureUsageAnalytics;