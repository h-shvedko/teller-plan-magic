import React, { useState, useEffect } from 'react'
import { Clock, Calendar, Brain, Utensils, Moon, Sun, Activity, Lightbulb, Target, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { enhancedAI, type MealTimingSuggestions, type MealTimingParams } from '@/lib/enhancedAI'

interface IntelligentMealTimingSuggesterProps {
  recipes: any[]
  userProfile?: any
  onTimingSuggestions?: (suggestions: MealTimingSuggestions) => void
  className?: string
}

export const IntelligentMealTimingSuggester: React.FC<IntelligentMealTimingSuggesterProps> = ({
  recipes = [],
  userProfile = null,
  onTimingSuggestions,
  className = ''
}) => {
  const [suggestions, setSuggestions] = useState<MealTimingSuggestions | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // User preferences state
  const [preferences, setPreferences] = useState({
    wakeUpTime: '7:00',
    bedTime: '22:00',
    workSchedule: 'standard', // standard, shift, flexible
    exerciseTime: 'morning', // morning, afternoon, evening, none
    energyPattern: 'morning', // morning, evening, consistent
    socialEating: true,
    mealPrepTime: [60], // minutes available for cooking
    dietaryGoals: ['balanced'], // balanced, weight_loss, muscle_gain, performance
    digestiveSensitivity: false,
    intermittentFasting: false,
    fastingWindow: [16] // hours
  })

  const [constraints, setConstraints] = useState([
    { type: 'work_meeting', start: '9:00', end: '17:00', days: ['mon', 'tue', 'wed', 'thu', 'fri'] },
    { type: 'exercise', start: '6:30', end: '7:30', days: ['mon', 'wed', 'fri'] }
  ])

  useEffect(() => {
    if (recipes.length > 0) {
      generateSuggestions()
    }
  }, [recipes, preferences])

  const generateSuggestions = async () => {
    setLoading(true)
    setError(null)

    try {
      const params: MealTimingParams = {
        userProfile: userProfile || {
          age: 30,
          activityLevel: 'moderate',
          healthGoals: preferences.dietaryGoals,
          schedule: preferences.workSchedule,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        recipes,
        preferences: {
          wakeUpTime: preferences.wakeUpTime,
          bedTime: preferences.bedTime,
          energyPattern: preferences.energyPattern,
          exerciseTime: preferences.exerciseTime,
          socialEating: preferences.socialEating,
          maxCookingTime: preferences.mealPrepTime[0],
          intermittentFasting: preferences.intermittentFasting,
          fastingHours: preferences.fastingWindow[0]
        },
        constraints,
        goals: preferences.dietaryGoals
      }

      const result = await enhancedAI.generateMealTimingSuggestions(params)
      setSuggestions(result)
      onTimingSuggestions?.(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate meal timing suggestions')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number)
    const period = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
  }

  const renderDailySchedule = (schedule: any) => (
    <div className="space-y-4">
      {Object.entries(schedule).map(([mealType, mealInfo]: [string, any]) => (
        <Card key={mealType} className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              <span className="font-medium capitalize">{mealType}</span>
              <Badge variant="outline">{formatTime(mealInfo.suggestedTime)}</Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              {mealInfo.preparationTime} min prep
            </div>
          </div>
          
          {mealInfo.recommendedRecipes && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Recommended Recipes:</div>
              <div className="flex gap-2 flex-wrap">
                {mealInfo.recommendedRecipes.slice(0, 3).map((recipe: any, index: number) => (
                  <Badge key={index} variant="secondary">
                    {recipe.name || recipe.title}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {mealInfo.nutritionalFocus && (
            <div className="mt-2 text-sm text-muted-foreground">
              Focus: {mealInfo.nutritionalFocus}
            </div>
          )}

          {mealInfo.energyAlignment && (
            <div className="flex items-center gap-1 mt-2">
              <Activity className="h-3 w-3" />
              <span className="text-xs text-muted-foreground">
                Energy alignment: {mealInfo.energyAlignment}
              </span>
            </div>
          )}
        </Card>
      ))}
    </div>
  )

  const renderWeeklyPattern = (pattern: any) => (
    <div className="space-y-4">
      {Object.entries(pattern).map(([day, dayPlan]: [string, any]) => (
        <Card key={day} className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium capitalize">{day}</span>
            <Badge variant={dayPlan.complexity === 'high' ? 'destructive' : dayPlan.complexity === 'medium' ? 'default' : 'secondary'}>
              {dayPlan.complexity} complexity
            </Badge>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-medium">Breakfast</div>
              <div className="text-muted-foreground">{formatTime(dayPlan.breakfast?.time || '7:00')}</div>
            </div>
            <div>
              <div className="font-medium">Lunch</div>
              <div className="text-muted-foreground">{formatTime(dayPlan.lunch?.time || '12:00')}</div>
            </div>
            <div>
              <div className="font-medium">Dinner</div>
              <div className="text-muted-foreground">{formatTime(dayPlan.dinner?.time || '19:00')}</div>
            </div>
          </div>

          {dayPlan.specialConsiderations && (
            <div className="mt-3 p-2 bg-muted rounded text-sm">
              <Lightbulb className="h-3 w-3 inline mr-1" />
              {dayPlan.specialConsiderations}
            </div>
          )}
        </Card>
      ))}
    </div>
  )

  const renderPrepStrategy = (strategy: any) => (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Target className="h-4 w-4" />
            Batch Cooking Windows
          </h4>
          <div className="space-y-2 text-sm">
            {strategy.batchCookingDays?.map((day: string, index: number) => (
              <div key={index} className="flex justify-between">
                <span className="capitalize">{day}</span>
                <Badge variant="outline">2-3 hours</Badge>
              </div>
            )) || (
              <div className="text-muted-foreground">No specific batch cooking scheduled</div>
            )}
          </div>
        </Card>

        <Card className="p-4">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Meal Prep Schedule
          </h4>
          <div className="space-y-2 text-sm">
            {strategy.prepTasks?.slice(0, 4).map((task: any, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>{task.task}</span>
                <Badge variant="outline" className="ml-auto text-xs">
                  {task.estimatedTime}min
                </Badge>
              </div>
            )) || (
              <div className="text-muted-foreground">Minimal prep required</div>
            )}
          </div>
        </Card>
      </div>

      {strategy.timeSavingTips && (
        <Card className="p-4">
          <h4 className="font-medium mb-2">Time-Saving Tips</h4>
          <ul className="space-y-1 text-sm">
            {strategy.timeSavingTips.map((tip: string, index: number) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )

  const renderPersonalizedTips = (tips: string[], energyOptimization: any, digestiveConsiderations: any) => (
    <div className="space-y-4">
      <Card className="p-4">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <Lightbulb className="h-4 w-4" />
          Personalized Recommendations
        </h4>
        <div className="space-y-2">
          {tips.map((tip, index) => (
            <div key={index} className="flex items-start gap-2 text-sm">
              <span className="text-primary mt-1">•</span>
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </Card>

      {energyOptimization && Object.keys(energyOptimization).length > 0 && (
        <Card className="p-4">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Energy Optimization
          </h4>
          <div className="space-y-3">
            {energyOptimization.peakEnergyTimes && (
              <div>
                <span className="text-sm font-medium">Peak Energy Times:</span>
                <div className="flex gap-2 mt-1">
                  {energyOptimization.peakEnergyTimes.map((time: string, index: number) => (
                    <Badge key={index} variant="secondary">{time}</Badge>
                  ))}
                </div>
              </div>
            )}
            {energyOptimization.recommendations && (
              <div className="text-sm">
                <span className="font-medium">Energy Tips:</span>
                <p className="text-muted-foreground mt-1">{energyOptimization.recommendations}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {digestiveConsiderations && Object.keys(digestiveConsiderations).length > 0 && (
        <Card className="p-4">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Utensils className="h-4 w-4" />
            Digestive Considerations
          </h4>
          <div className="space-y-2 text-sm">
            {digestiveConsiderations.recommendations?.map((rec: string, index: number) => (
              <div key={index} className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )

  const renderPreferencesForm = () => (
    <div className="space-y-6">
      <Card className="p-4">
        <h4 className="font-medium mb-4">Daily Schedule</h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Wake Up Time</label>
            <Select value={preferences.wakeUpTime} onValueChange={(value) => 
              setPreferences(prev => ({ ...prev, wakeUpTime: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 24 }, (_, i) => {
                  const hour = String(i).padStart(2, '0')
                  return <SelectItem key={i} value={`${hour}:00`}>{formatTime(`${hour}:00`)}</SelectItem>
                })}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Bed Time</label>
            <Select value={preferences.bedTime} onValueChange={(value) => 
              setPreferences(prev => ({ ...prev, bedTime: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 24 }, (_, i) => {
                  const hour = String(i).padStart(2, '0')
                  return <SelectItem key={i} value={`${hour}:00`}>{formatTime(`${hour}:00`)}</SelectItem>
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h4 className="font-medium mb-4">Lifestyle Preferences</h4>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Work Schedule</label>
            <Select value={preferences.workSchedule} onValueChange={(value) => 
              setPreferences(prev => ({ ...prev, workSchedule: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard (9-5)</SelectItem>
                <SelectItem value="shift">Shift Work</SelectItem>
                <SelectItem value="flexible">Flexible</SelectItem>
                <SelectItem value="remote">Remote</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Exercise Time</label>
            <Select value={preferences.exerciseTime} onValueChange={(value) => 
              setPreferences(prev => ({ ...prev, exerciseTime: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="morning">Morning</SelectItem>
                <SelectItem value="afternoon">Afternoon</SelectItem>
                <SelectItem value="evening">Evening</SelectItem>
                <SelectItem value="none">No Regular Exercise</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Available Cooking Time: {preferences.mealPrepTime[0]} minutes</label>
            <Slider
              value={preferences.mealPrepTime}
              onValueChange={(value) => setPreferences(prev => ({ ...prev, mealPrepTime: value }))}
              min={15}
              max={180}
              step={15}
              className="w-full"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">Social Eating</label>
              <p className="text-xs text-muted-foreground">Prefer meals that can be shared</p>
            </div>
            <Switch
              checked={preferences.socialEating}
              onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, socialEating: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">Intermittent Fasting</label>
              <p className="text-xs text-muted-foreground">Following a fasting schedule</p>
            </div>
            <Switch
              checked={preferences.intermittentFasting}
              onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, intermittentFasting: checked }))}
            />
          </div>

          {preferences.intermittentFasting && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Fasting Window: {preferences.fastingWindow[0]} hours</label>
              <Slider
                value={preferences.fastingWindow}
                onValueChange={(value) => setPreferences(prev => ({ ...prev, fastingWindow: value }))}
                min={12}
                max={20}
                step={1}
                className="w-full"
              />
            </div>
          )}
        </div>
      </Card>

      <Button onClick={generateSuggestions} disabled={loading} className="w-full">
        {loading ? 'Generating Suggestions...' : 'Update Meal Timing Suggestions'}
      </Button>
    </div>
  )

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Intelligent Meal Timing Suggester
          </CardTitle>
          <CardDescription>
            AI-powered meal timing optimization based on your lifestyle, energy patterns, and nutritional goals
          </CardDescription>
        </CardHeader>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-y-2 py-8">
              <div className="space-y-2 text-center">
                <Brain className="h-8 w-8 animate-pulse mx-auto text-primary" />
                <p className="font-medium">AI is optimizing your meal timing...</p>
                <p className="text-sm text-muted-foreground">Analyzing your preferences and schedule</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue={suggestions ? "schedule" : "preferences"} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="schedule" disabled={!suggestions}>Daily Schedule</TabsTrigger>
          <TabsTrigger value="weekly" disabled={!suggestions}>Weekly Pattern</TabsTrigger>
          <TabsTrigger value="insights" disabled={!suggestions}>Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="preferences">
          {renderPreferencesForm()}
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          {suggestions && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Optimized Daily Schedule</CardTitle>
                  <CardDescription>
                    AI-recommended meal times based on your preferences
                  </CardDescription>
                  <div className="flex items-center gap-2 text-sm">
                    <span>Optimization Confidence:</span>
                    <Progress value={suggestions.confidenceScore * 100} className="flex-1 max-w-xs" />
                    <span className="text-muted-foreground">
                      {Math.round(suggestions.confidenceScore * 100)}%
                    </span>
                  </div>
                </CardHeader>
              </Card>
              {renderDailySchedule(suggestions.dailySchedule)}
            </>
          )}
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4">
          {suggestions && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Meal Pattern</CardTitle>
                  <CardDescription>Adaptive scheduling throughout the week</CardDescription>
                </CardHeader>
              </Card>
              {renderWeeklyPattern(suggestions.weeklyPattern)}
              
              <Card>
                <CardHeader>
                  <CardTitle>Meal Prep Strategy</CardTitle>
                </CardHeader>
                <CardContent>
                  {renderPrepStrategy(suggestions.mealPrepStrategy)}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          {suggestions && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Timing Insights</CardTitle>
                  <CardDescription>Personalized recommendations and optimization tips</CardDescription>
                </CardHeader>
              </Card>
              {renderPersonalizedTips(
                suggestions.personalizedTips,
                suggestions.energyOptimization,
                suggestions.digestiveConsiderations
              )}

              {suggestions.seasonalAdjustments && Object.keys(suggestions.seasonalAdjustments).length > 0 && (
                <Card className="p-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    Seasonal Adjustments
                  </h4>
                  <div className="space-y-2 text-sm">
                    {Object.entries(suggestions.seasonalAdjustments).map(([season, adjustments]: [string, any]) => (
                      <div key={season}>
                        <span className="font-medium capitalize">{season}:</span>
                        <p className="text-muted-foreground ml-2">{adjustments.recommendation || 'No special adjustments needed'}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {suggestions && (
        <div className="flex gap-2">
          <Button onClick={() => onTimingSuggestions?.(suggestions)}>
            Apply Timing Suggestions
          </Button>
          <Button variant="outline" onClick={generateSuggestions}>
            Regenerate Suggestions
          </Button>
        </div>
      )}
    </div>
  )
}

export default IntelligentMealTimingSuggester