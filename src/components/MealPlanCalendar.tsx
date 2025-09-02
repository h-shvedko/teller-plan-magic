import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { 
  Calendar as CalendarIcon, 
  ChefHat, 
  Clock, 
  Plus, 
  Edit, 
  Trash2,
  Users,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek, isSameDay, isToday } from 'date-fns';

interface MealPlanCalendarProps {
  onScheduleMeal: (mealSchedule: MealSchedule) => void;
  onUpdateSchedule: (scheduleId: string, updates: Partial<MealSchedule>) => void;
  onDeleteSchedule: (scheduleId: string) => void;
  existingSchedules?: MealSchedule[];
}

interface MealSchedule {
  id: string;
  date: Date;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  recipe_name: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  status: 'planned' | 'prep_started' | 'cooking' | 'completed';
  notes?: string;
  ingredients_shopped?: boolean;
  meal_plan_id?: string;
}

interface DaySchedule {
  date: Date;
  meals: MealSchedule[];
  total_prep_time: number;
  total_cook_time: number;
  completion_status: 'none' | 'partial' | 'complete';
}

const MEAL_TYPES = [
  { value: 'breakfast', label: 'Breakfast', time: '8:00 AM' },
  { value: 'lunch', label: 'Lunch', time: '12:00 PM' },
  { value: 'dinner', label: 'Dinner', time: '6:00 PM' },
  { value: 'snack', label: 'Snack', time: '3:00 PM' }
];

const STATUS_COLORS = {
  planned: 'bg-blue-100 text-blue-800',
  prep_started: 'bg-yellow-100 text-yellow-800',
  cooking: 'bg-orange-100 text-orange-800',
  completed: 'bg-green-100 text-green-800'
};

