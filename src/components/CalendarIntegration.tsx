import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Bell,
  CheckCircle,
  AlertCircle,
  Plus,
  Settings,
  Smartphone,
  Globe,
  Sync,
  CalendarDays,
  CalendarPlus
} from 'lucide-react';
import { calendarIntegration } from '@/lib/thirdPartyIntegrations';
import type { CalendarProvider, CalendarEvent, MealEvent, CalendarSync } from '@/lib/thirdPartyIntegrations';

interface CalendarIntegrationProps {
  userId: string;
  mealPlans?: Array<{
    id: string;
    name: string;
    meals: Array<{
      id: string;
      name: string;
      type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
      scheduledTime?: Date;
      prepTime: number;
      cookTime: number;
    }>;
    startDate: Date;
    endDate: Date;
  }>;
  onEventCreated?: (event: CalendarEvent) => void;
}

export function CalendarIntegration({ userId, mealPlans = [], onEventCreated }: CalendarIntegrationProps) {
  const [connectedProviders, setConnectedProviders] = useState<CalendarProvider[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [autoSync, setAutoSync] = useState(true);
  const [syncSettings, setSyncSettings] = useState({
    syncMealPlans: true,
    syncShoppingReminders: true,
    syncPrepReminders: true,
    defaultReminders: [15, 60], // minutes before
    includeNutritionInfo: true,
    includeIngredientsList: false
  });
  const [newEventForm, setNewEventForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: 60,
    location: '',
    calendar: '',
    reminders: [15]
  });

  const availableProviders = [
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      icon: <Globe className="w-5 h-5" />,
      description: 'Sync with your Google Calendar account',
      features: ['Event creation', 'Reminders', 'Multi-calendar', 'Sharing']
    },
    {
      id: 'outlook',
      name: 'Microsoft Outlook',
      icon: <CalendarDays className="w-5 h-5" />,
      description: 'Integrate with Outlook and Office 365',
      features: ['Exchange sync', 'Teams integration', 'Corporate calendars', 'Scheduling']
    },
    {
      id: 'apple-calendar',
      name: 'Apple Calendar (iCal)',
      icon: <Calendar className="w-5 h-5" />,
      description: 'Connect with Apple Calendar and iCloud',
      features: ['iCloud sync', 'Siri integration', 'Apple Watch', 'Family sharing']
    },
    {
      id: 'caldav',
      name: 'CalDAV',
      icon: <Sync className="w-5 h-5" />,
      description: 'Connect to any CalDAV-compatible calendar service',
      features: ['Universal protocol', 'Self-hosted', 'Multiple providers', 'Open standard']
    }
  ];

  useEffect(() => {
    loadUserData();
    const interval = setInterval(() => {
      if (autoSync) {
        handleSyncEvents();
      }
    }, 300000); // Sync every 5 minutes

    return () => clearInterval(interval);
  }, [userId, autoSync]);

  const loadUserData = async () => {
    try {
      const [providers, events] = await Promise.all([
        calendarIntegration.getConnectedProviders(userId),
        calendarIntegration.getUpcomingEvents(userId, 7) // Next 7 days
      ]);

      setConnectedProviders(providers);
      setUpcomingEvents(events);
    } catch (error) {
      console.error('Failed to load calendar data:', error);
    }
  };

  const handleConnectProvider = async (providerId: string) => {
    setSyncStatus('syncing');
    try {
      await calendarIntegration.connectProvider(userId, providerId);
      await loadUserData();
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to connect provider:', error);
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  const handleDisconnectProvider = async (providerId: string) => {
    try {
      await calendarIntegration.disconnectProvider(userId, providerId);
      await loadUserData();
    } catch (error) {
      console.error('Failed to disconnect provider:', error);
    }
  };

  const handleSyncEvents = async () => {
    setSyncStatus('syncing');
    try {
      await calendarIntegration.syncEvents(userId);
      await loadUserData();
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to sync events:', error);
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  const handleSyncMealPlans = async () => {
    if (!mealPlans.length || !connectedProviders.length) return;

    setSyncStatus('syncing');
    try {
      const mealEvents: MealEvent[] = [];
      
      for (const plan of mealPlans) {
        for (const meal of plan.meals) {
          if (meal.scheduledTime) {
            const event: MealEvent = {
              id: `meal-${meal.id}`,
              title: `Cook: ${meal.name}`,
              description: `Meal type: ${meal.type}\nPrep time: ${meal.prepTime} min\nCook time: ${meal.cookTime} min`,
              startDate: new Date(meal.scheduledTime.getTime() - meal.prepTime * 60000),
              endDate: new Date(meal.scheduledTime.getTime() + meal.cookTime * 60000),
              type: 'meal',
              mealId: meal.id,
              mealType: meal.type,
              prepTime: meal.prepTime,
              cookTime: meal.cookTime,
              reminders: syncSettings.defaultReminders,
              includeIngredients: syncSettings.includeIngredientsList,
              includeNutrition: syncSettings.includeNutritionInfo
            };
            mealEvents.push(event);
          }
        }
      }

      await calendarIntegration.syncMealEvents(userId, mealEvents);
      await loadUserData();
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to sync meal plans:', error);
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  const handleCreateEvent = async () => {
    if (!newEventForm.title || !newEventForm.date || !newEventForm.time) return;

    try {
      const startDate = new Date(`${newEventForm.date}T${newEventForm.time}`);
      const endDate = new Date(startDate.getTime() + newEventForm.duration * 60000);

      const event: CalendarEvent = {
        id: `custom-${Date.now()}`,
        title: newEventForm.title,
        description: newEventForm.description,
        startDate,
        endDate,
        location: newEventForm.location,
        calendar: newEventForm.calendar,
        reminders: newEventForm.reminders,
        type: 'custom'
      };

      await calendarIntegration.createEvent(userId, event);
      if (onEventCreated) {
        onEventCreated(event);
      }

      // Reset form
      setNewEventForm({
        title: '',
        description: '',
        date: '',
        time: '',
        duration: 60,
        location: '',
        calendar: '',
        reminders: [15]
      });

      await loadUserData();
    } catch (error) {
      console.error('Failed to create event:', error);
    }
  };

  const getStatusIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return <Clock className="w-4 h-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const formatEventTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatEventDate = (date: Date) => {
    return date.toLocaleDateString([], { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Sync Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Calendar Integration
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Sync meal plans and cooking schedules with your calendar apps
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="auto-sync">Auto Sync</Label>
                <Switch
                  id="auto-sync"
                  checked={autoSync}
                  onCheckedChange={setAutoSync}
                />
              </div>
              <Button
                onClick={handleSyncEvents}
                disabled={syncStatus === 'syncing'}
                className="flex items-center gap-2"
              >
                {getStatusIcon()}
                Sync Now
              </Button>
            </div>
          </div>
        </CardHeader>

        {syncStatus === 'error' && (
          <CardContent>
            <Alert>
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                Failed to sync calendar events. Please check your connections and try again.
              </AlertDescription>
            </Alert>
          </CardContent>
        )}
      </Card>

      <Tabs defaultValue="providers" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="meal-sync">Meal Sync</TabsTrigger>
          <TabsTrigger value="create">Create Event</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Calendar Providers Tab */}
        <TabsContent value="providers" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {availableProviders.map(provider => {
              const isConnected = connectedProviders.find(connected => connected.providerId === provider.id);
              
              return (
                <Card key={provider.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {provider.icon}
                        <div>
                          <CardTitle className="text-base">{provider.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {provider.description}
                          </p>
                        </div>
                      </div>
                      {isConnected && (
                        <Badge variant="default">Connected</Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-1">
                      {provider.features.map(feature => (
                        <Badge key={feature} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                    
                    {isConnected ? (
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">
                          Connected on {isConnected.connectedAt.toLocaleDateString()}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSyncEvents()}
                            disabled={syncStatus === 'syncing'}
                          >
                            Sync Events
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDisconnectProvider(provider.id)}
                          >
                            Disconnect
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        onClick={() => handleConnectProvider(provider.id)}
                        disabled={syncStatus === 'syncing'}
                        className="w-full"
                      >
                        Connect {provider.name}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Upcoming Events Tab */}
        <TabsContent value="events" className="space-y-4">
          {upcomingEvents.length > 0 ? (
            <div className="space-y-3">
              {upcomingEvents.map(event => (
                <Card key={event.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{event.title}</h4>
                          <Badge variant={event.type === 'meal' ? 'default' : 'secondary'}>
                            {event.type}
                          </Badge>
                        </div>
                        {event.description && (
                          <p className="text-sm text-muted-foreground">{event.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatEventDate(event.startDate)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatEventTime(event.startDate)} - {formatEventTime(event.endDate)}
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {event.location}
                            </div>
                          )}
                        </div>
                        {event.reminders && event.reminders.length > 0 && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Bell className="w-3 h-3" />
                            Reminders: {event.reminders.join(', ')} min before
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <CalendarDays className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  No upcoming events found
                </p>
                <Button onClick={() => document.querySelector<HTMLButtonElement>('[data-tabs-value="create"]')?.click()}>
                  Create Event
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Meal Plan Sync Tab */}
        <TabsContent value="meal-sync" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Meal Plan Calendar Sync</CardTitle>
              <p className="text-sm text-muted-foreground">
                Automatically sync your meal plans to connected calendars
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {connectedProviders.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="sync-meal-plans">Sync Meal Plans</Label>
                        <Switch
                          id="sync-meal-plans"
                          checked={syncSettings.syncMealPlans}
                          onCheckedChange={(checked) => setSyncSettings(prev => ({
                            ...prev,
                            syncMealPlans: checked
                          }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="sync-shopping">Shopping Reminders</Label>
                        <Switch
                          id="sync-shopping"
                          checked={syncSettings.syncShoppingReminders}
                          onCheckedChange={(checked) => setSyncSettings(prev => ({
                            ...prev,
                            syncShoppingReminders: checked
                          }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="sync-prep">Prep Reminders</Label>
                        <Switch
                          id="sync-prep"
                          checked={syncSettings.syncPrepReminders}
                          onCheckedChange={(checked) => setSyncSettings(prev => ({
                            ...prev,
                            syncPrepReminders: checked
                          }))}
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="include-nutrition">Include Nutrition Info</Label>
                        <Switch
                          id="include-nutrition"
                          checked={syncSettings.includeNutritionInfo}
                          onCheckedChange={(checked) => setSyncSettings(prev => ({
                            ...prev,
                            includeNutritionInfo: checked
                          }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="include-ingredients">Include Ingredients</Label>
                        <Switch
                          id="include-ingredients"
                          checked={syncSettings.includeIngredientsList}
                          onCheckedChange={(checked) => setSyncSettings(prev => ({
                            ...prev,
                            includeIngredientsList: checked
                          }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Default Reminders (minutes before)</Label>
                    <div className="flex gap-2">
                      {[5, 15, 30, 60, 120].map(minutes => (
                        <Button
                          key={minutes}
                          variant={syncSettings.defaultReminders.includes(minutes) ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            const newReminders = syncSettings.defaultReminders.includes(minutes)
                              ? syncSettings.defaultReminders.filter(r => r !== minutes)
                              : [...syncSettings.defaultReminders, minutes].sort((a, b) => a - b);
                            setSyncSettings(prev => ({ ...prev, defaultReminders: newReminders }));
                          }}
                        >
                          {minutes}min
                        </Button>
                      ))}
                    </div>
                  </div>

                  {mealPlans.length > 0 && (
                    <div className="space-y-2">
                      <Label>Available Meal Plans</Label>
                      <div className="space-y-2">
                        {mealPlans.map(plan => (
                          <div key={plan.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <h4 className="font-medium">{plan.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {plan.meals.length} meals • {formatEventDate(plan.startDate)} - {formatEventDate(plan.endDate)}
                              </p>
                            </div>
                            <Button size="sm" variant="outline">
                              Sync Plan
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button onClick={handleSyncMealPlans} className="w-full" disabled={!mealPlans.length}>
                    <CalendarPlus className="w-4 h-4 mr-2" />
                    Sync All Meal Plans
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Connect a calendar provider to sync your meal plans
                  </p>
                  <Button onClick={() => document.querySelector<HTMLButtonElement>('[data-tabs-value="providers"]')?.click()}>
                    Connect Calendar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Create Event Tab */}
        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create Custom Event
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="event-title">Event Title</Label>
                  <Input
                    id="event-title"
                    value={newEventForm.title}
                    onChange={(e) => setNewEventForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter event title"
                  />
                </div>
                <div>
                  <Label htmlFor="event-calendar">Calendar</Label>
                  <Select
                    value={newEventForm.calendar}
                    onValueChange={(value) => setNewEventForm(prev => ({ ...prev, calendar: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select calendar" />
                    </SelectTrigger>
                    <SelectContent>
                      {connectedProviders.map(provider => (
                        <SelectItem key={provider.providerId} value={provider.providerId}>
                          {provider.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="event-description">Description</Label>
                <Textarea
                  id="event-description"
                  value={newEventForm.description}
                  onChange={(e) => setNewEventForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter event description"
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="event-date">Date</Label>
                  <Input
                    id="event-date"
                    type="date"
                    value={newEventForm.date}
                    onChange={(e) => setNewEventForm(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="event-time">Time</Label>
                  <Input
                    id="event-time"
                    type="time"
                    value={newEventForm.time}
                    onChange={(e) => setNewEventForm(prev => ({ ...prev, time: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="event-duration">Duration (minutes)</Label>
                  <Input
                    id="event-duration"
                    type="number"
                    value={newEventForm.duration}
                    onChange={(e) => setNewEventForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="event-location">Location</Label>
                <Input
                  id="event-location"
                  value={newEventForm.location}
                  onChange={(e) => setNewEventForm(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Enter location (optional)"
                />
              </div>

              <div>
                <Label>Reminders (minutes before)</Label>
                <div className="flex gap-2 mt-2">
                  {[5, 15, 30, 60, 120].map(minutes => (
                    <Button
                      key={minutes}
                      variant={newEventForm.reminders.includes(minutes) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        const newReminders = newEventForm.reminders.includes(minutes)
                          ? newEventForm.reminders.filter(r => r !== minutes)
                          : [...newEventForm.reminders, minutes].sort((a, b) => a - b);
                        setNewEventForm(prev => ({ ...prev, reminders: newReminders }));
                      }}
                    >
                      {minutes}min
                    </Button>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleCreateEvent}
                className="w-full"
                disabled={!newEventForm.title || !newEventForm.date || !newEventForm.time || !connectedProviders.length}
              >
                <CalendarPlus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Calendar Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-sync meal plans</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically sync meal plans when they are updated
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Create prep reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Add reminders for meal preparation time
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Shopping list reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Remind when to shop for meal ingredients
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Sync across all calendars</Label>
                    <p className="text-sm text-muted-foreground">
                      Sync events to all connected calendar providers
                    </p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Include guest count</Label>
                    <p className="text-sm text-muted-foreground">
                      Add expected number of guests to meal events
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}