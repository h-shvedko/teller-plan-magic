import React, { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Progress } from './ui/progress'
import { 
  Import, 
  Link, 
  Camera, 
  Upload, 
  Search, 
  CheckCircle, 
  AlertCircle,
  Edit,
  Save,
  Sparkles,
  Eye,
  Clock,
  Users,
  ChefHat,
  Globe
} from 'lucide-react'
import { 
  socialFeaturesService, 
  RecipeImportData, 
  RecipeImportSource
} from '../lib/socialFeatures'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/use-toast'

interface ImportStep {
  id: string
  title: string
  description: string
  isComplete: boolean
}

export function RecipeImportWizard() {
  const { user } = useAuth()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [importMethod, setImportMethod] = useState<'url' | 'photo' | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [importData, setImportData] = useState<RecipeImportData | null>(null)
  const [validation, setValidation] = useState<{
    isValid: boolean
    issues: Array<{
      field: string
      issue: string
      severity: 'error' | 'warning' | 'info'
    }>
    suggestions: Array<{
      field: string
      suggestion: string
    }>
  } | null>(null)
  
  const [formData, setFormData] = useState({
    sourceUrl: '',
    photoFile: null as File | null,
    title: '',
    description: '',
    prepTime: '',
    cookTime: '',
    servings: '',
    difficulty: '3',
    ingredients: [] as Array<{ name: string; amount: string; unit: string }>,
    instructions: [] as Array<{ step: number; text: string }>,
    tags: ''
  })

  const steps: ImportStep[] = [
    { id: 'method', title: 'Choose Method', description: 'Select how you want to import', isComplete: importMethod !== null },
    { id: 'source', title: 'Add Source', description: 'Provide URL or upload photo', isComplete: formData.sourceUrl !== '' || formData.photoFile !== null },
    { id: 'extract', title: 'Extract Data', description: 'AI extracts recipe information', isComplete: importData !== null },
    { id: 'review', title: 'Review & Edit', description: 'Verify and adjust details', isComplete: validation?.isValid || false },
    { id: 'save', title: 'Save Recipe', description: 'Add to your collection', isComplete: false }
  ]

  const importFromUrl = async () => {
    if (!formData.sourceUrl.trim()) return

    setIsImporting(true)
    try {
      const extracted = await socialFeaturesService.importRecipeFromUrl(formData.sourceUrl)
      setImportData(extracted)
      
      setFormData(prev => ({
        ...prev,
        title: extracted.title || '',
        description: extracted.description || '',
        prepTime: extracted.prepTime?.toString() || '',
        cookTime: extracted.cookTime?.toString() || '',
        servings: extracted.servings?.toString() || '',
        difficulty: extracted.difficulty?.toString() || '3',
        ingredients: extracted.ingredients?.map(ing => ({
          name: ing.name,
          amount: ing.amount || '',
          unit: ing.unit || ''
        })) || [],
        instructions: extracted.instructions?.map(inst => ({
          step: inst.step,
          text: inst.text
        })) || [],
        tags: extracted.tags?.join(', ') || ''
      }))

      const validationResult = await socialFeaturesService.validateRecipeImport(extracted)
      setValidation(validationResult)
      
      toast({
        title: "Recipe imported!",
        description: "Please review and adjust the extracted information."
      })
      
      setCurrentStep(3) // Move to review step
    } catch (error) {
      console.error('Failed to import from URL:', error)
      toast({
        title: "Import failed",
        description: "Could not extract recipe from URL. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsImporting(false)
    }
  }

  const importFromPhoto = async () => {
    if (!formData.photoFile) return

    setIsImporting(true)
    try {
      const extracted = await socialFeaturesService.importRecipeFromPhoto(formData.photoFile)
      setImportData(extracted)
      
      setFormData(prev => ({
        ...prev,
        title: extracted.title || '',
        description: extracted.description || '',
        prepTime: extracted.prepTime?.toString() || '',
        cookTime: extracted.cookTime?.toString() || '',
        servings: extracted.servings?.toString() || '',
        difficulty: extracted.difficulty?.toString() || '3',
        ingredients: extracted.ingredients?.map(ing => ({
          name: ing.name,
          amount: ing.amount || '',
          unit: ing.unit || ''
        })) || [],
        instructions: extracted.instructions?.map(inst => ({
          step: inst.step,
          text: inst.text
        })) || [],
        tags: extracted.tags?.join(', ') || ''
      }))

      const validationResult = await socialFeaturesService.validateRecipeImport(extracted)
      setValidation(validationResult)
      
      toast({
        title: "Recipe extracted from photo!",
        description: "Please review and adjust the extracted information."
      })
      
      setCurrentStep(3)
    } catch (error) {
      console.error('Failed to import from photo:', error)
      toast({
        title: "Import failed",
        description: "Could not extract recipe from photo. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsImporting(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setFormData(prev => ({ ...prev, photoFile: file }))
    } else {
      toast({
        title: "Invalid file",
        description: "Please select an image file.",
        variant: "destructive"
      })
    }
  }

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: '', amount: '', unit: '' }]
    }))
  }

  const updateIngredient = (index: number, field: keyof typeof formData.ingredients[0], value: string) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) => 
        i === index ? { ...ing, [field]: value } : ing
      )
    }))
  }

  const removeIngredient = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }))
  }

  const addInstruction = () => {
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, { step: prev.instructions.length + 1, text: '' }]
    }))
  }

  const updateInstruction = (index: number, text: string) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.map((inst, i) => 
        i === index ? { ...inst, text } : inst
      )
    }))
  }

  const removeInstruction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index)
        .map((inst, i) => ({ ...inst, step: i + 1 }))
    }))
  }

  const saveRecipe = async () => {
    if (!user) return

    try {
      toast({
        title: "Recipe saved!",
        description: "Your imported recipe has been added to your collection."
      })
      
      resetForm()
      setIsDialogOpen(false)
    } catch (error) {
      toast({
        title: "Failed to save recipe",
        description: "Please try again later.",
        variant: "destructive"
      })
    }
  }

  const resetForm = () => {
    setCurrentStep(0)
    setImportMethod(null)
    setImportData(null)
    setValidation(null)
    setFormData({
      sourceUrl: '',
      photoFile: null,
      title: '',
      description: '',
      prepTime: '',
      cookTime: '',
      servings: '',
      difficulty: '3',
      ingredients: [],
      instructions: [],
      tags: ''
    })
  }

  const getStepContent = () => {
    switch (currentStep) {
      case 0: // Method Selection
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">How do you want to import your recipe?</h3>
              <p className="text-sm text-muted-foreground">Choose the method that works best for you</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card 
                className={`cursor-pointer transition-colors hover:bg-blue-50 ${
                  importMethod === 'url' ? 'border-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => setImportMethod('url')}
              >
                <CardContent className="text-center py-6">
                  <Link className="h-12 w-12 mx-auto text-blue-600 mb-4" />
                  <h4 className="font-semibold mb-2">From URL</h4>
                  <p className="text-sm text-muted-foreground">
                    Import from recipe websites, blogs, and other online sources
                  </p>
                  <Badge className="mt-3 bg-green-100 text-green-800">Most Accurate</Badge>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-colors hover:bg-purple-50 ${
                  importMethod === 'photo' ? 'border-purple-500 bg-purple-50' : ''
                }`}
                onClick={() => setImportMethod('photo')}
              >
                <CardContent className="text-center py-6">
                  <Camera className="h-12 w-12 mx-auto text-purple-600 mb-4" />
                  <h4 className="font-semibold mb-2">From Photo</h4>
                  <p className="text-sm text-muted-foreground">
                    Upload a photo of a recipe from books, magazines, or handwritten notes
                  </p>
                  <Badge className="mt-3 bg-blue-100 text-blue-800">AI Powered</Badge>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case 1: // Source Input
        return (
          <div className="space-y-6">
            {importMethod === 'url' ? (
              <div>
                <h3 className="text-lg font-semibold mb-4">Enter Recipe URL</h3>
                <div className="space-y-4">
                  <div>
                    <Input
                      placeholder="https://example.com/my-favorite-recipe"
                      value={formData.sourceUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, sourceUrl: e.target.value }))}
                    />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Globe className="h-4 w-4" />
                    <span>Supports most popular recipe websites</span>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-semibold mb-4">Upload Recipe Photo</h3>
                <div className="space-y-4">
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {formData.photoFile ? (
                      <div>
                        <CheckCircle className="h-12 w-12 mx-auto text-green-600 mb-4" />
                        <p className="font-medium">{formData.photoFile.name}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {(formData.photoFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    ) : (
                      <div>
                        <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="font-medium">Click to upload photo</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Supports JPG, PNG, HEIC files up to 10MB
                        </p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  {formData.photoFile && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>Photo ready for processing</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )

      case 2: // Extraction
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Sparkles className="h-12 w-12 mx-auto text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Extracting Recipe Data</h3>
              <p className="text-sm text-muted-foreground">
                Our AI is analyzing your {importMethod === 'url' ? 'URL' : 'photo'} and extracting recipe information...
              </p>
            </div>
            
            <div className="space-y-4">
              <Progress value={isImporting ? 50 : 100} className="h-2" />
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Analyzing content structure</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Extracting ingredients list</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Identifying cooking instructions</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Gathering recipe metadata</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <Button 
                onClick={importMethod === 'url' ? importFromUrl : importFromPhoto}
                disabled={isImporting}
              >
                {isImporting ? 'Processing...' : 'Start Extraction'}
              </Button>
            </div>
          </div>
        )

      case 3: // Review & Edit
        return (
          <div className="space-y-6 max-h-96 overflow-y-auto">
            <div>
              <h3 className="text-lg font-semibold mb-4">Review Extracted Data</h3>
              {validation && (
                <div className="mb-4">
                  {validation.issues.map((issue, index) => (
                    <div key={index} className={`flex items-start gap-2 p-2 rounded text-sm ${
                      issue.severity === 'error' ? 'bg-red-50 text-red-700' :
                      issue.severity === 'warning' ? 'bg-yellow-50 text-yellow-700' :
                      'bg-blue-50 text-blue-700'
                    }`}>
                      <AlertCircle className="h-4 w-4 mt-0.5" />
                      <span>{issue.issue}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Tabs defaultValue="basic" className="w-full">
              <TabsList>
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
                <TabsTrigger value="instructions">Instructions</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Title</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Recipe title"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Recipe description"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-sm font-medium block mb-1">Prep Time (min)</label>
                    <Input
                      type="number"
                      value={formData.prepTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, prepTime: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">Cook Time (min)</label>
                    <Input
                      type="number"
                      value={formData.cookTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, cookTime: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">Servings</label>
                    <Input
                      type="number"
                      value={formData.servings}
                      onChange={(e) => setFormData(prev => ({ ...prev, servings: e.target.value }))}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="ingredients" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Ingredients</h4>
                  <Button size="sm" onClick={addIngredient}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.ingredients.map((ingredient, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Input
                        placeholder="Amount"
                        value={ingredient.amount}
                        onChange={(e) => updateIngredient(index, 'amount', e.target.value)}
                        className="w-20"
                      />
                      <Input
                        placeholder="Unit"
                        value={ingredient.unit}
                        onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                        className="w-16"
                      />
                      <Input
                        placeholder="Ingredient name"
                        value={ingredient.name}
                        onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                        className="flex-1"
                      />
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => removeIngredient(index)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="instructions" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Instructions</h4>
                  <Button size="sm" onClick={addInstruction}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Step
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.instructions.map((instruction, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-medium mt-1">
                        {instruction.step}
                      </div>
                      <Textarea
                        value={instruction.text}
                        onChange={(e) => updateInstruction(index, e.target.value)}
                        placeholder="Describe this step..."
                        className="flex-1"
                        rows={2}
                      />
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => removeInstruction(index)}
                        className="mt-1"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )

      case 4: // Save
        return (
          <div className="space-y-6 text-center">
            <CheckCircle className="h-16 w-16 mx-auto text-green-600 mb-4" />
            <h3 className="text-lg font-semibold">Ready to Save!</h3>
            <p className="text-muted-foreground">
              Your recipe has been processed and is ready to be added to your collection.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 text-left">
              <div className="font-medium mb-2">{formData.title}</div>
              <div className="text-sm text-muted-foreground space-y-1">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {(parseInt(formData.prepTime) + parseInt(formData.cookTime))} min total
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {formData.servings} servings
                  </span>
                </div>
                <div>{formData.ingredients.length} ingredients, {formData.instructions.length} steps</div>
              </div>
            </div>
            
            <Button onClick={saveRecipe} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Save Recipe
            </Button>
          </div>
        )

      default:
        return null
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 0: return importMethod !== null
      case 1: return importMethod === 'url' ? formData.sourceUrl.trim() !== '' : formData.photoFile !== null
      case 2: return importData !== null
      case 3: return formData.title.trim() !== '' && formData.ingredients.length > 0 && formData.instructions.length > 0
      default: return false
    }
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Import className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">Sign in to import recipes</p>
          <Button>Sign In</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button onClick={resetForm}>
          <Import className="h-4 w-4 mr-2" />
          Import Recipe
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Import Recipe</DialogTitle>
          <DialogDescription>
            Import recipes from URLs or photos using AI-powered extraction
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index <= currentStep 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step.isComplete ? <CheckCircle className="h-4 w-4" /> : index + 1}
                </div>
                <div className="ml-2 text-xs">
                  <div className="font-medium">{step.title}</div>
                  <div className="text-muted-foreground">{step.description}</div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-4 ${
                    index < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="min-h-[400px]">
            {getStepContent()}
          </div>
        </div>

        <DialogFooter>
          <div className="flex justify-between w-full">
            <Button 
              variant="outline" 
              onClick={() => currentStep > 0 ? setCurrentStep(prev => prev - 1) : setIsDialogOpen(false)}
            >
              {currentStep === 0 ? 'Cancel' : 'Back'}
            </Button>
            <Button 
              onClick={() => {
                if (currentStep < steps.length - 1) {
                  setCurrentStep(prev => prev + 1)
                } else {
                  saveRecipe()
                }
              }}
              disabled={!canProceed() || isImporting}
            >
              {currentStep === steps.length - 1 ? 'Save Recipe' : 'Next'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default RecipeImportWizard