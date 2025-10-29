import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { 
  ChefHat, 
  Clock, 
  Refrigerator, 
  ShoppingCart, 
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Users,
  Timer
} from 'lucide-react';
import { BATCH_COOKING_SUGGESTIONS, BatchCookingSuggestion } from '@/lib/mealPlanTemplates';

interface BatchCookingOptimizerProps {
  plannedMeals: PlannedMeal[];
  onOptimizationApply: (optimizations: BatchOptimization[]) => void;
}

interface PlannedMeal {
  id: string;
  name: string;
  date: Date;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  prep_time: number;
  cook_time: number;
  servings: number;
  ingredients: MealIngredient[];
  batch_cookable: boolean;
  storage_days?: number;
}

interface MealIngredient {
  name: string;
  quantity: number;
  unit: string;
  prep_required: boolean;
}

interface BatchOptimization {
  id: string;
  name: string;
  meals: PlannedMeal[];
  batch_date: Date;
  total_time_saved: number;
  storage_containers_needed: number;
  instructions: BatchInstruction[];
  difficulty: 'easy' | 'medium' | 'hard';
  priority: 'high' | 'medium' | 'low';
}

interface BatchInstruction {
  step: number;
  description: string;
  time_required: number;
  ingredients: string[];
  equipment: string[];
  storage_tip: string;
}

const SAMPLE_PLANNED_MEALS: PlannedMeal[] = [
  {
    id: '1',
    name: 'Grilled Chicken Breast',
    date: new Date(),
    meal_type: 'dinner',
    prep_time: 10,
    cook_time: 25,
    servings: 4,
    batch_cookable: true,
    storage_days: 4,
    ingredients: [
      { name: 'chicken_breast', quantity: 4, unit: 'pieces', prep_required: true },
      { name: 'olive_oil', quantity: 2, unit: 'tbsp', prep_required: false },
      { name: 'salt', quantity: 1, unit: 'tsp', prep_required: false }
    ]
  },
  {
    id: '2',
    name: 'Brown Rice',
    date: new Date(),
    meal_type: 'dinner',
    prep_time: 5,
    cook_time: 45,
    servings: 6,
    batch_cookable: true,
    storage_days: 5,
    ingredients: [
      { name: 'brown_rice', quantity: 2, unit: 'cups', prep_required: false },
      { name: 'water', quantity: 4, unit: 'cups', prep_required: false }
    ]
  },
  {
    id: '3',
    name: 'Roasted Vegetables',
    date: new Date(),
    meal_type: 'dinner',
    prep_time: 15,
    cook_time: 30,
    servings: 8,
    batch_cookable: true,
    storage_days: 4,
    ingredients: [
      { name: 'mixed_vegetables', quantity: 4, unit: 'cups', prep_required: true },
      { name: 'olive_oil', quantity: 3, unit: 'tbsp', prep_required: false }
    ]
  }
];

