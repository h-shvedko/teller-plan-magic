import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { 
  Sparkles, 
  Heart, 
  Calendar, 
  TrendingUp, 
  User, 
  Clock,
  ChefHat,
  Star,
  Eye,
  Bookmark,
  RefreshCw
} from 'lucide-react'
import { RecommendationScore, smartRecommendationEngine } from '../lib/smartRecommendations'
import { Recipe } from '../integrations/supabase/types'
import { useAuth } from '../hooks/useAuth'

interface RecommendationCategory {
  id: string
  name: string
  icon: React.ReactNode
  description: string
  recommendations: RecommendationScore[]
}

interface RecommendationDisplayProps {
  recipes: Recipe[]
  context?: {
    mealType?: string
    timeAvailable?: number
    occasion?: string
  }
}

export function SmartRecommendationDisplay({ recipes, context }: RecommendationDisplayProps) {
  const { user } = useAuth()
  const [categories, setCategories] = useState<RecommendationCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRecipe, setSelectedRecipe] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadRecommendations()
  }, [user, recipes, context]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadRecommendations = async () => {
    if (!user || !recipes.length) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const allRecommendations = await smartRecommendationEngine.generateRecommendations(
        user.id,
        recipes,
        20,
        context
      )

      const categoryGroups = groupRecommendationsByCategory(allRecommendations, recipes)
      setCategories(categoryGroups)
    } catch (error) {
      console.error('Failed to load recommendations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const groupRecommendationsByCategory = (
    recommendations: RecommendationScore[],
    allRecipes: Recipe[]
  ): RecommendationCategory[] => {
    const categoryMap: Record<string, RecommendationScore[]> = {}
    
    recommendations.forEach(rec => {
      if (!categoryMap[rec.category]) {
        categoryMap[rec.category] = []
      }
      categoryMap[rec.category].push(rec)
    })

    const categoryDefinitions = {
      taste_match: {
        name: 'Perfect for You',
        icon: <Heart className="h-4 w-4" />,
        description: 'Based on your taste preferences and cooking history'
      },
      seasonal: {
        name: 'Seasonal Picks',
        icon: <Calendar className="h-4 w-4" />,
        description: 'Fresh seasonal ingredients and weather-appropriate dishes'
      },
      success_pattern: {
        name: 'You\'ll Actually Cook',
        icon: <TrendingUp className="h-4 w-4" />,
        description: 'Similar to recipes you\'ve successfully made before'
      },
      personalized: {
        name: 'Just for You',
        icon: <User className="h-4 w-4" />,
        description: 'Tailored to your recent activity and feedback'
      },
      trending: {
        name: 'Popular Now',
        icon: <Sparkles className="h-4 w-4" />,
        description: 'What\'s trending with users like you'
      }
    }

    return Object.entries(categoryMap).map(([categoryId, recs]) => {
      const def = categoryDefinitions[categoryId as keyof typeof categoryDefinitions]
      return {
        id: categoryId,
        name: def.name,
        icon: def.icon,
        description: def.description,
        recommendations: recs.slice(0, 6)
      }
    }).sort((a, b) => b.recommendations.length - a.recommendations.length)
  }

  const handleRecipeInteraction = async (recipeId: string, interactionType: 'view' | 'like' | 'save') => {
    if (!user) return

    try {
      await smartRecommendationEngine.updateTasteProfile(user.id, {
        userId: user.id,
        recipeId,
        interactionType,
        timestamp: new Date()
      })

      if (interactionType === 'view') {
        setSelectedRecipe(recipeId)
      }
    } catch (error) {
      console.error('Failed to track interaction:', error)
    }
  }

  const refreshRecommendations = async () => {
    setRefreshing(true)
    await loadRecommendations()
    setRefreshing(false)
  }

  const getRecipeById = (recipeId: string): Recipe | undefined => {
    return recipes.find(r => r.id === recipeId)
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50 border-green-200'
    if (confidence >= 0.6) return 'text-blue-600 bg-blue-50 border-blue-200'
    if (confidence >= 0.4) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-gray-600 bg-gray-50 border-gray-200'
  }

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-700 bg-green-100'
    if (score >= 0.6) return 'text-blue-700 bg-blue-100'
    if (score >= 0.4) return 'text-yellow-700 bg-yellow-100'
    return 'text-gray-700 bg-gray-100'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Smart Recommendations
          </CardTitle>
          <CardDescription>
            Sign in to get personalized recipe recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Button>Sign In to Get Started</Button>
        </CardContent>
      </Card>
    )
  }

  if (categories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Building Your Recommendations
          </CardTitle>
          <CardDescription>
            Cook some recipes and rate them to start getting personalized recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <ChefHat className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">
            We're learning your preferences. Try a few recipes first!
          </p>
          <Button onClick={() => window.location.href = '/recipes'}>
            Explore Recipes
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Smart Recommendations
              </CardTitle>
              <CardDescription>
                AI-powered suggestions based on your taste profile and cooking patterns
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshRecommendations}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={categories[0]?.id} className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {categories.map((category) => (
                <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-1">
                  {category.icon}
                  <span className="hidden sm:inline">{category.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((category) => (
              <TabsContent key={category.id} value={category.id} className="space-y-4">
                <div className="mb-4">
                  <h3 className="font-semibold mb-1">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.recommendations.map((rec, index) => {
                    const recipe = getRecipeById(rec.recipeId)
                    if (!recipe) return null

                    return (
                      <div key={rec.recipeId} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium line-clamp-2">{recipe.title}</h4>
                          <Badge className={`text-xs ${getScoreColor(rec.score)}`}>
                            {Math.round(rec.score * 100)}%
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{recipe.prep_time + recipe.cook_time} min</span>
                          {recipe.difficulty && (
                            <>
                              <span>•</span>
                              <div className="flex">
                                {Array.from({ length: 5 }, (_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${
                                      i < recipe.difficulty ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </>
                          )}
                        </div>

                        {rec.reasons.length > 0 && (
                          <div className="mb-3">
                            <div className="text-xs text-muted-foreground mb-1">Why this recipe:</div>
                            <div className="text-xs space-y-1">
                              {rec.reasons.slice(0, 2).map((reason, i) => (
                                <div key={i} className="text-green-600">• {reason}</div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className={`text-xs px-2 py-1 rounded-full border ${getConfidenceColor(rec.confidence)}`}>
                            {Math.round(rec.confidence * 100)}% confidence
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRecipeInteraction(rec.recipeId, 'view')}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRecipeInteraction(rec.recipeId, 'like')}
                            >
                              <Heart className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRecipeInteraction(rec.recipeId, 'save')}
                            >
                              <Bookmark className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {category.recommendations.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <ChefHat className="h-8 w-8 mx-auto mb-2" />
                    <p>No recommendations in this category yet</p>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {context && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Context-Aware Suggestions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {context.mealType && (
                <Badge variant="outline">For {context.mealType}</Badge>
              )}
              {context.timeAvailable && (
                <Badge variant="outline">Under {context.timeAvailable} minutes</Badge>
              )}
              {context.occasion && (
                <Badge variant="outline">{context.occasion}</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default SmartRecommendationDisplay