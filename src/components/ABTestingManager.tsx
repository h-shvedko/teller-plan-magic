import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { AlertTriangle, Play, Pause, BarChart3, TrendingUp, Users, Target, Calendar, Settings } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AdminBusinessIntelligenceService, ABTestExperiment, ABTestStatus } from '../lib/adminBusinessIntelligence';

const ABTestingManager: React.FC = () => {
  const [experiments, setExperiments] = useState<ABTestExperiment[]>([]);
  const [selectedExperiment, setSelectedExperiment] = useState<ABTestExperiment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newExperiment, setNewExperiment] = useState({
    name: '',
    description: '',
    hypothesis: '',
    feature: '',
    variants: [{ name: 'Control', trafficAllocation: 50 }, { name: 'Variant A', trafficAllocation: 50 }],
    targetMetric: '',
    significanceLevel: 0.05,
    minSampleSize: 1000,
    maxDuration: 30
  });

  const service = new AdminBusinessIntelligenceService();

  useEffect(() => {
    loadExperiments();
  }, []);

  const loadExperiments = async () => {
    setIsLoading(true);
    try {
      const data = await service.getABTestExperiments();
      setExperiments(data);
    } catch (error) {
      console.error('Failed to load A/B tests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateExperiment = async () => {
    try {
      const experiment = await service.createABTestExperiment(newExperiment);
      setExperiments([...experiments, experiment]);
      setShowCreateDialog(false);
      setNewExperiment({
        name: '',
        description: '',
        hypothesis: '',
        feature: '',
        variants: [{ name: 'Control', trafficAllocation: 50 }, { name: 'Variant A', trafficAllocation: 50 }],
        targetMetric: '',
        significanceLevel: 0.05,
        minSampleSize: 1000,
        maxDuration: 30
      });
    } catch (error) {
      console.error('Failed to create experiment:', error);
    }
  };

  const handleStartExperiment = async (id: string) => {
    try {
      await service.startABTest(id);
      await loadExperiments();
    } catch (error) {
      console.error('Failed to start experiment:', error);
    }
  };

  const handleStopExperiment = async (id: string) => {
    try {
      await service.stopABTest(id);
      await loadExperiments();
    } catch (error) {
      console.error('Failed to stop experiment:', error);
    }
  };

  const getStatusColor = (status: ABTestStatus) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'running': return 'default';
      case 'completed': return 'outline';
      case 'paused': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: ABTestStatus) => {
    switch (status) {
      case 'running': return <Play className="h-4 w-4" />;
      case 'paused': return <Pause className="h-4 w-4" />;
      case 'completed': return <BarChart3 className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading A/B tests...</p>
        </div>
      </div>
    );
  }

  const activeExperiments = experiments.filter(exp => exp.status === 'running');
  const completedExperiments = experiments.filter(exp => exp.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">A/B Testing Manager</h1>
          <p className="text-muted-foreground">Design, run, and analyze feature experiments</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>Create New Experiment</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create A/B Test Experiment</DialogTitle>
              <DialogDescription>
                Design a new experiment to test feature changes
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Experiment Name</Label>
                  <Input
                    id="name"
                    value={newExperiment.name}
                    onChange={(e) => setNewExperiment(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Recipe Page Redesign"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="feature">Feature Area</Label>
                  <Select
                    value={newExperiment.feature}
                    onValueChange={(value) => setNewExperiment(prev => ({ ...prev, feature: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select feature" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recipe_page">Recipe Page</SelectItem>
                      <SelectItem value="meal_planner">Meal Planner</SelectItem>
                      <SelectItem value="shopping_list">Shopping List</SelectItem>
                      <SelectItem value="onboarding">User Onboarding</SelectItem>
                      <SelectItem value="checkout">Checkout Flow</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newExperiment.description}
                  onChange={(e) => setNewExperiment(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the experiment"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hypothesis">Hypothesis</Label>
                <Textarea
                  id="hypothesis"
                  value={newExperiment.hypothesis}
                  onChange={(e) => setNewExperiment(prev => ({ ...prev, hypothesis: e.target.value }))}
                  placeholder="If we change X, then Y will happen because Z"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="targetMetric">Target Metric</Label>
                  <Select
                    value={newExperiment.targetMetric}
                    onValueChange={(value) => setNewExperiment(prev => ({ ...prev, targetMetric: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select metric" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conversion_rate">Conversion Rate</SelectItem>
                      <SelectItem value="engagement_time">Engagement Time</SelectItem>
                      <SelectItem value="feature_adoption">Feature Adoption</SelectItem>
                      <SelectItem value="retention_rate">Retention Rate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minSampleSize">Min Sample Size</Label>
                  <Input
                    id="minSampleSize"
                    type="number"
                    value={newExperiment.minSampleSize}
                    onChange={(e) => setNewExperiment(prev => ({ ...prev, minSampleSize: parseInt(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxDuration">Max Duration (days)</Label>
                  <Input
                    id="maxDuration"
                    type="number"
                    value={newExperiment.maxDuration}
                    onChange={(e) => setNewExperiment(prev => ({ ...prev, maxDuration: parseInt(e.target.value) }))}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
              <Button onClick={handleCreateExperiment}>Create Experiment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Experiments</p>
                <p className="text-2xl font-bold">{experiments.length}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Tests</p>
                <p className="text-2xl font-bold">{activeExperiments.length}</p>
              </div>
              <Play className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed Tests</p>
                <p className="text-2xl font-bold">{completedExperiments.length}</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">
                  {completedExperiments.length > 0
                    ? Math.round((completedExperiments.filter(exp => exp.results?.winner !== 'inconclusive').length / completedExperiments.length) * 100)
                    : 0}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active">Active Tests</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeExperiments.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Play className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Active Experiments</h3>
                <p className="text-muted-foreground">Start an experiment to begin testing features</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {activeExperiments.map((experiment) => (
                <Card key={experiment.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {experiment.name}
                          <Badge variant={getStatusColor(experiment.status)}>
                            {getStatusIcon(experiment.status)}
                            {experiment.status}
                          </Badge>
                        </CardTitle>
                        <CardDescription>{experiment.description}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setSelectedExperiment(experiment)}>
                          View Details
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleStopExperiment(experiment.id)}>
                          Stop Test
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Duration</p>
                        <p className="font-medium">{experiment.duration} days</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Sample Size</p>
                        <p className="font-medium">{experiment.sampleSize.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Confidence</p>
                        <p className="font-medium">{experiment.results?.confidenceLevel || 0}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <p className="font-medium">
                          {experiment.sampleSize >= experiment.minSampleSize ? 'Sufficient' : 'Collecting Data'}
                        </p>
                      </div>
                    </div>
                    {experiment.results && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Variant Performance</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {experiment.variants.map((variant, index) => (
                            <div key={index} className="p-3 border rounded-lg">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-medium">{variant.name}</span>
                                <Badge variant="outline">{variant.trafficAllocation}% traffic</Badge>
                              </div>
                              <div className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span>Conversion Rate:</span>
                                  <span>{experiment.results.variants[index]?.conversionRate.toFixed(2)}%</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span>Participants:</span>
                                  <span>{experiment.results.variants[index]?.participants.toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {completedExperiments.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Completed Experiments</h3>
                <p className="text-muted-foreground">Complete some experiments to see results</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {completedExperiments.map((experiment) => (
                <Card key={experiment.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {experiment.name}
                          <Badge variant={experiment.results?.winner === 'inconclusive' ? 'secondary' : 'default'}>
                            {experiment.results?.winner === 'inconclusive' ? 'Inconclusive' : `Winner: ${experiment.results?.winner}`}
                          </Badge>
                        </CardTitle>
                        <CardDescription>{experiment.description}</CardDescription>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setSelectedExperiment(experiment)}>
                        View Analysis
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Duration</p>
                        <p className="font-medium">{experiment.duration} days</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Sample</p>
                        <p className="font-medium">{experiment.sampleSize.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Confidence</p>
                        <p className="font-medium">{experiment.results?.confidenceLevel}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Statistical Significance</p>
                        <Badge variant={experiment.results?.isSignificant ? 'default' : 'secondary'}>
                          {experiment.results?.isSignificant ? 'Significant' : 'Not Significant'}
                        </Badge>
                      </div>
                    </div>
                    {experiment.results && (
                      <div>
                        <h4 className="font-medium mb-2">Final Results</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {experiment.variants.map((variant, index) => (
                            <div 
                              key={index} 
                              className={`p-3 border rounded-lg ${
                                experiment.results?.winner === variant.name ? 'border-green-500 bg-green-50' : ''
                              }`}
                            >
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-medium">{variant.name}</span>
                                {experiment.results?.winner === variant.name && (
                                  <Badge variant="default">Winner</Badge>
                                )}
                              </div>
                              <div className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span>Conversion Rate:</span>
                                  <span>{experiment.results.variants[index]?.conversionRate.toFixed(2)}%</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span>Improvement:</span>
                                  <span className={
                                    experiment.results.variants[index]?.improvement > 0 ? 'text-green-600' : 'text-red-600'
                                  }>
                                    {experiment.results.variants[index]?.improvement > 0 ? '+' : ''}
                                    {experiment.results.variants[index]?.improvement.toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="draft" className="space-y-4">
          {experiments.filter(exp => exp.status === 'draft').map((experiment) => (
            <Card key={experiment.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{experiment.name}</CardTitle>
                    <CardDescription>{experiment.description}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setSelectedExperiment(experiment)}>
                      Edit
                    </Button>
                    <Button size="sm" onClick={() => handleStartExperiment(experiment.id)}>
                      Start Test
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-muted-foreground">Hypothesis: </span>
                    <span className="text-sm">{experiment.hypothesis}</span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Target Metric: </span>
                    <Badge variant="outline">{experiment.targetMetric}</Badge>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Variants: </span>
                    {experiment.variants.map((variant, index) => (
                      <Badge key={index} variant="secondary" className="ml-1">
                        {variant.name} ({variant.trafficAllocation}%)
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Experiment Success Rate Over Time</CardTitle>
                <CardDescription>Percentage of experiments that achieved statistical significance</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={[
                    { month: 'Jan', successRate: 65 },
                    { month: 'Feb', successRate: 72 },
                    { month: 'Mar', successRate: 68 },
                    { month: 'Apr', successRate: 75 },
                    { month: 'May', successRate: 71 },
                    { month: 'Jun', successRate: 78 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="successRate" stroke="hsl(var(--primary))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Average Lift by Feature Area</CardTitle>
                <CardDescription>Performance improvements achieved by feature category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { feature: 'Onboarding', lift: 12.5 },
                    { feature: 'Recipe Page', lift: 8.2 },
                    { feature: 'Checkout', lift: 15.7 },
                    { feature: 'Meal Planner', lift: 6.3 },
                    { feature: 'Shopping List', lift: 9.8 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="feature" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="lift" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Experiment Details Dialog */}
      {selectedExperiment && (
        <Dialog open={!!selectedExperiment} onOpenChange={() => setSelectedExperiment(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedExperiment.name}</DialogTitle>
              <DialogDescription>{selectedExperiment.description}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Hypothesis</h4>
                <p className="text-sm text-muted-foreground">{selectedExperiment.hypothesis}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Setup</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>Target Metric: <Badge variant="outline">{selectedExperiment.targetMetric}</Badge></div>
                  <div>Feature Area: <Badge variant="outline">{selectedExperiment.feature}</Badge></div>
                  <div>Min Sample Size: {selectedExperiment.minSampleSize.toLocaleString()}</div>
                  <div>Max Duration: {selectedExperiment.maxDuration} days</div>
                </div>
              </div>
              {selectedExperiment.results && (
                <div>
                  <h4 className="font-medium mb-2">Results</h4>
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>Winner: <Badge>{selectedExperiment.results.winner}</Badge></div>
                      <div>Confidence: {selectedExperiment.results.confidenceLevel}%</div>
                      <div>Significant: <Badge variant={selectedExperiment.results.isSignificant ? 'default' : 'secondary'}>
                        {selectedExperiment.results.isSignificant ? 'Yes' : 'No'}
                      </Badge></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedExperiment(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ABTestingManager;