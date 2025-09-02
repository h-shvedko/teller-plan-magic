import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Package,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  Calendar,
  BarChart3,
  Search,
  Filter,
  ShoppingCart,
  Clock,
  MapPin,
  TrendingDown,
  RefreshCw
} from 'lucide-react';
import { PantryItem, getLowStockItems, getExpiringItems } from '@/lib/shoppingOptimization';

interface PantryInventoryManagerProps {
  onAddToShoppingList?: (items: PantryItem[]) => void;
}

export const PantryInventoryManager = ({ onAddToShoppingList }: PantryInventoryManagerProps) => {
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<PantryItem | null>(null);
  const [newItem, setNewItem] = useState<Partial<PantryItem>>({});

  // Mock initial pantry data - in real app would load from backend
  useEffect(() => {
    const mockPantryItems: PantryItem[] = [
      {
        id: '1',
        name: 'Rice (Basmati)',
        category: 'grains',
        quantity: 2.5,
        unit: 'lbs',
        expiration_date: '2025-12-15',
        purchase_date: '2024-10-01',
        storage_location: 'Pantry Shelf 1',
        minimum_threshold: 1,
        reorder_quantity: 5,
        estimated_price: 8.99,
        notes: 'Organic basmati rice'
      },
      {
        id: '2',
        name: 'Olive Oil (Extra Virgin)',
        category: 'oils',
        quantity: 0.5,
        unit: 'liters',
        expiration_date: '2024-11-30',
        purchase_date: '2024-09-15',
        storage_location: 'Pantry Shelf 2',
        minimum_threshold: 0.5,
        reorder_quantity: 1,
        estimated_price: 12.49,
        notes: 'Premium olive oil'
      },
      {
        id: '3',
        name: 'Canned Tomatoes',
        category: 'canned_goods',
        quantity: 3,
        unit: 'cans',
        expiration_date: '2026-08-20',
        purchase_date: '2024-08-15',
        storage_location: 'Pantry Shelf 3',
        minimum_threshold: 2,
        reorder_quantity: 6,
        estimated_price: 1.29,
        notes: 'Diced tomatoes'
      }
    ];
    setPantryItems(mockPantryItems);
  }, []);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'grains', label: 'Grains & Rice' },
    { value: 'oils', label: 'Oils & Vinegars' },
    { value: 'canned_goods', label: 'Canned Goods' },
    { value: 'spices', label: 'Spices & Herbs' },
    { value: 'dairy', label: 'Dairy Products' },
    { value: 'frozen', label: 'Frozen Items' },
    { value: 'snacks', label: 'Snacks' }
  ];

  const statusFilters = [
    { value: 'all', label: 'All Items' },
    { value: 'low_stock', label: 'Low Stock' },
    { value: 'expiring', label: 'Expiring Soon' },
    { value: 'good', label: 'Well Stocked' }
  ];

  const getFilteredItems = () => {
    let filtered = pantryItems;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.storage_location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(item => item.category === filterCategory);
    }

    // Status filter
    if (filterStatus !== 'all') {
      const lowStockItems = getLowStockItems(pantryItems);
      const expiringItems = getExpiringItems(pantryItems);
      
      switch (filterStatus) {
        case 'low_stock':
          filtered = filtered.filter(item => lowStockItems.includes(item));
          break;
        case 'expiring':
          filtered = filtered.filter(item => expiringItems.includes(item));
          break;
        case 'good':
          filtered = filtered.filter(item => 
            !lowStockItems.includes(item) && !expiringItems.includes(item)
          );
          break;
      }
    }

    return filtered;
  };

  const getItemStatus = (item: PantryItem) => {
    const isLowStock = item.quantity <= item.minimum_threshold;
    const isExpiring = item.expiration_date && 
      new Date(item.expiration_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    if (isExpiring) return { status: 'expiring', color: 'bg-red-100 text-red-800', label: 'Expiring Soon' };
    if (isLowStock) return { status: 'low', color: 'bg-yellow-100 text-yellow-800', label: 'Low Stock' };
    return { status: 'good', color: 'bg-green-100 text-green-800', label: 'Good Stock' };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleAddItem = () => {
    if (!newItem.name || !newItem.quantity || !newItem.unit) return;

    const item: PantryItem = {
      id: Date.now().toString(),
      name: newItem.name,
      category: newItem.category || 'other',
      quantity: newItem.quantity,
      unit: newItem.unit,
      expiration_date: newItem.expiration_date,
      purchase_date: new Date().toISOString().split('T')[0],
      storage_location: newItem.storage_location || 'Pantry',
      minimum_threshold: newItem.minimum_threshold || 1,
      reorder_quantity: newItem.reorder_quantity || newItem.quantity,
      estimated_price: newItem.estimated_price || 0,
      notes: newItem.notes
    };

    setPantryItems([...pantryItems, item]);
    setNewItem({});
    setShowAddDialog(false);
  };

  const handleUpdateItem = (updatedItem: PantryItem) => {
    setPantryItems(items => items.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    ));
    setEditingItem(null);
  };

  const handleDeleteItem = (itemId: string) => {
    setPantryItems(items => items.filter(item => item.id !== itemId));
  };

  const handleAddLowStockToShoppingList = () => {
    const lowStockItems = getLowStockItems(pantryItems);
    if (onAddToShoppingList) {
      onAddToShoppingList(lowStockItems);
    }
  };

  const lowStockItems = getLowStockItems(pantryItems);
  const expiringItems = getExpiringItems(pantryItems);
  const totalValue = pantryItems.reduce((sum, item) => sum + (item.estimated_price * item.quantity), 0);

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Pantry Inventory Manager
          </CardTitle>
          <CardDescription>
            Track your pantry items, monitor stock levels, and manage expiration dates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{pantryItems.length}</div>
              <div className="text-sm text-blue-600">Total Items</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{lowStockItems.length}</div>
              <div className="text-sm text-yellow-600">Low Stock</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{expiringItems.length}</div>
              <div className="text-sm text-red-600">Expiring Soon</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">${totalValue.toFixed(2)}</div>
              <div className="text-sm text-green-600">Est. Value</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Pantry Item</DialogTitle>
                  <DialogDescription>
                    Add a new item to your pantry inventory
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="item-name">Item Name</Label>
                    <Input
                      id="item-name"
                      value={newItem.name || ''}
                      onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                      placeholder="Enter item name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={newItem.quantity || ''}
                        onChange={(e) => setNewItem({...newItem, quantity: parseFloat(e.target.value)})}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="unit">Unit</Label>
                      <Select value={newItem.unit || ''} onValueChange={(value) => setNewItem({...newItem, unit: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lbs">Pounds</SelectItem>
                          <SelectItem value="kg">Kilograms</SelectItem>
                          <SelectItem value="oz">Ounces</SelectItem>
                          <SelectItem value="g">Grams</SelectItem>
                          <SelectItem value="liters">Liters</SelectItem>
                          <SelectItem value="cans">Cans</SelectItem>
                          <SelectItem value="boxes">Boxes</SelectItem>
                          <SelectItem value="each">Each</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={newItem.category || ''} onValueChange={(value) => setNewItem({...newItem, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.slice(1).map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="expiration">Expiration Date</Label>
                    <Input
                      id="expiration"
                      type="date"
                      value={newItem.expiration_date || ''}
                      onChange={(e) => setNewItem({...newItem, expiration_date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Storage Location</Label>
                    <Input
                      id="location"
                      value={newItem.storage_location || ''}
                      onChange={(e) => setNewItem({...newItem, storage_location: e.target.value})}
                      placeholder="e.g., Pantry Shelf 1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="min-threshold">Minimum Stock</Label>
                      <Input
                        id="min-threshold"
                        type="number"
                        value={newItem.minimum_threshold || ''}
                        onChange={(e) => setNewItem({...newItem, minimum_threshold: parseFloat(e.target.value)})}
                        placeholder="1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="price">Estimated Price</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={newItem.estimated_price || ''}
                        onChange={(e) => setNewItem({...newItem, estimated_price: parseFloat(e.target.value)})}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddItem}>Add Item</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {lowStockItems.length > 0 && (
              <Button variant="outline" onClick={handleAddLowStockToShoppingList}>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add Low Stock to Shopping List ({lowStockItems.length})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-60">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusFilters.map(filter => (
                  <SelectItem key={filter.value} value={filter.value}>{filter.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Alerts for Low Stock and Expiring Items */}
      {(lowStockItems.length > 0 || expiringItems.length > 0) && (
        <div className="space-y-3">
          {lowStockItems.length > 0 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <TrendingDown className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Low Stock Alert</h4>
                    <p className="text-sm text-yellow-700 mb-2">
                      {lowStockItems.length} item{lowStockItems.length !== 1 ? 's' : ''} running low
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {lowStockItems.slice(0, 5).map(item => (
                        <Badge key={item.id} variant="outline" className="text-yellow-800 border-yellow-300">
                          {item.name}
                        </Badge>
                      ))}
                      {lowStockItems.length > 5 && (
                        <Badge variant="outline" className="text-yellow-800 border-yellow-300">
                          +{lowStockItems.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {expiringItems.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-800">Expiration Alert</h4>
                    <p className="text-sm text-red-700 mb-2">
                      {expiringItems.length} item{expiringItems.length !== 1 ? 's' : ''} expiring within 7 days
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {expiringItems.slice(0, 5).map(item => (
                        <Badge key={item.id} variant="outline" className="text-red-800 border-red-300">
                          {item.name} - {item.expiration_date ? formatDate(item.expiration_date) : 'No date'}
                        </Badge>
                      ))}
                      {expiringItems.length > 5 && (
                        <Badge variant="outline" className="text-red-800 border-red-300">
                          +{expiringItems.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Pantry Items List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {getFilteredItems().map(item => {
          const status = getItemStatus(item);
          return (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-muted-foreground capitalize">
                        {item.category.replace('_', ' ')}
                      </p>
                    </div>
                    <Badge className={status.color}>
                      {status.label}
                    </Badge>
                  </div>

                  {/* Quantity and Location */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Current Stock:</span>
                      <span className="font-medium">{item.quantity} {item.unit}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{item.storage_location}</span>
                    </div>
                  </div>

                  {/* Expiration Date */}
                  {item.expiration_date && (
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3" />
                      <span>Expires: {formatDate(item.expiration_date)}</span>
                    </div>
                  )}

                  {/* Price */}
                  <div className="flex items-center justify-between text-sm">
                    <span>Est. Value:</span>
                    <span className="font-medium">${(item.estimated_price * item.quantity).toFixed(2)}</span>
                  </div>

                  <Separator />

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {getFilteredItems().length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No items found</h3>
            <p className="text-muted-foreground">
              {searchQuery || filterCategory !== 'all' || filterStatus !== 'all'
                ? 'Try adjusting your search or filters.'
                : 'Start by adding items to your pantry inventory.'
              }
            </p>
            {!searchQuery && filterCategory === 'all' && filterStatus === 'all' && (
              <Button onClick={() => setShowAddDialog(true)} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Item
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};