import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback } from './ui/avatar';
import { UserCheck, Users, TrendingUp, Clock, Target, AlertTriangle, Star, Calendar } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, FunnelChart, Funnel, LabelList } from 'recharts';
import { AdminBusinessIntelligenceService, CustomerLifecycleAnalysis as LifecycleData } from '../lib/adminBusinessIntelligence';

const CustomerLifecycleAnalysis: React.FC = () => {
  const [lifecycleData, setLifecycleData] = useState<LifecycleData | null>(null);
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('90');
  const [isLoading, setIsLoading] = useState(true);

  const service = new AdminBusinessIntelligenceService();

  useEffect(() => {
    loadLifecycleData();
  }, [selectedSegment, selectedTimeframe]);

  const loadLifecycleData = async () => {
    setIsLoading(true);
    try {
      const data = await service.getCustomerLifecycleAnalysis(selectedSegment, selectedTimeframe);
      setLifecycleData(data);
    } catch (error) {
      console.error('Failed to load lifecycle analysis:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading lifecycle analysis...</p>
        </div>
      </div>
    );
  }

  if (!lifecycleData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Lifecycle Data Available</h3>
            <p className="text-muted-foreground">Unable to load customer lifecycle analysis at this time.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { stages, segments, journeyAnalysis, conversionRates, timeInStage } = lifecycleData;

  const getStageColor = (stage: string) => {
    const colors = {
      'visitor': '#94a3b8',
      'trial': '#3b82f6',
      'active': '#10b981',
      'paying': '#8b5cf6',
      'champion': '#f59e0b',
      'churned': '#ef4444'
    };
    return colors[stage as keyof typeof colors] || '#6b7280';
  };

  const getSegmentIcon = (segment: string) => {
    switch (segment.toLowerCase()) {
      case 'new_users': return <UserCheck className="h-4 w-4" />;
      case 'engaged_users': return <Star className="h-4 w-4" />;
      case 'premium_users': return <Target className="h-4 w-4" />;
      case 'at_risk_users': return <AlertTriangle className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Customer Lifecycle Analysis</h1>
          <p className="text-muted-foreground">Track user progression through lifecycle stages</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="180">Last 6 months</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedSegment} onValueChange={setSelectedSegment}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="new_users">New Users</SelectItem>
              <SelectItem value="engaged_users">Engaged Users</SelectItem>
              <SelectItem value="premium_users">Premium Users</SelectItem>
              <SelectItem value="at_risk_users">At Risk Users</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Lifecycle Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stages.map((stage, index) => (
          <Card key={stage.name}>
            <CardContent className="p-4">
              <div className="text-center">
                <div 
                  className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: getStageColor(stage.name.toLowerCase()) }}
                >
                  {index + 1}
                </div>
                <h3 className="font-medium text-sm mb-1">{stage.name}</h3>
                <p className="text-2xl font-bold mb-1">{stage.userCount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{stage.percentage.toFixed(1)}% of total</p>
                <div className="mt-2">
                  <Progress value={stage.percentage} className="h-1" />
                </div>
                {stage.avgTimeInStage && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Avg: {Math.round(stage.avgTimeInStage)} days
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Analytics */}
      <Tabs defaultValue="funnel" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="funnel">Conversion Funnel</TabsTrigger>
          <TabsTrigger value="segments">User Segments</TabsTrigger>
          <TabsTrigger value="journey">Customer Journey</TabsTrigger>
          <TabsTrigger value="trends">Stage Trends</TabsTrigger>
          <TabsTrigger value="cohorts">Cohort Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="funnel" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
                <CardDescription>User progression through lifecycle stages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {conversionRates.map((rate, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{rate.fromStage} → {rate.toStage}</span>
                        <span className="text-sm text-muted-foreground">{rate.rate.toFixed(1)}%</span>
                      </div>
                      <Progress value={rate.rate} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{rate.totalUsers.toLocaleString()} users</span>
                        <span>{rate.convertedUsers.toLocaleString()} converted</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Time in Each Stage</CardTitle>
                <CardDescription>Average duration users spend in lifecycle stages</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={timeInStage}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="stage" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} days`, 'Average Time']} />
                    <Bar 
                      dataKey="avgDays" 
                      fill="hsl(var(--primary))"
                      name="Average Days"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Conversion Bottlenecks</CardTitle>
                <CardDescription>Identify where users are dropping off in the funnel</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {conversionRates
                    .sort((a, b) => a.rate - b.rate)
                    .slice(0, 3)
                    .map((rate, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-medium">{rate.fromStage} → {rate.toStage}</h4>
                            <p className="text-sm text-muted-foreground">
                              Only {rate.rate.toFixed(1)}% conversion rate
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            {(rate.totalUsers - rate.convertedUsers).toLocaleString()} users lost
                          </p>
                          <Badge variant="destructive">Critical</Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="segments" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Segment Distribution</CardTitle>
                <CardDescription>Breakdown of users by segment</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={segments}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} ${percentage.toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="userCount"
                    >
                      {segments.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getStageColor(entry.segment.toLowerCase())} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Segment Performance</CardTitle>
                <CardDescription>Key metrics by user segment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {segments.map((segment, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                          {getSegmentIcon(segment.segment)}
                        </div>
                        <div>
                          <h4 className="font-medium">{segment.segment.replace('_', ' ').toUpperCase()}</h4>
                          <p className="text-sm text-muted-foreground">
                            {segment.userCount.toLocaleString()} users ({segment.percentage.toFixed(1)}%)
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          Avg LTV: ${segment.avgLifetimeValue?.toFixed(0) || 0}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Engagement: {segment.avgEngagementScore?.toFixed(1) || 0}/10
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Segment Journey Comparison</CardTitle>
              <CardDescription>How different segments progress through stages</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={journeyAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="stage" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {segments.map((segment, index) => (
                    <Area
                      key={segment.segment}
                      type="monotone"
                      dataKey={segment.segment}
                      stackId="1"
                      stroke={getStageColor(segment.segment.toLowerCase())}
                      fill={getStageColor(segment.segment.toLowerCase())}
                      fillOpacity={0.6}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="journey" className="space-y-4">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Journey Paths</CardTitle>
                <CardDescription>Most common paths users take through the lifecycle</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {journeyAnalysis.slice(0, 5).map((journey, index) => (
                    <div key={index} className="relative">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Journey Path #{index + 1}</h4>
                        <Badge variant="outline">{journey.userCount} users</Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        {journey.path?.map((stage, stageIndex) => (
                          <React.Fragment key={stageIndex}>
                            <div className="flex flex-col items-center">
                              <div 
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                                style={{ backgroundColor: getStageColor(stage.toLowerCase()) }}
                              >
                                {stageIndex + 1}
                              </div>
                              <span className="text-xs mt-1 text-center">{stage}</span>
                            </div>
                            {stageIndex < journey.path!.length - 1 && (
                              <div className="flex-1 h-px bg-gray-300 mx-2"></div>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                      <div className="mt-2 text-sm text-muted-foreground">
                        Average completion time: {journey.avgCompletionTime} days
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Stage Transition Heatmap</CardTitle>
                  <CardDescription>Visual representation of user flow</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-6 gap-1">
                    {stages.map((fromStage, fromIndex) => (
                      stages.map((toStage, toIndex) => {
                        const transitionRate = conversionRates.find(
                          rate => rate.fromStage === fromStage.name && rate.toStage === toStage.name
                        )?.rate || 0;
                        
                        return (
                          <div
                            key={`${fromIndex}-${toIndex}`}
                            className={`w-8 h-8 rounded-sm flex items-center justify-center text-xs text-white font-bold ${
                              transitionRate > 50 ? 'bg-green-500' :
                              transitionRate > 25 ? 'bg-yellow-500' :
                              transitionRate > 10 ? 'bg-orange-500' :
                              transitionRate > 0 ? 'bg-red-500' : 'bg-gray-300'
                            }`}
                            title={`${fromStage.name} → ${toStage.name}: ${transitionRate.toFixed(1)}%`}
                          >
                            {transitionRate > 0 ? transitionRate.toFixed(0) : ''}
                          </div>
                        );
                      })
                    ))}
                  </div>
                  <div className="mt-4 flex justify-between text-xs text-muted-foreground">
                    <span>Low conversion</span>
                    <span>High conversion</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Journey Velocity</CardTitle>
                  <CardDescription>How quickly users progress through stages</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={timeInStage}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="stage" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} days`, 'Average Time']} />
                      <Line 
                        type="monotone" 
                        dataKey="avgDays" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Stage Population Trends</CardTitle>
                <CardDescription>User count changes over time by stage</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={journeyAnalysis}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {stages.slice(0, 4).map((stage, index) => (
                      <Line
                        key={stage.name}
                        type="monotone"
                        dataKey={stage.name.toLowerCase()}
                        stroke={getStageColor(stage.name.toLowerCase())}
                        strokeWidth={2}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conversion Rate Trends</CardTitle>
                <CardDescription>Stage-to-stage conversion rates over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={conversionRates.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="fromStage" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => [`${value}%`, 'Conversion Rate']} />
                    <Line 
                      type="monotone" 
                      dataKey="rate" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Stage Health Indicators</CardTitle>
              <CardDescription>Key performance indicators for each lifecycle stage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stages.map((stage, index) => (
                  <div key={stage.name} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{stage.name}</h4>
                      <Badge variant={
                        stage.healthScore && stage.healthScore > 80 ? 'default' :
                        stage.healthScore && stage.healthScore > 60 ? 'secondary' : 'destructive'
                      }>
                        {stage.healthScore ? `${stage.healthScore}%` : 'N/A'}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Users:</span>
                        <span>{stage.userCount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Growth:</span>
                        <span className={stage.growthRate && stage.growthRate > 0 ? 'text-green-600' : 'text-red-600'}>
                          {stage.growthRate ? (stage.growthRate > 0 ? '+' : '') + stage.growthRate.toFixed(1) + '%' : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Avg Time:</span>
                        <span>{stage.avgTimeInStage ? Math.round(stage.avgTimeInStage) + ' days' : 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cohorts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cohort Lifecycle Progression</CardTitle>
              <CardDescription>How user cohorts progress through lifecycle stages over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Cohort</th>
                      <th className="text-center p-2">Size</th>
                      <th className="text-center p-2">Visitor</th>
                      <th className="text-center p-2">Trial</th>
                      <th className="text-center p-2">Active</th>
                      <th className="text-center p-2">Paying</th>
                      <th className="text-center p-2">Champion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {['Jan 2024', 'Feb 2024', 'Mar 2024', 'Apr 2024', 'May 2024', 'Jun 2024'].map((cohort, index) => (
                      <tr key={cohort} className="border-b">
                        <td className="p-2 font-medium">{cohort}</td>
                        <td className="text-center p-2">{(1000 - index * 50).toLocaleString()}</td>
                        <td className="text-center p-2">
                          <Badge variant="outline">100%</Badge>
                        </td>
                        <td className="text-center p-2">
                          <Badge variant={75 - index * 5 > 60 ? 'default' : 'secondary'}>
                            {75 - index * 5}%
                          </Badge>
                        </td>
                        <td className="text-center p-2">
                          <Badge variant={45 - index * 3 > 30 ? 'default' : 'secondary'}>
                            {45 - index * 3}%
                          </Badge>
                        </td>
                        <td className="text-center p-2">
                          <Badge variant={25 - index * 2 > 15 ? 'default' : 'secondary'}>
                            {25 - index * 2}%
                          </Badge>
                        </td>
                        <td className="text-center p-2">
                          <Badge variant={10 - index > 5 ? 'default' : 'secondary'}>
                            {Math.max(10 - index, 2)}%
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Cohort Progression Speed</CardTitle>
                <CardDescription>Average time to reach each stage by cohort</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { cohort: 'Jan 2024', trial: 7, active: 14, paying: 30, champion: 90 },
                    { cohort: 'Feb 2024', trial: 6, active: 12, paying: 28, champion: 85 },
                    { cohort: 'Mar 2024', trial: 5, active: 11, paying: 25, champion: 80 },
                    { cohort: 'Apr 2024', trial: 5, active: 10, paying: 23, champion: 75 },
                    { cohort: 'May 2024', trial: 4, active: 9, paying: 22, champion: 70 },
                    { cohort: 'Jun 2024', trial: 4, active: 8, paying: 20, champion: 65 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="cohort" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} days`, 'Time to Stage']} />
                    <Legend />
                    <Bar dataKey="trial" stackId="a" fill="#3b82f6" name="To Trial" />
                    <Bar dataKey="active" stackId="a" fill="#10b981" name="To Active" />
                    <Bar dataKey="paying" stackId="a" fill="#8b5cf6" name="To Paying" />
                    <Bar dataKey="champion" stackId="a" fill="#f59e0b" name="To Champion" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cohort Value Evolution</CardTitle>
                <CardDescription>Lifetime value progression by cohort</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={[
                    { month: 'Month 1', jan: 25, feb: 30, mar: 35, apr: 40 },
                    { month: 'Month 2', jan: 45, feb: 55, mar: 65, apr: 75 },
                    { month: 'Month 3', jan: 85, feb: 95, mar: 105, apr: 115 },
                    { month: 'Month 4', jan: 125, feb: 140, mar: 155, apr: 170 },
                    { month: 'Month 5', jan: 165, feb: 185, mar: 205, apr: 225 },
                    { month: 'Month 6', jan: 205, feb: 230, mar: 255, apr: 280 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'LTV']} />
                    <Legend />
                    <Line type="monotone" dataKey="jan" stroke="#ef4444" name="Jan 2024" />
                    <Line type="monotone" dataKey="feb" stroke="#f97316" name="Feb 2024" />
                    <Line type="monotone" dataKey="mar" stroke="#84cc16" name="Mar 2024" />
                    <Line type="monotone" dataKey="apr" stroke="#06b6d4" name="Apr 2024" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerLifecycleAnalysis;