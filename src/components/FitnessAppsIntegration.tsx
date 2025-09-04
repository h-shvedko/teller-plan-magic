import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Target, 
  TrendingUp, 
  Heart, 
  Zap, 
  Scale,
  Clock,
  CheckCircle,
  AlertCircle,
  Smartphone,
  Watch,
  Calendar,
  BarChart3
} from 'lucide-react';
import { fitnessAppsIntegration } from '@/lib/thirdPartyIntegrations';
import type { FitnessApp, FitnessGoals, ActivityData, NutritionSync } from '@/lib/thirdPartyIntegrations';

interface FitnessAppsIntegrationProps {
  userId: string;
  onDataSync?: (data: NutritionSync) => void;
}

export function FitnessAppsIntegration({ userId, onDataSync }: FitnessAppsIntegrationProps) {
  const [connectedApps, setConnectedApps] = useState<FitnessApp[]>([]);
  const [fitnessGoals, setFitnessGoals] = useState<FitnessGoals | null>(null);
  const [todayActivity, setTodayActivity] = useState<ActivityData | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [autoSync, setAutoSync] = useState(true);
  const [customGoals, setCustomGoals] = useState({
    dailyCalories: 2000,
    protein: 150,
    carbs: 200,
    fat: 65,
    fiber: 25,
    steps: 10000,
    activeMinutes: 30
  });

  const availableApps: Array<{
    id: string;
    name: string;
    icon: React.ReactNode;
    description: string;
    features: string[];
  }> = [
    {
      id: 'myfitnesspal',
      name: 'MyFitnessPal',
      icon: <Target className="w-5 h-5" />,
      description: 'Comprehensive nutrition tracking and calorie counting',
      features: ['Calorie tracking', 'Macro nutrients', 'Food database', 'Meal logging']
    },
    {
      id: 'fitbit',
      name: 'Fitbit',
      icon: <Watch className="w-5 h-5" />,
      description: 'Activity tracking and health metrics',
      features: ['Steps', 'Heart rate', 'Sleep', 'Exercise tracking']
    },
    {
      id: 'apple-health',
      name: 'Apple Health',
      icon: <Heart className="w-5 h-5" />,
      description: 'Integrated health data from iPhone and Apple Watch',
      features: ['All health metrics', 'Workouts', 'Nutrition', 'Sleep']
    },
    {
      id: 'google-fit',
      name: 'Google Fit',
      icon: <Smartphone className="w-5 h-5" />,
      description: 'Activity tracking and health insights',
      features: ['Activity tracking', 'Goals', 'Coaching', 'Integration']
    },
    {
      id: 'strava',
      name: 'Strava',
      icon: <Activity className="w-5 h-5" />,
      description: 'Social fitness tracking and performance analytics',
      features: ['Running', 'Cycling', 'Performance', 'Social features']
    },
    {
      id: 'cronometer',
      name: 'Cronometer',
      icon: <BarChart3 className="w-5 h-5" />,
      description: 'Detailed nutrition tracking and micronutrient analysis',
      features: ['Micronutrients', 'Detailed tracking', 'Scientific data', 'Custom recipes']
    }
  ];

  useEffect(() => {
    loadUserData();
    const interval = setInterval(() => {
      if (autoSync) {
        handleSyncData();
      }
    }, 300000); // Sync every 5 minutes

    return () => clearInterval(interval);
  }, [userId, autoSync]);

  const loadUserData = async () => {
    try {
      const [apps, goals, activity] = await Promise.all([
        fitnessAppsIntegration.getConnectedApps(userId),
        fitnessAppsIntegration.getFitnessGoals(userId),
        fitnessAppsIntegration.getTodayActivity(userId)
      ]);

      setConnectedApps(apps);
      setFitnessGoals(goals);
      setTodayActivity(activity);

      if (goals) {
        setCustomGoals({
          dailyCalories: goals.dailyCalories,
          protein: goals.macros.protein,
          carbs: goals.macros.carbs,
          fat: goals.macros.fat,
          fiber: goals.micronutrients.fiber || 25,
          steps: goals.activity.steps,
          activeMinutes: goals.activity.activeMinutes
        });
      }
    } catch (error) {
      console.error('Failed to load fitness data:', error);
    }
  };

  const handleConnectApp = async (appId: string) => {
    setSyncStatus('syncing');
    try {
      await fitnessAppsIntegration.connectApp(userId, appId);
      await loadUserData();
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to connect app:', error);
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  const handleDisconnectApp = async (appId: string) => {
    try {
      await fitnessAppsIntegration.disconnectApp(userId, appId);
      await loadUserData();
    } catch (error) {
      console.error('Failed to disconnect app:', error);
    }
  };

  const handleSyncData = async () => {
    setSyncStatus('syncing');
    try {
      const nutritionData = await fitnessAppsIntegration.syncNutritionData(userId);
      if (nutritionData && onDataSync) {
        onDataSync(nutritionData);
      }
      await loadUserData();
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to sync data:', error);
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  const handleUpdateGoals = async () => {
    try {
      const updatedGoals: FitnessGoals = {
        dailyCalories: customGoals.dailyCalories,
        macros: {
          protein: customGoals.protein,
          carbs: customGoals.carbs,
          fat: customGoals.fat
        },
        micronutrients: {
          fiber: customGoals.fiber
        },
        activity: {
          steps: customGoals.steps,
          activeMinutes: customGoals.activeMinutes,
          caloriesBurned: Math.round(customGoals.dailyCalories * 0.3)
        }
      };

      await fitnessAppsIntegration.updateFitnessGoals(userId, updatedGoals);
      setFitnessGoals(updatedGoals);
    } catch (error) {
      console.error('Failed to update goals:', error);
    }
  };

  const getProgressPercentage = (current: number, target: number): number => {
    return Math.min((current / target) * 100, 100);
  };

  const getStatusIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return <Clock className="w-4 h-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Sync Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Fitness Apps Integration
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Connect your fitness apps to sync nutrition and activity data
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="auto-sync">Auto Sync</Label>
                <Switch
                  id="auto-sync"
                  checked={autoSync}
                  onCheckedChange={setAutoSync}
                />
              </div>
              <Button
                onClick={handleSyncData}
                disabled={syncStatus === 'syncing'}
                className="flex items-center gap-2"
              >
                {getStatusIcon()}
                Sync Now
              </Button>
            </div>
          </div>
        </CardHeader>

        {syncStatus === 'error' && (
          <CardContent>
            <Alert>
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                Failed to sync data. Please check your app connections and try again.
              </AlertDescription>
            </Alert>
          </CardContent>
        )}
      </Card>

      <Tabs defaultValue="apps" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="apps">Connected Apps</TabsTrigger>
          <TabsTrigger value="goals">Goals & Targets</TabsTrigger>
          <TabsTrigger value="activity">Today's Activity</TabsTrigger>
          <TabsTrigger value="nutrition">Nutrition Sync</TabsTrigger>
        </TabsList>

        {/* Connected Apps Tab */}
        <TabsContent value="apps" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {availableApps.map(app => {
              const isConnected = connectedApps.find(connected => connected.appId === app.id);
              
              return (
                <Card key={app.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {app.icon}
                        <div>
                          <CardTitle className="text-base">{app.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {app.description}
                          </p>
                        </div>
                      </div>
                      {isConnected && (
                        <Badge variant="default">Connected</Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-1">
                      {app.features.map(feature => (
                        <Badge key={feature} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                    
                    {isConnected ? (
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">
                          Connected on {isConnected.connectedAt.toLocaleDateString()}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSyncData()}
                            disabled={syncStatus === 'syncing'}
                          >
                            Sync Data
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDisconnectApp(app.id)}
                          >
                            Disconnect
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        onClick={() => handleConnectApp(app.id)}
                        disabled={syncStatus === 'syncing'}
                        className="w-full"
                      >
                        Connect {app.name}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Goals & Targets Tab */}
        <TabsContent value="goals" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Daily Nutrition Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div>
                    <Label htmlFor="calories">Daily Calories</Label>
                    <Input
                      id="calories"
                      type="number"
                      value={customGoals.dailyCalories}
                      onChange={(e) => setCustomGoals(prev => ({
                        ...prev,
                        dailyCalories: parseInt(e.target.value) || 0
                      }))}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label htmlFor="protein">Protein (g)</Label>
                      <Input
                        id="protein"
                        type="number"
                        value={customGoals.protein}
                        onChange={(e) => setCustomGoals(prev => ({
                          ...prev,
                          protein: parseInt(e.target.value) || 0
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="carbs">Carbs (g)</Label>
                      <Input
                        id="carbs"
                        type="number"
                        value={customGoals.carbs}
                        onChange={(e) => setCustomGoals(prev => ({
                          ...prev,
                          carbs: parseInt(e.target.value) || 0
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="fat">Fat (g)</Label>
                      <Input
                        id="fat"
                        type="number"
                        value={customGoals.fat}
                        onChange={(e) => setCustomGoals(prev => ({
                          ...prev,
                          fat: parseInt(e.target.value) || 0
                        }))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="fiber">Fiber (g)</Label>
                    <Input
                      id="fiber"
                      type="number"
                      value={customGoals.fiber}
                      onChange={(e) => setCustomGoals(prev => ({
                        ...prev,
                        fiber: parseInt(e.target.value) || 0
                      }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Activity Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="steps">Daily Steps</Label>
                  <Input
                    id="steps"
                    type="number"
                    value={customGoals.steps}
                    onChange={(e) => setCustomGoals(prev => ({
                      ...prev,
                      steps: parseInt(e.target.value) || 0
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="active-minutes">Active Minutes</Label>
                  <Input
                    id="active-minutes"
                    type="number"
                    value={customGoals.activeMinutes}
                    onChange={(e) => setCustomGoals(prev => ({
                      ...prev,
                      activeMinutes: parseInt(e.target.value) || 0
                    }))}
                  />
                </div>
                <Button onClick={handleUpdateGoals} className="w-full">
                  Update Goals
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Today's Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          {todayActivity && fitnessGoals ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Nutrition Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Nutrition Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Calories</span>
                      <span>{todayActivity.nutrition.calories} / {fitnessGoals.dailyCalories}</span>
                    </div>
                    <Progress value={getProgressPercentage(todayActivity.nutrition.calories, fitnessGoals.dailyCalories)} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Protein</span>
                      <span>{todayActivity.nutrition.protein}g / {fitnessGoals.macros.protein}g</span>
                    </div>
                    <Progress value={getProgressPercentage(todayActivity.nutrition.protein, fitnessGoals.macros.protein)} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Carbs</span>
                      <span>{todayActivity.nutrition.carbs}g / {fitnessGoals.macros.carbs}g</span>
                    </div>
                    <Progress value={getProgressPercentage(todayActivity.nutrition.carbs, fitnessGoals.macros.carbs)} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Fat</span>
                      <span>{todayActivity.nutrition.fat}g / {fitnessGoals.macros.fat}g</span>
                    </div>
                    <Progress value={getProgressPercentage(todayActivity.nutrition.fat, fitnessGoals.macros.fat)} />
                  </div>
                </CardContent>
              </Card>

              {/* Activity Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Activity Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Steps</span>
                      <span>{todayActivity.activity.steps.toLocaleString()} / {fitnessGoals.activity.steps.toLocaleString()}</span>
                    </div>
                    <Progress value={getProgressPercentage(todayActivity.activity.steps, fitnessGoals.activity.steps)} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Active Minutes</span>
                      <span>{todayActivity.activity.activeMinutes} / {fitnessGoals.activity.activeMinutes}</span>
                    </div>
                    <Progress value={getProgressPercentage(todayActivity.activity.activeMinutes, fitnessGoals.activity.activeMinutes)} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Calories Burned</span>
                      <span>{todayActivity.activity.caloriesBurned} / {fitnessGoals.activity.caloriesBurned}</span>
                    </div>
                    <Progress value={getProgressPercentage(todayActivity.activity.caloriesBurned, fitnessGoals.activity.caloriesBurned)} />
                  </div>
                </CardContent>
              </Card>

              {/* Health Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Health Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center gap-2">
                      <Heart className="w-4 h-4" />
                      Resting Heart Rate
                    </span>
                    <span className="font-medium">{todayActivity.healthMetrics.restingHeartRate} bpm</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center gap-2">
                      <Scale className="w-4 h-4" />
                      Weight
                    </span>
                    <span className="font-medium">{todayActivity.healthMetrics.weight} lbs</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Body Fat %
                    </span>
                    <span className="font-medium">{todayActivity.healthMetrics.bodyFat}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Sleep Score</span>
                    <span className="font-medium">{todayActivity.healthMetrics.sleepScore}/100</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Connect a fitness app to see your activity data
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Nutrition Sync Tab */}
        <TabsContent value="nutrition" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Meal Plan Nutrition Sync</CardTitle>
              <p className="text-sm text-muted-foreground">
                Automatically sync your meal plans with connected fitness apps
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {connectedApps.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Automatic Meal Logging</h4>
                      <p className="text-sm text-muted-foreground">
                        Sync planned meals to your fitness apps automatically
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Macro Balancing</h4>
                      <p className="text-sm text-muted-foreground">
                        Adjust meal plans based on your fitness goals
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Activity-Based Adjustments</h4>
                      <p className="text-sm text-muted-foreground">
                        Modify calorie targets based on daily activity
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <Button onClick={handleSyncData} className="w-full">
                    <Calendar className="w-4 h-4 mr-2" />
                    Sync This Week's Meal Plan
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Connect a fitness app to enable nutrition sync
                  </p>
                  <Button onClick={() => document.querySelector<HTMLButtonElement>('[data-tabs-value="apps"]')?.click()}>
                    Connect Apps
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}