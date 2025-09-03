import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { Checkbox } from './ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { ChefHat, Clock, CheckCircle, XCircle, AlertCircle, TrendingUp } from 'lucide-react'
import { MealPlanSuccess, smartRecommendationEngine } from '../lib/smartRecommendations'
import { useAuth } from '../hooks/useAuth'

interface MealPlanTrackingProps {
  mealPlanId: string
  plannedMeals: Array<{
    id: string
    name: string
    mealType: string
    day: string
    estimatedTime: number
  }>
}

export function MealPlanSuccessTracker({ mealPlanId, plannedMeals }: MealPlanTrackingProps) {
  const { user } = useAuth()
  const [mealStatus, setMealStatus] = useState<Record<string, 'planned' | 'cooked' | 'partial' | 'skipped'>>({})
  const [cookingNotes, setCookingNotes] = useState<Record<string, { actualTime?: number; difficulty?: number; notes?: string }>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)

  useEffect(() => {
    const initialStatus = plannedMeals.reduce((acc, meal) => {
      acc[meal.id] = 'planned'
      return acc
    }, {} as Record<string, 'planned' | 'cooked' | 'partial' | 'skipped'>)
    setMealStatus(initialStatus)
  }, [plannedMeals])

  const updateMealStatus = (mealId: string, status: 'planned' | 'cooked' | 'partial' | 'skipped') => {
    setMealStatus(prev => ({ ...prev, [mealId]: status }))
  }

  const updateCookingNotes = (mealId: string, notes: Partial<{ actualTime: number; difficulty: number; notes: string }>) => {
    setCookingNotes(prev => ({
      ...prev,
      [mealId]: { ...prev[mealId], ...notes }
    }))
  }

  const calculateSuccessMetrics = () => {
    const totalMeals = plannedMeals.length
    const cookedMeals = Object.values(mealStatus).filter(status => status === 'cooked').length
    const partialMeals = Object.values(mealStatus).filter(status => status === 'partial').length
    const skippedMeals = Object.values(mealStatus).filter(status => status === 'skipped').length
    
    const successRate = totalMeals > 0 ? (cookedMeals + partialMeals * 0.5) / totalMeals : 0
    
    return {
      totalMeals,
      cookedMeals,
      partialMeals,
      skippedMeals,
      successRate: Math.round(successRate * 100)
    }
  }

  const submitMealPlanFeedback = async () => {
    if (!user) return

    setIsSubmitting(true)
    try {
      const metrics = calculateSuccessMetrics()
      
      const mealPlanSuccess: MealPlanSuccess = {
        mealPlanId,
        userId: user.id,
        plannedMeals: plannedMeals.map(m => m.id),
        actuallyCooked: Object.entries(mealStatus)
          .filter(([, status]) => status === 'cooked')
          .map(([mealId]) => mealId),
        partiallyCooked: Object.entries(mealStatus)
          .filter(([, status]) => status === 'partial')
          .map(([mealId]) => mealId),
        skippedMeals: Object.entries(mealStatus)
          .filter(([, status]) => status === 'skipped')
          .map(([mealId]) => mealId),
        successRate: metrics.successRate / 100,
        createdAt: new Date(),
        completedAt: new Date()
      }

      await smartRecommendationEngine.trackMealPlanSuccess(mealPlanSuccess)

      for (const [mealId, notes] of Object.entries(cookingNotes)) {
        if (mealStatus[mealId] === 'cooked' || mealStatus[mealId] === 'partial') {
          await smartRecommendationEngine.learnFromUserFeedback(user.id, mealId, {
            liked: mealStatus[mealId] === 'cooked',
            actualCookingTime: notes.actualTime,
            actualDifficulty: notes.difficulty,
            wouldCookAgain: mealStatus[mealId] === 'cooked'
          })
        }
      }

      setHasSubmitted(true)
    } catch (error) {
      console.error('Failed to submit meal plan feedback:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const metrics = calculateSuccessMetrics()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'cooked': return 'bg-green-500'
      case 'partial': return 'bg-yellow-500'
      case 'skipped': return 'bg-red-500'
      default: return 'bg-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'cooked': return <CheckCircle className="h-4 w-4" />
      case 'partial': return <AlertCircle className="h-4 w-4" />
      case 'skipped': return <XCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  if (hasSubmitted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Meal Plan Feedback Submitted
          </CardTitle>
          <CardDescription>
            Thank you for tracking your meal plan! This helps us provide better recommendations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{metrics.successRate}%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{metrics.cookedMeals}</div>
              <div className="text-sm text-muted-foreground">Fully Cooked</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{metrics.partialMeals}</div>
              <div className="text-sm text-muted-foreground">Partially Cooked</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{metrics.skippedMeals}</div>
              <div className="text-sm text-muted-foreground">Skipped</div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChefHat className="h-5 w-5" />
            Track Your Meal Plan Success
          </CardTitle>
          <CardDescription>
            Let us know how your meal plan went to get better recommendations next time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">{metrics.successRate}% Success Rate</span>
            </div>
            <Progress value={metrics.successRate} className="h-2" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-semibold text-green-700">{metrics.cookedMeals}</div>
              <div className="text-xs text-green-600">Fully Cooked</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-lg font-semibold text-yellow-700">{metrics.partialMeals}</div>
              <div className="text-xs text-yellow-600">Partially Made</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-lg font-semibold text-red-700">{metrics.skippedMeals}</div>
              <div className="text-xs text-red-600">Skipped</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-semibold text-gray-700">{metrics.totalMeals}</div>
              <div className="text-xs text-gray-600">Total Planned</div>
            </div>
          </div>

          <Tabs defaultValue="tracking" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="tracking">Meal Tracking</TabsTrigger>
              <TabsTrigger value="feedback">Detailed Feedback</TabsTrigger>
            </TabsList>

            <TabsContent value="tracking" className="space-y-4">
              {plannedMeals.map((meal) => (
                <div key={meal.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{meal.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline">{meal.mealType}</Badge>
                        <span>{meal.day}</span>
                        <span>•</span>
                        <span>{meal.estimatedTime} min</span>
                      </div>
                    </div>
                    <Badge className={getStatusColor(mealStatus[meal.id])}>
                      {getStatusIcon(mealStatus[meal.id])}
                      {mealStatus[meal.id]}
                    </Badge>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant={mealStatus[meal.id] === 'cooked' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateMealStatus(meal.id, 'cooked')}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Cooked It
                    </Button>
                    <Button
                      variant={mealStatus[meal.id] === 'partial' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateMealStatus(meal.id, 'partial')}
                    >
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Made Parts
                    </Button>
                    <Button
                      variant={mealStatus[meal.id] === 'skipped' ? 'destructive' : 'outline'}
                      size="sm"
                      onClick={() => updateMealStatus(meal.id, 'skipped')}
                    >
                      <XCircle className="h-3 w-3 mr-1" />
                      Skipped
                    </Button>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="feedback" className="space-y-4">
              {plannedMeals.filter(meal => 
                mealStatus[meal.id] === 'cooked' || mealStatus[meal.id] === 'partial'
              ).map((meal) => (
                <div key={meal.id} className="border rounded-lg p-4 space-y-3">
                  <h4 className="font-medium">{meal.name}</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Actual Cooking Time (minutes)</label>
                      <input
                        type="number"
                        placeholder={meal.estimatedTime.toString()}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                        onChange={(e) => updateCookingNotes(meal.id, { actualTime: parseInt(e.target.value) || undefined })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Difficulty (1-5)</label>
                      <select
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                        onChange={(e) => updateCookingNotes(meal.id, { difficulty: parseInt(e.target.value) || undefined })}
                      >
                        <option value="">Rate difficulty</option>
                        <option value="1">1 - Very Easy</option>
                        <option value="2">2 - Easy</option>
                        <option value="3">3 - Moderate</option>
                        <option value="4">4 - Hard</option>
                        <option value="5">5 - Very Hard</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Notes (optional)</label>
                    <textarea
                      placeholder="Any notes about cooking this recipe..."
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                      rows={2}
                      onChange={(e) => updateCookingNotes(meal.id, { notes: e.target.value })}
                    />
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>

          <div className="mt-6 pt-4 border-t">
            <Button 
              onClick={submitMealPlanFeedback}
              disabled={isSubmitting || Object.values(mealStatus).every(status => status === 'planned')}
              className="w-full"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback & Improve Recommendations'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default MealPlanSuccessTracker