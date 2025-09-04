import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Star, ChefHat, Clock, Users, DollarSign, Crown, Play, BookOpen, Award, Heart, ShoppingCart } from 'lucide-react';
import { PremiumFeaturesService, PremiumRecipeCollection, CelebrityChef } from '../lib/premiumFeatures';

const PremiumRecipeCollections: React.FC = () => {
  const [collections, setCollections] = useState<PremiumRecipeCollection[]>([]);
  const [chefs, setChefs] = useState<CelebrityChef[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<PremiumRecipeCollection | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChef, setSelectedChef] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [sortBy, setSortBy] = useState('popularity');
  const [isLoading, setIsLoading] = useState(true);

  const service = new PremiumFeaturesService();

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    setIsLoading(true);
    try {
      const [collectionsData, chefsData] = await Promise.all([
        service.getPremiumRecipeCollections(),
        service.getCelebrityChefs()
      ]);
      setCollections(collectionsData);
      setChefs(chefsData);
    } catch (error) {
      console.error('Failed to load premium collections:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAndSortedCollections = collections
    .filter(collection => {
      const matchesSearch = collection.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        collection.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        collection.chef.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesChef = selectedChef === 'all' || collection.chef.id === selectedChef;
      const matchesDifficulty = selectedDifficulty === 'all' || collection.difficulty === selectedDifficulty;
      
      return matchesSearch && matchesChef && matchesDifficulty;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popularity':
          return b.popularity - a.popularity;
        case 'rating':
          return b.userRating - a.userRating;
        case 'price':
          return a.price - b.price;
        case 'newest':
          return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
        default:
          return 0;
      }
    });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading premium collections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Crown className="h-8 w-8 text-yellow-500" />
          Premium Recipe Collections
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Learn from world-renowned celebrity chefs with exclusive recipe collections, 
          masterclasses, and behind-the-scenes techniques.
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Input
              placeholder="Search collections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="lg:col-span-2"
            />
            <Select value={selectedChef} onValueChange={setSelectedChef}>
              <SelectTrigger>
                <SelectValue placeholder="All Chefs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Chefs</SelectItem>
                {chefs.map((chef) => (
                  <SelectItem key={chef.id} value={chef.id}>{chef.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
                <SelectItem value="Expert">Expert</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popularity">Most Popular</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="price">Price: Low to High</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Celebrity Chefs Spotlight */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Meet Our Celebrity Chefs</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {chefs.map((chef) => (
            <Card key={chef.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <ChefHat className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold flex items-center gap-2">
                      {chef.name}
                      {chef.verified && <Badge variant="default" className="text-xs">Verified</Badge>}
                    </h3>
                    <p className="text-sm text-muted-foreground">{chef.specialty}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{chef.bio}</p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{chef.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{chef.totalRecipes} recipes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    <span>{(chef.followers / 1000000).toFixed(1)}M</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recipe Collections */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Premium Collections</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedCollections.map((collection) => (
            <Card key={collection.id} className="hover:shadow-lg transition-shadow overflow-hidden">
              <div className="relative">
                <div className="aspect-video bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                  <ChefHat className="h-16 w-16 text-orange-600" />
                </div>
                {collection.isExclusive && (
                  <Badge className="absolute top-2 left-2 bg-yellow-500 text-black">
                    <Crown className="h-3 w-3 mr-1" />
                    Exclusive
                  </Badge>
                )}
                {collection.originalPrice > collection.price && (
                  <Badge variant="destructive" className="absolute top-2 right-2">
                    {Math.round(((collection.originalPrice - collection.price) / collection.originalPrice) * 100)}% OFF
                  </Badge>
                )}
              </div>
              
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Collection Info */}
                  <div>
                    <h3 className="font-bold text-lg mb-1">{collection.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {collection.description}
                    </p>
                  </div>

                  {/* Chef */}
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <ChefHat className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{collection.chef.name}</p>
                      <p className="text-xs text-muted-foreground">{collection.chef.specialty}</p>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{collection.totalTime} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{collection.servings} servings</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{collection.userRating} ({collection.totalRatings.toLocaleString()})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Award className="h-4 w-4 text-muted-foreground" />
                      <span>{collection.difficulty}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {collection.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Pricing */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-primary">
                        ${collection.price}
                      </span>
                      {collection.originalPrice > collection.price && (
                        <span className="text-sm text-muted-foreground line-through">
                          ${collection.originalPrice}
                        </span>
                      )}
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button onClick={() => setSelectedCollection(collection)}>
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        {selectedCollection && (
                          <>
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                {selectedCollection.isExclusive && (
                                  <Crown className="h-5 w-5 text-yellow-500" />
                                )}
                                {selectedCollection.title}
                              </DialogTitle>
                              <DialogDescription>
                                {selectedCollection.description}
                              </DialogDescription>
                            </DialogHeader>
                            
                            <Tabs defaultValue="overview" className="w-full">
                              <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="chef">Chef Info</TabsTrigger>
                                <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
                                <TabsTrigger value="bonuses">Bonuses</TabsTrigger>
                              </TabsList>
                              
                              <TabsContent value="overview" className="space-y-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  <div className="text-center">
                                    <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
                                    <div className="text-2xl font-bold">{selectedCollection.totalTime}</div>
                                    <div className="text-sm text-muted-foreground">minutes</div>
                                  </div>
                                  <div className="text-center">
                                    <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                                    <div className="text-2xl font-bold">{selectedCollection.servings}</div>
                                    <div className="text-sm text-muted-foreground">servings</div>
                                  </div>
                                  <div className="text-center">
                                    <Award className="h-8 w-8 mx-auto mb-2 text-primary" />
                                    <div className="text-2xl font-bold">{selectedCollection.difficulty}</div>
                                    <div className="text-sm text-muted-foreground">level</div>
                                  </div>
                                  <div className="text-center">
                                    <Star className="h-8 w-8 mx-auto mb-2 fill-yellow-400 text-yellow-400" />
                                    <div className="text-2xl font-bold">{selectedCollection.userRating}</div>
                                    <div className="text-sm text-muted-foreground">rating</div>
                                  </div>
                                </div>
                                
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="font-medium mb-2">What You'll Learn:</h4>
                                    <div className="flex flex-wrap gap-2">
                                      {selectedCollection.tags.map((tag) => (
                                        <Badge key={tag} variant="outline">{tag}</Badge>
                                      ))}
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h4 className="font-medium mb-2">Nutritional Highlights:</h4>
                                    <div className="flex flex-wrap gap-2">
                                      {selectedCollection.nutritionalHighlights.map((highlight) => (
                                        <Badge key={highlight} className="bg-green-100 text-green-800">
                                          {highlight}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h4 className="font-medium mb-2">Dietary Options:</h4>
                                    <div className="flex flex-wrap gap-2">
                                      {selectedCollection.dietaryRestrictions.map((diet) => (
                                        <Badge key={diet} className="bg-blue-100 text-blue-800">
                                          {diet}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </TabsContent>
                              
                              <TabsContent value="chef" className="space-y-4">
                                <div className="flex items-center space-x-4 mb-4">
                                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                    <ChefHat className="h-8 w-8 text-primary" />
                                  </div>
                                  <div>
                                    <h3 className="text-xl font-bold flex items-center gap-2">
                                      {selectedCollection.chef.name}
                                      {selectedCollection.chef.verified && (
                                        <Badge variant="default">Verified</Badge>
                                      )}
                                    </h3>
                                    <p className="text-muted-foreground">{selectedCollection.chef.specialty}</p>
                                  </div>
                                </div>
                                
                                <p className="text-sm text-muted-foreground">
                                  {selectedCollection.chef.bio}
                                </p>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  <div className="text-center">
                                    <div className="text-2xl font-bold">{selectedCollection.chef.rating}</div>
                                    <div className="text-sm text-muted-foreground">Chef Rating</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-2xl font-bold">{selectedCollection.chef.totalRecipes}</div>
                                    <div className="text-sm text-muted-foreground">Total Recipes</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-2xl font-bold">
                                      {(selectedCollection.chef.followers / 1000000).toFixed(1)}M
                                    </div>
                                    <div className="text-sm text-muted-foreground">Followers</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-2xl font-bold">{selectedCollection.chef.achievements.length}</div>
                                    <div className="text-sm text-muted-foreground">Awards</div>
                                  </div>
                                </div>
                                
                                <div>
                                  <h4 className="font-medium mb-2">Achievements:</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {selectedCollection.chef.achievements.map((achievement) => (
                                      <Badge key={achievement} variant="outline">
                                        <Award className="h-3 w-3 mr-1" />
                                        {achievement}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </TabsContent>
                              
                              <TabsContent value="nutrition" className="space-y-4">
                                <div className="text-center">
                                  <h4 className="text-lg font-medium mb-4">Nutritional Focus</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {selectedCollection.nutritionalHighlights.map((highlight) => (
                                      <Card key={highlight}>
                                        <CardContent className="p-4 text-center">
                                          <div className="w-12 h-12 rounded-full bg-green-100 mx-auto mb-3 flex items-center justify-center">
                                            <Award className="h-6 w-6 text-green-600" />
                                          </div>
                                          <h5 className="font-medium text-sm">{highlight}</h5>
                                        </CardContent>
                                      </Card>
                                    ))}
                                  </div>
                                </div>
                                
                                <div className="bg-muted rounded-lg p-4">
                                  <h5 className="font-medium mb-2">Dietary Accommodations:</h5>
                                  <div className="flex flex-wrap gap-2">
                                    {selectedCollection.dietaryRestrictions.map((diet) => (
                                      <Badge key={diet} className="bg-blue-100 text-blue-800">
                                        {diet}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </TabsContent>
                              
                              <TabsContent value="bonuses" className="space-y-4">
                                <h4 className="text-lg font-medium mb-4">Included Bonuses</h4>
                                <div className="space-y-3">
                                  {selectedCollection.includedBonuses.map((bonus, index) => (
                                    <div key={bonus} className="flex items-center space-x-3 p-3 border rounded-lg">
                                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        {index === 0 && <Play className="h-5 w-5 text-primary" />}
                                        {index === 1 && <BookOpen className="h-5 w-5 text-primary" />}
                                        {index === 2 && <Award className="h-5 w-5 text-primary" />}
                                      </div>
                                      <div>
                                        <h5 className="font-medium">{bonus}</h5>
                                        <p className="text-sm text-muted-foreground">
                                          Exclusive premium content included with purchase
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </TabsContent>
                            </Tabs>
                            
                            <DialogFooter className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="text-2xl font-bold text-primary">
                                  ${selectedCollection.price}
                                </span>
                                {selectedCollection.originalPrice > selectedCollection.price && (
                                  <span className="text-lg text-muted-foreground line-through">
                                    ${selectedCollection.originalPrice}
                                  </span>
                                )}
                              </div>
                              <Button className="gap-2">
                                <ShoppingCart className="h-4 w-4" />
                                Purchase Collection
                              </Button>
                            </DialogFooter>
                          </>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Results Summary */}
      <div className="text-center text-sm text-muted-foreground">
        Showing {filteredAndSortedCollections.length} of {collections.length} premium collections
      </div>
    </div>
  );
};

export default PremiumRecipeCollections;