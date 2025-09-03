import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { 
  BookOpen, 
  Plus, 
  Star, 
  Users, 
  Search,
  Filter,
  Heart,
  Bookmark,
  Eye,
  Crown,
  TrendingUp,
  Calendar,
  Tag,
  Globe,
  Lock
} from 'lucide-react'
import { 
  socialFeaturesService, 
  CommunityCollection
} from '../lib/socialFeatures'
import { Recipe } from '../integrations/supabase/types'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/use-toast'

interface CommunityRecipeCollectionsProps {
  recipes?: Recipe[]
}

const COLLECTION_CATEGORIES = [
  'All',
  'Beginner Friendly',
  'Quick & Easy',
  'Healthy',
  'Comfort Food',
  'International',
  'Desserts',
  'Vegetarian',
  'Holiday',
  'Meal Prep'
]

export function CommunityRecipeCollections({ recipes = [] }: CommunityRecipeCollectionsProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [collections, setCollections] = useState<CommunityCollection[]>([])
  const [featuredCollections, setFeaturedCollections] = useState<CommunityCollection[]>([])
  const [subscribedCollections, setSubscribedCollections] = useState<CommunityCollection[]>([])
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [newCollection, setNewCollection] = useState({
    name: '',
    description: '',
    category: 'Quick & Easy',
    tags: '',
    isPublic: true,
    selectedRecipes: [] as string[]
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadCollections()
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    filterCollections()
  }, [searchQuery, selectedCategory, collections]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadCollections = async () => {
    setIsLoading(true)
    try {
      const [featured, subscribed] = await Promise.all([
        socialFeaturesService.getFeaturedCollections(),
        user ? socialFeaturesService.getSubscribedCollections(user.id) : Promise.resolve([])
      ])

      const allCollections = await socialFeaturesService.searchCollections('', selectedCategory !== 'All' ? selectedCategory : undefined)
      
      setFeaturedCollections(featured)
      setSubscribedCollections(subscribed)
      setCollections(allCollections)
    } catch (error) {
      console.error('Failed to load collections:', error)
      
      setFeaturedCollections([
        {
          id: 'featured1',
          name: 'Quick Weeknight Dinners',
          description: 'Delicious meals you can make in 30 minutes or less',
          curatedBy: 'chef_maria',
          category: 'Quick & Easy',
          tags: ['quick', 'easy', 'dinner', 'weeknight'],
          recipes: ['recipe1', 'recipe2', 'recipe3'],
          isPublic: true,
          isFeatured: true,
          subscribers: 1247,
          rating: 4.8,
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-20')
        },
        {
          id: 'featured2',
          name: 'Healthy Meal Prep',
          description: 'Nutritious recipes perfect for weekly meal preparation',
          curatedBy: 'nutritionist_jane',
          category: 'Healthy',
          tags: ['healthy', 'meal-prep', 'nutrition', 'batch-cooking'],
          recipes: ['recipe4', 'recipe5', 'recipe6'],
          isPublic: true,
          isFeatured: true,
          subscribers: 892,
          rating: 4.6,
          createdAt: new Date('2024-01-10'),
          updatedAt: new Date('2024-01-18')
        }
      ])
      
      setCollections([
        {
          id: 'collection1',
          name: 'Italian Classics',
          description: 'Traditional Italian recipes passed down through generations',
          curatedBy: 'user123',
          category: 'International',
          tags: ['italian', 'traditional', 'pasta', 'authentic'],
          recipes: ['recipe7', 'recipe8'],
          isPublic: true,
          isFeatured: false,
          subscribers: 324,
          rating: 4.4,
          createdAt: new Date('2024-01-05'),
          updatedAt: new Date('2024-01-12')
        },
        {
          id: 'collection2',
          name: 'Comfort Food Favorites',
          description: 'Soul-warming dishes for cozy evenings',
          curatedBy: 'user456',
          category: 'Comfort Food',
          tags: ['comfort', 'cozy', 'warming', 'hearty'],
          recipes: ['recipe9', 'recipe10'],
          isPublic: true,
          isFeatured: false,
          subscribers: 156,
          rating: 4.2,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-08')
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const filterCollections = async () => {
    if (searchQuery || selectedCategory !== 'All') {
      try {
        const filtered = await socialFeaturesService.searchCollections(
          searchQuery,
          selectedCategory !== 'All' ? selectedCategory : undefined
        )
        setCollections(filtered)
      } catch (error) {
        console.error('Failed to filter collections:', error)
      }
    }
  }

  const createCollection = async () => {
    if (!user || !newCollection.name.trim()) return

    try {
      const collectionData = {
        name: newCollection.name.trim(),
        description: newCollection.description.trim(),
        category: newCollection.category,
        tags: newCollection.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        recipes: newCollection.selectedRecipes,
        isPublic: newCollection.isPublic,
        isFeatured: false
      }

      await socialFeaturesService.createCommunityCollection(user.id, collectionData)
      
      setCreateDialogOpen(false)
      resetNewCollection()
      await loadCollections()
      
      toast({
        title: "Collection created!",
        description: "Your recipe collection has been created successfully."
      })
    } catch (error) {
      console.error('Failed to create collection:', error)
      toast({
        title: "Failed to create collection",
        description: "Please try again later.",
        variant: "destructive"
      })
    }
  }

  const resetNewCollection = () => {
    setNewCollection({
      name: '',
      description: '',
      category: 'Quick & Easy',
      tags: '',
      isPublic: true,
      selectedRecipes: []
    })
  }

  const subscribeToCollection = async (collectionId: string) => {
    if (!user) return

    try {
      await socialFeaturesService.subscribeToCollection(user.id, collectionId)
      await loadCollections()
      
      toast({
        title: "Subscribed!",
        description: "You'll get notified when new recipes are added."
      })
    } catch (error) {
      toast({
        title: "Failed to subscribe",
        description: "Please try again later.",
        variant: "destructive"
      })
    }
  }

  const toggleRecipeSelection = (recipeId: string) => {
    setNewCollection(prev => ({
      ...prev,
      selectedRecipes: prev.selectedRecipes.includes(recipeId)
        ? prev.selectedRecipes.filter(id => id !== recipeId)
        : [...prev.selectedRecipes, recipeId]
    }))
  }

  const renderCollectionCard = (collection: CommunityCollection, showSubscribeButton = true) => (
    <Card key={collection.id} className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-lg">{collection.name}</CardTitle>
              {collection.isFeatured && <Crown className="h-4 w-4 text-yellow-500" />}
            </div>
            <CardDescription className="line-clamp-2">{collection.description}</CardDescription>
          </div>
          {collection.isPublic ? (
            <Globe className="h-4 w-4 text-green-500" />
          ) : (
            <Lock className="h-4 w-4 text-gray-500" />
          )}
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Avatar className="h-5 w-5">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${collection.curatedBy}`} />
              <AvatarFallback className="text-xs">{collection.curatedBy.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span>by {collection.curatedBy}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span>{collection.rating}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>{collection.subscribers}</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            <span>{collection.recipes.length} recipes</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{collection.category}</Badge>
            {collection.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {collection.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{collection.tags.length - 3} more
              </Badge>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              Updated {collection.updatedAt.toLocaleDateString()}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Eye className="h-3 w-3 mr-1" />
                View
              </Button>
              {showSubscribeButton && user && (
                <Button 
                  size="sm" 
                  onClick={() => subscribeToCollection(collection.id)}
                  disabled={subscribedCollections.some(sub => sub.id === collection.id)}
                >
                  <Heart className="h-3 w-3 mr-1" />
                  {subscribedCollections.some(sub => sub.id === collection.id) ? 'Subscribed' : 'Subscribe'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Community Recipe Collections
              </CardTitle>
              <CardDescription>
                Discover curated recipe collections from the community
              </CardDescription>
            </div>
            {user && (
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Collection
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create Recipe Collection</DialogTitle>
                    <DialogDescription>
                      Curate a collection of your favorite recipes to share with the community
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Collection Name</label>
                      <Input
                        placeholder="e.g., 'Quick Weeknight Dinners'"
                        value={newCollection.name}
                        onChange={(e) => setNewCollection(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Description</label>
                      <Textarea
                        placeholder="Describe what makes this collection special..."
                        value={newCollection.description}
                        onChange={(e) => setNewCollection(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Category</label>
                        <select
                          value={newCollection.category}
                          onChange={(e) => setNewCollection(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                          {COLLECTION_CATEGORIES.filter(cat => cat !== 'All').map(category => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Tags (comma separated)</label>
                        <Input
                          placeholder="quick, easy, healthy"
                          value={newCollection.tags}
                          onChange={(e) => setNewCollection(prev => ({ ...prev, tags: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Select Recipes</label>
                      <div className="max-h-40 overflow-y-auto border rounded-md p-3">
                        {recipes.length > 0 ? recipes.map(recipe => (
                          <div key={recipe.id} className="flex items-center gap-2 p-2">
                            <input
                              type="checkbox"
                              checked={newCollection.selectedRecipes.includes(recipe.id)}
                              onChange={() => toggleRecipeSelection(recipe.id)}
                            />
                            <span className="text-sm">{recipe.title}</span>
                          </div>
                        )) : (
                          <p className="text-sm text-muted-foreground">No recipes available</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newCollection.isPublic}
                        onChange={(e) => setNewCollection(prev => ({ ...prev, isPublic: e.target.checked }))}
                      />
                      <span className="text-sm">Make this collection public</span>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={createCollection} 
                      disabled={!newCollection.name.trim() || newCollection.selectedRecipes.length === 0}
                    >
                      Create Collection
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search collections..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                {COLLECTION_CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <Tabs defaultValue="featured" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="featured">Featured</TabsTrigger>
                <TabsTrigger value="all">All Collections</TabsTrigger>
                <TabsTrigger value="subscribed">My Subscriptions</TabsTrigger>
              </TabsList>

              <TabsContent value="featured" className="space-y-4">
                {featuredCollections.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {featuredCollections.map(collection => renderCollectionCard(collection))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Crown className="h-12 w-12 mx-auto mb-4" />
                    <p>No featured collections available</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="all" className="space-y-4">
                {collections.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {collections.map(collection => renderCollectionCard(collection))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-4" />
                    <p>No collections found</p>
                    {user && (
                      <Button 
                        variant="outline" 
                        className="mt-2"
                        onClick={() => setCreateDialogOpen(true)}
                      >
                        Create First Collection
                      </Button>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="subscribed" className="space-y-4">
                {user ? (
                  subscribedCollections.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {subscribedCollections.map(collection => renderCollectionCard(collection, false))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Bookmark className="h-12 w-12 mx-auto mb-4" />
                      <p>No subscriptions yet</p>
                      <p className="text-xs mt-1">Subscribe to collections to see them here</p>
                    </div>
                  )
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Sign in to view your subscriptions</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default CommunityRecipeCollections