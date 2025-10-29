import React, { useState } from 'react'
import { FileText, Brain, Loader2, CheckCircle, AlertCircle, Copy, Download } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { enhancedAI, type ParsedRecipe } from '@/lib/enhancedAI'

interface NaturalLanguageRecipeParserProps {
  onRecipeParsed?: (recipe: ParsedRecipe) => void
  initialText?: string
  className?: string
}

export const NaturalLanguageRecipeParser: React.FC<NaturalLanguageRecipeParserProps> = ({
  onRecipeParsed,
  initialText = '',
  className = ''
}) => {
  const [inputText, setInputText] = useState(initialText)
  const [parsing, setParsing] = useState(false)
  const [parsedRecipe, setParsedRecipe] = useState<ParsedRecipe | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleParse = async () => {
    if (!inputText.trim()) {
      setError('Please enter some recipe text to parse')
      return
    }

    setParsing(true)
    setError(null)

    try {
      const result = await enhancedAI.parseNaturalLanguageRecipe(inputText)
      setParsedRecipe(result)
      onRecipeParsed?.(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse recipe')
    } finally {
      setParsing(false)
    }
  }

  const handleClear = () => {
    setInputText('')
    setParsedRecipe(null)
    setError(null)
  }

  const handleExampleLoad = (example: string) => {
    setInputText(example)
    setParsedRecipe(null)
    setError(null)
  }

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const downloadRecipe = () => {
    if (!parsedRecipe) return
    
    const recipeText = `${parsedRecipe.title}\n\n${parsedRecipe.description}\n\nIngredients:\n${parsedRecipe.ingredients.map(ing => `- ${ing.quantity} ${ing.unit} ${ing.name}`).join('\n')}\n\nInstructions:\n${parsedRecipe.instructions.map((inst, i) => `${i + 1}. ${inst.description}`).join('\n')}`
    
    const blob = new Blob([recipeText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${parsedRecipe.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const examples = [
    {
      title: "Blog Post Recipe",
      text: `My grandmother's chocolate chip cookies are the best! Here's how to make them:

You'll need 2 cups of flour, 1 cup butter (softened), 3/4 cup brown sugar, 1/2 cup white sugar, 2 large eggs, 1 tsp vanilla, 1 tsp baking soda, 1/2 tsp salt, and 2 cups chocolate chips.

First, cream the butter and sugars together until fluffy, about 3 minutes. Beat in eggs one at a time, then vanilla. In another bowl, whisk together flour, baking soda, and salt. Gradually mix dry ingredients into wet ingredients. Fold in chocolate chips.

Drop spoonfuls onto baking sheets lined with parchment. Bake at 375°F for 9-11 minutes until edges are golden. Let cool on pan for 5 minutes before transferring. Makes about 48 cookies. Prep time is 15 minutes, baking time about 25 minutes total.`
    },
    {
      title: "Social Media Recipe",
      text: `🍝 BEST PASTA EVER!! 🍝

Guys this is SO good and super easy!!!

What you need:
- 1 lb spaghetti 
- 4 cloves garlic minced
- 1/4 cup olive oil
- 1 can crushed tomatoes (28oz)
- fresh basil leaves
- parmesan cheese
- salt & pepper

Cook pasta al dente (like 8-10 mins). Meanwhile heat oil in big pan, add garlic for 30 seconds until fragrant. Add tomatoes, season with S&P, simmer 10 mins. Toss with pasta, top with basil and parm. AMAZING!! Serves 4-6 people. Takes maybe 20 mins total?`
    },
    {
      title: "Handwritten Recipe",
      text: `Mom's Apple Pie

Filling: 6-8 apples peeled and sliced, 1/2 c sugar, 2 tbsp flour, 1 tsp cinnamon, pinch nutmeg, 2 tbsp butter

Crust: 2 1/2 c flour, 1 tsp salt, 1 c shortening, 6-8 tbsp cold water

Mix filling ingredients. For crust - cut shortening into flour/salt until crumbly. Add water gradually. Roll out bottom crust, add filling, dot with butter. Top with second crust, seal edges. Cut vents. Bake 425° for 15 min then 350° for 35-40 min. Cool completely before serving.`
    }
  ]

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Natural Language Recipe Parser
          </CardTitle>
          <CardDescription>
            Paste any recipe text (blog posts, social media, handwritten notes) and AI will extract structured recipe data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Input Area */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Recipe Text</label>
            <Textarea
              placeholder="Paste your recipe text here... can be from blogs, social media, handwritten notes, or any unstructured format"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={10}
              className="min-h-[200px]"
            />
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>{inputText.length} characters</span>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={handleClear}>
                  Clear
                </Button>
              </div>
            </div>
          </div>

          {/* Example Recipes */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Try Example Recipes</label>
            <div className="flex gap-2 flex-wrap">
              {examples.map((example, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleExampleLoad(example.text)}
                >
                  {example.title}
                </Button>
              ))}
            </div>
          </div>

          {/* Parse Button */}
          <Button 
            onClick={handleParse}
            disabled={parsing || !inputText.trim()}
            className="w-full"
          >
            {parsing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Parsing Recipe with AI...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Parse Recipe
              </>
            )}
          </Button>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Parsed Results */}
      {parsedRecipe && (
        <div className="space-y-4">
          {/* Success Message & Confidence */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Recipe Successfully Parsed!</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={downloadRecipe}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span>Parsing Confidence:</span>
                  <Progress value={parsedRecipe.parsingConfidence * 100} className="flex-1 max-w-xs" />
                  <span className="text-muted-foreground">
                    {Math.round(parsedRecipe.parsingConfidence * 100)}%
                  </span>
                </div>
                
                {parsedRecipe.parsingConfidence < 0.8 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      Lower confidence detected. Please review the parsed data for accuracy.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recipe Details */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
              <TabsTrigger value="instructions">Instructions</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold mb-2">{parsedRecipe.title}</h3>
                      {parsedRecipe.description && (
                        <p className="text-muted-foreground">{parsedRecipe.description}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-lg font-semibold">{formatTime(parsedRecipe.prepTime)}</div>
                        <div className="text-sm text-muted-foreground">Prep Time</div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-lg font-semibold">{formatTime(parsedRecipe.cookTime)}</div>
                        <div className="text-sm text-muted-foreground">Cook Time</div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-lg font-semibold">{parsedRecipe.servings}</div>
                        <div className="text-sm text-muted-foreground">Servings</div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-lg font-semibold capitalize">{parsedRecipe.difficulty}</div>
                        <div className="text-sm text-muted-foreground">Difficulty</div>
                      </div>
                    </div>

                    {parsedRecipe.tags.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Tags</h4>
                        <div className="flex gap-2 flex-wrap">
                          {parsedRecipe.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ingredients" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Ingredients ({parsedRecipe.ingredients.length})
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(
                        parsedRecipe.ingredients.map(ing => `${ing.quantity} ${ing.unit} ${ing.name}`).join('\n')
                      )}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy List
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {parsedRecipe.ingredients.map((ingredient, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex-1">
                          <span className="font-medium">{ingredient.name}</span>
                          {ingredient.preparation && (
                            <span className="text-sm text-muted-foreground ml-2">
                              ({ingredient.preparation})
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="font-medium">
                            {ingredient.quantity} {ingredient.unit}
                          </span>
                          {ingredient.category && (
                            <div className="text-xs text-muted-foreground">
                              {ingredient.category}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="instructions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Instructions ({parsedRecipe.instructions.length} steps)
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(
                        parsedRecipe.instructions.map((inst, i) => `${i + 1}. ${inst.description}`).join('\n')
                      )}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Steps
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {parsedRecipe.instructions.map((instruction, index) => (
                      <div key={index} className="flex gap-4 p-3 border rounded">
                        <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                          {instruction.step}
                        </div>
                        <div className="flex-1">
                          <p>{instruction.description}</p>
                          {(instruction.duration || instruction.temperature) && (
                            <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                              {instruction.duration && (
                                <span>⏱️ {instruction.duration} min</span>
                              )}
                              {instruction.temperature && (
                                <span>🌡️ {instruction.temperature}</span>
                              )}
                            </div>
                          )}
                          {instruction.techniques && instruction.techniques.length > 0 && (
                            <div className="flex gap-1 mt-2">
                              {instruction.techniques.map((technique, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {technique}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Equipment */}
                {parsedRecipe.equipment.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Equipment Needed</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {parsedRecipe.equipment.map((item, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <span>•</span>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Extracted Data */}
                {parsedRecipe.extractedData && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Extracted Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {parsedRecipe.extractedData.temperatures.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Temperatures</h4>
                          <div className="flex gap-2 flex-wrap">
                            {parsedRecipe.extractedData.temperatures.map((temp, index) => (
                              <Badge key={index} variant="secondary">{temp}</Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {parsedRecipe.extractedData.timings.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Timings</h4>
                          <div className="flex gap-2 flex-wrap">
                            {parsedRecipe.extractedData.timings.map((timing, index) => (
                              <Badge key={index} variant="secondary">{timing}</Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {parsedRecipe.extractedData.techniques.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Cooking Techniques</h4>
                          <div className="flex gap-2 flex-wrap">
                            {parsedRecipe.extractedData.techniques.map((technique, index) => (
                              <Badge key={index} variant="outline">{technique}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Nutrition Estimate */}
              {parsedRecipe.nutritionEstimate && (
                <Card>
                  <CardHeader>
                    <CardTitle>Estimated Nutrition (per serving)</CardTitle>
                    <CardDescription>
                      AI-estimated values - actual nutrition may vary
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-lg font-semibold">{parsedRecipe.nutritionEstimate.calories}</div>
                        <div className="text-sm text-muted-foreground">Calories</div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-lg font-semibold">{parsedRecipe.nutritionEstimate.protein}g</div>
                        <div className="text-sm text-muted-foreground">Protein</div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-lg font-semibold">{parsedRecipe.nutritionEstimate.carbs}g</div>
                        <div className="text-sm text-muted-foreground">Carbs</div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-lg font-semibold">{parsedRecipe.nutritionEstimate.fat}g</div>
                        <div className="text-sm text-muted-foreground">Fat</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button onClick={() => onRecipeParsed?.(parsedRecipe)}>
              Create Recipe from Parsed Data
            </Button>
            <Button variant="outline" onClick={() => setParsedRecipe(null)}>
              Parse Another Recipe
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default NaturalLanguageRecipeParser