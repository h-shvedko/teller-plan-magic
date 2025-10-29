import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Progress } from './ui/progress'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { 
  Brain, 
  TrendingUp, 
  Heart, 
  Clock, 
  ChefHat, 
  Sparkles,
  Target,
  BarChart3,
  Calendar
} from 'lucide-react'
import { UserTasteProfile, smartRecommendationEngine } from '../lib/smartRecommendations'
import { useAuth } from '../hooks/useAuth'

interface TasteProfileData {
  profileCompleteness: number
  strongPreferences: Array<{
    category: string
    item: string
    confidence: number
    trend: 'increasing' | 'decreasing' | 'stable'
  }>
  learningInsights: Array<{
    insight: string
    confidence: number
    actionable: boolean
  }>
  seasonalPatterns: Array<{
    season: string
    preferences: string[]
    strength: number
  }>
  improvementSuggestions: Array<{
    area: string
    suggestion: string
    potentialImpact: 'high' | 'medium' | 'low'
  }>
}

export function TasteProfileLearning() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserTasteProfile | null>(null)
  const [profileData, setProfileData] = useState<TasteProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeInsight, setActiveInsight] = useState(0)

  useEffect(() => {
    loadTasteProfile()
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadTasteProfile = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const userProfile = await smartRecommendationEngine.getUserTasteProfile(user.id)
      setProfile(userProfile)
      
      if (userProfile) {
        const data = await generateProfileData(userProfile)
        setProfileData(data)
      }
    } catch (error) {
      console.error('Failed to load taste profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateProfileData = async (profile: UserTasteProfile): Promise<TasteProfileData> => {
    const completeness = calculateProfileCompleteness(profile)
    
    const strongPreferences = [
      ...Object.entries(profile.cuisinePreferences)
        .filter(([, score]) => score > 0.7)
        .map(([cuisine, score]) => ({
          category: 'Cuisine',
          item: cuisine,
          confidence: score,
          trend: 'stable' as const
        })),
      ...Object.entries(profile.flavorProfiles)
        .filter(([, score]) => score > 0.7)
        .map(([flavor, score]) => ({
          category: 'Flavor',
          item: flavor,
          confidence: score,
          trend: 'increasing' as const
        }))
    ].sort((a, b) => b.confidence - a.confidence).slice(0, 8)

    const learningInsights = generateLearningInsights(profile)
    const seasonalPatterns = generateSeasonalPatterns(profile)
    const improvementSuggestions = generateImprovementSuggestions(profile, completeness)

    return {
      profileCompleteness: completeness,
      strongPreferences,
      learningInsights,
      seasonalPatterns,
      improvementSuggestions
    }
  }

  const calculateProfileCompleteness = (profile: UserTasteProfile): number => {
    const factors = [
      Object.keys(profile.cuisinePreferences).length > 5 ? 20 : Object.keys(profile.cuisinePreferences).length * 4,
      Object.keys(profile.flavorProfiles).length > 4 ? 20 : Object.keys(profile.flavorProfiles).length * 5,
      Object.keys(profile.ingredientAffinities).length > 20 ? 25 : Object.keys(profile.ingredientAffinities).length * 1.25,
      profile.cookingTimePreference > 0 ? 15 : 0,
      profile.difficultyPreference > 0 ? 10 : 0,
      Object.keys(profile.seasonalPreferences).length > 2 ? 10 : Object.keys(profile.seasonalPreferences).length * 5
    ]

    return Math.min(100, factors.reduce((sum, score) => sum + score, 0))
  }

  const generateLearningInsights = (profile: UserTasteProfile): TasteProfileData['learningInsights'] => {
    const insights = []

    const topCuisine = Object.entries(profile.cuisinePreferences)
      .sort(([, a], [, b]) => b - a)[0]
    if (topCuisine && topCuisine[1] > 0.8) {
      insights.push({
        insight: `You have a strong preference for ${topCuisine[0]} cuisine (${Math.round(topCuisine[1] * 100)}% match)`,
        confidence: topCuisine[1],
        actionable: true
      })
    }

    const avgCookingTime = profile.cookingTimePreference
    if (avgCookingTime > 0) {
      if (avgCookingTime < 30) {
        insights.push({
          insight: "You prefer quick meals under 30 minutes - perfect for busy weekdays",
          confidence: 0.85,
          actionable: true
        })
      } else if (avgCookingTime > 60) {
        insights.push({
          insight: "You enjoy longer cooking sessions - great for weekend meal prep",
          confidence: 0.8,
          actionable: true
        })
      }
    }

    const topFlavors = Object.entries(profile.flavorProfiles)
      .filter(([, score]) => score > 0.7)
      .map(([flavor]) => flavor)

    if (topFlavors.length > 2) {
      insights.push({
        insight: `Your flavor profile leans toward ${topFlavors.slice(0, 2).join(' and ')} combinations`,
        confidence: 0.75,
        actionable: true
      })
    }

    const seasonalVariation = Object.values(profile.seasonalPreferences)
    const hasSeasonalPattern = Math.max(...seasonalVariation) - Math.min(...seasonalVariation) > 0.3
    if (hasSeasonalPattern) {
      insights.push({
        insight: "You show distinct seasonal eating patterns - we'll adapt recommendations accordingly",
        confidence: 0.7,
        actionable: false
      })
    }

    return insights.slice(0, 6)
  }

  const generateSeasonalPatterns = (profile: UserTasteProfile): TasteProfileData['seasonalPatterns'] => {
    return Object.entries(profile.seasonalPreferences).map(([season, strength]) => ({
      season: season.charAt(0).toUpperCase() + season.slice(1),
      preferences: [`${season} favorites`],
      strength: Math.round(strength * 100)
    }))
  }

  const generateImprovementSuggestions = (
    profile: UserTasteProfile, 
    completeness: number
  ): TasteProfileData['improvementSuggestions'] => {
    const suggestions = []

    if (completeness < 50) {
      suggestions.push({
        area: 'Profile Completeness',
        suggestion: 'Rate more recipes and track meal plans to improve recommendations',
        potentialImpact: 'high' as const
      })
    }

    if (Object.keys(profile.cuisinePreferences).length < 5) {
      suggestions.push({
        area: 'Cuisine Exploration',
        suggestion: 'Try recipes from different cuisines to discover new favorites',
        potentialImpact: 'medium' as const
      })
    }

    if (Object.keys(profile.ingredientAffinities).length < 15) {
      suggestions.push({
        area: 'Ingredient Diversity',
        suggestion: 'Experiment with new ingredients to expand your palate',
        potentialImpact: 'medium' as const
      })
    }

    if (Object.values(profile.seasonalPreferences).every(score => score < 0.6)) {
      suggestions.push({
        area: 'Seasonal Awareness',
        suggestion: 'Cook more seasonal recipes to develop seasonal preferences',
        potentialImpact: 'low' as const
      })
    }

    return suggestions.slice(0, 4)
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50'
    if (confidence >= 0.6) return 'text-blue-600 bg-blue-50'
    if (confidence >= 0.4) return 'text-yellow-600 bg-yellow-50'
    return 'text-gray-600 bg-gray-50'
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-3 w-3 text-green-500" />
      case 'decreasing': return <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />
      default: return <Target className="h-3 w-3 text-blue-500" />
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'border-red-200 bg-red-50'
      case 'medium': return 'border-yellow-200 bg-yellow-50'
      default: return 'border-blue-200 bg-blue-50'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!profile || !profileData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Start Building Your Taste Profile
          </CardTitle>
          <CardDescription>
            Cook recipes, rate meals, and track your meal plans to help us learn your preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Sparkles className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">
            We need more data to create your personalized taste profile
          </p>
          <Button>Explore Recipes to Get Started</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Your Taste Profile Learning
          </CardTitle>
          <CardDescription>
            AI-powered insights about your cooking and eating preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Profile Completeness</span>
              <span className="text-sm text-muted-foreground">
                {profileData.profileCompleteness}% Complete
              </span>
            </div>
            <Progress value={profileData.profileCompleteness} className="h-3" />
            <p className="text-xs text-muted-foreground mt-1">
              The more you cook and rate recipes, the better our recommendations become
            </p>
          </div>

          <Tabs defaultValue="preferences" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="seasonal">Seasonal</TabsTrigger>
              <TabsTrigger value="improve">Improve</TabsTrigger>
            </TabsList>

            <TabsContent value="preferences" className="space-y-4">
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Your Strong Preferences
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {profileData.strongPreferences.map((pref, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{pref.item}</span>
                        {getTrendIcon(pref.trend)}
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {pref.category}
                        </Badge>
                        <div className={`text-xs px-2 py-1 rounded-full ${getConfidenceColor(pref.confidence)}`}>
                          {Math.round(pref.confidence * 100)}% match
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="insights" className="space-y-4">
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Learning Insights
                </h4>
                <div className="space-y-3">
                  {profileData.learningInsights.map((insight, index) => (
                    <div 
                      key={index} 
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        activeInsight === index ? 'border-blue-300 bg-blue-50' : ''
                      }`}
                      onClick={() => setActiveInsight(index)}
                    >
                      <div className="flex items-start justify-between">
                        <p className="text-sm flex-1">{insight.insight}</p>
                        <div className="ml-3 flex flex-col items-end gap-1">
                          <div className={`text-xs px-2 py-1 rounded-full ${getConfidenceColor(insight.confidence)}`}>
                            {Math.round(insight.confidence * 100)}%
                          </div>
                          {insight.actionable && (
                            <Badge variant="outline" className="text-xs">Actionable</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="seasonal" className="space-y-4">
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Seasonal Patterns
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {profileData.seasonalPatterns.map((pattern, index) => (
                    <div key={index} className="text-center p-4 border rounded-lg">
                      <div className="text-lg font-semibold mb-1">{pattern.season}</div>
                      <Progress value={pattern.strength} className="h-2 mb-2" />
                      <div className="text-xs text-muted-foreground">
                        {pattern.strength}% preference
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="improve" className="space-y-4">
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Improvement Suggestions
                </h4>
                <div className="space-y-3">
                  {profileData.improvementSuggestions.map((suggestion, index) => (
                    <div key={index} className={`border rounded-lg p-4 ${getImpactColor(suggestion.potentialImpact)}`}>
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-sm">{suggestion.area}</h5>
                        <Badge 
                          variant={suggestion.potentialImpact === 'high' ? 'destructive' : 
                                  suggestion.potentialImpact === 'medium' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {suggestion.potentialImpact} impact
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700">{suggestion.suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

export default TasteProfileLearning