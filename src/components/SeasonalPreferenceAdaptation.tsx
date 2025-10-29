import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { 
  Calendar, 
  Leaf, 
  Sun, 
  Snowflake, 
  CloudRain,
  TrendingUp,
  ThermometerSun,
  Wind,
  Sparkles,
  MapPin,
  Clock
} from 'lucide-react'
import { SeasonalContext, smartRecommendationEngine } from '../lib/smartRecommendations'
import { useAuth } from '../hooks/useAuth'

interface SeasonalIngredient {
  name: string
  peakSeason: string
  currentSeason: string
  availability: 'peak' | 'good' | 'limited' | 'out-of-season'
  priceImpact: 'low' | 'medium' | 'high'
  nutritionalPeak: boolean
  storageAdvice: string
  alternatives: string[]
}

interface WeatherAdaptation {
  currentWeather: 'cold' | 'warm' | 'mild' | 'hot'
  suggestedMealTypes: string[]
  cookingMethods: string[]
  flavorProfiles: string[]
  reasoning: string
}

interface LocationalPreferences {
  region: string
  localSpecialties: string[]
  seasonalTraditions: string[]
  climateInfluence: string
}

export function SeasonalPreferenceAdaptation() {
  const { user } = useAuth()
  const [currentSeason, setCurrentSeason] = useState<'spring' | 'summer' | 'fall' | 'winter'>('fall')
  const [seasonalIngredients, setSeasonalIngredients] = useState<SeasonalIngredient[]>([])
  const [weatherAdaptation, setWeatherAdaptation] = useState<WeatherAdaptation | null>(null)
  const [locationPrefs, setLocationPrefs] = useState<LocationalPreferences | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [adaptationEnabled, setAdaptationEnabled] = useState(true)

  useEffect(() => {
    loadSeasonalData()
    detectCurrentSeason()
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  const detectCurrentSeason = () => {
    const month = new Date().getMonth()
    if (month >= 2 && month <= 4) setCurrentSeason('spring')
    else if (month >= 5 && month <= 7) setCurrentSeason('summer')
    else if (month >= 8 && month <= 10) setCurrentSeason('fall')
    else setCurrentSeason('winter')
  }

  const loadSeasonalData = async () => {
    setIsLoading(true)
    try {
      const ingredients = await generateSeasonalIngredients(currentSeason)
      setSeasonalIngredients(ingredients)
      
      const weather = await generateWeatherAdaptation()
      setWeatherAdaptation(weather)
      
      const location = await generateLocationalPreferences()
      setLocationPrefs(location)
      
      if (user) {
        await smartRecommendationEngine.adaptSeasonalPreferences(user.id, currentSeason)
      }
    } catch (error) {
      console.error('Failed to load seasonal data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateSeasonalIngredients = async (season: string): Promise<SeasonalIngredient[]> => {
    const seasonalData = {
      spring: [
        { name: 'Asparagus', peakSeason: 'spring', availability: 'peak' as const, nutritionalPeak: true, alternatives: ['Green beans', 'Broccoli'] },
        { name: 'Peas', peakSeason: 'spring', availability: 'peak' as const, nutritionalPeak: true, alternatives: ['Edamame', 'Lima beans'] },
        { name: 'Artichokes', peakSeason: 'spring', availability: 'good' as const, nutritionalPeak: true, alternatives: ['Brussels sprouts', 'Cabbage'] },
        { name: 'Spring onions', peakSeason: 'spring', availability: 'peak' as const, nutritionalPeak: false, alternatives: ['Chives', 'Regular onions'] },
        { name: 'Strawberries', peakSeason: 'spring', availability: 'peak' as const, nutritionalPeak: true, alternatives: ['Raspberries', 'Blueberries'] }
      ],
      summer: [
        { name: 'Tomatoes', peakSeason: 'summer', availability: 'peak' as const, nutritionalPeak: true, alternatives: ['Bell peppers', 'Eggplant'] },
        { name: 'Zucchini', peakSeason: 'summer', availability: 'peak' as const, nutritionalPeak: true, alternatives: ['Yellow squash', 'Cucumber'] },
        { name: 'Corn', peakSeason: 'summer', availability: 'peak' as const, nutritionalPeak: true, alternatives: ['Frozen corn', 'Quinoa'] },
        { name: 'Berries', peakSeason: 'summer', availability: 'peak' as const, nutritionalPeak: true, alternatives: ['Frozen berries', 'Stone fruits'] },
        { name: 'Basil', peakSeason: 'summer', availability: 'peak' as const, nutritionalPeak: true, alternatives: ['Oregano', 'Thyme'] }
      ],
      fall: [
        { name: 'Pumpkin', peakSeason: 'fall', availability: 'peak' as const, nutritionalPeak: true, alternatives: ['Butternut squash', 'Sweet potato'] },
        { name: 'Apples', peakSeason: 'fall', availability: 'peak' as const, nutritionalPeak: true, alternatives: ['Pears', 'Persimmons'] },
        { name: 'Brussels sprouts', peakSeason: 'fall', availability: 'peak' as const, nutritionalPeak: true, alternatives: ['Cabbage', 'Kale'] },
        { name: 'Sweet potatoes', peakSeason: 'fall', availability: 'peak' as const, nutritionalPeak: true, alternatives: ['Regular potatoes', 'Carrots'] },
        { name: 'Cranberries', peakSeason: 'fall', availability: 'peak' as const, nutritionalPeak: true, alternatives: ['Pomegranate', 'Dried fruits'] }
      ],
      winter: [
        { name: 'Citrus fruits', peakSeason: 'winter', availability: 'peak' as const, nutritionalPeak: true, alternatives: ['Kiwi', 'Persimmons'] },
        { name: 'Root vegetables', peakSeason: 'winter', availability: 'peak' as const, nutritionalPeak: true, alternatives: ['Stored vegetables', 'Frozen options'] },
        { name: 'Kale', peakSeason: 'winter', availability: 'good' as const, nutritionalPeak: true, alternatives: ['Spinach', 'Swiss chard'] },
        { name: 'Leeks', peakSeason: 'winter', availability: 'good' as const, nutritionalPeak: false, alternatives: ['Onions', 'Shallots'] },
        { name: 'Pomegranates', peakSeason: 'winter', availability: 'peak' as const, nutritionalPeak: true, alternatives: ['Cranberries', 'Frozen berries'] }
      ]
    }

    return (seasonalData[season as keyof typeof seasonalData] || []).map(item => ({
      ...item,
      currentSeason: season,
      priceImpact: item.availability === 'peak' ? 'low' as const : 
                   item.availability === 'good' ? 'medium' as const : 'high' as const,
      storageAdvice: generateStorageAdvice(item.name)
    }))
  }

  const generateStorageAdvice = (ingredient: string): string => {
    const storageMap: Record<string, string> = {
      'Asparagus': 'Store upright in water in fridge, use within 3-4 days',
      'Peas': 'Keep in pod until use, refrigerate for up to 1 week',
      'Tomatoes': 'Store at room temperature, refrigerate only when fully ripe',
      'Zucchini': 'Refrigerate in perforated bag for up to 1 week',
      'Pumpkin': 'Store in cool, dry place for several months',
      'Apples': 'Refrigerate for several weeks, store away from other fruits',
      'Citrus fruits': 'Room temperature for 1 week, refrigerate for longer storage'
    }
    return storageMap[ingredient] || 'Store in cool, dry place'
  }

  const generateWeatherAdaptation = async (): Promise<WeatherAdaptation> => {
    const adaptations = {
      cold: {
        currentWeather: 'cold' as const,
        suggestedMealTypes: ['Soups', 'Stews', 'Hot pot', 'Casseroles', 'Braised dishes'],
        cookingMethods: ['Braising', 'Slow cooking', 'Roasting', 'Simmering'],
        flavorProfiles: ['Warming spices', 'Rich broths', 'Hearty grains', 'Root vegetables'],
        reasoning: 'Cold weather calls for warming, comforting foods that provide sustained energy'
      },
      warm: {
        currentWeather: 'warm' as const,
        suggestedMealTypes: ['Salads', 'Grilled dishes', 'Light soups', 'Fresh bowls'],
        cookingMethods: ['Grilling', 'Raw preparation', 'Light sautéing', 'Steaming'],
        flavorProfiles: ['Fresh herbs', 'Citrus', 'Light vinaigrettes', 'Cooling ingredients'],
        reasoning: 'Warm weather favors lighter, refreshing foods that don\'t require heavy cooking'
      },
      mild: {
        currentWeather: 'mild' as const,
        suggestedMealTypes: ['Balanced meals', 'Pasta dishes', 'Stir-fries', 'Light proteins'],
        cookingMethods: ['Sautéing', 'Baking', 'Pan-frying', 'Light roasting'],
        flavorProfiles: ['Balanced seasonings', 'Mixed textures', 'Varied temperatures'],
        reasoning: 'Mild weather allows for versatile cooking methods and balanced flavor profiles'
      }
    }

    return adaptations.mild
  }

  const generateLocationalPreferences = async (): Promise<LocationalPreferences> => {
    return {
      region: 'Your Area',
      localSpecialties: ['Regional favorites', 'Local produce', 'Traditional dishes'],
      seasonalTraditions: ['Holiday recipes', 'Seasonal celebrations', 'Cultural dishes'],
      climateInfluence: 'Your local climate shapes ingredient availability and cooking traditions'
    }
  }

  const getSeasonIcon = (season: string) => {
    const icons = {
      spring: <Leaf className="h-5 w-5 text-green-500" />,
      summer: <Sun className="h-5 w-5 text-yellow-500" />,
      fall: <Wind className="h-5 w-5 text-orange-500" />,
      winter: <Snowflake className="h-5 w-5 text-blue-500" />
    }
    return icons[season as keyof typeof icons] || icons.fall
  }

  const getAvailabilityColor = (availability: string) => {
    const colors = {
      peak: 'bg-green-100 text-green-800 border-green-200',
      good: 'bg-blue-100 text-blue-800 border-blue-200',
      limited: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'out-of-season': 'bg-red-100 text-red-800 border-red-200'
    }
    return colors[availability as keyof typeof colors] || colors.limited
  }

  const getPriceImpactColor = (impact: string) => {
    const colors = {
      low: 'text-green-600',
      medium: 'text-yellow-600',
      high: 'text-red-600'
    }
    return colors[impact as keyof typeof colors] || colors.medium
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Seasonal Preference Adaptation
          </CardTitle>
          <CardDescription>
            AI-powered seasonal recommendations based on ingredients, weather, and your preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              {getSeasonIcon(currentSeason)}
              <div>
                <h3 className="font-semibold capitalize">{currentSeason} Season</h3>
                <p className="text-sm text-muted-foreground">
                  Recommendations adapted for {currentSeason} cooking
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Auto-adapt</span>
              <input
                type="checkbox"
                checked={adaptationEnabled}
                onChange={(e) => setAdaptationEnabled(e.target.checked)}
                className="rounded"
              />
            </div>
          </div>

          <Tabs defaultValue="ingredients" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
              <TabsTrigger value="weather">Weather</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="location">Location</TabsTrigger>
            </TabsList>

            <TabsContent value="ingredients" className="space-y-4">
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Peak Season Ingredients
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {seasonalIngredients.map((ingredient, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium">{ingredient.name}</h5>
                        <Badge className={getAvailabilityColor(ingredient.availability)}>
                          {ingredient.availability}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Price Impact:</span>
                          <span className={getPriceImpactColor(ingredient.priceImpact)}>
                            {ingredient.priceImpact}
                          </span>
                        </div>
                        
                        {ingredient.nutritionalPeak && (
                          <div className="flex items-center gap-1 text-sm text-green-600">
                            <TrendingUp className="h-3 w-3" />
                            Nutritional peak
                          </div>
                        )}
                        
                        <div className="text-xs text-muted-foreground">
                          <strong>Storage:</strong> {ingredient.storageAdvice}
                        </div>
                        
                        {ingredient.alternatives.length > 0 && (
                          <div className="text-xs">
                            <strong>Alternatives:</strong> {ingredient.alternatives.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="weather" className="space-y-4">
              {weatherAdaptation && (
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <ThermometerSun className="h-4 w-4" />
                    Weather-Based Recommendations
                  </h4>
                  
                  <div className="border rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">
                        {weatherAdaptation.currentWeather} weather
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {weatherAdaptation.reasoning}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                      <h5 className="font-medium mb-2">Suggested Meal Types</h5>
                      <div className="flex flex-wrap gap-2">
                        {weatherAdaptation.suggestedMealTypes.map((meal, index) => (
                          <Badge key={index} variant="secondary">{meal}</Badge>
                        ))}
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h5 className="font-medium mb-2">Cooking Methods</h5>
                      <div className="flex flex-wrap gap-2">
                        {weatherAdaptation.cookingMethods.map((method, index) => (
                          <Badge key={index} variant="outline">{method}</Badge>
                        ))}
                      </div>
                    </div>

                    <div className="border rounded-lg p-4 md:col-span-2">
                      <h5 className="font-medium mb-2">Flavor Profiles</h5>
                      <div className="flex flex-wrap gap-2">
                        {weatherAdaptation.flavorProfiles.map((flavor, index) => (
                          <Badge key={index} className="bg-purple-100 text-purple-800">
                            {flavor}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="trends" className="space-y-4">
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Seasonal Cooking Trends
                </h4>
                
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h5 className="font-medium mb-2">Popular This Season</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Comfort food recipes</span>
                        <div className="flex items-center gap-2">
                          <Progress value={85} className="h-2 w-20" />
                          <span className="text-xs text-muted-foreground">85%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Seasonal produce dishes</span>
                        <div className="flex items-center gap-2">
                          <Progress value={92} className="h-2 w-20" />
                          <span className="text-xs text-muted-foreground">92%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Holiday preparations</span>
                        <div className="flex items-center gap-2">
                          <Progress value={78} className="h-2 w-20" />
                          <span className="text-xs text-muted-foreground">78%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h5 className="font-medium mb-2">Your Seasonal Adaptation</h5>
                    <p className="text-sm text-muted-foreground mb-2">
                      Based on your cooking history, you tend to:
                    </p>
                    <ul className="text-sm space-y-1">
                      <li>• Cook more warming dishes in {currentSeason}</li>
                      <li>• Prefer seasonal ingredients (78% match rate)</li>
                      <li>• Adapt recipes based on weather</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="location" className="space-y-4">
              {locationPrefs && (
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location-Based Preferences
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <h5 className="font-medium mb-2">Regional Influence</h5>
                      <p className="text-sm text-muted-foreground mb-3">
                        {locationPrefs.climateInfluence}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h6 className="text-sm font-medium mb-2">Local Specialties</h6>
                          <div className="space-y-1">
                            {locationPrefs.localSpecialties.map((specialty, index) => (
                              <div key={index} className="text-sm text-muted-foreground">
                                • {specialty}
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h6 className="text-sm font-medium mb-2">Seasonal Traditions</h6>
                          <div className="space-y-1">
                            {locationPrefs.seasonalTraditions.map((tradition, index) => (
                              <div key={index} className="text-sm text-muted-foreground">
                                • {tradition}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h5 className="font-medium mb-2">Adaptation Settings</h5>
                      <div className="space-y-3">
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" defaultChecked className="rounded" />
                          Prioritize local ingredients
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" defaultChecked className="rounded" />
                          Adapt to weather patterns
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" className="rounded" />
                          Include regional specialties
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" defaultChecked className="rounded" />
                          Follow seasonal traditions
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="mt-6 pt-4 border-t">
            <Button onClick={loadSeasonalData} className="w-full">
              <Clock className="h-4 w-4 mr-2" />
              Refresh Seasonal Recommendations
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SeasonalPreferenceAdaptation