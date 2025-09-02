import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { 
  Leaf, 
  Flame, 
  Heart, 
  Wheat, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Users,
  ChefHat,
  ArrowRight,
  Info,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { RecipeVariation, getRecipeVariations, IngredientSubstitution } from '@/lib/recipeEnhancements';

interface RecipeVariationsProps {
  recipeId: string;
  recipeName: string;
  recipeIngredients: string[];
  recipeTags?: string[];
  userDietaryRestrictions?: string[];
  onVariationApply?: (variation: RecipeVariation) => void;
}

export const RecipeVariations = ({
  recipeId,
  recipeName,
  recipeIngredients,
  recipeTags = [],
  userDietaryRestrictions = [],
  onVariationApply
}: RecipeVariationsProps) => {
  const [selectedVariation, setSelectedVariation] = useState<RecipeVariation | null>(null);
  const [showVariationDialog, setShowVariationDialog] = useState(false);

  const availableVariations = getRecipeVariations(recipeIngredients, recipeTags, userDietaryRestrictions);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'dietary': return <Leaf className="h-5 w-5" />;
      case 'spice_level': return <Flame className="h-5 w-5" />;
      case 'health_focus': return <Heart className="h-5 w-5" />;
      case 'cooking_method': return <ChefHat className="h-5 w-5" />;
      case 'cuisine_style': return <Users className="h-5 w-5" />;
      default: return <ChefHat className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'dietary': return 'bg-green-100 text-green-800';
      case 'spice_level': return 'bg-red-100 text-red-800';
      case 'health_focus': return 'bg-blue-100 text-blue-800';
      case 'cooking_method': return 'bg-purple-100 text-purple-800';
      case 'cuisine_style': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyAdjustment = (adjustment: number) => {
    if (adjustment > 0) {
      return { icon: <TrendingUp className="h-4 w-4 text-red-500" />, text: 'Harder', color: 'text-red-500' };
    } else if (adjustment < 0) {
      return { icon: <TrendingDown className="h-4 w-4 text-green-500" />, text: 'Easier', color: 'text-green-500' };
    }
    return { icon: <CheckCircle className="h-4 w-4 text-gray-500" />, text: 'Same', color: 'text-gray-500' };
  };

  const formatTimeAdjustment = (minutes: number) => {
    if (minutes === 0) return 'No change';
    return minutes > 0 ? `+${minutes} minutes` : `${minutes} minutes`;
  };

  const handleVariationSelect = (variation: RecipeVariation) => {
    setSelectedVariation(variation);
    setShowVariationDialog(true);
  };

  const handleApplyVariation = () => {
    if (selectedVariation && onVariationApply) {
      onVariationApply(selectedVariation);
      setShowVariationDialog(false);
      setSelectedVariation(null);
    }
  };

  const groupVariationsByCategory = (variations: RecipeVariation[]) => {
    return variations.reduce((groups, variation) => {
      const category = variation.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(variation);
      return groups;
    }, {} as Record<string, RecipeVariation[]>);
  };

  const groupedVariations = groupVariationsByCategory(availableVariations);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChefHat className="h-6 w-6" />
            Recipe Variations
          </CardTitle>
          <CardDescription>
            Customize "{recipeName}" to match your preferences and dietary needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {availableVariations.length === 0 ? (
            <div className="text-center py-6">
              <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Variations Available</h3>
              <p className="text-muted-foreground">
                This recipe doesn't have customizable variations at the moment.
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {availableVariations.length} variation{availableVariations.length !== 1 ? 's' : ''} available for this recipe
            </p>
          )}
        </CardContent>
      </Card>

      {availableVariations.length > 0 && (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="dietary">Dietary</TabsTrigger>
            <TabsTrigger value="spice_level">Spice</TabsTrigger>
            <TabsTrigger value="health_focus">Health</TabsTrigger>
            <TabsTrigger value="cooking_method">Method</TabsTrigger>
            <TabsTrigger value="cuisine_style">Style</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {availableVariations.map((variation) => (
                <VariationCard
                  key={variation.id}
                  variation={variation}
                  onSelect={() => handleVariationSelect(variation)}
                />
              ))}
            </div>
          </TabsContent>

          {Object.entries(groupedVariations).map(([category, variations]) => (
            <TabsContent key={category} value={category} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {variations.map((variation) => (
                  <VariationCard
                    key={variation.id}
                    variation={variation}
                    onSelect={() => handleVariationSelect(variation)}
                  />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* Variation Detail Dialog */}
      <Dialog open={showVariationDialog} onOpenChange={setShowVariationDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedVariation && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {getCategoryIcon(selectedVariation.category)}
                  {selectedVariation.name}
                </DialogTitle>
                <DialogDescription>
                  {selectedVariation.description}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Variation Impact */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 border rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      {getDifficultyAdjustment(selectedVariation.difficulty_adjustment).icon}
                    </div>
                    <div className={`text-sm font-medium ${getDifficultyAdjustment(selectedVariation.difficulty_adjustment).color}`}>
                      {getDifficultyAdjustment(selectedVariation.difficulty_adjustment).text}
                    </div>
                    <div className="text-xs text-muted-foreground">Difficulty</div>
                  </div>
                  
                  <div className="text-center p-3 border rounded-lg">
                    <Clock className="h-5 w-5 mx-auto mb-2 text-blue-600" />
                    <div className="text-sm font-medium text-blue-600">
                      {formatTimeAdjustment(selectedVariation.time_adjustment_minutes)}
                    </div>
                    <div className="text-xs text-muted-foreground">Time</div>
                  </div>
                  
                  <div className="text-center p-3 border rounded-lg">
                    <Badge className={getCategoryColor(selectedVariation.category)}>
                      {selectedVariation.category.replace('_', ' ')}
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-1">Category</div>
                  </div>
                </div>

                {/* Ingredient Substitutions */}
                {selectedVariation.ingredient_substitutions.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Ingredient Substitutions</h4>
                    <div className="space-y-3">
                      {selectedVariation.ingredient_substitutions.map((substitution, index) => (
                        <SubstitutionCard key={index} substitution={substitution} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Instruction Modifications */}
                {selectedVariation.instruction_modifications.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Cooking Instructions</h4>
                    <div className="space-y-2">
                      {selectedVariation.instruction_modifications.map((modification, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                          <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{modification}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Nutritional Impact */}
                {selectedVariation.nutritional_impact && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900 mb-1">Nutritional Impact</h4>
                        <p className="text-sm text-blue-800">{selectedVariation.nutritional_impact}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tags */}
                <div>
                  <h4 className="font-medium mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedVariation.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setShowVariationDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleApplyVariation} className="flex-1">
                    Apply This Variation
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Variation Card Component
const VariationCard = ({ 
  variation, 
  onSelect 
}: { 
  variation: RecipeVariation; 
  onSelect: () => void;
}) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'dietary': return <Leaf className="h-4 w-4" />;
      case 'spice_level': return <Flame className="h-4 w-4" />;
      case 'health_focus': return <Heart className="h-4 w-4" />;
      case 'cooking_method': return <ChefHat className="h-4 w-4" />;
      case 'cuisine_style': return <Users className="h-4 w-4" />;
      default: return <ChefHat className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'dietary': return 'bg-green-100 text-green-800';
      case 'spice_level': return 'bg-red-100 text-red-800';
      case 'health_focus': return 'bg-blue-100 text-blue-800';
      case 'cooking_method': return 'bg-purple-100 text-purple-800';
      case 'cuisine_style': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onSelect}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {getCategoryIcon(variation.category)}
            <h3 className="font-medium">{variation.name}</h3>
          </div>
          <Badge className={`${getCategoryColor(variation.category)} text-xs`}>
            {variation.category.replace('_', ' ')}
          </Badge>
        </div>
        
        <p className="text-sm text-muted-foreground mb-3">
          {variation.description}
        </p>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            {variation.difficulty_adjustment !== 0 && (
              <div className="flex items-center gap-1">
                {variation.difficulty_adjustment > 0 ? (
                  <TrendingUp className="h-3 w-3 text-red-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-green-500" />
                )}
                <span className="text-xs text-muted-foreground">Difficulty</span>
              </div>
            )}
            
            {variation.time_adjustment_minutes !== 0 && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span className="text-xs text-muted-foreground">
                  {variation.time_adjustment_minutes > 0 ? '+' : ''}{variation.time_adjustment_minutes}min
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1 text-primary">
            <span className="text-xs">View Details</span>
            <ArrowRight className="h-3 w-3" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Substitution Card Component
const SubstitutionCard = ({ substitution }: { substitution: IngredientSubstitution }) => (
  <div className="flex items-center gap-4 p-3 border rounded-lg">
    <div className="flex-1">
      <div className="text-sm font-medium capitalize">
        {substitution.original_ingredient.replace('_', ' ')}
      </div>
    </div>
    
    <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
    
    <div className="flex-1">
      <div className="text-sm font-medium capitalize text-primary">
        {substitution.substitute_ingredient.replace('_', ' ')}
      </div>
      {substitution.conversion_ratio !== 1 && (
        <div className="text-xs text-muted-foreground">
          Use {substitution.conversion_ratio}x amount
        </div>
      )}
    </div>
    
    {substitution.notes && (
      <div className="flex-1">
        <div className="text-xs text-muted-foreground">
          {substitution.notes}
        </div>
      </div>
    )}
  </div>
);