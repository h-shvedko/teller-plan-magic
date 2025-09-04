import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Target,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Activity,
  Zap,
  Droplet,
  Flame,
} from 'lucide-react';
import {
  NutritionalGoal,
  MealBalance,
  BalanceRecommendation,
  advancedPlanningService,
} from '@/lib/advancedPlanningTools';

interface NutritionalGoalTrackerProps {
  mealPlanId: string;
  userId: string;
}

export const NutritionalGoalTracker: React.FC<NutritionalGoalTrackerProps> = ({
  mealPlanId,
  userId,
}) => {
  const [goals, setGoals] = useState<NutritionalGoal>({
    id: '',
    userId,
    goalType: 'daily',
    targetCalories: 2000,
    targetProtein: 50,
    targetCarbs: 300,
    targetFat: 65,
    targetFiber: 25,
    targetSodium: 2300,
    maxSugar: 50,
    maxSaturatedFat: 20,
    dietaryRestrictions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const [balance, setBalance] = useState<MealBalance | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mealPlanId) {
      trackBalance();
    }
  }, [mealPlanId]);

  const trackBalance = async () => {
    setLoading(true);
    try {
      // In real implementation, fetch meal plan data first
      const mockMealPlan = { id: mealPlanId };
      const result = await advancedPlanningService.trackNutritionalGoals(
        mockMealPlan,
        goals
      );
      setBalance(result);
    } catch (error) {
      console.error('Error tracking nutritional balance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoalChange = (field: keyof NutritionalGoal, value: any) => {
    setGoals((prev) => ({
      ...prev,
      [field]: value,
      updatedAt: new Date(),
    }));
  };

  const saveGoals = async () => {
    setEditMode(false);
    await trackBalance();
  };

  const getNutrientIcon = (nutrient: string) => {
    switch (nutrient.toLowerCase()) {
      case 'calories':
        return <Flame className="w-4 h-4" />;
      case 'protein':
        return <Activity className="w-4 h-4" />;
      case 'carbs':
        return <Zap className="w-4 h-4" />;
      case 'fat':
      case 'sodium':
        return <Droplet className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  const getProgressColor = (current: number, target: number, isMax: boolean = false) => {
    const percentage = (current / target) * 100;
    if (isMax) {
      if (percentage <= 100) return 'bg-green-500';
      if (percentage <= 120) return 'bg-yellow-500';
      return 'bg-red-500';
    } else {
      if (percentage >= 90 && percentage <= 110) return 'bg-green-500';
      if (percentage >= 75 && percentage < 90) return 'bg-yellow-500';
      if (percentage > 110 && percentage <= 125) return 'bg-yellow-500';
      return 'bg-red-500';
    }
  };

  const renderRecommendation = (rec: BalanceRecommendation) => {
    const icon = rec.type === 'increase' ? 
      <TrendingUp className="w-4 h-4 text-blue-500" /> :
      rec.type === 'decrease' ? 
      <TrendingDown className="w-4 h-4 text-orange-500" /> :
      <CheckCircle className="w-4 h-4 text-green-500" />;

    return (
      <Alert key={rec.nutrient} className="mb-2">
        <div className="flex items-start gap-2">
          {icon}
          <div className="flex-1">
            <AlertDescription>
              <strong>{rec.nutrient}:</strong> {rec.type === 'increase' ? 'Increase' : 'Decrease'} from{' '}
              {rec.currentAmount}g to {rec.targetAmount}g
              {rec.suggestedFoods.length > 0 && (
                <div className="mt-1">
                  <span className="text-sm text-muted-foreground">
                    Try: {rec.suggestedFoods.join(', ')}
                  </span>
                </div>
              )}
            </AlertDescription>
          </div>
          <Badge variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}>
            {rec.priority}
          </Badge>
        </div>
      </Alert>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Nutritional Goals
            </div>
            <Button
              variant={editMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => editMode ? saveGoals() : setEditMode(true)}
            >
              {editMode ? 'Save Goals' : 'Edit Goals'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Goal Type</Label>
              <Select
                value={goals.goalType}
                onValueChange={(value) => handleGoalChange('goalType', value)}
                disabled={!editMode}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Target Calories</Label>
              <Input
                type="number"
                value={goals.targetCalories || ''}
                onChange={(e) => handleGoalChange('targetCalories', parseInt(e.target.value))}
                disabled={!editMode}
                placeholder="2000"
              />
            </div>

            <div>
              <Label>Target Protein (g)</Label>
              <Input
                type="number"
                value={goals.targetProtein || ''}
                onChange={(e) => handleGoalChange('targetProtein', parseInt(e.target.value))}
                disabled={!editMode}
                placeholder="50"
              />
            </div>

            <div>
              <Label>Target Carbs (g)</Label>
              <Input
                type="number"
                value={goals.targetCarbs || ''}
                onChange={(e) => handleGoalChange('targetCarbs', parseInt(e.target.value))}
                disabled={!editMode}
                placeholder="300"
              />
            </div>

            <div>
              <Label>Target Fat (g)</Label>
              <Input
                type="number"
                value={goals.targetFat || ''}
                onChange={(e) => handleGoalChange('targetFat', parseInt(e.target.value))}
                disabled={!editMode}
                placeholder="65"
              />
            </div>

            <div>
              <Label>Target Fiber (g)</Label>
              <Input
                type="number"
                value={goals.targetFiber || ''}
                onChange={(e) => handleGoalChange('targetFiber', parseInt(e.target.value))}
                disabled={!editMode}
                placeholder="25"
              />
            </div>

            <div>
              <Label>Max Sodium (mg)</Label>
              <Input
                type="number"
                value={goals.targetSodium || ''}
                onChange={(e) => handleGoalChange('targetSodium', parseInt(e.target.value))}
                disabled={!editMode}
                placeholder="2300"
              />
            </div>

            <div>
              <Label>Max Sugar (g)</Label>
              <Input
                type="number"
                value={goals.maxSugar || ''}
                onChange={(e) => handleGoalChange('maxSugar', parseInt(e.target.value))}
                disabled={!editMode}
                placeholder="50"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {balance && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Current Balance
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Balance Score:</span>
                  <Badge variant={balance.balanceScore >= 80 ? 'default' : balance.balanceScore >= 60 ? 'secondary' : 'destructive'}>
                    {balance.balanceScore.toFixed(0)}%
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Calories */}
              {goals.targetCalories && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getNutrientIcon('calories')}
                      <span className="text-sm font-medium">Calories</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {balance.totalCalories} / {goals.targetCalories} kcal
                    </span>
                  </div>
                  <Progress
                    value={(balance.totalCalories / goals.targetCalories) * 100}
                    className={`h-2 ${getProgressColor(balance.totalCalories, goals.targetCalories)}`}
                  />
                </div>
              )}

              {/* Protein */}
              {goals.targetProtein && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getNutrientIcon('protein')}
                      <span className="text-sm font-medium">Protein</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {balance.totalProtein}g / {goals.targetProtein}g
                    </span>
                  </div>
                  <Progress
                    value={(balance.totalProtein / goals.targetProtein) * 100}
                    className={`h-2 ${getProgressColor(balance.totalProtein, goals.targetProtein)}`}
                  />
                </div>
              )}

              {/* Carbs */}
              {goals.targetCarbs && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getNutrientIcon('carbs')}
                      <span className="text-sm font-medium">Carbohydrates</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {balance.totalCarbs}g / {goals.targetCarbs}g
                    </span>
                  </div>
                  <Progress
                    value={(balance.totalCarbs / goals.targetCarbs) * 100}
                    className={`h-2 ${getProgressColor(balance.totalCarbs, goals.targetCarbs)}`}
                  />
                </div>
              )}

              {/* Fat */}
              {goals.targetFat && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getNutrientIcon('fat')}
                      <span className="text-sm font-medium">Fat</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {balance.totalFat}g / {goals.targetFat}g
                    </span>
                  </div>
                  <Progress
                    value={(balance.totalFat / goals.targetFat) * 100}
                    className={`h-2 ${getProgressColor(balance.totalFat, goals.targetFat)}`}
                  />
                </div>
              )}

              {/* Fiber */}
              {goals.targetFiber && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getNutrientIcon('fiber')}
                      <span className="text-sm font-medium">Fiber</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {balance.totalFiber}g / {goals.targetFiber}g
                    </span>
                  </div>
                  <Progress
                    value={(balance.totalFiber / goals.targetFiber) * 100}
                    className={`h-2 ${getProgressColor(balance.totalFiber, goals.targetFiber)}`}
                  />
                </div>
              )}

              {/* Sodium (max) */}
              {goals.targetSodium && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getNutrientIcon('sodium')}
                      <span className="text-sm font-medium">Sodium (max)</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {balance.totalSodium}mg / {goals.targetSodium}mg
                    </span>
                  </div>
                  <Progress
                    value={(balance.totalSodium / goals.targetSodium) * 100}
                    className={`h-2 ${getProgressColor(balance.totalSodium, goals.targetSodium, true)}`}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {balance.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {balance.recommendations.map(renderRecommendation)}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};