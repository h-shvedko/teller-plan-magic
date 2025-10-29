import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { ChefProfile, MarketplaceRecipe, RecipeLicense, MarketplaceService, AffiliateProduct, SponsorshipInfo } from '@/lib/marketplaceFeatures'
import { 
  User, 
  Upload, 
  Star, 
  DollarSign, 
  Eye, 
  ShoppingCart, 
  TrendingUp,
  Award,
  Verified,
  Camera,
  Video,
  Tags,
  Clock,
  Users,
  ChefHat,
  BookOpen,
  Settings,
  BarChart3,
  FileText,
  Link,
  AlertCircle,
  CheckCircle,
  Plus,
  Edit,
  Trash2,
  Share2
} from 'lucide-react'

interface ChefPublishingPortalProps {
  currentUser?: any
  onRecipePublished?: (recipe: MarketplaceRecipe) => void
}

interface RecipeFormData {
  title: string
  description: string
  category: string
  cuisine: string
  difficulty: 'easy' | 'medium' | 'hard'
  prepTime: number
  cookTime: number
  servings: number
  ingredients: Array<{
    name: string
    amount: number
    unit: string
    category: string
    optional: boolean
  }>
  instructions: Array<{
    stepNumber: number
    instruction: string
    duration?: number
    temperature?: number
  }>
  tags: string[]
  pricing: {
    isFree: boolean
    price?: number
    subscriptionTier?: string
  }
  licensing: {
    type: string
    royaltyRate?: number
  }
}

