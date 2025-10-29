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
  DollarSign,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  AlertTriangle,
  CheckCircle,
  Utensils,
  Coffee,
  Beef,
  Apple,
  Droplets,
} from 'lucide-react';
import {
  MealPlanBudget,
  BudgetAllocation,
  SavingsOpportunity,
  advancedPlanningService,
} from '@/lib/advancedPlanningTools';

interface MealPlanBudgetTrackerProps {
  mealPlanId: string;
}

export const MealPlanBudgetTracker: React.FC<MealPlanBudgetTrackerProps> = ({
  mealPlanId,
}) => {
  const [budgetData, setBudgetData] = useState<MealPlanBudget | null>(null);
  const [weeklyBudget, setWeeklyBudget] = useState<number>(150);
  const [currency, setCurrency] = useState<string>('USD');
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mealPlanId) {
      trackBudget();
    }
  }, [mealPlanId]);

  const trackBudget = async () => {
    setLoading(true);
    try {
      const mockMealPlan = { id: mealPlanId };
      const result = await advancedPlanningService.trackBudget(
        mockMealPlan,
        weeklyBudget,
        currency
      );
      setBudgetData(result);
    } catch (error) {
      console.error('Error tracking budget:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveBudgetSettings = async () => {
    setEditMode(false);
    await trackBudget();
  };

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case 'USD':
        return '$';
      case 'EUR':
        return '€';
      case 'GBP':
        return '£';
      case 'CAD':
        return 'C$';
      default:
        return '$';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'breakfast':
        return <Coffee className="w-4 h-4" />;
      case 'lunch':
        return <Utensils className="w-4 h-4" />;
      case 'dinner':
        return <Beef className="w-4 h-4" />;
      case 'snacks':
        return <Apple className="w-4 h-4" />;
      case 'beverages':
        return <Droplets className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  const getVarianceColor = (variance: number) => {
    if (variance <= 0) return 'text-green-600'; // Under or on budget
    if (variance <= 10) return 'text-yellow-600'; // Slightly over
    return 'text-red-600'; // Significantly over
  };

  const getVarianceIcon = (variance: number) => {
    if (variance <= 0) return <TrendingDown className="w-4 h-4 text-green-600" />;
    if (variance <= 10) return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    return <TrendingUp className="w-4 h-4 text-red-600" />;
  };

  const renderAllocation = (allocation: BudgetAllocation) => {
    const symbol = getCurrencySymbol(currency);
    const overBudget = allocation.actualAmount > allocation.allocatedAmount;
    const progress = (allocation.actualAmount / allocation.allocatedAmount) * 100;

    return (
      <Card key={allocation.category} className="mb-3">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {getCategoryIcon(allocation.category)}
              <span className="font-medium capitalize">{allocation.category}</span>
            </div>
            <div className="flex items-center gap-2">
              {getVarianceIcon(allocation.variance)}
              <span className={getVarianceColor(allocation.variance)}>
                {symbol}{allocation.actualAmount.toFixed(2)} / {symbol}{allocation.allocatedAmount.toFixed(2)}
              </span>
            </div>
          </div>
          <Progress
            value={Math.min(progress, 100)}
            className={`h-2 ${overBudget ? 'bg-red-100' : 'bg-green-100'}`}
          />
          <div className="flex justify-between items-center mt-1 text-xs text-muted-foreground">
            <span>{allocation.allocatedPercentage.toFixed(0)}% of budget</span>
            <span>
              {allocation.variance > 0 ? '+' : ''}{symbol}{allocation.variance.toFixed(2)} variance
            </span>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderSavingsOpportunity = (opportunity: SavingsOpportunity) => {
    const symbol = getCurrencySymbol(currency);
    const effortColors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800',
    };

    return (
      <Card key={opportunity.id} className="mb-3">
        <CardContent className="pt-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <PiggyBank className="w-4 h-4 text-green-600" />
                <span className="font-medium">{opportunity.ingredient}</span>
                <Badge variant="outline" className={effortColors[opportunity.effortLevel]}>
                  {opportunity.effortLevel} effort
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                {opportunity.recommendation}
              </p>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-green-600">
                {symbol}{opportunity.potentialSaving.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">
                {opportunity.savingPercentage.toFixed(0)}% savings
              </div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Current cost: {symbol}{opportunity.currentCost.toFixed(2)}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="text-center">
          <DollarSign className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p>Calculating budget...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Budget Settings
            </div>
            <Button
              variant={editMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => editMode ? saveBudgetSettings() : setEditMode(true)}
            >
              {editMode ? 'Save Settings' : 'Edit Budget'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Weekly Budget</Label>
              <Input
                type="number"
                value={weeklyBudget}
                onChange={(e) => setWeeklyBudget(parseFloat(e.target.value))}
                disabled={!editMode}
                placeholder="150"
              />
            </div>
            <div>
              <Label>Currency</Label>
              <Select
                value={currency}
                onValueChange={setCurrency}
                disabled={!editMode}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="CAD">CAD (C$)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {budgetData && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Budget Overview
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Spent</div>
                    <div className="font-semibold">
                      {getCurrencySymbol(currency)}{budgetData.actualSpent.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Projected</div>
                    <div className="font-semibold">
                      {getCurrencySymbol(currency)}{budgetData.projectedCost.toFixed(2)}
                    </div>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span>Budget Progress</span>
                  <span>
                    {getCurrencySymbol(currency)}{budgetData.actualSpent.toFixed(2)} / {getCurrencySymbol(currency)}{budgetData.weeklyBudget.toFixed(2)}
                  </span>
                </div>
                <Progress
                  value={(budgetData.actualSpent / budgetData.weeklyBudget) * 100}
                  className="h-3"
                />
              </div>

              {budgetData.projectedCost > budgetData.weeklyBudget && (
                <Alert className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Your projected spending ({getCurrencySymbol(currency)}{budgetData.projectedCost.toFixed(2)}) 
                    exceeds your weekly budget by {getCurrencySymbol(currency)}{(budgetData.projectedCost - budgetData.weeklyBudget).toFixed(2)}
                  </AlertDescription>
                </Alert>
              )}

              {budgetData.actualSpent < budgetData.weeklyBudget * 0.8 && (
                <Alert className="mb-4">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Great job! You're staying well within your budget. 
                    You have {getCurrencySymbol(currency)}{(budgetData.weeklyBudget - budgetData.actualSpent).toFixed(2)} remaining.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Utensils className="w-5 h-5" />
                Budget Allocation by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              {budgetData.allocations.map(renderAllocation)}
            </CardContent>
          </Card>

          {budgetData.savingsOpportunities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PiggyBank className="w-5 h-5" />
                    Savings Opportunities
                  </div>
                  <Badge variant="secondary">
                    Total Potential: {getCurrencySymbol(currency)}
                    {budgetData.savingsOpportunities
                      .reduce((sum, opp) => sum + opp.potentialSaving, 0)
                      .toFixed(2)}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {budgetData.savingsOpportunities.map(renderSavingsOpportunity)}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};