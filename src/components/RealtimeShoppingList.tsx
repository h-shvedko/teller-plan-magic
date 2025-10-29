import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import { shoppingListManager, ShoppingList, ShoppingListItem } from '@/lib/realtime'
import { 
  ShoppingCart,
  Users,
  Plus,
  Check,
  X,
  Share2,
  UserPlus,
  Eye,
  MessageCircle,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'

interface RealtimeShoppingListProps {
  listId: string
  currentUser?: {
    id: string
    name: string
    avatar?: string
  }
}

interface Collaborator {
  id: string
  name: string
  avatar?: string
  status: 'online' | 'offline'
  lastSeen?: Date
}

export function RealtimeShoppingList({ listId, currentUser }: RealtimeShoppingListProps) {
  const { toast } = useToast()
  const [shoppingList, setShoppingList] = useState<ShoppingList | null>(null)
  const [items, setItems] = useState<ShoppingListItem[]>([])
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [newItemName, setNewItemName] = useState('')
  const [newItemQuantity, setNewItemQuantity] = useState(1)
  const [newItemUnit, setNewItemUnit] = useState('pcs')
  const [newItemCategory, setNewItemCategory] = useState('other')
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])
  const [realtimeUpdates, setRealtimeUpdates] = useState<any[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const categories = [
    { value: 'produce', label: 'Produce', color: 'bg-green-100 text-green-800' },
    { value: 'dairy', label: 'Dairy', color: 'bg-blue-100 text-blue-800' },
    { value: 'meat', label: 'Meat & Seafood', color: 'bg-red-100 text-red-800' },
    { value: 'pantry', label: 'Pantry', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'frozen', label: 'Frozen', color: 'bg-cyan-100 text-cyan-800' },
    { value: 'bakery', label: 'Bakery', color: 'bg-orange-100 text-orange-800' },
    { value: 'other', label: 'Other', color: 'bg-gray-100 text-gray-800' }
  ]

  useEffect(() => {
    initializeShoppingList()
    setupRealtimeListeners()

    return () => {
      cleanupRealtimeListeners()
    }
  }, [listId])

  const initializeShoppingList = async () => {
    if (!currentUser) return

    try {
      // Initialize mock shopping list
      const mockList: ShoppingList = {
        id: listId,
        name: 'Weekly Groceries',
        ownerId: currentUser.id,
        collaborators: [currentUser.id],
        items: [
          {
            id: 'item1',
            listId,
            name: 'Organic Bananas',
            quantity: 6,
            unit: 'pcs',
            category: 'produce',
            completed: false,
            addedBy: currentUser.id,
            addedAt: new Date()
          },
          {
            id: 'item2',
            listId,
            name: 'Whole Milk',
            quantity: 1,
            unit: 'gallon',
            category: 'dairy',
            completed: true,
            addedBy: currentUser.id,
            addedAt: new Date(),
            completedBy: currentUser.id,
            completedAt: new Date()
          }
        ],
        isShared: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const mockCollaborators: Collaborator[] = [
        {
          id: currentUser.id,
          name: currentUser.name,
          avatar: currentUser.avatar,
          status: 'online'
        },
        {
          id: 'user2',
          name: 'Sarah Johnson',
          avatar: '',
          status: 'online'
        },
        {
          id: 'user3',
          name: 'Mike Chen',
          avatar: '',
          status: 'offline',
          lastSeen: new Date(Date.now() - 3600000) // 1 hour ago
        }
      ]

      setShoppingList(mockList)
      setItems(mockList.items)
      setCollaborators(mockCollaborators)
      setOnlineUsers([currentUser.id, 'user2'])

      // Join the shopping list for real-time updates
      await shoppingListManager.joinShoppingList(listId, currentUser.id)
      setIsConnected(true)

    } catch (error) {
      toast({
        title: "Error loading shopping list",
        description: "Failed to load shopping list data",
        variant: "destructive"
      })
    }
  }

  const setupRealtimeListeners = () => {
    window.addEventListener('shopping_item_added', handleItemAdded)
    window.addEventListener('shopping_item_updated', handleItemUpdated)
    window.addEventListener('shopping_item_deleted', handleItemDeleted)
    window.addEventListener('collaborator_joined', handleCollaboratorJoined)
    window.addEventListener('collaborator_left', handleCollaboratorLeft)
  }

  const cleanupRealtimeListeners = async () => {
    window.removeEventListener('shopping_item_added', handleItemAdded)
    window.removeEventListener('shopping_item_updated', handleItemUpdated)
    window.removeEventListener('shopping_item_deleted', handleItemDeleted)
    window.removeEventListener('collaborator_joined', handleCollaboratorJoined)
    window.removeEventListener('collaborator_left', handleCollaboratorLeft)

    if (currentUser) {
      await shoppingListManager.leaveShoppingList(listId)
    }
  }

  const handleItemAdded = (event: any) => {
    const { item } = event.detail
    setItems(prev => [...prev, item])
    setRealtimeUpdates(prev => [...prev, {
      id: Date.now(),
      type: 'item_added',
      message: `${item.name} was added`,
      timestamp: new Date(),
      user: item.addedBy
    }])
  }

  const handleItemUpdated = (event: any) => {
    const { itemId, updates } = event.detail
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, ...updates } : item
    ))
    setRealtimeUpdates(prev => [...prev, {
      id: Date.now(),
      type: 'item_updated',
      message: updates.completed ? 'Item completed' : 'Item updated',
      timestamp: new Date()
    }])
  }

  const handleItemDeleted = (event: any) => {
    const { itemId } = event.detail
    setItems(prev => prev.filter(item => item.id !== itemId))
    setRealtimeUpdates(prev => [...prev, {
      id: Date.now(),
      type: 'item_deleted',
      message: 'Item removed',
      timestamp: new Date()
    }])
  }

  const handleCollaboratorJoined = (event: any) => {
    const { collaborator } = event.detail
    setOnlineUsers(prev => [...prev, collaborator.id])
    toast({
      title: "Collaborator joined",
      description: `${collaborator.name} joined the shopping list`
    })
  }

  const handleCollaboratorLeft = (event: any) => {
    const { collaboratorId } = event.detail
    setOnlineUsers(prev => prev.filter(id => id !== collaboratorId))
  }

  const handleAddItem = async () => {
    if (!currentUser || !newItemName.trim()) return

    const newItem: Omit<ShoppingListItem, 'id' | 'addedAt'> = {
      listId,
      name: newItemName.trim(),
      quantity: newItemQuantity,
      unit: newItemUnit,
      category: newItemCategory,
      completed: false,
      addedBy: currentUser.id
    }

    try {
      await shoppingListManager.addItem(listId, newItem)
      setNewItemName('')
      setNewItemQuantity(1)
      setNewItemUnit('pcs')
      setNewItemCategory('other')
      
      if (inputRef.current) {
        inputRef.current.focus()
      }
    } catch (error) {
      toast({
        title: "Error adding item",
        description: "Failed to add item to shopping list",
        variant: "destructive"
      })
    }
  }

  const handleToggleItem = async (item: ShoppingListItem) => {
    if (!currentUser) return

    const updates: Partial<ShoppingListItem> = {
      completed: !item.completed,
      completedBy: !item.completed ? currentUser.id : undefined,
      completedAt: !item.completed ? new Date() : undefined
    }

    try {
      await shoppingListManager.updateItem(listId, item.id, updates)
    } catch (error) {
      toast({
        title: "Error updating item",
        description: "Failed to update item status",
        variant: "destructive"
      })
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    try {
      await shoppingListManager.deleteItem(listId, itemId)
    } catch (error) {
      toast({
        title: "Error deleting item",
        description: "Failed to delete item",
        variant: "destructive"
      })
    }
  }

  const handleInviteCollaborator = async () => {
    if (!inviteEmail.trim()) return

    try {
      // In real implementation, this would send an email invitation
      toast({
        title: "Invitation sent",
        description: `Shopping list invitation sent to ${inviteEmail}`
      })
      setInviteEmail('')
      setShareDialogOpen(false)
    } catch (error) {
      toast({
        title: "Error sending invitation",
        description: "Failed to send invitation",
        variant: "destructive"
      })
    }
  }

  const getCategoryInfo = (category: string) => {
    return categories.find(cat => cat.value === category) || categories[categories.length - 1]
  }

  const completedItems = items.filter(item => item.completed)
  const pendingItems = items.filter(item => !item.completed)
  const completionRate = items.length > 0 ? (completedItems.length / items.length) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <ShoppingCart className="h-6 w-6" />
                <span>{shoppingList?.name || 'Shopping List'}</span>
                {isConnected && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                    Live
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="flex items-center space-x-4">
                <span>{items.length} items • {completionRate.toFixed(0)}% complete</span>
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{onlineUsers.length} online</span>
                </div>
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Share Shopping List</DialogTitle>
                    <DialogDescription>
                      Invite others to collaborate on this shopping list in real-time.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="invite-email">Email Address</Label>
                      <Input
                        id="invite-email"
                        type="email"
                        placeholder="Enter email address"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleInviteCollaborator}>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Send Invitation
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shopping List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Add Item Form */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-5">
                  <Input
                    ref={inputRef}
                    placeholder="Add item..."
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    placeholder="Qty"
                    value={newItemQuantity}
                    onChange={(e) => setNewItemQuantity(parseInt(e.target.value))}
                    min="1"
                  />
                </div>
                <div className="col-span-2">
                  <Select value={newItemUnit} onValueChange={setNewItemUnit}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pcs">pcs</SelectItem>
                      <SelectItem value="lbs">lbs</SelectItem>
                      <SelectItem value="oz">oz</SelectItem>
                      <SelectItem value="gallon">gallon</SelectItem>
                      <SelectItem value="quart">quart</SelectItem>
                      <SelectItem value="package">package</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Select value={newItemCategory} onValueChange={setNewItemCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-1">
                  <Button onClick={handleAddItem} disabled={!newItemName.trim()}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pending Items */}
          {pendingItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">To Buy ({pendingItems.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pendingItems.map((item) => {
                  const categoryInfo = getCategoryInfo(item.category)
                  return (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={false}
                          onCheckedChange={() => handleToggleItem(item)}
                        />
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-gray-600">
                            {item.quantity} {item.unit}
                          </div>
                        </div>
                        <Badge className={`${categoryInfo.color} text-xs`}>
                          {categoryInfo.label}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}

          {/* Completed Items */}
          {completedItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span>Completed ({completedItems.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {completedItems.map((item) => {
                  const categoryInfo = getCategoryInfo(item.category)
                  return (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={true}
                          onCheckedChange={() => handleToggleItem(item)}
                        />
                        <div className="opacity-75">
                          <div className="font-medium line-through">{item.name}</div>
                          <div className="text-sm text-gray-600">
                            {item.quantity} {item.unit}
                            {item.completedAt && (
                              <span className="ml-2">
                                • {item.completedAt.toLocaleTimeString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <Badge className={`${categoryInfo.color} text-xs`}>
                          {categoryInfo.label}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Collaborators */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Collaborators</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {collaborators.map((collaborator) => {
                const isOnline = onlineUsers.includes(collaborator.id)
                return (
                  <div key={collaborator.id} className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={collaborator.avatar} />
                      <AvatarFallback>
                        {collaborator.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{collaborator.name}</div>
                      <div className="text-xs text-gray-500 flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        <span>{isOnline ? 'Online' : 'Offline'}</span>
                        {!isOnline && collaborator.lastSeen && (
                          <span>• {collaborator.lastSeen.toLocaleTimeString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Real-time Updates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Live Updates</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {realtimeUpdates.slice(-5).reverse().map((update) => (
                <div key={update.id} className="flex items-start space-x-2 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <div>{update.message}</div>
                    <div className="text-xs text-gray-500">
                      {update.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              {realtimeUpdates.length === 0 && (
                <div className="text-sm text-gray-500 text-center py-4">
                  No recent updates
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}