export function ChefPublishingPortal({ currentUser, onRecipePublished }: ChefPublishingPortalProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('profile')
  const [chefProfile, setChefProfile] = useState<ChefProfile | null>(null)
  const [publishedRecipes, setPublishedRecipes] = useState<MarketplaceRecipe[]>([])
  const [affiliateProducts, setAffiliateProducts] = useState<AffiliateProduct[]>([])
  const [sponsorships, setSponsorships] = useState<SponsorshipInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [publishDialogOpen, setPublishDialogOpen] = useState(false)
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false)

  const [recipeForm, setRecipeForm] = useState<RecipeFormData>({
    title: '',
    description: '',
    category: '',
    cuisine: '',
    difficulty: 'medium',
    prepTime: 30,
    cookTime: 45,
    servings: 4,
    ingredients: [],
    instructions: [],
    tags: [],
    pricing: {
      isFree: true
    },
    licensing: {
      type: 'non-exclusive'
    }
  })

  const [profileForm, setProfileForm] = useState({
    displayName: '',
    bio: '',
    specialties: [] as string[],
    socialMedia: {
      instagram: '',
      youtube: '',
      website: ''
    }
  })

  const [verificationForm, setVerificationForm] = useState({
    credentials: [] as string[],
    portfolioUrls: [] as string[],
    experience: ''
  })

  useEffect(() => {
    loadChefData()
  }, [currentUser])

  const loadChefData = async () => {
    if (!currentUser) return
    
    setLoading(true)
    try {
      const profile = await MarketplaceService.getChefProfile(currentUser.id)
      const recipes = await MarketplaceService.getMarketplaceRecipes({ chefId: currentUser.id })
      const products = await MarketplaceService.getAffiliateProducts()
      
      setChefProfile(profile)
      setPublishedRecipes(recipes)
      setAffiliateProducts(products)
      
      if (profile) {
        setProfileForm({
          displayName: profile.displayName,
          bio: profile.bio,
          specialties: profile.specialties,
          socialMedia: profile.socialMedia
        })
      }
    } catch (error) {
      toast({
        title: "Error loading data",
        description: "Failed to load chef profile data",
        variant: "destructive"
      })
    }
    setLoading(false)
  }

  const handleCreateProfile = async () => {
    if (!currentUser) return
    
    try {
      const newProfile = await MarketplaceService.createChefProfile(currentUser.id, profileForm)
      setChefProfile(newProfile)
      toast({
        title: "Chef profile created!",
        description: "Your marketplace profile has been successfully created."
      })
    } catch (error) {
      toast({
        title: "Error creating profile",
        description: "Failed to create chef profile",
        variant: "destructive"
      })
    }
  }

  const handleUpdateProfile = async () => {
    if (!chefProfile) return
    
    try {
      const updatedProfile = await MarketplaceService.updateChefProfile(chefProfile.id, profileForm)
      if (updatedProfile) {
        setChefProfile(updatedProfile)
        toast({
          title: "Profile updated!",
          description: "Your chef profile has been successfully updated."
        })
      }
    } catch (error) {
      toast({
        title: "Error updating profile",
        description: "Failed to update chef profile",
        variant: "destructive"
      })
    }
  }

  const handleSubmitVerification = async () => {
    if (!chefProfile) return
    
    try {
      const result = await MarketplaceService.submitForVerification(chefProfile.id, verificationForm.credentials)
      if (result.success) {
        toast({
          title: "Verification submitted!",
          description: result.message
        })
        setVerificationDialogOpen(false)
      }
    } catch (error) {
      toast({
        title: "Error submitting verification",
        description: "Failed to submit verification request",
        variant: "destructive"
      })
    }
  }

  const handlePublishRecipe = async () => {
    if (!chefProfile) return
    
    try {
      const recipeData = {
        ...recipeForm,
        chefId: chefProfile.id,
        nutritionalInfo: {
          calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0,
          sodium: 0, cholesterol: 0, vitamins: {}, minerals: {}
        },
        images: [],
        licensing: {
          id: `license_${Date.now()}`,
          type: recipeForm.licensing.type as any,
          permissions: {
            canModify: false,
            canRedistribute: false,
            canCommercialUse: false,
            requiresAttribution: true
          },
          restrictions: [],
          territory: 'worldwide' as any,
          terms: 'Standard marketplace license'
        },
        affiliateProducts: []
      }
      
      const publishedRecipe = await MarketplaceService.publishRecipe(recipeData)
      setPublishedRecipes([...publishedRecipes, publishedRecipe])
      setPublishDialogOpen(false)
      
      // Reset form
      setRecipeForm({
        title: '',
        description: '',
        category: '',
        cuisine: '',
        difficulty: 'medium',
        prepTime: 30,
        cookTime: 45,
        servings: 4,
        ingredients: [],
        instructions: [],
        tags: [],
        pricing: { isFree: true },
        licensing: { type: 'non-exclusive' }
      })
      
      toast({
        title: "Recipe published!",
        description: "Your recipe has been successfully published to the marketplace."
      })
      
      onRecipePublished?.(publishedRecipe)
    } catch (error) {
      toast({
        title: "Error publishing recipe",
        description: "Failed to publish recipe",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            <span>Loading chef portal...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!chefProfile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ChefHat className="h-6 w-6" />
            <span>Create Chef Profile</span>
          </CardTitle>
          <CardDescription>
            Start publishing premium recipes and earn revenue from your culinary expertise.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="displayName">Chef Name</Label>
                <Input
                  id="displayName"
                  value={profileForm.displayName}
                  onChange={(e) => setProfileForm({...profileForm, displayName: e.target.value})}
                  placeholder="Your professional chef name"
                />
              </div>
              <div>
                <Label htmlFor="specialties">Specialties (comma-separated)</Label>
                <Input
                  id="specialties"
                  value={profileForm.specialties.join(', ')}
                  onChange={(e) => setProfileForm({...profileForm, specialties: e.target.value.split(',').map(s => s.trim())})}
                  placeholder="Italian, French, Pastry, etc."
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="bio">Biography</Label>
              <Textarea
                id="bio"
                value={profileForm.bio}
                onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                placeholder="Tell your culinary story..."
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  value={profileForm.socialMedia.instagram}
                  onChange={(e) => setProfileForm({...profileForm, socialMedia: {...profileForm.socialMedia, instagram: e.target.value}})}
                  placeholder="@username"
                />
              </div>
              <div>
                <Label htmlFor="youtube">YouTube</Label>
                <Input
                  id="youtube"
                  value={profileForm.socialMedia.youtube}
                  onChange={(e) => setProfileForm({...profileForm, socialMedia: {...profileForm.socialMedia, youtube: e.target.value}})}
                  placeholder="Channel name"
                />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={profileForm.socialMedia.website}
                  onChange={(e) => setProfileForm({...profileForm, socialMedia: {...profileForm.socialMedia, website: e.target.value}})}
                  placeholder="www.yoursite.com"
                />
              </div>
            </div>
          </div>
          
          <Button onClick={handleCreateProfile} className="w-full">
            <ChefHat className="mr-2 h-4 w-4" />
            Create Chef Profile
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Profile Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                <ChefHat className="h-10 w-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold flex items-center space-x-2">
                  <span>{chefProfile.displayName}</span>
                  {chefProfile.verification.isVerified && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <Verified className="mr-1 h-3 w-3" />
                      {chefProfile.verification.verificationLevel}
                    </Badge>
                  )}
                </h2>
                <p className="text-gray-600">{chefProfile.specialties.join(' • ')}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-sm text-gray-500">
                    {chefProfile.stats.recipesPublished} Recipes Published
                  </span>
                  <span className="text-sm text-gray-500">
                    {chefProfile.stats.averageRating.toFixed(1)} ⭐ Average Rating
                  </span>
                  <span className="text-sm text-gray-500">
                    ${chefProfile.revenue.totalEarnings.toLocaleString()} Total Earnings
                  </span>
                </div>
              </div>
            </div>
            
            {!chefProfile.verification.isVerified && (
              <Dialog open={verificationDialogOpen} onOpenChange={setVerificationDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Award className="mr-2 h-4 w-4" />
                    Get Verified
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Chef Verification</DialogTitle>
                    <DialogDescription>
                      Submit your credentials for professional verification to increase trust and sales.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Professional Credentials</Label>
                      <Textarea
                        placeholder="List your culinary education, certifications, awards, etc."
                        value={verificationForm.credentials.join('\n')}
                        onChange={(e) => setVerificationForm({...verificationForm, credentials: e.target.value.split('\n')})}
                      />
                    </div>
                    <div>
                      <Label>Years of Experience</Label>
                      <Input
                        placeholder="e.g., 15 years in fine dining restaurants"
                        value={verificationForm.experience}
                        onChange={(e) => setVerificationForm({...verificationForm, experience: e.target.value})}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleSubmitVerification}>Submit for Review</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="recipes" className="flex items-center space-x-1">
            <BookOpen className="h-4 w-4" />
            <span>Recipes</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-1">
            <BarChart3 className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="affiliate" className="flex items-center space-x-1">
            <Link className="h-4 w-4" />
            <span>Affiliate</span>
          </TabsTrigger>
          <TabsTrigger value="sponsorship" className="flex items-center space-x-1">
            <Star className="h-4 w-4" />
            <span>Sponsored</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center space-x-1">
            <Settings className="h-4 w-4" />
            <span>Profile</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recipes" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Published Recipes</h3>
            <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Publish Recipe
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Publish New Recipe</DialogTitle>
                  <DialogDescription>
                    Share your culinary creation with the marketplace community.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="recipeTitle">Recipe Title</Label>
                      <Input
                        id="recipeTitle"
                        value={recipeForm.title}
                        onChange={(e) => setRecipeForm({...recipeForm, title: e.target.value})}
                        placeholder="Enter recipe name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select value={recipeForm.category} onValueChange={(value) => setRecipeForm({...recipeForm, category: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="appetizer">Appetizer</SelectItem>
                          <SelectItem value="main-course">Main Course</SelectItem>
                          <SelectItem value="dessert">Dessert</SelectItem>
                          <SelectItem value="beverage">Beverage</SelectItem>
                          <SelectItem value="side-dish">Side Dish</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={recipeForm.description}
                      onChange={(e) => setRecipeForm({...recipeForm, description: e.target.value})}
                      placeholder="Describe your recipe..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="cuisine">Cuisine</Label>
                      <Select value={recipeForm.cuisine} onValueChange={(value) => setRecipeForm({...recipeForm, cuisine: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Cuisine" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="italian">Italian</SelectItem>
                          <SelectItem value="french">French</SelectItem>
                          <SelectItem value="mexican">Mexican</SelectItem>
                          <SelectItem value="asian">Asian</SelectItem>
                          <SelectItem value="american">American</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="difficulty">Difficulty</Label>
                      <Select value={recipeForm.difficulty} onValueChange={(value) => setRecipeForm({...recipeForm, difficulty: value as any})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="prepTime">Prep Time (min)</Label>
                      <Input
                        id="prepTime"
                        type="number"
                        value={recipeForm.prepTime}
                        onChange={(e) => setRecipeForm({...recipeForm, prepTime: parseInt(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="servings">Servings</Label>
                      <Input
                        id="servings"
                        type="number"
                        value={recipeForm.servings}
                        onChange={(e) => setRecipeForm({...recipeForm, servings: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Pricing</Label>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={!recipeForm.pricing.isFree}
                          onCheckedChange={(checked) => setRecipeForm({...recipeForm, pricing: {...recipeForm.pricing, isFree: !checked}})}
                        />
                        <Label>Premium Recipe</Label>
                      </div>
                      {!recipeForm.pricing.isFree && (
                        <div>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Price ($)"
                            value={recipeForm.pricing.price || ''}
                            onChange={(e) => setRecipeForm({...recipeForm, pricing: {...recipeForm.pricing, price: parseFloat(e.target.value)}})}
                            className="w-32"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      value={recipeForm.tags.join(', ')}
                      onChange={(e) => setRecipeForm({...recipeForm, tags: e.target.value.split(',').map(t => t.trim())})}
                      placeholder="healthy, quick, comfort-food"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handlePublishRecipe} disabled={!recipeForm.title || !recipeForm.category}>
                    Publish Recipe
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          {publishedRecipes.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold mb-2">No recipes published yet</h3>
                <p className="text-gray-600 mb-4">Start sharing your culinary creations with the community.</p>
                <Button onClick={() => setPublishDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Publish Your First Recipe
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {publishedRecipes.map((recipe) => (
                <Card key={recipe.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h4 className="font-semibold">{recipe.title}</h4>
                        <p className="text-sm text-gray-600">{recipe.description}</p>
                        <div className="flex items-center space-x-4">
                          <Badge variant="outline">{recipe.category}</Badge>
                          <Badge variant="outline">{recipe.cuisine}</Badge>
                          <span className="text-xs text-gray-500">
                            {recipe.stats.views} views • {recipe.stats.purchases} purchases
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold">
                          {recipe.pricing.isFree ? 'Free' : `$${recipe.pricing.price}`}
                        </div>
                        <div className="text-sm text-gray-500">
                          ⭐ {recipe.stats.averageRating.toFixed(1)} ({recipe.stats.ratings} ratings)
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold">${chefProfile.revenue.totalEarnings.toLocaleString()}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                    <p className="text-2xl font-bold">${chefProfile.revenue.monthlyEarnings.toLocaleString()}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Sales</p>
                    <p className="text-2xl font-bold">{chefProfile.stats.totalSales.toLocaleString()}</p>
                  </div>
                  <ShoppingCart className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Followers</p>
                    <p className="text-2xl font-bold">{chefProfile.stats.followerCount.toLocaleString()}</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Detailed analytics coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="affiliate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Affiliate Marketing</CardTitle>
              <CardDescription>
                Earn commissions by recommending kitchen tools and ingredients in your recipes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Commission Rate: 5-15%</AlertTitle>
                  <AlertDescription>
                    Earn commissions on all affiliate product sales generated from your recipes.
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">${chefProfile.revenue.commissionsEarned.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Total Commissions Earned</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{affiliateProducts.length}</p>
                        <p className="text-sm text-gray-600">Available Products</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold">Top Performing Products</h4>
                  {affiliateProducts.slice(0, 3).map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-200 rounded"></div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-600">{product.brand}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${product.pricing.price}</p>
                        <p className="text-sm text-gray-600">{product.commission.rate}% commission</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sponsorship" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sponsored Content</CardTitle>
              <CardDescription>
                Partner with brands to create sponsored recipe content and earn additional revenue.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <Star className="h-4 w-4" />
                <AlertTitle>Sponsorship Opportunities</AlertTitle>
                <AlertDescription>
                  Available for verified chefs with 10+ published recipes and strong engagement metrics.
                </AlertDescription>
              </Alert>
              
              {chefProfile.verification.isVerified && chefProfile.stats.recipesPublished >= 10 ? (
                <div className="mt-4 space-y-4">
                  <Button>
                    <Star className="mr-2 h-4 w-4" />
                    Apply for Brand Partnerships
                  </Button>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">Available Sponsors</h4>
                    <div className="grid gap-2">
                      {['Williams Sonoma', 'KitchenAid', 'Whole Foods'].map((sponsor) => (
                        <div key={sponsor} className="flex items-center justify-between p-3 border rounded">
                          <span>{sponsor}</span>
                          <Button variant="outline" size="sm">Apply</Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-4 text-center py-8">
                  <h4 className="font-semibold mb-2">Unlock Sponsorship Opportunities</h4>
                  <p className="text-gray-600 mb-4">
                    Complete verification and publish more recipes to access brand partnerships.
                  </p>
                  <div className="space-y-2">
                    <Progress value={(chefProfile.stats.recipesPublished / 10) * 100} className="w-64 mx-auto" />
                    <p className="text-sm text-gray-500">
                      {chefProfile.stats.recipesPublished}/10 recipes published
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="profileDisplayName">Display Name</Label>
                  <Input
                    id="profileDisplayName"
                    value={profileForm.displayName}
                    onChange={(e) => setProfileForm({...profileForm, displayName: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="profileSpecialties">Specialties</Label>
                  <Input
                    id="profileSpecialties"
                    value={profileForm.specialties.join(', ')}
                    onChange={(e) => setProfileForm({...profileForm, specialties: e.target.value.split(',').map(s => s.trim())})}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="profileBio">Biography</Label>
                <Textarea
                  id="profileBio"
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                  rows={4}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h4 className="font-semibold">Social Media</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="profileInstagram">Instagram</Label>
                    <Input
                      id="profileInstagram"
                      value={profileForm.socialMedia.instagram}
                      onChange={(e) => setProfileForm({...profileForm, socialMedia: {...profileForm.socialMedia, instagram: e.target.value}})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="profileYoutube">YouTube</Label>
                    <Input
                      id="profileYoutube"
                      value={profileForm.socialMedia.youtube}
                      onChange={(e) => setProfileForm({...profileForm, socialMedia: {...profileForm.socialMedia, youtube: e.target.value}})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="profileWebsite">Website</Label>
                    <Input
                      id="profileWebsite"
                      value={profileForm.socialMedia.website}
                      onChange={(e) => setProfileForm({...profileForm, socialMedia: {...profileForm.socialMedia, website: e.target.value}})}
                    />
                  </div>
                </div>
              </div>
              
              <Button onClick={handleUpdateProfile}>
                <Settings className="mr-2 h-4 w-4" />
                Update Profile
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}