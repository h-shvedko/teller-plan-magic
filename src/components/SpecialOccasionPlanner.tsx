import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  PartyPopper,
  Calendar,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Utensils,
  ShoppingCart,
  Heart,
  Cake,
  Gift,
  MapPin,
} from 'lucide-react';
import {
  SpecialOccasionPlan,
  DietaryRequirement,
  CoursePlan,
  PreparationTimeline,
  SpecialShoppingItem,
  advancedPlanningService,
} from '@/lib/advancedPlanningTools';

interface SpecialOccasionPlannerProps {
  userId: string;
}

export const SpecialOccasionPlanner: React.FC<SpecialOccasionPlannerProps> = ({
  userId,
}) => {
  const [occasions, setOccasions] = useState<SpecialOccasionPlan[]>([]);
  const [selectedOccasion, setSelectedOccasion] = useState<SpecialOccasionPlan | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newOccasion, setNewOccasion] = useState<Partial<SpecialOccasionPlan>>({
    occasionType: 'birthday',
    occasionName: '',
    date: new Date(),
    guestCount: 4,
    budget: 100,
    theme: '',
    dietaryRequirements: [],
    courses: [],
    decorationNotes: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOccasions();
  }, []);

  const loadOccasions = async () => {
    // In real implementation, load from backend
    const mockOccasions: SpecialOccasionPlan[] = [
      {
        id: 'occ-1',
        userId,
        occasionType: 'birthday',
        occasionName: "Sarah's Birthday Party",
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        guestCount: 8,
        budget: 200,
        theme: 'Garden Party',
        dietaryRequirements: [
          {
            guestName: 'John',
            requirement: 'Vegetarian',
            severity: 'preference',
            affectedIngredients: ['meat', 'poultry', 'fish'],
          },
        ],
        courses: [],
        timeline: [],
        shoppingList: [],
        status: 'planning',
      },
    ];
    setOccasions(mockOccasions);
  };

  const createOccasion = async () => {
    if (!newOccasion.occasionName || !newOccasion.date) return;

    setLoading(true);
    try {
      const result = await advancedPlanningService.planSpecialOccasion(
        newOccasion.occasionType as any,
        {
          ...newOccasion,
          userId,
        }
      );
      setOccasions([...occasions, result]);
      setNewOccasion({
        occasionType: 'birthday',
        occasionName: '',
        date: new Date(),
        guestCount: 4,
        budget: 100,
        theme: '',
        dietaryRequirements: [],
        courses: [],
        decorationNotes: '',
      });
      setShowCreateDialog(false);
    } catch (error) {
      console.error('Error creating occasion:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOccasionIcon = (type: string) => {
    switch (type) {
      case 'birthday':
        return <Cake className="w-4 h-4" />;
      case 'holiday':
        return <Gift className="w-4 h-4" />;
      case 'dinner_party':
        return <Utensils className="w-4 h-4" />;
      case 'potluck':
        return <Users className="w-4 h-4" />;
      case 'picnic':
        return <MapPin className="w-4 h-4" />;
      default:
        return <PartyPopper className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const updateTaskStatus = (occasionId: string, taskId: string, completed: boolean) => {
    setOccasions(occasions.map(occ => 
      occ.id === occasionId 
        ? {
            ...occ,
            timeline: occ.timeline.map(task => 
              task.taskId === taskId ? { ...task, completed } : task
            ),
          }
        : occ
    ));
  };

  const getTaskProgress = (timeline: PreparationTimeline[]) => {
    if (timeline.length === 0) return 0;
    const completedTasks = timeline.filter(task => task.completed).length;
    return (completedTasks / timeline.length) * 100;
  };

  const renderOccasionCard = (occasion: SpecialOccasionPlan) => {
    const daysUntil = Math.ceil((new Date(occasion.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    const progress = getTaskProgress(occasion.timeline);

    return (
      <Card 
        key={occasion.id} 
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => setSelectedOccasion(occasion)}
      >
        <CardContent className="pt-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              {getOccasionIcon(occasion.occasionType)}
              <div>
                <h4 className="font-medium">{occasion.occasionName}</h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  {new Date(occasion.date).toLocaleDateString()}
                  <span>({daysUntil} days)</span>
                </div>
              </div>
            </div>
            <Badge className={getStatusColor(occasion.status)}>
              {occasion.status.replace('_', ' ')}
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {occasion.guestCount} guests
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              ${occasion.budget}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {occasion.timeline.length} tasks
            </div>
          </div>

          {occasion.theme && (
            <div className="mb-3">
              <Badge variant="outline">{occasion.theme}</Badge>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderTimelineTask = (task: PreparationTimeline, occasionId: string) => {
    const isOverdue = task.daysBeforeEvent < 0 && !task.completed;
    const isUrgent = task.daysBeforeEvent <= 1 && !task.completed;

    return (
      <div 
        key={task.taskId}
        className={`flex items-center gap-3 p-3 rounded border ${
          task.completed ? 'bg-green-50 border-green-200' :
          isOverdue ? 'bg-red-50 border-red-200' :
          isUrgent ? 'bg-yellow-50 border-yellow-200' :
          'bg-gray-50 border-gray-200'
        }`}
      >
        <Button
          size="sm"
          variant="ghost"
          className="p-0 h-6 w-6"
          onClick={() => updateTaskStatus(occasionId, task.taskId, !task.completed)}
        >
          {task.completed ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            <div className="w-4 h-4 border-2 border-gray-300 rounded" />
          )}
        </Button>

        <div className="flex-1">
          <div className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
            {task.taskName}
          </div>
          <div className="text-sm text-muted-foreground">
            {task.daysBeforeEvent > 0 
              ? `${task.daysBeforeEvent} days before event`
              : task.daysBeforeEvent === 0
              ? 'Day of event'
              : `${Math.abs(task.daysBeforeEvent)} days overdue`
            } • {task.duration} minutes • {task.taskType}
          </div>
          {task.notes && (
            <div className="text-xs text-muted-foreground mt-1">
              {task.notes}
            </div>
          )}
        </div>

        {isOverdue && !task.completed && (
          <AlertCircle className="w-4 h-4 text-red-500" />
        )}
      </div>
    );
  };

  const renderShoppingItem = (item: SpecialShoppingItem, occasionId: string) => {
    return (
      <div key={`${item.ingredient}-${item.category}`} className="flex items-center gap-3 p-3 rounded border bg-gray-50">
        <Button
          size="sm"
          variant="ghost"
          className="p-0 h-6 w-6"
          onClick={() => {
            // Toggle purchased status
            setOccasions(occasions.map(occ => 
              occ.id === occasionId 
                ? {
                    ...occ,
                    shoppingList: occ.shoppingList.map(i => 
                      i.ingredient === item.ingredient && i.category === item.category 
                        ? { ...i, purchased: !i.purchased } 
                        : i
                    ),
                  }
                : occ
            ));
          }}
        >
          {item.purchased ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            <div className="w-4 h-4 border-2 border-gray-300 rounded" />
          )}
        </Button>

        <div className="flex-1">
          <div className={`font-medium ${item.purchased ? 'line-through text-muted-foreground' : ''}`}>
            {item.ingredient}
          </div>
          <div className="text-sm text-muted-foreground">
            {item.quantity} {item.unit} • {item.category}
            {item.store && ` • ${item.store}`}
          </div>
          {item.specialNotes && (
            <div className="text-xs text-muted-foreground">
              Note: {item.specialNotes}
            </div>
          )}
        </div>

        <Badge variant="outline" className={`${
          item.category === 'food' ? 'bg-blue-100 text-blue-800' :
          item.category === 'decoration' ? 'bg-purple-100 text-purple-800' :
          item.category === 'tableware' ? 'bg-green-100 text-green-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {item.category}
        </Badge>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <PartyPopper className="w-6 h-6" />
          Special Occasion Planning
        </h2>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Occasion
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Plan New Special Occasion</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Occasion Type</Label>
                <Select
                  value={newOccasion.occasionType}
                  onValueChange={(value) => setNewOccasion({ ...newOccasion, occasionType: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="birthday">Birthday</SelectItem>
                    <SelectItem value="holiday">Holiday</SelectItem>
                    <SelectItem value="dinner_party">Dinner Party</SelectItem>
                    <SelectItem value="potluck">Potluck</SelectItem>
                    <SelectItem value="picnic">Picnic</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Occasion Name</Label>
                <Input
                  value={newOccasion.occasionName}
                  onChange={(e) => setNewOccasion({ ...newOccasion, occasionName: e.target.value })}
                  placeholder="e.g., Sarah's Birthday Party"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={newOccasion.date ? new Date(newOccasion.date).toISOString().split('T')[0] : ''}
                    onChange={(e) => setNewOccasion({ ...newOccasion, date: new Date(e.target.value) })}
                  />
                </div>
                
                <div>
                  <Label>Guest Count</Label>
                  <Input
                    type="number"
                    min="1"
                    value={newOccasion.guestCount}
                    onChange={(e) => setNewOccasion({ ...newOccasion, guestCount: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Budget ($)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={newOccasion.budget}
                    onChange={(e) => setNewOccasion({ ...newOccasion, budget: parseFloat(e.target.value) })}
                  />
                </div>

                <div>
                  <Label>Theme (Optional)</Label>
                  <Input
                    value={newOccasion.theme}
                    onChange={(e) => setNewOccasion({ ...newOccasion, theme: e.target.value })}
                    placeholder="e.g., Garden Party"
                  />
                </div>
              </div>

              <div>
                <Label>Decoration Notes</Label>
                <Textarea
                  value={newOccasion.decorationNotes}
                  onChange={(e) => setNewOccasion({ ...newOccasion, decorationNotes: e.target.value })}
                  placeholder="Special decoration ideas or requirements"
                  rows={3}
                />
              </div>

              <Button onClick={createOccasion} disabled={loading} className="w-full">
                {loading ? 'Creating...' : 'Create Occasion'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {occasions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <PartyPopper className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No special occasions planned</h3>
            <p className="text-muted-foreground mb-4">
              Start planning your next celebration with our comprehensive planning tools
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Plan Your First Occasion
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {occasions.map(renderOccasionCard)}
          </div>

          {selectedOccasion && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getOccasionIcon(selectedOccasion.occasionType)}
                    {selectedOccasion.occasionName}
                  </div>
                  <Badge className={getStatusColor(selectedOccasion.status)}>
                    {selectedOccasion.status.replace('_', ' ')}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="timeline">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                    <TabsTrigger value="shopping">Shopping List</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                  </TabsList>

                  <TabsContent value="timeline" className="space-y-3">
                    {selectedOccasion.timeline.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No timeline tasks yet</p>
                      </div>
                    ) : (
                      selectedOccasion.timeline
                        .sort((a, b) => b.daysBeforeEvent - a.daysBeforeEvent)
                        .map(task => renderTimelineTask(task, selectedOccasion.id))
                    )}
                  </TabsContent>

                  <TabsContent value="shopping" className="space-y-3">
                    {selectedOccasion.shoppingList.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No shopping items yet</p>
                      </div>
                    ) : (
                      selectedOccasion.shoppingList.map(item => 
                        renderShoppingItem(item, selectedOccasion.id)
                      )
                    )}
                  </TabsContent>

                  <TabsContent value="details" className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3">Event Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Date:</span>
                            <span>{new Date(selectedOccasion.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Guests:</span>
                            <span>{selectedOccasion.guestCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Budget:</span>
                            <span>${selectedOccasion.budget}</span>
                          </div>
                          {selectedOccasion.theme && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Theme:</span>
                              <span>{selectedOccasion.theme}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-3">Dietary Requirements</h4>
                        {selectedOccasion.dietaryRequirements.length === 0 ? (
                          <p className="text-sm text-muted-foreground">None specified</p>
                        ) : (
                          <div className="space-y-2">
                            {selectedOccasion.dietaryRequirements.map((req, index) => (
                              <div key={index} className="p-2 bg-muted/50 rounded text-sm">
                                <div className="font-medium">{req.guestName || 'Guest'}</div>
                                <div className="flex items-center gap-2">
                                  <Badge variant={req.severity === 'allergy' ? 'destructive' : 'secondary'}>
                                    {req.severity}
                                  </Badge>
                                  <span>{req.requirement}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {selectedOccasion.decorationNotes && (
                      <div>
                        <h4 className="font-medium mb-3">Decoration Notes</h4>
                        <div className="p-3 bg-muted/50 rounded text-sm">
                          {selectedOccasion.decorationNotes}
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};