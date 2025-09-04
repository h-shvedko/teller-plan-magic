import React, { useState, useEffect } from 'react'
import { Activity, Brain, Zap, Shield, TrendingUp, Info, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { enhancedAI, type DetailedNutritionAnalysis, type Recipe } from '@/lib/enhancedAI'

interface AIAdvancedNutritionAnalyzerProps {
  recipe: Recipe
  servingSize?: number
  onAnalysisComplete?: (analysis: DetailedNutritionAnalysis) => void
  className?: string
}

export const AIAdvancedNutritionAnalyzer: React.FC<AIAdvancedNutritionAnalyzerProps> = ({
  recipe,
  servingSize,
  onAnalysisComplete,
  className = ''
}) => {
  const [analysis, setAnalysis] = useState<DetailedNutritionAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (recipe) {
      analyzeNutrition()
    }
  }, [recipe, servingSize])

  const analyzeNutrition = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await enhancedAI.analyzeNutrition(recipe, servingSize)
      setAnalysis(result)
      onAnalysisComplete?.(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze nutrition')
    } finally {
      setLoading(false)
    }
  }

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getHealthScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent'
    if (score >= 80) return 'Very Good'
    if (score >= 70) return 'Good'
    if (score >= 60) return 'Fair'
    if (score >= 40) return 'Poor'
    return 'Very Poor'
  }

  const renderMacronutrients = (macros: any) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{macros.calories}</div>
          <div className="text-sm text-muted-foreground">Calories</div>
        </div>
        <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{macros.protein}g</div>
          <div className="text-sm text-muted-foreground">Protein</div>
        </div>
        <div className="text-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{macros.carbohydrates}g</div>
          <div className="text-sm text-muted-foreground">Carbs</div>
        </div>
        <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{macros.fat}g</div>
          <div className="text-sm text-muted-foreground">Fat</div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Fiber</span>
          <span className="text-sm">{macros.fiber}g</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Sugar</span>
          <span className="text-sm">{macros.sugar}g</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Sodium</span>
          <span className="text-sm">{macros.sodium}mg</span>
        </div>
      </div>
    </div>
  )

  const renderVitaminsAndMinerals = (vitamins: any, minerals: any) => (
    <div className="space-y-6">
      {Object.keys(vitamins).length > 0 && (
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Vitamins
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(vitamins).map(([vitamin, amount]) => (
              <div key={vitamin} className="flex justify-between items-center p-2 bg-muted rounded">
                <span className="text-sm font-medium capitalize">{vitamin.replace('_', ' ')}</span>
                <span className="text-sm">{amount as number}mg</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {Object.keys(minerals).length > 0 && (
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Minerals
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(minerals).map(([mineral, amount]) => (
              <div key={mineral} className="flex justify-between items-center p-2 bg-muted rounded">
                <span className="text-sm font-medium capitalize">{mineral.replace('_', ' ')}</span>
                <span className="text-sm">{amount as number}mg</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const renderHealthMetrics = (metrics: any) => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className={`text-4xl font-bold ${getHealthScoreColor(metrics.healthScore)}`}>
          {metrics.healthScore}/100
        </div>
        <div className="text-lg font-medium">
          Overall Health Score: {getHealthScoreLabel(metrics.healthScore)}
        </div>
        <Progress value={metrics.healthScore} className="w-full" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border rounded-lg">
          <div className="text-center">
            <div className="text-xl font-semibold">{metrics.glycemicIndex}</div>
            <div className="text-sm text-muted-foreground">Glycemic Index</div>
            <div className="text-xs mt-1">
              {metrics.glycemicIndex < 55 ? 'Low GI' : metrics.glycemicIndex < 70 ? 'Medium GI' : 'High GI'}
            </div>
          </div>
        </div>
        
        <div className="p-4 border rounded-lg">
          <div className="text-center">
            <div className={`text-xl font-semibold ${metrics.inflammatoryScore < 0 ? 'text-green-600' : 'text-orange-600'}`}>
              {metrics.inflammatoryScore > 0 ? '+' : ''}{metrics.inflammatoryScore}
            </div>
            <div className="text-sm text-muted-foreground">Inflammatory Score</div>
            <div className="text-xs mt-1">
              {metrics.inflammatoryScore < 0 ? 'Anti-inflammatory' : 'Pro-inflammatory'}
            </div>
          </div>
        </div>
        
        <div className="p-4 border rounded-lg">
          <div className="text-center">
            <div className="text-xl font-semibold text-blue-600">{metrics.nutrientDensity}</div>
            <div className="text-sm text-muted-foreground">Nutrient Density</div>
            <div className="text-xs mt-1">
              {metrics.nutrientDensity > 15 ? 'Very High' : metrics.nutrientDensity > 10 ? 'High' : 'Moderate'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderDietaryInfo = (tags: string[], allergens: string[]) => (
    <div className="space-y-4">
      {tags.length > 0 && (
        <div>
          <h4 className="font-medium mb-3">Dietary Tags</h4>
          <div className="flex gap-2 flex-wrap">
            {tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {allergens.length > 0 && (
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2 text-orange-600">
            <AlertTriangle className="h-4 w-4" />
            Potential Allergens
          </h4>
          <div className="flex gap-2 flex-wrap">
            {allergens.map((allergen, index) => (
              <Badge key={index} variant="destructive">
                {allergen}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const renderInsights = (insights: string[], benefits: string[]) => (
    <div className="space-y-4">
      {insights.length > 0 && (
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Info className="h-4 w-4" />
            Nutrition Insights
          </h4>
          <ul className="space-y-2">
            {insights.map((insight, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="text-blue-500 mt-1">•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {benefits.length > 0 && (
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2 text-green-600">
            <TrendingUp className="h-4 w-4" />
            Health Benefits
          </h4>
          <ul className="space-y-2">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-3 w-3 text-green-500 mt-1" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )

  const renderIngredientBreakdown = (contributions: any[]) => (
    <div className="space-y-4">
      <h4 className="font-medium">Ingredient Nutrition Contributions</h4>
      <div className="space-y-3">
        {contributions.map((contribution, index) => (
          <div key={index} className="p-3 border rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <span className="font-medium">{contribution.ingredient}</span>
              <span className="text-sm text-muted-foreground">
                {contribution.calories} cal
              </span>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>Protein: {contribution.protein}g | Carbs: {contribution.carbs}g | Fat: {contribution.fat}g</div>
              {contribution.keyNutrients && (
                <div className="flex gap-1 flex-wrap mt-2">
                  {contribution.keyNutrients.map((nutrient: string, i: number) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {nutrient}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center space-y-2 py-8">
            <div className="space-y-2 text-center">
              <Brain className="h-8 w-8 animate-pulse mx-auto text-primary" />
              <p className="font-medium">AI is analyzing nutrition...</p>
              <p className="text-sm text-muted-foreground">This may take a few moments</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <Button variant="outline" size="sm" onClick={analyzeNutrition} className="mt-2">
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (!analysis) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center py-4">
            <p className="text-muted-foreground">No nutrition analysis available</p>
            <Button onClick={analyzeNutrition} className="mt-2">
              Analyze Nutrition
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI-Powered Nutrition Analysis
          </CardTitle>
          <CardDescription>
            Comprehensive nutritional analysis for {recipe.title}
            {servingSize && ` (${servingSize} serving${servingSize > 1 ? 's' : ''})`}
          </CardDescription>
          <div className="flex items-center gap-2 text-sm">
            <span>Analysis Confidence:</span>
            <Progress value={analysis.nutritionConfidence * 100} className="flex-1 max-w-xs" />
            <span className="text-muted-foreground">
              {Math.round(analysis.nutritionConfidence * 100)}%
            </span>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="macros" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="macros">Macros</TabsTrigger>
          <TabsTrigger value="vitamins">Vitamins</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
          <TabsTrigger value="dietary">Dietary</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="macros" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Macronutrients (Per Serving)</CardTitle>
            </CardHeader>
            <CardContent>
              {renderMacronutrients(analysis.perServing)}
            </CardContent>
          </Card>

          {analysis.ingredientContributions.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                {renderIngredientBreakdown(analysis.ingredientContributions)}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="vitamins" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vitamins & Minerals</CardTitle>
              <CardDescription>Essential micronutrients per serving</CardDescription>
            </CardHeader>
            <CardContent>
              {renderVitaminsAndMinerals(analysis.vitamins, analysis.minerals)}
              
              {Object.keys(analysis.antioxidants).length > 0 && (
                <>
                  <Separator className="my-6" />
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Activity className="h-4 w-4 text-orange-500" />
                      Antioxidants
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(analysis.antioxidants).map(([antioxidant, amount]) => (
                        <div key={antioxidant} className="flex justify-between items-center p-2 bg-orange-50 dark:bg-orange-950 rounded">
                          <span className="text-sm font-medium capitalize">{antioxidant.replace('_', ' ')}</span>
                          <span className="text-sm">{amount as number}mg</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Health Metrics</CardTitle>
              <CardDescription>AI-calculated health indicators</CardDescription>
            </CardHeader>
            <CardContent>
              {renderHealthMetrics(analysis.healthMetrics)}
            </CardContent>
          </Card>

          {analysis.recommendedPairings.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h4 className="font-medium mb-3">Recommended Food Pairings</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Foods that complement this recipe's nutritional profile:
                </p>
                <div className="flex gap-2 flex-wrap">
                  {analysis.recommendedPairings.map((pairing, index) => (
                    <Badge key={index} variant="outline">
                      {pairing}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="dietary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dietary Information</CardTitle>
            </CardHeader>
            <CardContent>
              {renderDietaryInfo(analysis.dietaryTags, analysis.allergens)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Nutrition Insights & Benefits</CardTitle>
              <CardDescription>AI-generated insights about this recipe's nutritional value</CardDescription>
            </CardHeader>
            <CardContent>
              {renderInsights(analysis.nutritionInsights, analysis.healthBenefits)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex gap-2">
        <Button onClick={() => onAnalysisComplete?.(analysis)}>
          Save Nutrition Analysis
        </Button>
        <Button variant="outline" onClick={analyzeNutrition}>
          Re-analyze
        </Button>
      </div>
    </div>
  )
}

export default AIAdvancedNutritionAnalyzer