export const BatchCookingOptimizer = ({ 
  plannedMeals = SAMPLE_PLANNED_MEALS, 
  onOptimizationApply 
}: BatchCookingOptimizerProps) => {
  const [selectedOptimizations, setSelectedOptimizations] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('suggestions');

  // Generate batch cooking optimizations
  const optimizations = useMemo(() => {
    const batchableGroups: BatchOptimization[] = [];

    // Group by similar cooking methods and ingredients
    const proteinMeals = plannedMeals.filter(meal => 
      meal.batch_cookable && 
      meal.ingredients.some(ing => ing.name.includes('chicken') || ing.name.includes('beef') || ing.name.includes('fish'))
    );

    const grainMeals = plannedMeals.filter(meal =>
      meal.batch_cookable &&
      meal.ingredients.some(ing => ing.name.includes('rice') || ing.name.includes('quinoa') || ing.name.includes('pasta'))
    );

    const vegetableMeals = plannedMeals.filter(meal =>
      meal.batch_cookable &&
      meal.ingredients.some(ing => ing.name.includes('vegetables') || ing.name.includes('carrots') || ing.name.includes('broccoli'))
    );

    // Create protein batch optimization
    if (proteinMeals.length >= 2) {
      batchableGroups.push({
        id: 'protein_batch',
        name: 'Protein Prep Session',
        meals: proteinMeals,
        batch_date: new Date(),
        total_time_saved: proteinMeals.reduce((acc, meal) => acc + meal.prep_time, 0) * 0.6,
        storage_containers_needed: Math.ceil(proteinMeals.length * 1.5),
        difficulty: 'easy',
        priority: 'high',
        instructions: [
          {
            step: 1,
            description: 'Preheat oven to 375°F and prepare all proteins with seasonings',
            time_required: 15,
            ingredients: proteinMeals.flatMap(m => m.ingredients.map(ing => ing.name)),
            equipment: ['sheet_pans', 'mixing_bowls', 'measuring_spoons'],
            storage_tip: 'Let cool completely before storing in airtight containers'
          },
          {
            step: 2,
            description: 'Cook all proteins simultaneously using sheet pan method',
            time_required: 30,
            ingredients: [],
            equipment: ['oven', 'timer'],
            storage_tip: 'Label containers with cooking date and contents'
          },
          {
            step: 3,
            description: 'Cool, portion, and store in refrigerator containers',
            time_required: 10,
            ingredients: [],
            equipment: ['storage_containers', 'labels'],
            storage_tip: 'Use within 4 days or freeze for longer storage'
          }
        ]
      });
    }

    // Create grain batch optimization
    if (grainMeals.length >= 2) {
      batchableGroups.push({
        id: 'grain_batch',
        name: 'Grain Base Preparation',
        meals: grainMeals,
        batch_date: new Date(),
        total_time_saved: 20,
        storage_containers_needed: 3,
        difficulty: 'easy',
        priority: 'medium',
        instructions: [
          {
            step: 1,
            description: 'Measure and rinse all grains, prepare large cooking pot',
            time_required: 5,
            ingredients: grainMeals.flatMap(m => m.ingredients.filter(ing => ing.name.includes('rice') || ing.name.includes('quinoa')).map(ing => ing.name)),
            equipment: ['large_pot', 'fine_mesh_strainer'],
            storage_tip: 'Cook grains with slightly less water for batch cooking'
          },
          {
            step: 2,
            description: 'Cook grains in large batches using absorption method',
            time_required: 45,
            ingredients: ['water', 'salt'],
            equipment: ['large_pot', 'timer'],
            storage_tip: 'Fluff grains and let steam escape before storing'
          },
          {
            step: 3,
            description: 'Cool and portion into weekly serving sizes',
            time_required: 10,
            ingredients: [],
            equipment: ['storage_containers', 'measuring_cups'],
            storage_tip: 'Store in refrigerator up to 5 days, reheat with splash of water'
          }
        ]
      });
    }

    // Create vegetable batch optimization
    if (vegetableMeals.length >= 2) {
      batchableGroups.push({
        id: 'vegetable_batch',
        name: 'Vegetable Prep & Roasting',
        meals: vegetableMeals,
        batch_date: new Date(),
        total_time_saved: 25,
        storage_containers_needed: 4,
        difficulty: 'medium',
        priority: 'high',
        instructions: [
          {
            step: 1,
            description: 'Wash, chop, and prepare all vegetables by cooking time',
            time_required: 20,
            ingredients: vegetableMeals.flatMap(m => m.ingredients.filter(ing => ing.name.includes('vegetables')).map(ing => ing.name)),
            equipment: ['cutting_boards', 'sharp_knives', 'sheet_pans'],
            storage_tip: 'Keep raw prepped vegetables separate from cooked ones'
          },
          {
            step: 2,
            description: 'Roast vegetables in batches based on cooking times',
            time_required: 35,
            ingredients: ['olive_oil', 'salt', 'pepper'],
            equipment: ['sheet_pans', 'oven'],
            storage_tip: 'Slightly undercook vegetables as they\'ll be reheated later'
          },
          {
            step: 3,
            description: 'Cool completely and store by vegetable type',
            time_required: 15,
            ingredients: [],
            equipment: ['storage_containers', 'labels'],
            storage_tip: 'Store different vegetables separately to maintain textures'
          }
        ]
      });
    }

    return batchableGroups;
  }, [plannedMeals]);

  const toggleOptimization = (optimizationId: string) => {
    if (selectedOptimizations.includes(optimizationId)) {
      setSelectedOptimizations(prev => prev.filter(id => id !== optimizationId));
    } else {
      setSelectedOptimizations(prev => [...prev, optimizationId]);
    }
  };

  const totalTimeSaved = useMemo(() => {
    return optimizations
      .filter(opt => selectedOptimizations.includes(opt.id))
      .reduce((acc, opt) => acc + opt.total_time_saved, 0);
  }, [optimizations, selectedOptimizations]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '⭐';
      case 'medium': return '⭐⭐';
      case 'hard': return '⭐⭐⭐';
      default: return '⭐';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChefHat className="h-6 w-6" />
            Batch Cooking Optimizer
          </CardTitle>
          <CardDescription>
            Save time by cooking multiple meals together. Optimize your meal prep for maximum efficiency.
          </CardDescription>
          {selectedOptimizations.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
              <div className="flex items-center gap-2">
                <Timer className="h-5 w-5 text-primary" />
                <span className="font-medium">
                  Total Time Saved: {Math.round(totalTimeSaved)} minutes
                </span>
              </div>
              <Button onClick={() => onOptimizationApply(optimizations.filter(opt => selectedOptimizations.includes(opt.id)))}>
                Apply Optimizations
              </Button>
            </div>
          )}
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="suggestions">Optimization Suggestions</TabsTrigger>
          <TabsTrigger value="tips">Batch Cooking Tips</TabsTrigger>
          <TabsTrigger value="schedule">Schedule Planner</TabsTrigger>
        </TabsList>

        {/* Suggestions Tab */}
        <TabsContent value="suggestions" className="space-y-4">
          {optimizations.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Batch Cooking Opportunities</h3>
                <p className="text-muted-foreground">
                  Add more batch-cookable meals to your plan to see optimization suggestions.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {optimizations.map((optimization) => (
                <Card 
                  key={optimization.id}
                  className={`cursor-pointer transition-colors ${
                    selectedOptimizations.includes(optimization.id) 
                      ? 'bg-primary/5 border-primary' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => toggleOptimization(optimization.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {selectedOptimizations.includes(optimization.id) ? (
                            <CheckCircle className="h-5 w-5 text-primary" />
                          ) : (
                            <div className="w-5 h-5 border-2 border-muted-foreground rounded"></div>
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{optimization.name}</CardTitle>
                          <div className="flex items-center gap-4 mt-2">
                            <Badge className={getPriorityColor(optimization.priority)}>
                              {optimization.priority} priority
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {getDifficultyIcon(optimization.difficulty)} {optimization.difficulty}
                            </span>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              Saves {Math.round(optimization.total_time_saved)} min
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Meals Included */}
                      <div>
                        <h4 className="font-medium mb-2">Meals Included ({optimization.meals.length}):</h4>
                        <div className="grid gap-2 md:grid-cols-2">
                          {optimization.meals.map((meal) => (
                            <div key={meal.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                              <span className="text-sm font-medium">{meal.name}</span>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Users className="h-3 w-3" />
                                {meal.servings}
                                <Calendar className="h-3 w-3" />
                                {meal.storage_days}d
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Quick Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="text-center">
                          <div className="font-medium text-lg">{Math.round(optimization.total_time_saved)}min</div>
                          <div className="text-muted-foreground">Time Saved</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-lg">{optimization.storage_containers_needed}</div>
                          <div className="text-muted-foreground">Containers</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-lg">{optimization.instructions.length}</div>
                          <div className="text-muted-foreground">Steps</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-lg">
                            {optimization.instructions.reduce((acc, inst) => acc + inst.time_required, 0)}min
                          </div>
                          <div className="text-muted-foreground">Batch Time</div>
                        </div>
                      </div>

                      {/* Instructions Preview */}
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="instructions">
                          <AccordionTrigger className="text-sm font-medium">
                            View Step-by-Step Instructions
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-3">
                              {optimization.instructions.map((instruction) => (
                                <div key={instruction.step} className="border-l-2 border-primary pl-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-sm">
                                      Step {instruction.step}: {instruction.description}
                                    </span>
                                    <Badge variant="outline" className="text-xs">
                                      {instruction.time_required} min
                                    </Badge>
                                  </div>
                                  
                                  {instruction.ingredients.length > 0 && (
                                    <div className="mb-2">
                                      <span className="text-xs font-medium text-muted-foreground">Ingredients: </span>
                                      <span className="text-xs">
                                        {instruction.ingredients.join(', ')}
                                      </span>
                                    </div>
                                  )}
                                  
                                  {instruction.equipment.length > 0 && (
                                    <div className="mb-2">
                                      <span className="text-xs font-medium text-muted-foreground">Equipment: </span>
                                      <span className="text-xs">
                                        {instruction.equipment.join(', ')}
                                      </span>
                                    </div>
                                  )}
                                  
                                  <div className="flex items-start gap-2">
                                    <Lightbulb className="h-3 w-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-xs text-muted-foreground">
                                      {instruction.storage_tip}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tips Tab */}
        <TabsContent value="tips" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {BATCH_COOKING_SUGGESTIONS.map((suggestion) => (
              <Card key={suggestion.recipe_group}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ChefHat className="h-5 w-5" />
                    {suggestion.recipe_group}
                  </CardTitle>
                  <CardDescription>
                    Batch cook for {suggestion.batch_size} servings, stores for {suggestion.storage_days} days
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Included Recipes:</h4>
                    <div className="flex flex-wrap gap-2">
                      {suggestion.recipes.map((recipe) => (
                        <Badge key={recipe} variant="secondary" className="text-xs">
                          {recipe}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Prep Tips:</h4>
                    <ul className="space-y-1">
                      {suggestion.prep_tips.map((tip, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Refrigerator className="h-4 w-4 text-blue-500" />
                      <span className="font-medium text-sm">Reheating Instructions</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {suggestion.reheating_instructions}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Batch Cooking Schedule</CardTitle>
              <CardDescription>
                Plan your batch cooking sessions for maximum efficiency
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {selectedOptimizations.length === 0 ? (
                <div className="text-center py-6">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Select optimization suggestions to create your batch cooking schedule
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{selectedOptimizations.length}</div>
                      <div className="text-sm text-muted-foreground">Batch Sessions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{Math.round(totalTimeSaved)}</div>
                      <div className="text-sm text-muted-foreground">Minutes Saved</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {optimizations
                          .filter(opt => selectedOptimizations.includes(opt.id))
                          .reduce((acc, opt) => acc + opt.storage_containers_needed, 0)
                        }
                      </div>
                      <div className="text-sm text-muted-foreground">Containers Needed</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {optimizations
                      .filter(opt => selectedOptimizations.includes(opt.id))
                      .map((optimization) => (
                        <div key={optimization.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium">{optimization.name}</h4>
                            <Badge className={getPriorityColor(optimization.priority)}>
                              {optimization.priority}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>Total Time Required:</span>
                              <span className="font-medium">
                                {optimization.instructions.reduce((acc, inst) => acc + inst.time_required, 0)} minutes
                              </span>
                            </div>
                            
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <span>Progress:</span>
                                <span>0 of {optimization.instructions.length} steps</span>
                              </div>
                              <Progress value={0} className="h-2" />
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>

                  <div className="flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <div className="text-sm">
                      <span className="font-medium">Tip: </span>
                      Schedule batch cooking sessions when you have 2-3 hours of uninterrupted time for best results.
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};