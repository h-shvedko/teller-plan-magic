import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Leaf, 
  Sun, 
  TreePine, 
  Snowflake, 
  Apple, 
  ShoppingCart,
  Clock,
  TrendingUp
} from 'lucide-react';
import { 
  getCurrentSeason, 
  getSeasonalIngredients, 
  SeasonalIngredient,
  SEASONAL_INGREDIENTS 
} from '@/lib/mealPlanTemplates';

interface SeasonalMealPlanningProps {
  onSeasonalPlanCreate: (seasonalData: SeasonalPlanData) => void;
}

interface SeasonalPlanData {
  season: 'spring' | 'summer' | 'fall' | 'winter';
  featured_ingredients: string[];
  meal_focus: string;
  suggested_recipes: SeasonalRecipeSuggestion[];
  budget_tips: string[];
  storage_tips: string[];
}

interface SeasonalRecipeSuggestion {
  name: string;
  season_ingredients: string[];
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  prep_time: number;
  difficulty: 'easy' | 'medium' | 'hard';
  serves: number;
  description: string;
}

const SEASONAL_RECIPES: Record<string, SeasonalRecipeSuggestion[]> = {
  spring: [
    {
      name: 'Asparagus and Pea Risotto',
      season_ingredients: ['asparagus', 'peas', 'spring_onions'],
      meal_type: 'dinner',
      prep_time: 35,
      difficulty: 'medium',
      serves: 4,
      description: 'Creamy risotto highlighting fresh spring vegetables'
    },
    {
      name: 'Strawberry Spinach Salad',
      season_ingredients: ['strawberries', 'spinach', 'spring_greens'],
      meal_type: 'lunch',
      prep_time: 15,
      difficulty: 'easy',
      serves: 2,
      description: 'Light and refreshing salad with seasonal berries'
    },
    {
      name: 'Spring Vegetable Soup',
      season_ingredients: ['leeks', 'carrots', 'new_potatoes', 'herbs'],
      meal_type: 'lunch',
      prep_time: 45,
      difficulty: 'easy',
      serves: 6,
      description: 'Nourishing soup with tender spring vegetables'
    }
  ],
  summer: [
    {
      name: 'Caprese Stuffed Zucchini',
      season_ingredients: ['zucchini', 'tomatoes', 'basil', 'mozzarella'],
      meal_type: 'dinner',
      prep_time: 30,
      difficulty: 'medium',
      serves: 4,
      description: 'Fresh summer vegetables with Italian flavors'
    },
    {
      name: 'Grilled Peach and Corn Salad',
      season_ingredients: ['peaches', 'corn', 'arugula', 'mint'],
      meal_type: 'lunch',
      prep_time: 20,
      difficulty: 'easy',
      serves: 4,
      description: 'Sweet and savory summer salad'
    },
    {
      name: 'Gazpacho with Cucumber',
      season_ingredients: ['tomatoes', 'cucumber', 'bell_peppers', 'herbs'],
      meal_type: 'lunch',
      prep_time: 20,
      difficulty: 'easy',
      serves: 4,
      description: 'Refreshing cold soup perfect for hot days'
    }
  ],
  fall: [
    {
      name: 'Butternut Squash Curry',
      season_ingredients: ['butternut_squash', 'apples', 'onions', 'ginger'],
      meal_type: 'dinner',
      prep_time: 40,
      difficulty: 'medium',
      serves: 4,
      description: 'Warming curry with autumn flavors'
    },
    {
      name: 'Roasted Root Vegetable Bowl',
      season_ingredients: ['sweet_potatoes', 'carrots', 'parsnips', 'beets'],
      meal_type: 'dinner',
      prep_time: 50,
      difficulty: 'easy',
      serves: 4,
      description: 'Hearty bowl with caramelized autumn vegetables'
    },
    {
      name: 'Apple Cinnamon Oatmeal',
      season_ingredients: ['apples', 'cinnamon', 'walnuts', 'maple_syrup'],
      meal_type: 'breakfast',
      prep_time: 15,
      difficulty: 'easy',
      serves: 2,
      description: 'Warming breakfast with fall spices'
    }
  ],
  winter: [
    {
      name: 'Citrus Braised Chicken',
      season_ingredients: ['citrus', 'root_vegetables', 'herbs', 'garlic'],
      meal_type: 'dinner',
      prep_time: 60,
      difficulty: 'medium',
      serves: 6,
      description: 'Comforting braised dish with winter citrus'
    },
    {
      name: 'Brussels Sprouts Gratin',
      season_ingredients: ['brussels_sprouts', 'cream', 'cheese', 'bacon'],
      meal_type: 'dinner',
      prep_time: 45,
      difficulty: 'medium',
      serves: 8,
      description: 'Rich and creamy winter vegetable side'
    },
    {
      name: 'Winter Citrus Salad',
      season_ingredients: ['oranges', 'grapefruit', 'pomegranate', 'mint'],
      meal_type: 'lunch',
      prep_time: 15,
      difficulty: 'easy',
      serves: 4,
      description: 'Bright and refreshing winter salad'
    }
  ]
};

