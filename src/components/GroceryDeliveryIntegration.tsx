import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  ShoppingCart,
  Plus,
  ExternalLink,
  Clock,
  DollarSign,
  MapPin,
  Package,
  Search,
  Star,
  AlertCircle,
  CheckCircle,
  Truck,
} from 'lucide-react';
import {
  GroceryDeliveryService,
  GroceryItem,
  DeliveryOrder,
  groceryDeliveryService,
} from '@/lib/thirdPartyIntegrations';

interface GroceryDeliveryIntegrationProps {
  shoppingListItems?: string[];
  onItemsAdded?: (items: GroceryItem[]) => void;
}

export const GroceryDeliveryIntegration: React.FC<GroceryDeliveryIntegrationProps> = ({
  shoppingListItems = [],
  onItemsAdded,
}) => {
  const [services, setServices] = useState<GroceryDeliveryService[]>([]);
  const [selectedService, setSelectedService] = useState<GroceryDeliveryService | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GroceryItem[]>([]);
  const [cart, setCart] = useState<GroceryItem[]>([]);
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [zipCode, setZipCode] = useState('12345');
  const [showServiceDialog, setShowServiceDialog] = useState(false);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('123 Main St, Anytown, USA');

  useEffect(() => {
    loadServices();
  }, [zipCode]);

  const loadServices = async () => {
    setLoading(true);
    try {
      const availableServices = await groceryDeliveryService.getAvailableServices(zipCode);
      setServices(availableServices);
      if (availableServices.length > 0 && !selectedService) {
        setSelectedService(availableServices[0]);
      }
    } catch (error) {
      console.error('Failed to load grocery services:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchProducts = async () => {
    if (!selectedService || !searchQuery.trim()) return;

    setLoading(true);
    try {
      const results = await groceryDeliveryService.searchProducts(selectedService.id, searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Failed to search products:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item: GroceryItem) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, price: cartItem.price + item.price }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item }]);
    }
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const proceedToCheckout = async () => {
    if (!selectedService || cart.length === 0) return;

    setLoading(true);
    try {
      const result = await groceryDeliveryService.addToCart(selectedService.id, cart);
      if (result.success && result.cartUrl) {
        // Open service's cart page
        window.open(result.cartUrl, '_blank');
      }
    } catch (error) {
      console.error('Failed to add to service cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async () => {
    if (!selectedService || cart.length === 0) return;

    setLoading(true);
    try {
      const order = await groceryDeliveryService.createOrder(
        selectedService.id,
        cart,
        deliveryAddress
      );
      setOrders([order, ...orders]);
      setCart([]);
      setShowOrderDialog(false);
      
      if (onItemsAdded) {
        onItemsAdded(cart);
      }
    } catch (error) {
      console.error('Failed to create order:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchShoppingListItems = async () => {
    if (!selectedService || shoppingListItems.length === 0) return;

    setLoading(true);
    const allResults: GroceryItem[] = [];
    
    try {
      for (const item of shoppingListItems.slice(0, 5)) { // Limit to first 5 items
        const results = await groceryDeliveryService.searchProducts(selectedService.id, item);
        if (results.length > 0) {
          allResults.push(results[0]); // Take the first match
        }
      }
      setSearchResults(allResults);
    } catch (error) {
      console.error('Failed to search shopping list items:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCartTotal = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
    const deliveryFee = selectedService?.deliveryFee || 0;
    return { subtotal, deliveryFee, total: subtotal + deliveryFee };
  };

  const getAvailabilityColor = (availability: GroceryItem['availability']) => {
    switch (availability) {
      case 'in_stock':
        return 'bg-green-100 text-green-800';
      case 'low_stock':
        return 'bg-yellow-100 text-yellow-800';
      case 'out_of_stock':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getOrderStatusColor = (status: DeliveryOrder['status']) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'preparing':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const renderProduct = (item: GroceryItem) => {
    const inCart = cart.some(cartItem => cartItem.id === item.id);

    return (
      <div key={item.id} className="border rounded-lg p-4 space-y-3">
        {item.image && (
          <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
            <img src={item.image} alt={item.name} className="max-w-full max-h-full object-contain" />
          </div>
        )}
        
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-sm">{item.name}</h4>
              {item.brand && (
                <p className="text-xs text-gray-600">{item.brand}</p>
              )}
              <p className="text-xs text-gray-500">{item.size}</p>
            </div>
            <Badge className={getAvailabilityColor(item.availability)}>
              {item.availability.replace('_', ' ')}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-green-600">${item.price.toFixed(2)}</span>
              {item.nutritionInfo && (
                <span className="text-xs text-gray-500">
                  {item.nutritionInfo.calories} cal
                </span>
              )}
            </div>
            
            <Button
              size="sm"
              onClick={() => inCart ? removeFromCart(item.id) : addToCart(item)}
              disabled={item.availability === 'out_of_stock'}
              variant={inCart ? 'destructive' : 'default'}
            >
              {inCart ? 'Remove' : <Plus className="w-3 h-3" />}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderService = (service: GroceryDeliveryService) => {
    return (
      <div
        key={service.id}
        className={`border rounded-lg p-4 cursor-pointer transition-all ${
          selectedService?.id === service.id
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-200 hover:border-gray-300'
        }`}
        onClick={() => setSelectedService(service)}
      >
        <div className="flex items-center gap-3">
          <img src={service.logoUrl} alt={service.name} className="w-10 h-10 object-contain" />
          <div className="flex-1">
            <h4 className="font-medium">{service.name}</h4>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {service.deliveryTime}
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                ${service.deliveryFee}
              </div>
              <div className="text-xs">
                Min: ${service.minimumOrder}
              </div>
            </div>
          </div>
          {service.available && (
            <Badge variant="outline" className="text-green-600">
              Available
            </Badge>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Truck className="w-6 h-6" />
          Grocery Delivery
        </h2>
        
        <div className="flex items-center gap-2">
          <Input
            placeholder="ZIP Code"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            className="w-24"
          />
          <Button onClick={loadServices} size="sm">
            Update Location
          </Button>
        </div>
      </div>

      {/* Service Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Available Delivery Services</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && services.length === 0 ? (
            <div className="text-center py-4">Loading services...</div>
          ) : services.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No delivery services available in your area. Try a different ZIP code.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map(renderService)}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedService && (
        <Tabs defaultValue="search">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="search">Product Search</TabsTrigger>
            <TabsTrigger value="cart">
              Cart ({cart.length})
            </TabsTrigger>
            <TabsTrigger value="orders">Orders ({orders.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-4">
            {/* Search Interface */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Search Products - {selectedService.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search for products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchProducts()}
                    className="flex-1"
                  />
                  <Button onClick={searchProducts} disabled={loading || !searchQuery.trim()}>
                    <Search className="w-4 h-4" />
                  </Button>
                </div>

                {shoppingListItems.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      Or search for items from your shopping list:
                    </p>
                    <Button
                      variant="outline"
                      onClick={searchShoppingListItems}
                      disabled={loading}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Find Shopping List Items ({shoppingListItems.length})
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Search Results ({searchResults.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {searchResults.map(renderProduct)}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="cart" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Shopping Cart</span>
                  {cart.length > 0 && (
                    <Button onClick={() => setCart([])} variant="outline" size="sm">
                      Clear Cart
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Your cart is empty</p>
                    <p className="text-sm">Search for products to add them to your cart</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      {cart.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 border rounded">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{item.name}</h4>
                            <p className="text-xs text-gray-600">{item.brand} - {item.size}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold">${item.price.toFixed(2)}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeFromCart(item.id)}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Cart Summary */}
                    <div className="border-t pt-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>${getCartTotal().subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Delivery Fee:</span>
                          <span>${getCartTotal().deliveryFee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-base border-t pt-2">
                          <span>Total:</span>
                          <span>${getCartTotal().total.toFixed(2)}</span>
                        </div>
                      </div>

                      {getCartTotal().subtotal < selectedService.minimumOrder && (
                        <Alert className="mt-4">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            Add ${(selectedService.minimumOrder - getCartTotal().subtotal).toFixed(2)} more to meet the minimum order requirement.
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="flex gap-2 mt-4">
                        <Button
                          onClick={proceedToCheckout}
                          disabled={loading || getCartTotal().subtotal < selectedService.minimumOrder}
                          className="flex-1"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Checkout on {selectedService.name}
                        </Button>
                        
                        <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
                          <DialogTrigger asChild>
                            <Button variant="outline">
                              Create Order
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Create Delivery Order</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium">Delivery Address</label>
                                <Input
                                  value={deliveryAddress}
                                  onChange={(e) => setDeliveryAddress(e.target.value)}
                                  placeholder="Enter delivery address"
                                />
                              </div>
                              <div className="text-sm space-y-1">
                                <div className="flex justify-between">
                                  <span>Items: {cart.length}</span>
                                  <span>${getCartTotal().subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Delivery Fee:</span>
                                  <span>${getCartTotal().deliveryFee.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-semibold border-t pt-1">
                                  <span>Total:</span>
                                  <span>${getCartTotal().total.toFixed(2)}</span>
                                </div>
                              </div>
                              <Button onClick={createOrder} disabled={loading} className="w-full">
                                {loading ? 'Creating Order...' : 'Confirm Order'}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No orders yet</p>
                    <p className="text-sm">Your delivery orders will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium">Order #{order.id}</h4>
                            <p className="text-sm text-gray-600">
                              {order.items.length} items • ${order.totalPrice.toFixed(2)}
                            </p>
                          </div>
                          <Badge className={getOrderStatusColor(order.status)}>
                            {order.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Est. delivery: {order.estimatedDelivery.toLocaleTimeString()}
                          </div>
                          {order.trackingUrl && (
                            <a
                              href={order.trackingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-blue-600 hover:underline"
                            >
                              <Package className="w-3 h-3" />
                              Track Order
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};