export const MealPlanCalendar = ({
  onScheduleMeal,
  onUpdateSchedule,
  onDeleteSchedule,
  existingSchedules = []
}: MealPlanCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<MealSchedule | null>(null);
  const [newMealSchedule, setNewMealSchedule] = useState<Partial<MealSchedule>>({
    meal_type: 'dinner',
    recipe_name: '',
    prep_time: 15,
    cook_time: 30,
    servings: 4,
    status: 'planned'
  });

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Organize schedules by date
  const schedulesByDate = useMemo(() => {
    const organized: Record<string, DaySchedule> = {};
    
    // Initialize with empty days
    weekDays.forEach(date => {
      const dateKey = format(date, 'yyyy-MM-dd');
      organized[dateKey] = {
        date,
        meals: [],
        total_prep_time: 0,
        total_cook_time: 0,
        completion_status: 'none'
      };
    });

    // Add existing schedules
    existingSchedules.forEach(schedule => {
      const dateKey = format(schedule.date, 'yyyy-MM-dd');
      if (organized[dateKey]) {
        organized[dateKey].meals.push(schedule);
        organized[dateKey].total_prep_time += schedule.prep_time;
        organized[dateKey].total_cook_time += schedule.cook_time;
      }
    });

    // Calculate completion status
    Object.values(organized).forEach(daySchedule => {
      if (daySchedule.meals.length === 0) {
        daySchedule.completion_status = 'none';
      } else {
        const completedMeals = daySchedule.meals.filter(m => m.status === 'completed').length;
        const totalMeals = daySchedule.meals.length;
        
        if (completedMeals === 0) {
          daySchedule.completion_status = 'none';
        } else if (completedMeals === totalMeals) {
          daySchedule.completion_status = 'complete';
        } else {
          daySchedule.completion_status = 'partial';
        }
      }
    });

    return organized;
  }, [existingSchedules, weekDays]);

  const handleScheduleMeal = () => {
    if (!newMealSchedule.recipe_name || !selectedDate) return;

    const mealSchedule: MealSchedule = {
      id: `schedule_${Date.now()}`,
      date: selectedDate,
      meal_type: newMealSchedule.meal_type as 'breakfast' | 'lunch' | 'dinner' | 'snack',
      recipe_name: newMealSchedule.recipe_name,
      prep_time: newMealSchedule.prep_time || 15,
      cook_time: newMealSchedule.cook_time || 30,
      servings: newMealSchedule.servings || 4,
      status: 'planned',
      notes: newMealSchedule.notes
    };

    onScheduleMeal(mealSchedule);
    setShowScheduleDialog(false);
    setNewMealSchedule({
      meal_type: 'dinner',
      recipe_name: '',
      prep_time: 15,
      cook_time: 30,
      servings: 4,
      status: 'planned'
    });
  };

  const handleEditSchedule = (schedule: MealSchedule) => {
    setEditingSchedule(schedule);
    setNewMealSchedule(schedule);
    setShowScheduleDialog(true);
  };

  const handleUpdateSchedule = () => {
    if (!editingSchedule || !newMealSchedule.recipe_name) return;

    onUpdateSchedule(editingSchedule.id, newMealSchedule);
    setShowScheduleDialog(false);
    setEditingSchedule(null);
    setNewMealSchedule({
      meal_type: 'dinner',
      recipe_name: '',
      prep_time: 15,
      cook_time: 30,
      servings: 4,
      status: 'planned'
    });
  };

  const getCompletionIcon = (status: string) => {
    switch (status) {
      case 'complete': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'partial': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default: return null;
    }
  };

  const getMealTypeTime = (mealType: string) => {
    return MEAL_TYPES.find(type => type.value === mealType)?.time || '';
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-6 w-6" />
              <div>
                <CardTitle>Meal Plan Calendar</CardTitle>
                <CardDescription>Schedule and track your meal preparation</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={viewMode} onValueChange={(value: 'week' | 'month') => setViewMode(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Week View</SelectItem>
                  <SelectItem value="month">Month View</SelectItem>
                </SelectContent>
              </Select>
              <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Meal
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </div>
        </CardHeader>
      </Card>

      {viewMode === 'week' && (
        <div className="space-y-4">
          {/* Week Navigation */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => setSelectedDate(addDays(selectedDate, -7))}
                >
                  Previous Week
                </Button>
                <h3 className="text-lg font-semibold">
                  {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
                </h3>
                <Button
                  variant="outline"
                  onClick={() => setSelectedDate(addDays(selectedDate, 7))}
                >
                  Next Week
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Week Grid */}
          <div className="grid gap-4 lg:grid-cols-7">
            {weekDays.map(date => {
              const dateKey = format(date, 'yyyy-MM-dd');
              const daySchedule = schedulesByDate[dateKey];
              const isSelected = isSameDay(date, selectedDate);
              const isCurrentDay = isToday(date);

              return (
                <Card 
                  key={dateKey}
                  className={`cursor-pointer transition-colors ${
                    isSelected ? 'ring-2 ring-primary border-primary' : ''
                  } ${isCurrentDay ? 'bg-blue-50' : ''}`}
                  onClick={() => setSelectedDate(date)}
                >
                  <CardHeader className="p-3 pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">
                          {format(date, 'EEE')}
                        </p>
                        <p className={`text-lg font-bold ${isCurrentDay ? 'text-blue-600' : ''}`}>
                          {format(date, 'd')}
                        </p>
                      </div>
                      {getCompletionIcon(daySchedule.completion_status)}
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <div className="space-y-1">
                      {daySchedule.meals.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No meals planned</p>
                      ) : (
                        <>
                          {daySchedule.meals.slice(0, 2).map((meal) => (
                            <div
                              key={meal.id}
                              className="flex items-center justify-between text-xs"
                            >
                              <span className="truncate">
                                {meal.recipe_name}
                              </span>
                              <Badge
                                className={`text-xs ${STATUS_COLORS[meal.status]} ml-1`}
                                variant="secondary"
                              >
                                {meal.meal_type}
                              </Badge>
                            </div>
                          ))}
                          {daySchedule.meals.length > 2 && (
                            <p className="text-xs text-muted-foreground">
                              +{daySchedule.meals.length - 2} more
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                            <Clock className="h-3 w-3" />
                            {daySchedule.total_prep_time + daySchedule.total_cook_time}min total
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {viewMode === 'month' && (
        <Card>
          <CardContent className="p-6">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border w-full"
              modifiers={{
                hasmeals: (date) => {
                  const dateKey = format(date, 'yyyy-MM-dd');
                  return schedulesByDate[dateKey]?.meals.length > 0;
                }
              }}
              modifiersStyles={{
                hasmeals: {
                  backgroundColor: 'var(--primary)',
                  color: 'white'
                }
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Selected Day Detail */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              {isToday(selectedDate) && (
                <Badge variant="default">Today</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {schedulesByDate[format(selectedDate, 'yyyy-MM-dd')]?.meals.length === 0 ? (
              <div className="text-center py-6">
                <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No meals scheduled for this day</p>
                <Button onClick={() => setShowScheduleDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Your First Meal
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {schedulesByDate[format(selectedDate, 'yyyy-MM-dd')]?.meals
                  .sort((a, b) => MEAL_TYPES.findIndex(t => t.value === a.meal_type) - MEAL_TYPES.findIndex(t => t.value === b.meal_type))
                  .map((meal) => (
                    <div key={meal.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <Badge variant="outline" className="capitalize">
                            {meal.meal_type}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {getMealTypeTime(meal.meal_type)}
                          </span>
                          <Badge className={STATUS_COLORS[meal.status]}>
                            {meal.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <h4 className="font-medium">{meal.recipe_name}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Prep: {meal.prep_time}min, Cook: {meal.cook_time}min
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {meal.servings} servings
                          </div>
                        </div>
                        {meal.notes && (
                          <p className="text-sm text-muted-foreground mt-2">{meal.notes}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Select 
                          value={meal.status} 
                          onValueChange={(value) => onUpdateSchedule(meal.id, { status: value as any })}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="planned">Planned</SelectItem>
                            <SelectItem value="prep_started">Prep Started</SelectItem>
                            <SelectItem value="cooking">Cooking</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditSchedule(meal)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDeleteSchedule(meal.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Schedule Meal Dialog */}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingSchedule ? 'Edit Meal Schedule' : 'Schedule New Meal'}
          </DialogTitle>
          <DialogDescription>
            Plan a meal for {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Meal Type</label>
              <Select 
                value={newMealSchedule.meal_type} 
                onValueChange={(value) => setNewMealSchedule(prev => ({ ...prev, meal_type: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MEAL_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label} ({type.time})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select 
                value={newMealSchedule.status} 
                onValueChange={(value) => setNewMealSchedule(prev => ({ ...prev, status: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="prep_started">Prep Started</SelectItem>
                  <SelectItem value="cooking">Cooking</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Recipe Name</label>
            <input
              type="text"
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
              value={newMealSchedule.recipe_name || ''}
              onChange={(e) => setNewMealSchedule(prev => ({ ...prev, recipe_name: e.target.value }))}
              placeholder="Enter recipe name"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Prep Time (min)</label>
              <input
                type="number"
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                value={newMealSchedule.prep_time || 15}
                onChange={(e) => setNewMealSchedule(prev => ({ ...prev, prep_time: parseInt(e.target.value) || 15 }))}
                min="0"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Cook Time (min)</label>
              <input
                type="number"
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                value={newMealSchedule.cook_time || 30}
                onChange={(e) => setNewMealSchedule(prev => ({ ...prev, cook_time: parseInt(e.target.value) || 30 }))}
                min="0"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Servings</label>
              <input
                type="number"
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                value={newMealSchedule.servings || 4}
                onChange={(e) => setNewMealSchedule(prev => ({ ...prev, servings: parseInt(e.target.value) || 4 }))}
                min="1"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Notes (Optional)</label>
            <textarea
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
              value={newMealSchedule.notes || ''}
              onChange={(e) => setNewMealSchedule(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Add any notes about this meal..."
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={editingSchedule ? handleUpdateSchedule : handleScheduleMeal}
              disabled={!newMealSchedule.recipe_name}
            >
              {editingSchedule ? 'Update Schedule' : 'Schedule Meal'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </div>
  );
};