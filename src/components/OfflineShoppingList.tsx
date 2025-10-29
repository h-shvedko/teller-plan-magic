import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  ShoppingCart,
  Plus,
  Check,
  X,
  WifiOff,
  Wifi,
  Sync,
  RefreshCw,
  Edit,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import {
  OfflineShoppingList as OfflineShoppingListType,
  OfflineShoppingItem,
  OfflineShoppingManager,
  offlineStorage,
  networkManager,
} from '@/lib/pwaUtils';

interface OfflineShoppingListProps {
  listId?: string;
  onListSelect?: (listId: string) => void;
}

export const OfflineShoppingList: React.FC<OfflineShoppingListProps> = ({
  listId,
  onListSelect,
}) => {
  const [lists, setLists] = useState<OfflineShoppingListType[]>([]);
  const [currentList, setCurrentList] = useState<OfflineShoppingListType | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<OfflineShoppingItem | null>(null);
  const [newListName, setNewListName] = useState('');
  const [newItem, setNewItem] = useState<Partial<OfflineShoppingItem>>({
    name: '',
    quantity: 1,
    unit: 'piece',
    category: 'other',
    notes: '',
  });
  const [shoppingManager, setShoppingManager] = useState<OfflineShoppingManager | null>(null);

  // Categories for shopping items
  const categories = [
    'fruits',
    'vegetables',
    'meat',
    'dairy',
    'grains',
    'spices',
    'beverages',
    'snacks',
    'frozen',
    'other',
  ];

  const units = [
    'piece',
    'kg',
    'g',
    'lbs',
    'oz',
    'cup',
    'tbsp',
    'tsp',
    'ml',
    'l',
    'can',
    'package',
    'bottle',
    'bunch',
  ];

  useEffect(() => {
    initializeOfflineStorage();
    setupNetworkListener();
    
    return () => {
      // Cleanup network listener if needed
    };
  }, []);

  useEffect(() => {
    if (listId && shoppingManager) {
      loadSpecificList(listId);
    }
  }, [listId, shoppingManager]);

  const initializeOfflineStorage = async () => {
    try {
      await offlineStorage.init();
      const manager = new OfflineShoppingManager(offlineStorage);
      setShoppingManager(manager);
      await loadLists(manager);
    } catch (error) {
      console.error('Failed to initialize offline storage:', error);
    }
  };

  const setupNetworkListener = () => {
    const cleanup = networkManager.onStatusChange((online) => {
      setIsOnline(online);
      if (online && shoppingManager) {
        syncWithServer();
      }
    });
    return cleanup;
  };

  const loadLists = async (manager: OfflineShoppingManager) => {
    try {
      const allLists = await manager.getAllShoppingLists();
      setLists(allLists);
      
      if (allLists.length > 0 && !currentList) {
        setCurrentList(allLists[0]);
      }
    } catch (error) {
      console.error('Failed to load shopping lists:', error);
    }
  };

  const loadSpecificList = async (id: string) => {
    if (!shoppingManager) return;
    
    try {
      const list = await shoppingManager.getShoppingList(id);
      if (list) {
        setCurrentList(list);
        if (onListSelect) {
          onListSelect(id);
        }
      }
    } catch (error) {
      console.error('Failed to load specific list:', error);
    }
  };

  const syncWithServer = async () => {
    if (!shoppingManager || syncStatus === 'syncing') return;

    setSyncStatus('syncing');
    try {
      await shoppingManager.syncPendingChanges();
      setSyncStatus('idle');
      await loadLists(shoppingManager);
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  const createNewList = async () => {
    if (!shoppingManager || !newListName.trim()) return;

    const newList: OfflineShoppingListType = {
      id: `list-${Date.now()}`,
      name: newListName,
      items: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      syncStatus: 'pending',
      isCompleted: false,
    };

    try {
      await shoppingManager.saveShoppingList(newList);
      setLists([...lists, newList]);
      setCurrentList(newList);
      setNewListName('');
      setShowCreateDialog(false);
    } catch (error) {
      console.error('Failed to create list:', error);
    }
  };

  const addItem = async () => {
    if (!shoppingManager || !currentList || !newItem.name?.trim()) return;

    const item: OfflineShoppingItem = {
      id: `item-${Date.now()}`,
      name: newItem.name,
      quantity: newItem.quantity || 1,
      unit: newItem.unit || 'piece',
      category: newItem.category || 'other',
      isCompleted: false,
      notes: newItem.notes || undefined,
    };

    try {
      await shoppingManager.addItem(currentList.id, item);
      const updatedList = await shoppingManager.getShoppingList(currentList.id);
      if (updatedList) {
        setCurrentList(updatedList);
        updateListInState(updatedList);
      }
      
      // Reset form
      setNewItem({
        name: '',
        quantity: 1,
        unit: 'piece',
        category: 'other',
        notes: '',
      });
    } catch (error) {
      console.error('Failed to add item:', error);
    }
  };

  const toggleItemCompleted = async (itemId: string) => {
    if (!shoppingManager || !currentList) return;

    try {
      await shoppingManager.toggleItemCompleted(currentList.id, itemId);
      const updatedList = await shoppingManager.getShoppingList(currentList.id);
      if (updatedList) {
        setCurrentList(updatedList);
        updateListInState(updatedList);
      }
    } catch (error) {
      console.error('Failed to toggle item:', error);
    }
  };

  const removeItem = async (itemId: string) => {
    if (!shoppingManager || !currentList) return;

    try {
      await shoppingManager.removeItem(currentList.id, itemId);
      const updatedList = await shoppingManager.getShoppingList(currentList.id);
      if (updatedList) {
        setCurrentList(updatedList);
        updateListInState(updatedList);
      }
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const updateItem = async (itemId: string, updates: Partial<OfflineShoppingItem>) => {
    if (!shoppingManager || !currentList) return;

    try {
      await shoppingManager.updateItem(currentList.id, itemId, updates);
      const updatedList = await shoppingManager.getShoppingList(currentList.id);
      if (updatedList) {
        setCurrentList(updatedList);
        updateListInState(updatedList);
      }
      setEditingItem(null);
      setShowEditDialog(false);
    } catch (error) {
      console.error('Failed to update item:', error);
    }
  };

  const deleteList = async (listToDelete: OfflineShoppingListType) => {
    if (!shoppingManager) return;

    try {
      await shoppingManager.deleteShoppingList(listToDelete.id);
      const newLists = lists.filter(l => l.id !== listToDelete.id);
      setLists(newLists);
      
      if (currentList?.id === listToDelete.id) {
        setCurrentList(newLists.length > 0 ? newLists[0] : null);
      }
    } catch (error) {
      console.error('Failed to delete list:', error);
    }
  };

  const updateListInState = (updatedList: OfflineShoppingListType) => {
    setLists(lists.map(l => l.id === updatedList.id ? updatedList : l));
  };

  const getSyncStatusIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Sync className="w-4 h-4" />;
    }
  };

  const getSyncStatusText = () => {
    switch (syncStatus) {
      case 'syncing':
        return 'Syncing...';
      case 'error':
        return 'Sync failed';
      default:
        return isOnline ? 'Synced' : 'Offline';
    }
  };

  const renderItem = (item: OfflineShoppingItem) => {
    return (
      <div
        key={item.id}
        className={`flex items-center gap-3 p-3 border rounded-lg ${
          item.isCompleted ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
        }`}
      >
        <Button
          size="sm"
          variant="ghost"
          className="p-0 h-6 w-6"
          onClick={() => toggleItemCompleted(item.id)}
        >
          {item.isCompleted ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : (
            <div className="w-4 h-4 border-2 border-gray-300 rounded" />
          )}
        </Button>

        <div className="flex-1">
          <div className={`font-medium ${item.isCompleted ? 'line-through text-gray-500' : ''}`}>
            {item.name}
          </div>
          <div className="text-sm text-gray-500">
            {item.quantity} {item.unit} • {item.category}
            {item.notes && ` • ${item.notes}`}
          </div>
        </div>

        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setEditingItem(item);
              setShowEditDialog(true);
            }}
          >
            <Edit className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => removeItem(item.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with network status */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <ShoppingCart className="w-6 h-6" />
          Shopping Lists
        </h2>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="w-4 h-4 text-green-600" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-600" />
            )}
            <span className="text-sm text-gray-600">
              {getSyncStatusText()}
            </span>
            {getSyncStatusIcon()}
          </div>
          
          {isOnline && (
            <Button size="sm" onClick={syncWithServer} disabled={syncStatus === 'syncing'}>
              Sync Now
            </Button>
          )}
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New List
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Shopping List</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>List Name</Label>
                  <Input
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    placeholder="Enter list name"
                    onKeyPress={(e) => e.key === 'Enter' && createNewList()}
                  />
                </div>
                <Button onClick={createNewList} disabled={!newListName.trim()}>
                  Create List
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {!isOnline && (
        <Alert>
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            You're currently offline. Changes will be synced when you reconnect.
          </AlertDescription>
        </Alert>
      )}

      {/* List selector */}
      {lists.length > 0 && (
        <div className="flex items-center gap-4">
          <Label>Current List:</Label>
          <Select
            value={currentList?.id || ''}
            onValueChange={(value) => {
              const selectedList = lists.find(l => l.id === value);
              if (selectedList) {
                setCurrentList(selectedList);
                if (onListSelect) onListSelect(value);
              }
            }}
          >
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {lists.map((list) => (
                <SelectItem key={list.id} value={list.id}>
                  <div className="flex items-center gap-2">
                    {list.name}
                    <Badge variant={list.syncStatus === 'pending' ? 'secondary' : 'outline'}>
                      {list.syncStatus}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {currentList && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => deleteList(currentList)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}

      {/* Current shopping list */}
      {currentList ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{currentList.name}</span>
              <div className="flex items-center gap-2">
                <Badge variant={currentList.isCompleted ? 'default' : 'secondary'}>
                  {currentList.items.filter(i => i.isCompleted).length} / {currentList.items.length} complete
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Add new item form */}
            <div className="grid md:grid-cols-5 gap-3 mb-6 p-4 bg-muted/50 rounded-lg">
              <div>
                <Input
                  placeholder="Item name"
                  value={newItem.name || ''}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && addItem()}
                />
              </div>
              <div>
                <Input
                  type="number"
                  placeholder="Qty"
                  value={newItem.quantity || 1}
                  onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Select
                  value={newItem.unit || 'piece'}
                  onValueChange={(value) => setNewItem({ ...newItem, unit: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select
                  value={newItem.category || 'other'}
                  onValueChange={(value) => setNewItem({ ...newItem, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Button onClick={addItem} disabled={!newItem.name?.trim()}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Shopping items */}
            <div className="space-y-2">
              {currentList.items.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No items in this list yet</p>
                  <p className="text-sm">Add items using the form above</p>
                </div>
              ) : (
                currentList.items.map(renderItem)
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No shopping lists</h3>
            <p className="text-gray-600 mb-4">Create your first shopping list to get started</p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Shopping List
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Item Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <div className="space-y-4">
              <div>
                <Label>Item Name</Label>
                <Input
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    value={editingItem.quantity}
                    onChange={(e) => setEditingItem({ ...editingItem, quantity: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Unit</Label>
                  <Select
                    value={editingItem.unit}
                    onValueChange={(value) => setEditingItem({ ...editingItem, unit: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Category</Label>
                <Select
                  value={editingItem.category}
                  onValueChange={(value) => setEditingItem({ ...editingItem, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Notes (Optional)</Label>
                <Input
                  value={editingItem.notes || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, notes: e.target.value })}
                  placeholder="Additional notes"
                />
              </div>
              <Button
                onClick={() => updateItem(editingItem.id, editingItem)}
                disabled={!editingItem.name.trim()}
              >
                Update Item
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};