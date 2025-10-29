import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback } from './ui/avatar';
import { AlertTriangle, TrendingDown, Users, Target, Shield, Mail, Phone, MessageSquare, Clock } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AdminBusinessIntelligenceService, ChurnPredictionModel } from '../lib/adminBusinessIntelligence';

const ChurnPredictionDashboard: React.FC = () => {
  const [churnData, setChurnData] = useState<ChurnPredictionModel | null>(null);
  const [selectedRiskLevel, setSelectedRiskLevel] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('30');
  const [isLoading, setIsLoading] = useState(true);

  const service = new AdminBusinessIntelligenceService();

  useEffect(() => {
    loadChurnData();
  }, [selectedRiskLevel, selectedTimeframe]);

  const loadChurnData = async () => {
    setIsLoading(true);
    try {
      const data = await service.getChurnPredictionModel();
      setChurnData(data);
    } catch (error) {
      console.error('Failed to load churn prediction data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading churn prediction data...</p>
        </div>
      </div>
    );
  }

  if (!churnData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Churn Data Available</h3>
            <p className="text-muted-foreground">Unable to load churn prediction data at this time.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { overview, riskSegments, features, predictions, interventions } = churnData;

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <TrendingDown className="h-4 w-4" />;
      case 'low': return <Shield className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getInterventionIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'in_app': return <MessageSquare className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Churn Prediction & Prevention</h1>
          <p className="text-muted-foreground">Identify at-risk users and prevent churn</p>
        </div>
        <div className="flex gap-2">
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
          <Select value={selectedRiskLevel} onValueChange={setSelectedRiskLevel}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risk Levels</SelectItem>
              <SelectItem value="high">High Risk</SelectItem>
              <SelectItem value="medium">Medium Risk</SelectItem>
              <SelectItem value="low">Low Risk</SelectItem>
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
                <p className="text-sm text-muted-foreground">Predicted Churn Rate</p>
                <p className="text-2xl font-bold text-red-600">{overview.predictedChurnRate.toFixed(1)}%</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
            <div className="mt-2">
              <Progress value={overview.predictedChurnRate} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {overview.predictedChurnRate > overview.historicalChurnRate ? 'Above' : 'Below'} historical average
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">At-Risk Users</p>
                <p className="text-2xl font-bold text-orange-600">{overview.atRiskUsers.toLocaleString()}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-2">
              <Badge variant="secondary">
                {Math.round((overview.atRiskUsers / overview.totalUsers) * 100)}% of user base
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Model Accuracy</p>
                <p className="text-2xl font-bold text-green-600">{(overview.modelAccuracy * 100).toFixed(1)}%</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2">
              <Badge variant="default">High Confidence</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Interventions Active</p>
                <p className="text-2xl font-bold">{overview.activeInterventions}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-muted-foreground">
                Preventing {Math.round(overview.preventedChurn)} churns
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="risk-analysis" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="risk-analysis">Risk Analysis</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="features">Feature Importance</TabsTrigger>
          <TabsTrigger value="interventions">Interventions</TabsTrigger>
          <TabsTrigger value="prevention">Prevention</TabsTrigger>
        </TabsList>

        <TabsContent value="risk-analysis" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Risk Distribution</CardTitle>
                <CardDescription>User distribution across risk levels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {riskSegments.map((segment) => (
                    <div key={segment.riskLevel} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          {getRiskIcon(segment.riskLevel)}
                          <span className="font-medium">{segment.riskLevel.toUpperCase()} Risk</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{segment.userCount.toLocaleString()} users</p>
                          <p className="text-xs text-muted-foreground">{segment.percentage.toFixed(1)}%</p>
                        </div>
                      </div>
                      <Progress value={segment.percentage} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Avg Score: {segment.averageScore.toFixed(1)}</span>
                        <span>Est. Churn: {segment.expectedChurnRate.toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Score Distribution</CardTitle>
                <CardDescription>Distribution of churn risk scores</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={riskSegments}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="riskLevel" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="userCount" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>High-Risk Users</CardTitle>
                <CardDescription>Users with highest churn probability requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {predictions.slice(0, 10).map((prediction, index) => (
                    <div key={prediction.userId} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{prediction.userId.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">User {prediction.userId}</h4>
                          <p className="text-sm text-muted-foreground">
                            Last active: {prediction.lastActivity} days ago
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">Risk Score</p>
                          <p className="text-2xl font-bold text-red-600">
                            {(prediction.churnProbability * 100).toFixed(0)}%
                          </p>
                        </div>
                        <div className="flex flex-col gap-1">
                          {prediction.suggestedActions.slice(0, 2).map((action, actionIndex) => (
                            <Badge key={actionIndex} variant="outline" className="text-xs">
                              {action}
                            </Badge>
                          ))}
                        </div>
                        <Button size="sm" variant="outline">
                          Take Action
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Churn Probability Over Time</CardTitle>
                <CardDescription>Predicted churn rates for the next 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={[
                    { day: 1, churnRate: 2.1, confidence: 85 },
                    { day: 7, churnRate: 2.3, confidence: 82 },
                    { day: 14, churnRate: 2.8, confidence: 78 },
                    { day: 21, churnRate: 3.2, confidence: 74 },
                    { day: 30, churnRate: 3.7, confidence: 70 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="churnRate"
                      stroke="#ef4444"
                      strokeWidth={2}
                      name="Churn Rate %"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="confidence"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Confidence %"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Score vs Activity</CardTitle>
                <CardDescription>Correlation between user activity and churn risk</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart data={predictions.slice(0, 50)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="lastActivity" />
                    <YAxis dataKey="churnProbability" />
                    <Tooltip
                      formatter={(value, name) => [
                        name === 'churnProbability' ? `${(value as number * 100).toFixed(1)}%` : value,
                        name === 'churnProbability' ? 'Churn Risk' : 'Days Since Activity'
                      ]}
                    />
                    <Scatter dataKey="churnProbability" fill="hsl(var(--primary))" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Cohort Churn Analysis</CardTitle>
                <CardDescription>Churn predictions by user cohort and signup period</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={[
                    { cohort: 'Jan 2024', highRisk: 15, mediumRisk: 25, lowRisk: 60 },
                    { cohort: 'Feb 2024', highRisk: 12, mediumRisk: 28, lowRisk: 60 },
                    { cohort: 'Mar 2024', highRisk: 18, mediumRisk: 22, lowRisk: 60 },
                    { cohort: 'Apr 2024', highRisk: 14, mediumRisk: 26, lowRisk: 60 },
                    { cohort: 'May 2024', highRisk: 10, mediumRisk: 30, lowRisk: 60 },
                    { cohort: 'Jun 2024', highRisk: 8, mediumRisk: 32, lowRisk: 60 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="cohort" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="highRisk"
                      stackId="1"
                      stroke="#ef4444"
                      fill="#ef4444"
                      name="High Risk"
                    />
                    <Area
                      type="monotone"
                      dataKey="mediumRisk"
                      stackId="1"
                      stroke="#f97316"
                      fill="#f97316"
                      name="Medium Risk"
                    />
                    <Area
                      type="monotone"
                      dataKey="lowRisk"
                      stackId="1"
                      stroke="#10b981"
                      fill="#10b981"
                      name="Low Risk"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Feature Importance</CardTitle>
                <CardDescription>Factors most predictive of churn risk</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {features.map((feature, index) => (
                    <div key={feature.name} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{feature.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {(feature.importance * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={feature.importance * 100} className="h-2" />
                      <p className="text-xs text-muted-foreground">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Feature Impact Analysis</CardTitle>
                <CardDescription>How feature values correlate with churn risk</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={features} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={120} />
                    <Tooltip formatter={(value) => [`${(value as number * 100).toFixed(1)}%`, 'Importance']} />
                    <Bar dataKey="importance" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Risk Factor Combinations</CardTitle>
                <CardDescription>Most dangerous combinations of risk factors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      combination: ['Low Activity', 'No Recent Purchase', 'Support Tickets'],
                      riskIncrease: 85,
                      affectedUsers: 234
                    },
                    {
                      combination: ['Declining Engagement', 'Feature Non-adoption', 'Long Time Since Login'],
                      riskIncrease: 78,
                      affectedUsers: 189
                    },
                    {
                      combination: ['Payment Issues', 'Low Feature Usage', 'No Social Connections'],
                      riskIncrease: 92,
                      affectedUsers: 156
                    },
                    {
                      combination: ['Mobile App Uninstall', 'Email Unsubscribe', 'Reduced Sessions'],
                      riskIncrease: 95,
                      affectedUsers: 123
                    }
                  ].map((combo, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="destructive">High Risk Combo</Badge>
                        <span className="text-sm text-muted-foreground">
                          {combo.affectedUsers} users affected
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          <span className="font-medium">+{combo.riskIncrease}% Risk Increase</span>
                        </div>
                        <div className="space-y-1">
                          {combo.combination.map((factor, factorIndex) => (
                            <Badge key={factorIndex} variant="outline" className="mr-1 mb-1">
                              {factor}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="interventions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Interventions</CardTitle>
                <CardDescription>Currently running churn prevention campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {interventions.map((intervention, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                          {getInterventionIcon(intervention.type)}
                        </div>
                        <div>
                          <h4 className="font-medium">{intervention.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Target: {intervention.targetSegment}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          Success Rate: {(intervention.successRate * 100).toFixed(1)}%
                        </p>
                        <Badge variant={intervention.isActive ? 'default' : 'secondary'}>
                          {intervention.isActive ? 'Active' : 'Paused'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Intervention Performance</CardTitle>
                <CardDescription>Success rates of different intervention types</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={interventions}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => [`${value}%`, 'Success Rate']} />
                    <Bar 
                      dataKey="successRate" 
                      fill="hsl(var(--primary))" 
                      formatter={(value: number) => `${(value * 100).toFixed(1)}%`}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Recommended Actions by Risk Level</CardTitle>
                <CardDescription>Suggested interventions based on user risk profile</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-4">
                    <h4 className="font-medium text-red-600 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      High Risk Actions
                    </h4>
                    <div className="space-y-2">
                      {['Personal outreach call', 'Exclusive offer/discount', 'Account manager assignment', 'Priority support', 'Custom onboarding session'].map((action, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded">
                          <span className="text-sm">{action}</span>
                          <Clock className="h-4 w-4 text-muted-foreground" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-orange-600 flex items-center gap-2">
                      <TrendingDown className="h-4 w-4" />
                      Medium Risk Actions
                    </h4>
                    <div className="space-y-2">
                      {['Re-engagement email series', 'Feature adoption campaign', 'Usage tip notifications', 'Community invitation', 'Feedback survey'].map((action, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded">
                          <span className="text-sm">{action}</span>
                          <Mail className="h-4 w-4 text-muted-foreground" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-green-600 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Low Risk Actions
                    </h4>
                    <div className="space-y-2">
                      {['Product update notifications', 'Best practices content', 'Success story sharing', 'Referral program invite', 'Loyalty rewards'].map((action, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded">
                          <span className="text-sm">{action}</span>
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="prevention" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Prevention Impact</CardTitle>
                <CardDescription>Estimated churn prevented through interventions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Projected Monthly Churn</span>
                    <span className="text-2xl font-bold text-red-600">
                      {Math.round(overview.totalUsers * overview.predictedChurnRate / 100)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Prevented Through Interventions</span>
                    <span className="text-2xl font-bold text-green-600">
                      {Math.round(overview.preventedChurn)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Net Churn Reduction</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {((overview.preventedChurn / (overview.totalUsers * overview.predictedChurnRate / 100)) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={(overview.preventedChurn / (overview.totalUsers * overview.predictedChurnRate / 100)) * 100} 
                    className="h-3"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Prevention ROI</CardTitle>
                <CardDescription>Return on investment for churn prevention efforts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Prevention Cost</p>
                      <p className="text-2xl font-bold">$15,420</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Revenue Saved</p>
                      <p className="text-2xl font-bold text-green-600">$89,350</p>
                    </div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">ROI</p>
                    <p className="text-3xl font-bold text-green-600">479%</p>
                  </div>
                  <div className="text-xs text-muted-foreground text-center">
                    Based on average customer lifetime value of $1,247
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Prevention Strategy Recommendations</CardTitle>
                <CardDescription>Prioritized actions to reduce churn risk</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      priority: 'High',
                      action: 'Implement proactive support for users with payment issues',
                      impact: 'Could prevent 23% of high-risk churns',
                      effort: 'Medium',
                      timeline: '2 weeks'
                    },
                    {
                      priority: 'High',
                      action: 'Create personalized re-engagement campaigns for inactive users',
                      impact: 'Could prevent 18% of medium-risk churns',
                      effort: 'Low',
                      timeline: '1 week'
                    },
                    {
                      priority: 'Medium',
                      action: 'Develop feature adoption onboarding for new users',
                      impact: 'Could prevent 15% of early churns',
                      effort: 'High',
                      timeline: '6 weeks'
                    },
                    {
                      priority: 'Medium',
                      action: 'Build automated health score monitoring with alerts',
                      impact: 'Could identify 35% more at-risk users earlier',
                      effort: 'Medium',
                      timeline: '4 weeks'
                    },
                    {
                      priority: 'Low',
                      action: 'Implement customer success check-ins for premium users',
                      impact: 'Could prevent 12% of premium churns',
                      effort: 'High',
                      timeline: '8 weeks'
                    }
                  ].map((rec, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={rec.priority === 'High' ? 'destructive' : rec.priority === 'Medium' ? 'secondary' : 'outline'}>
                            {rec.priority} Priority
                          </Badge>
                          <Badge variant="outline">{rec.timeline}</Badge>
                        </div>
                        <h4 className="font-medium mb-1">{rec.action}</h4>
                        <p className="text-sm text-muted-foreground">{rec.impact}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Effort: {rec.effort}</p>
                        <Button size="sm" variant="outline" className="mt-2">
                          Start Planning
                        </Button>
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

export default ChurnPredictionDashboard;