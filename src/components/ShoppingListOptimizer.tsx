import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  Route,
  Clock,
  DollarSign,
  TrendingDown,
  MapPin,
  Navigation,
  CheckCircle,
  ArrowRight,
  ShoppingCart,
  Target,
  Lightbulb,
  Star
} from 'lucide-react';
import { 
  optimizeShoppingRoute, 
  ShoppingItem, 
  OptimizedShoppingList,
  GROCERY_STORES,
  calculateShoppingSavings
} from '@/lib/shoppingOptimization';

interface ShoppingListOptimizerProps {
  shoppingItems: ShoppingItem[];
  onOptimizedListUpdate?: (optimizedList: OptimizedShoppingList) => void;
}

export const ShoppingListOptimizer = ({
  shoppingItems,
  onOptimizedListUpdate
}: ShoppingListOptimizerProps) => {
  const [selectedStore, setSelectedStore] = useState<string>('walmart');
  const [optimizedList, setOptimizedList] = useState<OptimizedShoppingList | null>(null);
  const [currentAisle, setCurrentAisle] = useState(0);
  const [completedAisles, setCompletedAisles] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (shoppingItems.length > 0) {
      optimizeList();
    }
  }, [shoppingItems, selectedStore]);

  const optimizeList = async () => {
    setLoading(true);
    try {
      const optimized = optimizeShoppingRoute(shoppingItems, selectedStore);
      setOptimizedList(optimized);
      onOptimizedListUpdate?.(optimized);
    } catch (error) {
      console.error('Error optimizing shopping list:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAisleComplete = (aisleNumber: number) => {
    setCompletedAisles(prev => new Set([...prev, aisleNumber]));
    if (currentAisle === aisleNumber && optimizedList) {
      const nextIncompleteAisle = optimizedList.store_route.find(
        (route, index) => index > currentAisle && !completedAisles.has(route.aisle_number)
      );
      if (nextIncompleteAisle) {
        setCurrentAisle(optimizedList.store_route.indexOf(nextIncompleteAisle));
      }
    }
  };

  const resetProgress = () => {
    setCompletedAisles(new Set());
    setCurrentAisle(0);
  };

  const getProgressPercentage = () => {
    if (!optimizedList) return 0;
    return Math.round((completedAisles.size / optimizedList.store_route.length) * 100);
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  const savings = optimizedList ? 
    calculateShoppingSavings(shoppingItems, optimizedList) : null;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <ShoppingCart className="h-8 w-8 animate-pulse mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Optimizing your shopping route...</p>
        </CardContent>
      </Card>
    );
  }

  if (!optimizedList) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No items to optimize</h3>
          <p className="text-muted-foreground">
            Add items to your shopping list to see route optimization.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Store Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="h-5 w-5" />
            Shopping Route Optimizer
          </CardTitle>
          <CardDescription>
            Optimize your shopping route to save time and money
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Store Selection */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium">Store:</label>
            <Select value={selectedStore} onValueChange={setSelectedStore}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(GROCERY_STORES).map(([id, store]) => (
                  <SelectItem key={id} value={id}>
                    {store.store_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={optimizeList} size="sm">
              Re-optimize
            </Button>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="text-center">
              <div className="text-lg font-semibold text-primary">{optimizedList.items.length}</div>
              <div className="text-xs text-muted-foreground">Items</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-600">{formatTime(optimizedList.estimated_time_minutes)}</div>
              <div className="text-xs text-muted-foreground">Est. Time</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600">{formatPrice(optimizedList.estimated_total)}</div>
              <div className="text-xs text-muted-foreground">Total Cost</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-purple-600">{optimizedList.store_route.length}</div>
              <div className="text-xs text-muted-foreground">Aisles</div>
            </div>
          </div>

          {/* Shopping Progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Shopping Progress</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{getProgressPercentage()}% Complete</span>
                <Button variant="outline" size="sm" onClick={resetProgress}>
                  Reset
                </Button>
              </div>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Savings Summary */}
      {savings && savings.total_savings > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <TrendingDown className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-800 mb-2">Optimization Savings</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-green-700">Total Savings: </span>
                    <span className="font-medium text-green-800">{formatPrice(savings.total_savings)}</span>
                  </div>
                  <div>
                    <span className="text-green-700">Time Saved: </span>
                    <span className="font-medium text-green-800">{savings.time_saved_minutes} minutes</span>
                  </div>
                  <div>
                    <span className="text-green-700">Route Efficiency: </span>
                    <span className="font-medium text-green-800">+{savings.route_efficiency_improvement}%</span>
                  </div>
                  <div>
                    <span className="text-green-700">Bulk Savings: </span>
                    <span className="font-medium text-green-800">{formatPrice(savings.bulk_savings)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Optimized Shopping Route */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Optimized Shopping Route
          </CardTitle>
          <CardDescription>
            Follow this route through {GROCERY_STORES[selectedStore].store_name} for maximum efficiency
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {optimizedList.store_route.map((aisle, index) => {
              const isCompleted = completedAisles.has(aisle.aisle_number);
              const isCurrent = index === currentAisle && !isCompleted;
              
              return (
                <Card 
                  key={aisle.aisle_number} 
                  className={`transition-all ${
                    isCompleted ? 'bg-green-50 border-green-200' :
                    isCurrent ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-500/20' :
                    'hover:shadow-sm'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          isCompleted ? 'bg-green-500 text-white' :
                          isCurrent ? 'bg-blue-500 text-white' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {isCompleted ? <CheckCircle className="h-4 w-4" /> : aisle.aisle_number}
                        </div>
                        <div>
                          <h3 className="font-medium">{aisle.aisle_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {aisle.items.length} item{aisle.items.length !== 1 ? 's' : ''} • 
                            Est. {formatTime(aisle.estimated_time_minutes)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isCurrent && <Badge className="bg-blue-100 text-blue-800">Current</Badge>}
                        {isCompleted && <Badge className="bg-green-100 text-green-800">Done</Badge>}
                        {!isCompleted && !isCurrent && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleAisleComplete(aisle.aisle_number)}
                          >
                            Mark Complete
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Items in this aisle */}
                    <div className="grid gap-2 md:grid-cols-2">
                      {aisle.items.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-2 bg-background rounded border">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{item.name}</span>
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${
                                item.priority === 'essential' ? 'bg-red-100 text-red-800' :
                                item.priority === 'important' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {item.priority}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{item.quantity} {item.unit}</span>
                            <span>{formatPrice(item.estimated_price)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Money Saving Tips */}
      {optimizedList.money_saving_tips.length > 0 && (
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-900 mb-2">Money-Saving Tips</h4>
                <ul className="space-y-1">
                  {optimizedList.money_saving_tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-yellow-800">
                      <Star className="h-3 w-3 mt-1 flex-shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Substitution Suggestions */}
      {optimizedList.substitution_suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Smart Substitutions Available
            </CardTitle>
            <CardDescription>
              Consider these alternatives to save money or improve availability
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {optimizedList.substitution_suggestions.map((sub, index) => (
                <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="flex-1">
                    <span className="font-medium">{sub.original_item}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1 text-primary font-medium">
                    {sub.substitute_item}
                  </div>
                  <div className="flex items-center gap-2">
                    {sub.price_difference < 0 && (
                      <Badge className="bg-green-100 text-green-800">
                        Save {formatPrice(Math.abs(sub.price_difference))}
                      </Badge>
                    )}
                    {sub.availability_better && (
                      <Badge className="bg-blue-100 text-blue-800">
                        Better Stock
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bulk Buying Opportunities */}
      {optimizedList.bulk_opportunities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Bulk Buying Opportunities
            </CardTitle>
            <CardDescription>
              Save money by buying these items in bulk
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {optimizedList.bulk_opportunities.map((bulk, index) => (
                <Card key={index} className="p-3 bg-purple-50 border-purple-200">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{bulk.item_name}</h4>
                      <p className="text-sm text-muted-foreground">{bulk.reason}</p>
                    </div>
                    <Badge className="bg-purple-100 text-purple-800">
                      Save {bulk.savings_percentage}%
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Recommended:</span>
                      <div className="font-medium">{bulk.recommended_quantity} units</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Savings:</span>
                      <div className="font-medium text-green-600">{formatPrice(bulk.savings_amount)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Usage:</span>
                      <div className="font-medium capitalize">{bulk.usage_frequency}</div>
                    </div>
                  </div>
                  
                  <Separator className="my-2" />
                  
                  <div className="text-xs text-muted-foreground">
                    <p><strong>Storage:</strong> {bulk.storage_requirements}</p>
                    <p><strong>Shelf Life:</strong> {bulk.shelf_life_days} days</p>
                    <p><strong>Recommended Stores:</strong> {bulk.bulk_store_recommendations.join(', ')}</p>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};