const SEASONAL_TIPS = {
  spring: {
    budget: [
      'Buy asparagus in bulk when in season and freeze extras',
      'Visit farmers markets for best prices on spring vegetables',
      'Plant herbs like chives and parsley for continuous harvest'
    ],
    storage: [
      'Store asparagus upright in water like flowers',
      'Keep strawberries unwashed until ready to use',
      'Blanch and freeze spring peas for year-round use'
    ]
  },
  summer: {
    budget: [
      'Preserve tomatoes by canning or freezing for winter',
      'Buy stone fruits in bulk and freeze for smoothies',
      'Grow basil and other herbs on windowsill'
    ],
    storage: [
      'Never refrigerate tomatoes - keep at room temperature',
      'Store corn in husks in refrigerator until ready to use',
      'Freeze zucchini grated for winter baking'
    ]
  },
  fall: {
    budget: [
      'Buy winter squash in bulk - they store for months',
      'Apple picking can be more economical than grocery stores',
      'Stock up on root vegetables when prices are lowest'
    ],
    storage: [
      'Store winter squash in cool, dry place for months',
      'Keep apples in refrigerator crisper drawer',
      'Root vegetables last longer stored in sand or peat'
    ]
  },
  winter: {
    budget: [
      'Citrus is cheapest during peak winter months',
      'Buy cabbage family vegetables for budget-friendly nutrition',
      'Use frozen summer vegetables preserved from your garden'
    ],
    storage: [
      'Store citrus at room temperature for best flavor',
      'Brussels sprouts last longer left on the stalk',
      'Keep winter greens like kale in plastic bags in fridge'
    ]
  }
};

