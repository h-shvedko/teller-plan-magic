import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  DollarSign, 
  TrendingDown, 
  TrendingUp,
  MapPin,
  Truck,
  ShoppingCart,
  Clock,
  Star,
  AlertCircle,
  RefreshCw,
  Filter
} from 'lucide-react';
import { comparePrices, PriceComparison } from '@/lib/shoppingOptimization';

interface PriceComparisonWidgetProps {
  itemName: string;
  defaultQuantity?: number;
  defaultUnit?: string;
  onPriceSelect?: (store: string, price: number) => void;
}

export const PriceComparisonWidget = ({
  itemName,
  defaultQuantity = 1,
  defaultUnit = 'lb',
  onPriceSelect
}: PriceComparisonWidgetProps) => {
  const [quantity, setQuantity] = useState(defaultQuantity);
  const [unit, setUnit] = useState(defaultUnit);
  const [priceComparisons, setPriceComparisons] = useState<PriceComparison[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<'price' | 'distance' | 'rating'>('price');
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(true);

  useEffect(() => {
    loadPriceComparisons();
  }, [itemName, quantity, unit]);

  const loadPriceComparisons = async () => {
    setLoading(true);
    try {
      const prices = comparePrices(itemName, quantity, unit);
      setPriceComparisons(prices);
    } catch (error) {
      console.error('Error loading price comparisons:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSortedPrices = () => {
    const filtered = showOnlyAvailable 
      ? priceComparisons.filter(p => p.availability === 'in_stock')
      : priceComparisons;

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.total_price - b.total_price;
        case 'distance':
          return (a.distance_km || 0) - (b.distance_km || 0);
        case 'rating':
          return 0; // Would implement store ratings
        default:
          return 0;
      }
    });
  };

  const getBestDeal = () => {
    const availablePrices = priceComparisons.filter(p => p.availability === 'in_stock');
    return availablePrices.reduce((best, current) => 
      current.total_price < best.total_price ? current : best
    , availablePrices[0]);
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'in_stock': return 'text-green-600 bg-green-50 border-green-200';
      case 'limited': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'out_of_stock': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  const handleStoreSelect = (store: PriceComparison) => {
    onPriceSelect?.(store.store_name, store.total_price);
  };

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Price Comparison for {itemName}
          </CardTitle>
          <CardDescription>
            Compare prices across different grocery stores to find the best deals
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quantity and Unit Controls */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">Quantity</label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                min="0.1"
                step="0.1"
                className="w-full"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">Unit</label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lb">Pounds (lb)</SelectItem>
                  <SelectItem value="kg">Kilograms (kg)</SelectItem>
                  <SelectItem value="oz">Ounces (oz)</SelectItem>
                  <SelectItem value="g">Grams (g)</SelectItem>
                  <SelectItem value="each">Each</SelectItem>
                  <SelectItem value="package">Package</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={loadPriceComparisons} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="flex gap-3 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Sort by:</span>
              <Select value={sortBy} onValueChange={(value: 'price' | 'distance' | 'rating') => setSortBy(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="distance">Distance</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="available-only"
                checked={showOnlyAvailable}
                onChange={(e) => setShowOnlyAvailable(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="available-only" className="text-sm">In stock only</label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Best Deal Highlight */}
      {priceComparisons.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingDown className="h-5 w-5 text-green-600" />
              <div>
                <h3 className="font-medium text-green-800">Best Deal</h3>
                <p className="text-sm text-green-700">
                  {getBestDeal()?.store_name} - {formatPrice(getBestDeal()?.total_price || 0)} 
                  {getBestDeal()?.is_on_sale && (
                    <Badge className="ml-2 bg-red-500 text-white">
                      {getBestDeal()?.discount_percentage}% OFF
                    </Badge>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Price Comparison Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {getSortedPrices().map((store, index) => (
          <Card 
            key={store.store_id} 
            className={`cursor-pointer hover:shadow-md transition-shadow ${
              index === 0 && sortBy === 'price' ? 'ring-2 ring-green-500' : ''
            }`}
            onClick={() => handleStoreSelect(store)}
          >
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Store Header */}
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{store.store_name}</h3>
                  {index === 0 && sortBy === 'price' && (
                    <Badge className="bg-green-500 text-white">Best Price</Badge>
                  )}
                  {store.is_on_sale && (
                    <Badge className="bg-red-500 text-white">Sale</Badge>
                  )}
                </div>

                {/* Price Information */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">{formatPrice(store.total_price)}</span>
                    <span className="text-sm text-muted-foreground">
                      {formatPrice(store.price_per_unit)}/{store.unit}
                    </span>
                  </div>
                  
                  {store.discount_percentage && (
                    <div className="flex items-center gap-1 text-red-600">
                      <TrendingDown className="h-3 w-3" />
                      <span className="text-xs font-medium">{store.discount_percentage}% off regular price</span>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Availability Status */}
                <div className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getAvailabilityColor(store.availability)}`}>
                  {store.availability === 'in_stock' && <div className="w-2 h-2 bg-green-500 rounded-full mr-1" />}
                  {store.availability === 'limited' && <AlertCircle className="h-3 w-3 mr-1" />}
                  {store.availability === 'out_of_stock' && <div className="w-2 h-2 bg-red-500 rounded-full mr-1" />}
                  {store.availability.replace('_', ' ')}
                </div>

                {/* Store Details */}
                <div className="space-y-2 text-xs text-muted-foreground">
                  {store.distance_km && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{store.distance_km} km away</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3">
                    {store.delivery_available && (
                      <div className="flex items-center gap-1">
                        <Truck className="h-3 w-3" />
                        <span>Delivery</span>
                      </div>
                    )}
                    {store.pickup_available && (
                      <div className="flex items-center gap-1">
                        <ShoppingCart className="h-3 w-3" />
                        <span>Pickup</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Updated {new Date(store.last_updated).toLocaleTimeString()}</span>
                  </div>
                </div>

                {/* Action Button */}
                <Button 
                  variant="outline" 
                  className="w-full" 
                  disabled={store.availability === 'out_of_stock'}
                >
                  {store.availability === 'out_of_stock' ? 'Out of Stock' : 'Select Store'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading price comparisons...</p>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!loading && priceComparisons.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No prices found</h3>
            <p className="text-muted-foreground">
              Try adjusting the quantity or unit, or check back later for updated pricing.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Price Comparison Summary */}
      {priceComparisons.length > 1 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-2">Price Analysis</h4>
                <div className="space-y-1 text-sm text-blue-800">
                  <p>
                    Price range: {formatPrice(Math.min(...priceComparisons.map(p => p.total_price)))} - {formatPrice(Math.max(...priceComparisons.map(p => p.total_price)))}
                  </p>
                  <p>
                    Potential savings: {formatPrice(Math.max(...priceComparisons.map(p => p.total_price)) - Math.min(...priceComparisons.map(p => p.total_price)))} 
                    ({Math.round(((Math.max(...priceComparisons.map(p => p.total_price)) - Math.min(...priceComparisons.map(p => p.total_price))) / Math.max(...priceComparisons.map(p => p.total_price))) * 100)}%)
                  </p>
                  <p>{priceComparisons.filter(p => p.is_on_sale).length} stores currently have this item on sale</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};