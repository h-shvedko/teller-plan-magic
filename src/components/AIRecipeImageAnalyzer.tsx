import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Camera, Upload, Loader2, Eye, ChefHat, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { enhancedAI, type RecipeFromImage, type DetectedIngredient } from '@/lib/enhancedAI'

interface AIRecipeImageAnalyzerProps {
  onRecipeDetected?: (recipe: RecipeFromImage) => void
  onIngredientsDetected?: (ingredients: DetectedIngredient[]) => void
  className?: string
}

export const AIRecipeImageAnalyzer: React.FC<AIRecipeImageAnalyzerProps> = ({
  onRecipeDetected,
  onIngredientsDetected,
  className = ''
}) => {
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<RecipeFromImage | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    // Create image preview
    const imageUrl = URL.createObjectURL(file)
    setPreviewImage(imageUrl)
    
    setAnalyzing(true)
    setError(null)
    
    try {
      const analysis = await enhancedAI.analyzeRecipeImage(file)
      setResult(analysis)
      
      // Notify parent components
      onRecipeDetected?.(analysis)
      if (analysis.detectedIngredients.length > 0) {
        onIngredientsDetected?.(analysis.detectedIngredients)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze image')
    } finally {
      setAnalyzing(false)
    }
  }, [onRecipeDetected, onIngredientsDetected])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024 // 10MB
  })

  const takePhoto = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      const video = document.createElement('video')
      video.srcObject = stream
      video.play()

      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')!
      
      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0)
        
        canvas.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' })
            await onDrop([file])
          }
          stream.getTracks().forEach(track => track.stop())
        }, 'image/jpeg', 0.8)
      }
    } catch (err) {
      setError('Camera access denied or not available')
    }
  }

  const renderConfidenceBar = (confidence: number) => (
    <div className="flex items-center gap-2 text-sm">
      <span>Confidence:</span>
      <Progress value={confidence * 100} className="flex-1" />
      <span className="text-muted-foreground">{Math.round(confidence * 100)}%</span>
    </div>
  )

  const renderIngredientList = (ingredients: DetectedIngredient[]) => (
    <div className="space-y-3">
      <h4 className="font-medium flex items-center gap-2">
        <ChefHat className="h-4 w-4" />
        Detected Ingredients ({ingredients.length})
      </h4>
      <div className="grid gap-2">
        {ingredients.slice(0, 10).map((ingredient, index) => (
          <div key={index} className="flex items-center justify-between p-2 border rounded">
            <div>
              <span className="font-medium">{ingredient.name}</span>
              {ingredient.estimatedQuantity && (
                <span className="text-sm text-muted-foreground ml-2">
                  ({ingredient.estimatedQuantity})
                </span>
              )}
              {ingredient.preparation && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {ingredient.preparation}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Progress 
                value={ingredient.confidence * 100} 
                className="w-16 h-2" 
              />
              <span className="text-xs text-muted-foreground">
                {Math.round(ingredient.confidence * 100)}%
              </span>
            </div>
          </div>
        ))}
        {ingredients.length > 10 && (
          <p className="text-sm text-muted-foreground text-center">
            ... and {ingredients.length - 10} more ingredients
          </p>
        )}
      </div>
    </div>
  )

  const renderVisualAnalysis = (visual: any) => (
    <div className="space-y-3">
      <h4 className="font-medium flex items-center gap-2">
        <Eye className="h-4 w-4" />
        Visual Analysis
      </h4>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-medium">Presentation:</span>
          <p className="text-muted-foreground">{visual.presentation || 'Not detected'}</p>
        </div>
        <div>
          <span className="font-medium">Cooking Stage:</span>
          <p className="text-muted-foreground">{visual.cookingStage || 'Unknown'}</p>
        </div>
        <div>
          <span className="font-medium">Portion Size:</span>
          <p className="text-muted-foreground">{visual.portionSize || 'Not estimated'}</p>
        </div>
        <div>
          <span className="font-medium">Texture:</span>
          <p className="text-muted-foreground">{visual.texture || 'Not analyzed'}</p>
        </div>
      </div>
      {visual.colorProfile && visual.colorProfile.length > 0 && (
        <div>
          <span className="font-medium">Color Profile:</span>
          <div className="flex gap-1 mt-1">
            {visual.colorProfile.map((color: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                {color}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const renderEstimatedRecipe = (recipe: any) => (
    <div className="space-y-3">
      <h4 className="font-medium">Estimated Recipe</h4>
      <div>
        <h5 className="font-medium">{recipe.title}</h5>
        <p className="text-sm text-muted-foreground mt-1">{recipe.description}</p>
      </div>
      
      {recipe.cookingMethods && recipe.cookingMethods.length > 0 && (
        <div>
          <span className="font-medium">Cooking Methods:</span>
          <div className="flex gap-1 mt-1">
            {recipe.cookingMethods.map((method: string, index: number) => (
              <Badge key={index} variant="outline">
                {method}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {recipe.instructions && recipe.instructions.length > 0 && (
        <div>
          <span className="font-medium">Estimated Instructions:</span>
          <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
            {recipe.instructions.slice(0, 5).map((instruction: string, index: number) => (
              <li key={index} className="text-muted-foreground">
                {instruction}
              </li>
            ))}
            {recipe.instructions.length > 5 && (
              <li className="text-muted-foreground italic">
                ... {recipe.instructions.length - 5} more steps
              </li>
            )}
          </ol>
        </div>
      )}
    </div>
  )

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            AI Recipe Image Analyzer
          </CardTitle>
          <CardDescription>
            Upload a photo of food, ingredients, or a recipe to get AI-powered analysis and recipe suggestions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Image Upload Area */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}`}
          >
            <input {...getInputProps()} />
            {analyzing ? (
              <div className="space-y-2">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p>Analyzing image with AI...</p>
                <p className="text-sm text-muted-foreground">This may take a few moments</p>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                <div>
                  <p className="text-lg font-medium">
                    {isDragActive ? 'Drop the image here' : 'Drag & drop an image here'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    or click to browse (PNG, JPG, WebP up to 10MB)
                  </p>
                </div>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" size="sm">
                    Choose File
                  </Button>
                  <Button variant="outline" size="sm" onClick={takePhoto}>
                    <Camera className="h-4 w-4 mr-2" />
                    Take Photo
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Image Preview */}
          {previewImage && (
            <div className="text-center">
              <img
                src={previewImage}
                alt="Uploaded for analysis"
                className="max-h-64 mx-auto rounded-lg shadow-md"
              />
            </div>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {result && (
        <div className="space-y-4">
          {/* Overall Confidence */}
          <Card>
            <CardHeader>
              <CardTitle>Analysis Results</CardTitle>
              {renderConfidenceBar(result.confidenceScore)}
            </CardHeader>
          </Card>

          {/* Detected Ingredients */}
          {result.detectedIngredients.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                {renderIngredientList(result.detectedIngredients)}
              </CardContent>
            </Card>
          )}

          {/* Visual Analysis */}
          {result.visualElements && (
            <Card>
              <CardContent className="pt-6">
                {renderVisualAnalysis(result.visualElements)}
              </CardContent>
            </Card>
          )}

          {/* Estimated Recipe */}
          {result.estimatedRecipe && (
            <Card>
              <CardContent className="pt-6">
                {renderEstimatedRecipe(result.estimatedRecipe)}
              </CardContent>
            </Card>
          )}

          {/* Cooking Methods */}
          {result.cookingMethods.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h4 className="font-medium mb-3">Detected Cooking Methods</h4>
                <div className="flex flex-wrap gap-2">
                  {result.cookingMethods.map((method, index) => (
                    <Badge key={index} variant="secondary">
                      {method}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Dietary Information */}
          {result.dietaryInfo && Object.keys(result.dietaryInfo).length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h4 className="font-medium mb-3">Dietary Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {Object.entries(result.dietaryInfo).map(([key, value]) => (
                    <div key={key}>
                      <span className="font-medium capitalize">{key.replace('_', ' ')}:</span>
                      <p className="text-muted-foreground">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Suggestions */}
          {result.suggestions.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h4 className="font-medium mb-3">AI Suggestions</h4>
                <ul className="space-y-2">
                  {result.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span className="text-sm">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={() => result.estimatedRecipe && onRecipeDetected?.(result)}
              disabled={!result.estimatedRecipe}
            >
              Create Recipe from Analysis
            </Button>
            <Button
              variant="outline"
              onClick={() => onIngredientsDetected?.(result.detectedIngredients)}
              disabled={result.detectedIngredients.length === 0}
            >
              Add Ingredients to List
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setResult(null)
                setPreviewImage(null)
                setError(null)
              }}
            >
              Analyze Another Image
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AIRecipeImageAnalyzer