export const SeasonalMealPlanning = ({ onSeasonalPlanCreate }: SeasonalMealPlanningProps) => {
  const [selectedSeason, setSelectedSeason] = useState<'spring' | 'summer' | 'fall' | 'winter'>(getCurrentSeason());
  const [featuredIngredients, setFeaturedIngredients] = useState<string[]>([]);
  const [selectedRecipes, setSelectedRecipes] = useState<SeasonalRecipeSuggestion[]>([]);
  
  const currentSeason = getCurrentSeason();
  const seasonalIngredients = getSeasonalIngredients(selectedSeason);
  const seasonalRecipes = SEASONAL_RECIPES[selectedSeason] || [];

  useEffect(() => {
    // Auto-select some featured ingredients for the season
    const autoSelected = seasonalIngredients.slice(0, 4).map(ing => ing.name);
    setFeaturedIngredients(autoSelected);
  }, [selectedSeason]);

  const getSeasonIcon = (season: string) => {
    switch (season) {
      case 'spring': return <Leaf className="h-5 w-5 text-green-500" />;
      case 'summer': return <Sun className="h-5 w-5 text-yellow-500" />;
      case 'fall': return <TreePine className="h-5 w-5 text-orange-500" />;
      case 'winter': return <Snowflake className="h-5 w-5 text-blue-500" />;
      default: return <Calendar className="h-5 w-5" />;
    }
  };

  const toggleIngredient = (ingredient: string) => {
    if (featuredIngredients.includes(ingredient)) {
      setFeaturedIngredients(prev => prev.filter(ing => ing !== ingredient));
    } else {
      setFeaturedIngredients(prev => [...prev, ingredient]);
    }
  };

  const toggleRecipe = (recipe: SeasonalRecipeSuggestion) => {
    if (selectedRecipes.find(r => r.name === recipe.name)) {
      setSelectedRecipes(prev => prev.filter(r => r.name !== recipe.name));
    } else {
      setSelectedRecipes(prev => [...prev, recipe]);
    }
  };

  const handleCreateSeasonalPlan = () => {
    const seasonalPlan: SeasonalPlanData = {
      season: selectedSeason,
      featured_ingredients: featuredIngredients,
      meal_focus: `${selectedSeason} seasonal cooking`,
      suggested_recipes: selectedRecipes,
      budget_tips: SEASONAL_TIPS[selectedSeason].budget,
      storage_tips: SEASONAL_TIPS[selectedSeason].storage
    };
    
    onSeasonalPlanCreate(seasonalPlan);
  };

  return (
    <div className="space-y-6">
      {/* Season Selector */}
      <Card className={currentSeason === selectedSeason ? 'border-primary bg-primary/5' : ''}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getSeasonIcon(selectedSeason)}
              <CardTitle className="capitalize">{selectedSeason} Meal Planning</CardTitle>
              {currentSeason === selectedSeason && (
                <Badge className="ml-2">Current Season</Badge>
              )}
            </div>
            <Select value={selectedSeason} onValueChange={(value: 'spring' | 'summer' | 'fall' | 'winter') => setSelectedSeason(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spring">Spring</SelectItem>
                <SelectItem value="summer">Summer</SelectItem>
                <SelectItem value="fall">Fall</SelectItem>
                <SelectItem value="winter">Winter</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <CardDescription>
            Plan meals using the freshest {selectedSeason} ingredients for best flavor and value
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="ingredients" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ingredients">Seasonal Ingredients</TabsTrigger>
          <TabsTrigger value="recipes">Recipe Suggestions</TabsTrigger>
          <TabsTrigger value="tips">Storage & Budget Tips</TabsTrigger>
          <TabsTrigger value="plan">Create Plan</TabsTrigger>
        </TabsList>

        {/* Ingredients Tab */}
        <TabsContent value="ingredients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Peak {selectedSeason.charAt(0).toUpperCase() + selectedSeason.slice(1)} Ingredients</CardTitle>
              <CardDescription>
                Select ingredients you'd like to feature in your meal plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {seasonalIngredients.map((ingredient) => (
                  <Card 
                    key={ingredient.name}
                    className={`cursor-pointer transition-colors ${
                      featuredIngredients.includes(ingredient.name) 
                        ? 'bg-primary/10 border-primary' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => toggleIngredient(ingredient.name)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium capitalize">
                            {ingredient.name.replace('_', ' ')}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Peak: {ingredient.peak_months.join(', ')}
                          </p>
                        </div>
                        {featuredIngredients.includes(ingredient.name) && (
                          <Badge variant="default" className="text-xs">Selected</Badge>
                        )}
                      </div>
                      {ingredient.substitutes.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs text-muted-foreground">
                            Substitutes: {ingredient.substitutes.slice(0, 2).map(sub => sub.replace('_', ' ')).join(', ')}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {featuredIngredients.length > 0 && (
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Featured Ingredients ({featuredIngredients.length}):</h4>
                  <div className="flex flex-wrap gap-2">
                    {featuredIngredients.map((ingredient) => (
                      <Badge key={ingredient} variant="secondary">
                        {ingredient.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recipes Tab */}
        <TabsContent value="recipes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{selectedSeason.charAt(0).toUpperCase() + selectedSeason.slice(1)} Recipe Suggestions</CardTitle>
              <CardDescription>
                Choose recipes that highlight seasonal ingredients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {seasonalRecipes.map((recipe) => (
                  <Card 
                    key={recipe.name}
                    className={`cursor-pointer transition-colors ${
                      selectedRecipes.find(r => r.name === recipe.name)
                        ? 'bg-primary/10 border-primary' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => toggleRecipe(recipe)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">{recipe.name}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs capitalize">
                            {recipe.meal_type}
                          </Badge>
                          {selectedRecipes.find(r => r.name === recipe.name) && (
                            <Badge className="text-xs">Selected</Badge>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">
                        {recipe.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {recipe.prep_time}min
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {recipe.difficulty}
                        </div>
                        <span>Serves {recipe.serves}</span>
                      </div>

                      <div>
                        <p className="text-xs font-medium mb-1">Seasonal ingredients:</p>
                        <div className="flex flex-wrap gap-1">
                          {recipe.season_ingredients.map((ingredient) => (
                            <Badge key={ingredient} variant="secondary" className="text-xs">
                              {ingredient.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {selectedRecipes.length > 0 && (
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Selected Recipes ({selectedRecipes.length}):</h4>
                  <div className="space-y-2">
                    {selectedRecipes.map((recipe) => (
                      <div key={recipe.name} className="flex items-center justify-between text-sm">
                        <span>{recipe.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {recipe.meal_type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tips Tab */}
        <TabsContent value="tips" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Budget Tips
                </CardTitle>
                <CardDescription>Save money on {selectedSeason} ingredients</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {SEASONAL_TIPS[selectedSeason].budget.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Apple className="h-5 w-5" />
                  Storage Tips
                </CardTitle>
                <CardDescription>Keep {selectedSeason} produce fresh longer</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {SEASONAL_TIPS[selectedSeason].storage.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Create Plan Tab */}
        <TabsContent value="plan" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create Your Seasonal Meal Plan</CardTitle>
              <CardDescription>
                Generate a meal plan based on your seasonal selections
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2">Featured Ingredients ({featuredIngredients.length})</h4>
                  <div className="flex flex-wrap gap-1">
                    {featuredIngredients.slice(0, 8).map((ingredient) => (
                      <Badge key={ingredient} variant="secondary" className="text-xs">
                        {ingredient.replace('_', ' ')}
                      </Badge>
                    ))}
                    {featuredIngredients.length > 8 && (
                      <Badge variant="outline" className="text-xs">
                        +{featuredIngredients.length - 8} more
                      </Badge>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Selected Recipes ({selectedRecipes.length})</h4>
                  <div className="space-y-1">
                    {selectedRecipes.slice(0, 4).map((recipe) => (
                      <div key={recipe.name} className="text-sm text-muted-foreground">
                        • {recipe.name}
                      </div>
                    ))}
                    {selectedRecipes.length > 4 && (
                      <div className="text-sm text-muted-foreground">
                        • +{selectedRecipes.length - 4} more recipes
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={handleCreateSeasonalPlan}
                  disabled={featuredIngredients.length === 0 && selectedRecipes.length === 0}
                  className="flex-1"
                >
                  Create Seasonal Meal Plan
                </Button>
                <Button variant="outline" onClick={() => {
                  setFeaturedIngredients([]);
                  setSelectedRecipes([]);
                }}>
                  Clear Selections
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};