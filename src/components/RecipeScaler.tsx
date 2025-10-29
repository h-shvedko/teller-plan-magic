import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  Calculator, 
  Clock, 
  AlertTriangle, 
  ChefHat,
  Scale,
  Info,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { scaleRecipe, ScaledRecipe } from '@/lib/recipeEnhancements';

interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

interface RecipeScalerProps {
  recipeName: string;
  originalServings: number;
  ingredients: Ingredient[];
  instructions: string[];
  originalPrepTime: number;
  originalCookTime: number;
  onScaledRecipeApply?: (scaledRecipe: ScaledRecipe) => void;
}

export const RecipeScaler = ({
  recipeName,
  originalServings,
  ingredients,
  instructions,
  originalPrepTime,
  originalCookTime,
  onScaledRecipeApply
}: RecipeScalerProps) => {
  const [targetServings, setTargetServings] = useState(originalServings);
  const [showInstructions, setShowInstructions] = useState(false);

  const scaledRecipe = useMemo(() => {
    return scaleRecipe(
      ingredients,
      instructions,
      originalServings,
      targetServings,
      originalPrepTime,
      originalCookTime
    );
  }, [ingredients, instructions, originalServings, targetServings, originalPrepTime, originalCookTime]);

  const getServingsSuggestions = () => {
    const suggestions = [];
    const baseServings = originalServings;
    
    // Add common scaling options
    [0.5, 1, 1.5, 2, 3, 4].forEach(multiplier => {
      const servings = Math.round(baseServings * multiplier);
      if (servings > 0 && servings !== targetServings) {
        suggestions.push(servings);
      }
    });
    
    // Add common household sizes
    [1, 2, 4, 6, 8, 12].forEach(size => {
      if (!suggestions.includes(size) && size !== targetServings) {
        suggestions.push(size);
      }
    });
    
    return suggestions.sort((a, b) => a - b).slice(0, 6);
  };

  const getPrecisionColor = (precision: string) => {
    switch (precision) {
      case 'exact': return 'text-green-600';
      case 'rounded': return 'text-yellow-600';
      case 'estimated': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getPrecisionIcon = (precision: string) => {
    switch (precision) {
      case 'exact': return '✓';
      case 'rounded': return '≈';
      case 'estimated': return '~';
      default: return '';
    }
  };

  const formatQuantity = (quantity: number) => {
    // Handle fractions for better display
    if (quantity < 1 && quantity > 0) {
      const fractions: Record<string, string> = {
        '0.125': '⅛',
        '0.25': '¼',
        '0.33': '⅓',
        '0.5': '½',
        '0.67': '⅔',
        '0.75': '¾'
      };
      
      const rounded = Math.round(quantity * 8) / 8; // Round to nearest eighth
      const fractionString = rounded.toString();
      
      if (fractions[fractionString]) {
        return fractions[fractionString];
      }
    }
    
    return quantity % 1 === 0 ? quantity.toString() : quantity.toFixed(2);
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
    }
    return `${mins}m`;
  };

  return (
    <div className="space-y-4">
      {/* Scaling Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Recipe Scaling
          </CardTitle>
          <CardDescription>
            Adjust ingredient quantities for different serving sizes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current vs Target Servings */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <Users className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
              <div className="text-lg font-semibold">{originalServings}</div>
              <div className="text-sm text-muted-foreground">Original Servings</div>
            </div>
            <div className="text-center p-4 bg-primary/10 rounded-lg">
              <Users className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-lg font-semibold text-primary">{targetServings}</div>
              <div className="text-sm text-primary">Target Servings</div>
            </div>
          </div>

          {/* Scaling Factor */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-background border rounded-lg">
              <Calculator className="h-4 w-4" />
              <span className="text-sm">Scaling Factor:</span>
              <Badge variant="outline" className="font-mono">
                {scaledRecipe.scaling_factor.toFixed(2)}x
              </Badge>
              {scaledRecipe.scaling_factor > 1 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : scaledRecipe.scaling_factor < 1 ? (
                <TrendingDown className="h-4 w-4 text-blue-500" />
              ) : null}
            </div>
          </div>

          {/* Servings Input */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Target Servings:</label>
              <Input
                type="number"
                value={targetServings}
                onChange={(e) => setTargetServings(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20"
                min="1"
                max="50"
              />
            </div>
            
            {/* Quick Serving Options */}
            <div className="flex flex-wrap gap-2">
              {getServingsSuggestions().map(servings => (
                <Button
                  key={servings}
                  variant="outline"
                  size="sm"
                  onClick={() => setTargetServings(servings)}
                  className="text-xs"
                >
                  {servings}
                </Button>
              ))}
            </div>
          </div>

          {/* Time Adjustments */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 border rounded-lg">
              <Clock className="h-5 w-5 text-blue-600 mx-auto mb-1" />
              <div className="text-sm text-blue-600 font-medium">
                {formatTime(scaledRecipe.estimated_prep_time)}
              </div>
              <div className="text-xs text-muted-foreground">Prep Time</div>
              {scaledRecipe.estimated_prep_time !== originalPrepTime && (
                <div className="text-xs text-muted-foreground">
                  (was {formatTime(originalPrepTime)})
                </div>
              )}
            </div>
            <div className="text-center p-3 border rounded-lg">
              <ChefHat className="h-5 w-5 text-orange-600 mx-auto mb-1" />
              <div className="text-sm text-orange-600 font-medium">
                {formatTime(scaledRecipe.estimated_cook_time)}
              </div>
              <div className="text-xs text-muted-foreground">Cook Time</div>
              {scaledRecipe.estimated_cook_time !== originalCookTime && (
                <div className="text-xs text-muted-foreground">
                  (was {formatTime(originalCookTime)})
                </div>
              )}
            </div>
          </div>

          {onScaledRecipeApply && (
            <Button
              onClick={() => onScaledRecipeApply(scaledRecipe)}
              className="w-full"
            >
              Apply Scaled Recipe
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Scaled Ingredients */}
      <Card>
        <CardHeader>
          <CardTitle>Scaled Ingredients</CardTitle>
          <CardDescription>
            Adjusted quantities for {targetServings} serving{targetServings !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {scaledRecipe.scaled_ingredients.map((ingredient, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <span className="font-medium capitalize">
                    {ingredient.name.replace('_', ' ')}
                  </span>
                  {ingredient.notes && (
                    <p className="text-sm text-muted-foreground">{ingredient.notes}</p>
                  )}
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <span className="font-mono">
                      {formatQuantity(ingredient.scaled_quantity)} {ingredient.unit}
                    </span>
                    <span 
                      className={`text-xs ${getPrecisionColor(ingredient.measurement_precision)}`}
                      title={`Measurement precision: ${ingredient.measurement_precision}`}
                    >
                      {getPrecisionIcon(ingredient.measurement_precision)}
                    </span>
                  </div>
                  {ingredient.scaled_quantity !== ingredient.original_quantity && (
                    <div className="text-xs text-muted-foreground">
                      (was {formatQuantity(ingredient.original_quantity)} {ingredient.unit})
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Measurement Precision Legend */}
          <div className="mt-4 p-3 bg-muted/30 rounded-lg">
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Info className="h-4 w-4" />
              Measurement Precision
            </h4>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <span className="text-green-600">✓</span>
                <span>Exact</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-yellow-600">≈</span>
                <span>Rounded</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-red-600">~</span>
                <span>Estimated</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scaled Instructions */}
      {instructions.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Instructions</CardTitle>
                <CardDescription>
                  Updated cooking instructions for {targetServings} servings
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowInstructions(!showInstructions)}
              >
                {showInstructions ? 'Hide' : 'Show'} Instructions
              </Button>
            </div>
          </CardHeader>
          {showInstructions && (
            <CardContent>
              <ol className="space-y-3">
                {scaledRecipe.scaled_instructions.map((instruction, index) => (
                  <li key={index} className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{instruction}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          )}
        </Card>
      )}

      {/* Scaling Notes & Warnings */}
      {(scaledRecipe.scaling_notes.length > 0 || scaledRecipe.equipment_adjustments.length > 0) && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="space-y-3">
                <h4 className="font-medium text-yellow-800">Scaling Considerations</h4>
                
                {scaledRecipe.scaling_notes.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-yellow-800 mb-1">Cooking Notes:</h5>
                    <ul className="space-y-1 text-sm text-yellow-700">
                      {scaledRecipe.scaling_notes.map((note, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="w-1 h-1 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></span>
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {scaledRecipe.equipment_adjustments.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-yellow-800 mb-1">Equipment Adjustments:</h5>
                    <ul className="space-y-1 text-sm text-yellow-700">
                      {scaledRecipe.equipment_adjustments.map((adjustment, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="w-1 h-1 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></span>
                          {adjustment}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};