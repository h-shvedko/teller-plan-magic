import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Calendar, CalendarDays } from '@/components/ui/calendar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import { mealPlanManager, MealPlan, MealPlanDay, MealPlanMeal } from '@/lib/realtime'
import { 
  CalendarIcon,
  Users,
  Plus,
  Edit,
  Trash2,
  Share2,
  UserPlus,
  Clock,
  ChefHat,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  SkipForward,
  Eye
} from 'lucide-react'

interface RealtimeMealPlanProps {
  planId: string
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
  role: 'owner' | 'editor' | 'viewer'
}

export function RealtimeMealPlan({ planId, currentUser }: RealtimeMealPlanProps) {
  const { toast } = useToast()
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null)
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])
  const [realtimeUpdates, setRealtimeUpdates] = useState<any[]>([])
  const [addMealDialogOpen, setAddMealDialogOpen] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [newMeal, setNewMeal] = useState({
    recipeName: '',
    servings: 4,
    prepTime: 30,
    cookTime: 45,
    mealType: 'dinner',
    assignedTo: '',
    notes: ''
  })

  const mealTypes = [
    { value: 'breakfast', label: 'Breakfast', icon: '🌅', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'lunch', label: 'Lunch', icon: '☀️', color: 'bg-orange-100 text-orange-800' },
    { value: 'dinner', label: 'Dinner', icon: '🌙', color: 'bg-blue-100 text-blue-800' },
    { value: 'snack', label: 'Snack', icon: '🍎', color: 'bg-green-100 text-green-800' }
  ]

  const mealStatuses = [
    { value: 'planned', label: 'Planned', color: 'bg-gray-100 text-gray-800' },
    { value: 'prepping', label: 'Prepping', color: 'bg-blue-100 text-blue-800' },
    { value: 'cooking', label: 'Cooking', color: 'bg-orange-100 text-orange-800' },
    { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
    { value: 'skipped', label: 'Skipped', color: 'bg-red-100 text-red-800' }
  ]

  useEffect(() => {
    initializeMealPlan()
    setupRealtimeListeners()

    return () => {
      cleanupRealtimeListeners()
    }
  }, [planId])

  const initializeMealPlan = async () => {
    if (!currentUser) return

    try {
      // Generate mock meal plan data
      const startDate = new Date()
      startDate.setHours(0, 0, 0, 0)
      
      const mockMeals: MealPlanDay[] = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(startDate)
        date.setDate(startDate.getDate() + i)
        
        return {
          date,
          breakfast: {
            id: `breakfast_${i}`,
            recipeName: ['Overnight Oats', 'Avocado Toast', 'Greek Yogurt Bowl', 'Smoothie Bowl'][i % 4],
            servings: 2,
            prepTime: 10,
            cookTime: 0,
            ingredients: ['oats', 'milk', 'berries'],
            status: i < 2 ? 'completed' : i === 2 ? 'prepping' : 'planned',
            assignedTo: i % 2 === 0 ? currentUser.id : 'user2'
          },
          lunch: {
            id: `lunch_${i}`,
            recipeName: ['Caesar Salad', 'Grilled Chicken Wrap', 'Quinoa Bowl', 'Soup & Sandwich'][i % 4],
            servings: 2,
            prepTime: 15,
            cookTime: 20,
            ingredients: ['chicken', 'vegetables', 'quinoa'],
            status: i < 1 ? 'completed' : i === 1 ? 'cooking' : 'planned',
            assignedTo: i % 2 === 1 ? currentUser.id : 'user2'
          },
          dinner: {
            id: `dinner_${i}`,
            recipeName: ['Spaghetti Carbonara', 'Grilled Salmon', 'Chicken Stir Fry', 'Beef Tacos'][i % 4],
            servings: 4,
            prepTime: 20,
            cookTime: 30,
            ingredients: ['pasta', 'salmon', 'vegetables'],
            status: 'planned',
            assignedTo: currentUser.id
          }
        }
      })

      const mockPlan: MealPlan = {
        id: planId,
        userId: currentUser.id,
        name: 'Weekly Meal Plan - January 2025',
        description: 'Healthy and balanced meals for the family',
        startDate: startDate,
        endDate: new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000),
        meals: mockMeals,
        collaborators: [currentUser.id, 'user2', 'user3'],
        isShared: true,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const mockCollaborators: Collaborator[] = [
        {
          id: currentUser.id,
          name: currentUser.name,
          avatar: currentUser.avatar,
          status: 'online',
          role: 'owner'
        },
        {
          id: 'user2',
          name: 'Sarah Johnson',
          avatar: '',
          status: 'online',
          role: 'editor'
        },
        {
          id: 'user3',
          name: 'Mike Chen',
          avatar: '',
          status: 'offline',
          lastSeen: new Date(Date.now() - 1800000), // 30 minutes ago
          role: 'viewer'
        }
      ]

      setMealPlan(mockPlan)
      setCollaborators(mockCollaborators)
      setOnlineUsers([currentUser.id, 'user2'])

      // Join the meal plan for real-time updates
      await mealPlanManager.joinMealPlan(planId, currentUser.id)

    } catch (error) {
      toast({
        title: "Error loading meal plan",
        description: "Failed to load meal plan data",
        variant: "destructive"
      })
    }
  }

  const setupRealtimeListeners = () => {
    window.addEventListener('meal_plan_updated', handleMealPlanUpdated)
    window.addEventListener('meal_added', handleMealAdded)
    window.addEventListener('meal_updated', handleMealUpdated)
    window.addEventListener('meal_deleted', handleMealDeleted)
  }

  const cleanupRealtimeListeners = async () => {
    window.removeEventListener('meal_plan_updated', handleMealPlanUpdated)
    window.removeEventListener('meal_added', handleMealAdded)
    window.removeEventListener('meal_updated', handleMealUpdated)
    window.removeEventListener('meal_deleted', handleMealDeleted)

    if (currentUser) {
      await mealPlanManager.leaveMealPlan(planId)
    }
  }

  const handleMealPlanUpdated = (event: any) => {
    const { updates } = event.detail
    setMealPlan(prev => prev ? { ...prev, ...updates } : null)
    setRealtimeUpdates(prev => [...prev, {
      id: Date.now(),
      type: 'plan_updated',
      message: 'Meal plan updated',
      timestamp: new Date()
    }])
  }

  const handleMealAdded = (event: any) => {
    const { date, mealType, meal } = event.detail
    setMealPlan(prev => {
      if (!prev) return null
      const updatedMeals = prev.meals.map(day => {
        if (day.date.toDateString() === new Date(date).toDateString()) {
          return { ...day, [mealType]: meal }
        }
        return day
      })
      return { ...prev, meals: updatedMeals }
    })
    setRealtimeUpdates(prev => [...prev, {
      id: Date.now(),
      type: 'meal_added',
      message: `${meal.recipeName} added to ${mealType}`,
      timestamp: new Date()
    }])
  }

  const handleMealUpdated = (event: any) => {
    const { mealId, updates } = event.detail
    setMealPlan(prev => {
      if (!prev) return null
      const updatedMeals = prev.meals.map(day => {
        const updatedDay = { ...day }
        Object.keys(updatedDay).forEach(key => {
          if (key !== 'date' && updatedDay[key as keyof MealPlanDay]?.id === mealId) {
            updatedDay[key as keyof MealPlanDay] = { ...updatedDay[key as keyof MealPlanDay], ...updates }
          }
        })
        return updatedDay
      })
      return { ...prev, meals: updatedMeals }
    })
    setRealtimeUpdates(prev => [...prev, {
      id: Date.now(),
      type: 'meal_updated',
      message: 'Meal updated',
      timestamp: new Date()
    }])
  }

  const handleMealDeleted = (event: any) => {
    const { mealId } = event.detail
    setMealPlan(prev => {
      if (!prev) return null
      const updatedMeals = prev.meals.map(day => {
        const updatedDay = { ...day }
        Object.keys(updatedDay).forEach(key => {
          if (key !== 'date' && updatedDay[key as keyof MealPlanDay]?.id === mealId) {
            delete updatedDay[key as keyof MealPlanDay]
          }
        })
        return updatedDay
      })
      return { ...prev, meals: updatedMeals }
    })
    setRealtimeUpdates(prev => [...prev, {
      id: Date.now(),
      type: 'meal_deleted',
      message: 'Meal removed',
      timestamp: new Date()
    }])
  }

  const handleAddMeal = async () => {
    if (!currentUser || !newMeal.recipeName.trim()) return

    const meal: MealPlanMeal = {
      id: `meal_${Date.now()}`,
      recipeName: newMeal.recipeName,
      servings: newMeal.servings,
      prepTime: newMeal.prepTime,
      cookTime: newMeal.cookTime,
      ingredients: [],
      status: 'planned',
      assignedTo: newMeal.assignedTo || currentUser.id,
      notes: newMeal.notes
    }

    try {
      await mealPlanManager.addMeal(planId, selectedDate, newMeal.mealType, meal)
      setNewMeal({
        recipeName: '',
        servings: 4,
        prepTime: 30,
        cookTime: 45,
        mealType: 'dinner',
        assignedTo: '',
        notes: ''
      })
      setAddMealDialogOpen(false)
    } catch (error) {
      toast({
        title: "Error adding meal",
        description: "Failed to add meal to plan",
        variant: "destructive"
      })
    }
  }

  const handleUpdateMealStatus = async (mealId: string, status: string) => {
    try {
      await mealPlanManager.updateMeal(planId, mealId, { status: status as any })
    } catch (error) {
      toast({
        title: "Error updating meal",
        description: "Failed to update meal status",
        variant: "destructive"
      })
    }
  }

  const handleDeleteMeal = async (mealId: string) => {
    try {
      await mealPlanManager.deleteMeal(planId, mealId)
    } catch (error) {
      toast({
        title: "Error deleting meal",
        description: "Failed to delete meal",
        variant: "destructive"
      })
    }
  }

  const handleInviteCollaborator = async () => {
    if (!inviteEmail.trim()) return

    try {
      toast({
        title: "Invitation sent",
        description: `Meal plan invitation sent to ${inviteEmail}`
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

  const getMealTypeInfo = (mealType: string) => {
    return mealTypes.find(type => type.value === mealType) || mealTypes[2]
  }

  const getStatusInfo = (status: string) => {
    return mealStatuses.find(s => s.value === status) || mealStatuses[0]
  }

  const getSelectedDayMeals = () => {
    if (!mealPlan) return null
    return mealPlan.meals.find(day => 
      day.date.toDateString() === selectedDate.toDateString()
    )
  }

  const getAssignedUser = (assignedTo?: string) => {
    return collaborators.find(c => c.id === assignedTo)
  }

  const selectedDayMeals = getSelectedDayMeals()

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <CalendarIcon className="h-6 w-6" />
                <span>{mealPlan?.name || 'Meal Plan'}</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                  Live
                </Badge>
              </CardTitle>
              <CardDescription className="flex items-center space-x-4">
                <span>{mealPlan?.status === 'active' ? 'Active plan' : 'Draft plan'}</span>
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{onlineUsers.length} online</span>
                </div>
                {mealPlan && (
                  <span>
                    {mealPlan.startDate.toLocaleDateString()} - {mealPlan.endDate.toLocaleDateString()}
                  </span>
                )}
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
                    <DialogTitle>Share Meal Plan</DialogTitle>
                    <DialogDescription>
                      Invite others to collaborate on this meal plan in real-time.
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Date</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                disabled={(date) => {
                  if (!mealPlan) return false
                  return date < mealPlan.startDate || date > mealPlan.endDate
                }}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          {/* Collaborators */}
          <Card className="mt-4">
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
                      <div className="font-medium text-sm flex items-center space-x-2">
                        <span>{collaborator.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {collaborator.role}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500 flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        <span>{isOnline ? 'Online' : 'Offline'}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Live Updates */}
          <Card className="mt-4">
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

        {/* Meals for Selected Date */}
        <div className="lg:col-span-3">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">
              Meals for {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h2>
            <Dialog open={addMealDialogOpen} onOpenChange={setAddMealDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Meal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Meal</DialogTitle>
                  <DialogDescription>
                    Add a meal to your plan for {selectedDate.toLocaleDateString()}.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="recipe-name">Recipe Name</Label>
                      <Input
                        id="recipe-name"
                        value={newMeal.recipeName}
                        onChange={(e) => setNewMeal({...newMeal, recipeName: e.target.value})}
                        placeholder="Enter recipe name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="meal-type">Meal Type</Label>
                      <Select value={newMeal.mealType} onValueChange={(value) => setNewMeal({...newMeal, mealType: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {mealTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.icon} {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="servings">Servings</Label>
                      <Input
                        id="servings"
                        type="number"
                        value={newMeal.servings}
                        onChange={(e) => setNewMeal({...newMeal, servings: parseInt(e.target.value)})}
                        min="1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="prep-time">Prep Time (min)</Label>
                      <Input
                        id="prep-time"
                        type="number"
                        value={newMeal.prepTime}
                        onChange={(e) => setNewMeal({...newMeal, prepTime: parseInt(e.target.value)})}
                        min="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cook-time">Cook Time (min)</Label>
                      <Input
                        id="cook-time"
                        type="number"
                        value={newMeal.cookTime}
                        onChange={(e) => setNewMeal({...newMeal, cookTime: parseInt(e.target.value)})}
                        min="0"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="assigned-to">Assign To</Label>
                    <Select value={newMeal.assignedTo} onValueChange={(value) => setNewMeal({...newMeal, assignedTo: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select person" />
                      </SelectTrigger>
                      <SelectContent>
                        {collaborators.filter(c => c.role !== 'viewer').map(collaborator => (
                          <SelectItem key={collaborator.id} value={collaborator.id}>
                            {collaborator.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddMeal} disabled={!newMeal.recipeName.trim()}>
                    Add Meal
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {mealTypes.map(mealType => {
              const meal = selectedDayMeals?.[mealType.value as keyof MealPlanDay] as MealPlanMeal | undefined
              const statusInfo = getStatusInfo(meal?.status || 'planned')
              const assignedUser = getAssignedUser(meal?.assignedTo)

              return (
                <Card key={mealType.value}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span>{mealType.icon}</span>
                        <span>{mealType.label}</span>
                        {meal && (
                          <Badge className={statusInfo.color}>
                            {statusInfo.label}
                          </Badge>
                        )}
                      </div>
                      {meal && (
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteMeal(meal.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {meal ? (
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-lg">{meal.recipeName}</h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                            <span className="flex items-center space-x-1">
                              <Users className="h-4 w-4" />
                              <span>{meal.servings} servings</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{meal.prepTime + meal.cookTime} min total</span>
                            </span>
                            {assignedUser && (
                              <div className="flex items-center space-x-1">
                                <Avatar className="h-5 w-5">
                                  <AvatarImage src={assignedUser.avatar} />
                                  <AvatarFallback className="text-xs">
                                    {assignedUser.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{assignedUser.name}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {meal.status === 'planned' && (
                            <Button
                              size="sm"
                              onClick={() => handleUpdateMealStatus(meal.id, 'prepping')}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <Play className="mr-1 h-3 w-3" />
                              Start Prep
                            </Button>
                          )}
                          {meal.status === 'prepping' && (
                            <Button
                              size="sm"
                              onClick={() => handleUpdateMealStatus(meal.id, 'cooking')}
                              className="bg-orange-600 hover:bg-orange-700"
                            >
                              <ChefHat className="mr-1 h-3 w-3" />
                              Start Cooking
                            </Button>
                          )}
                          {meal.status === 'cooking' && (
                            <Button
                              size="sm"
                              onClick={() => handleUpdateMealStatus(meal.id, 'completed')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              Complete
                            </Button>
                          )}
                          {['prepping', 'cooking'].includes(meal.status) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateMealStatus(meal.id, 'planned')}
                            >
                              <Pause className="mr-1 h-3 w-3" />
                              Pause
                            </Button>
                          )}
                          {meal.status !== 'skipped' && meal.status !== 'completed' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateMealStatus(meal.id, 'skipped')}
                            >
                              Skip
                            </Button>
                          )}
                        </div>

                        {meal.notes && (
                          <div className="p-2 bg-gray-50 rounded text-sm">
                            <strong>Notes:</strong> {meal.notes}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <ChefHat className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p>No meal planned for {mealType.label.toLowerCase()}</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => {
                            setNewMeal({...newMeal, mealType: mealType.value})
                            setAddMealDialogOpen(true)
                          }}
                        >
                          <Plus className="mr-1 h-3 w-3" />
                          Add {mealType.label}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}