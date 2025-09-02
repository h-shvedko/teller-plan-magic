import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { 
  ShoppingBasket,
  TrendingDown,
  Clock,
  Package,
  MapPin,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Info,
  Filter,
  Star
} from 'lucide-react';
import { 
  generateBulkBuyingRecommendations, 
  BulkBuyingRecommendation,
  ShoppingItem
} from '@/lib/shoppingOptimization';

interface BulkBuyingRecommendationsProps {
  shoppingItems: ShoppingItem[];
  userPreferences?: {
    min_savings_percentage: number;
    max_storage_space: 'small' | 'medium' | 'large';
    preferred_stores: string[];
    avoid_perishables: boolean;
  };
  onRecommendationApply?: (recommendation: BulkBuyingRecommendation) => void;
}

export const BulkBuyingRecommendations = ({
  shoppingItems,
  userPreferences = {
    min_savings_percentage: 10,
    max_storage_space: 'medium',
    preferred_stores: [],
    avoid_perishables: false
  },
  onRecommendationApply
}: BulkBuyingRecommendationsProps) => {
  const [recommendations, setRecommendations] = useState<BulkBuyingRecommendation[]>([]);
  const [showOnlyHighSavings, setShowOnlyHighSavings] = useState(false);
  const [showOnlyPreferredStores, setShowOnlyPreferredStores] = useState(false);
  const [appliedRecommendations, setAppliedRecommendations] = useState<Set<string>>(new Set());
  const [dismissedRecommendations, setDismissedRecommendations] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (shoppingItems.length > 0) {
      const recs = generateBulkBuyingRecommendations(shoppingItems);
      setRecommendations(recs);
    }
  }, [shoppingItems]);

  const getFilteredRecommendations = () => {
    return recommendations.filter(rec => {
      const key = rec.item_name;
      
      // Skip if applied or dismissed
      if (appliedRecommendations.has(key) || dismissedRecommendations.has(key)) {
        return false;
      }

      // Filter by minimum savings
      if (rec.savings_percentage < userPreferences.min_savings_percentage) {
        return false;
      }

      // Filter by high savings only
      if (showOnlyHighSavings && rec.savings_percentage < 20) {
        return false;
      }

      // Filter by preferred stores
      if (showOnlyPreferredStores && userPreferences.preferred_stores.length > 0) {
        const hasPreferredStore = rec.bulk_store_recommendations.some(store => 
          userPreferences.preferred_stores.includes(store)
        );
        if (!hasPreferredStore) {
          return false;
        }
      }

      // Filter perishables if avoided
      if (userPreferences.avoid_perishables && rec.shelf_life_days < 30) {
        return false;
      }

      return true;
    });
  };

  const getStorageCapacityColor = (requirements: string) => {
    if (requirements.toLowerCase().includes('large') || requirements.toLowerCase().includes('basement')) {
      return 'text-red-600';
    }
    if (requirements.toLowerCase().includes('pantry') || requirements.toLowerCase().includes('shelf')) {
      return 'text-yellow-600';
    }
    return 'text-green-600';
  };

  const getUsageFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'bg-green-100 text-green-800';
      case 'weekly': return 'bg-blue-100 text-blue-800';
      case 'monthly': return 'bg-yellow-100 text-yellow-800';
      case 'occasional': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSavingsGrade = (percentage: number) => {
    if (percentage >= 30) return { grade: 'A+', color: 'text-green-700 bg-green-100' };
    if (percentage >= 20) return { grade: 'A', color: 'text-green-600 bg-green-50' };
    if (percentage >= 15) return { grade: 'B', color: 'text-blue-600 bg-blue-50' };
    if (percentage >= 10) return { grade: 'C', color: 'text-yellow-600 bg-yellow-50' };
    return { grade: 'D', color: 'text-gray-600 bg-gray-50' };
  };

  const handleApplyRecommendation = (rec: BulkBuyingRecommendation) => {
    setAppliedRecommendations(prev => new Set([...prev, rec.item_name]));
    onRecommendationApply?.(rec);
  };

  const handleDismissRecommendation = (rec: BulkBuyingRecommendation) => {
    setDismissedRecommendations(prev => new Set([...prev, rec.item_name]));
  };

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  const filteredRecommendations = getFilteredRecommendations();
  const totalPotentialSavings = filteredRecommendations.reduce((sum, rec) => sum + rec.savings_amount, 0);

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBasket className="h-5 w-5" />
            Bulk Buying Recommendations
          </CardTitle>
          <CardDescription>
            Save money by purchasing frequently used items in larger quantities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary Stats */}
          {filteredRecommendations.length > 0 && (
            <div className="grid grid-cols-4 gap-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600">{filteredRecommendations.length}</div>
                <div className="text-xs text-muted-foreground">Opportunities</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600">{formatPrice(totalPotentialSavings)}</div>
                <div className="text-xs text-muted-foreground">Total Savings</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600">
                  {Math.round(filteredRecommendations.reduce((sum, rec) => sum + rec.savings_percentage, 0) / filteredRecommendations.length)}%
                </div>
                <div className="text-xs text-muted-foreground">Avg. Savings</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-purple-600">{appliedRecommendations.size}</div>
                <div className="text-xs text-muted-foreground">Applied</div>
              </div>
            </div>
          )}

          {/* Filter Controls */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Switch
                id="high-savings"
                checked={showOnlyHighSavings}
                onCheckedChange={setShowOnlyHighSavings}
              />
              <label htmlFor="high-savings" className="text-sm font-medium">
                Show only high savings (20%+)
              </label>
            </div>
            {userPreferences.preferred_stores.length > 0 && (
              <div className="flex items-center space-x-2">
                <Switch
                  id="preferred-stores"
                  checked={showOnlyPreferredStores}
                  onCheckedChange={setShowOnlyPreferredStores}
                />
                <label htmlFor="preferred-stores" className="text-sm font-medium">
                  Preferred stores only
                </label>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bulk Buying Recommendations */}
      <div className="space-y-4">
        {filteredRecommendations.map((rec, index) => {
          const savingsGrade = getSavingsGrade(rec.savings_percentage);
          
          return (
            <Card key={rec.item_name} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${savingsGrade.color}`}>
                        {savingsGrade.grade}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{rec.item_name}</h3>
                        <p className="text-sm text-muted-foreground">{rec.reason}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800 font-medium">
                        Save {rec.savings_percentage}%
                      </Badge>
                      <Badge className={getUsageFrequencyColor(rec.usage_frequency)}>
                        Used {rec.usage_frequency}
                      </Badge>
                    </div>
                  </div>

                  {/* Savings Breakdown */}
                  <div className="grid grid-cols-4 gap-4 p-3 bg-muted/30 rounded-lg">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Current Quantity</div>
                      <div className="font-semibold">{rec.current_quantity} units</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Recommended</div>
                      <div className="font-semibold text-blue-600">{rec.recommended_quantity} units</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Total Savings</div>
                      <div className="font-semibold text-green-600">{formatPrice(rec.savings_amount)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Cost per Use</div>
                      <div className="font-semibold">
                        {formatPrice(rec.cost_per_use_current)} → {formatPrice(rec.cost_per_use_bulk)}
                      </div>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Storage Requirements */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        <span className="text-sm font-medium">Storage Requirements</span>
                      </div>
                      <p className={`text-sm pl-6 ${getStorageCapacityColor(rec.storage_requirements)}`}>
                        {rec.storage_requirements}
                      </p>
                      {userPreferences.max_storage_space === 'small' && 
                       rec.storage_requirements.toLowerCase().includes('large') && (
                        <div className="flex items-center gap-1 pl-6">
                          <AlertTriangle className="h-3 w-3 text-yellow-600" />
                          <span className="text-xs text-yellow-600">May exceed your storage capacity</span>
                        </div>
                      )}
                    </div>

                    {/* Shelf Life */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm font-medium">Shelf Life</span>
                      </div>
                      <div className="pl-6">
                        <p className="text-sm">{rec.shelf_life_days} days</p>
                        <Progress 
                          value={Math.min(100, (rec.shelf_life_days / 365) * 100)} 
                          className="h-1 mt-1" 
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {rec.shelf_life_days > 365 ? 'Long-term storage' : 
                           rec.shelf_life_days > 90 ? 'Medium-term storage' : 
                           'Short-term storage'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Recommended Stores */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm font-medium">Best Stores for Bulk Purchase</span>
                    </div>
                    <div className="flex flex-wrap gap-2 pl-6">
                      {rec.bulk_store_recommendations.map(store => {
                        const isPreferred = userPreferences.preferred_stores.includes(store);
                        return (
                          <Badge 
                            key={store} 
                            variant={isPreferred ? "default" : "outline"}
                            className={isPreferred ? "bg-blue-500" : ""}
                          >
                            {store}
                            {isPreferred && <Star className="h-3 w-3 ml-1" />}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>

                  <Separator />

                  {/* Cost Analysis */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      <span className="text-sm font-medium">Cost Analysis</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 pl-6 text-sm">
                      <div>
                        <span className="text-muted-foreground">Current cost per use:</span>
                        <div className="font-medium">{formatPrice(rec.cost_per_use_current)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Bulk cost per use:</span>
                        <div className="font-medium text-green-600">{formatPrice(rec.cost_per_use_bulk)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Savings per use:</span>
                        <div className="font-medium text-green-600">
                          {formatPrice(rec.cost_per_use_current - rec.cost_per_use_bulk)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <Button 
                      variant="outline" 
                      onClick={() => handleDismissRecommendation(rec)}
                      className="flex-1"
                    >
                      Not Interested
                    </Button>
                    <Button 
                      onClick={() => handleApplyRecommendation(rec)}
                      className="flex-1"
                    >
                      Add to Bulk List
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredRecommendations.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <ShoppingBasket className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No bulk buying opportunities</h3>
            <p className="text-muted-foreground">
              {showOnlyHighSavings || showOnlyPreferredStores
                ? 'Try adjusting your filters to see more recommendations.'
                : 'Your current shopping list doesn\'t have items suitable for bulk purchasing at this time.'
              }
            </p>
            {(showOnlyHighSavings || showOnlyPreferredStores) && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowOnlyHighSavings(false);
                  setShowOnlyPreferredStores(false);
                }}
                className="mt-4"
              >
                Reset Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Applied Recommendations Summary */}
      {appliedRecommendations.size > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-800 mb-1">Bulk Purchases Applied</h4>
                <p className="text-sm text-green-700">
                  {appliedRecommendations.size} bulk buying recommendation{appliedRecommendations.size !== 1 ? 's' : ''} 
                  added to your shopping list. Visit the recommended stores for the best deals.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bulk Buying Tips */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-2">Bulk Buying Tips</h4>
              <div className="space-y-1 text-sm text-blue-800">
                <p>• Check unit prices to ensure you're actually saving money</p>
                <p>• Consider storage space and expiration dates before buying in bulk</p>
                <p>• Warehouse stores often have membership fees - calculate if savings justify the cost</p>
                <p>• Split large quantities with friends or family if storage is limited</p>
                <p>• Keep track of usage to refine your bulk buying strategy over time</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};