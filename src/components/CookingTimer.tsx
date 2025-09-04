import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Clock,
  Play,
  Pause,
  Square,
  Plus,
  Trash2,
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  RotateCcw,
  Timer,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

interface CookingTimerProps {
  onTimerComplete?: (timerId: string, timerName: string) => void;
  onTimerStart?: (timerId: string, duration: number) => void;
  initialTimers?: CookingTimerData[];
}

interface CookingTimerData {
  id: string;
  name: string;
  originalDuration: number; // in seconds
  remainingTime: number; // in seconds
  status: 'running' | 'paused' | 'stopped' | 'completed';
  category: string;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  notificationEnabled: boolean;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

interface TimerPreset {
  name: string;
  duration: number; // in minutes
  category: string;
}

const DEFAULT_PRESETS: TimerPreset[] = [
  { name: 'Boil Eggs', duration: 10, category: 'eggs' },
  { name: 'Pasta', duration: 12, category: 'pasta' },
  { name: 'Rice', duration: 18, category: 'rice' },
  { name: 'Pizza', duration: 15, category: 'baking' },
  { name: 'Bread Rising', duration: 60, category: 'baking' },
  { name: 'Tea Steeping', duration: 5, category: 'beverages' },
  { name: 'Coffee Brewing', duration: 4, category: 'beverages' },
  { name: 'Marination', duration: 30, category: 'preparation' },
  { name: 'Rest Meat', duration: 10, category: 'meat' },
  { name: 'Cool Down', duration: 15, category: 'cooling' },
];

const TIMER_CATEGORIES = [
  'general',
  'baking',
  'pasta',
  'rice',
  'meat',
  'vegetables',
  'eggs',
  'beverages',
  'preparation',
  'cooling',
];

export const CookingTimer: React.FC<CookingTimerProps> = ({
  onTimerComplete,
  onTimerStart,
  initialTimers = [],
}) => {
  const [timers, setTimers] = useState<CookingTimerData[]>(initialTimers);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTimer, setNewTimer] = useState({
    name: '',
    hours: 0,
    minutes: 5,
    seconds: 0,
    category: 'general',
  });
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [wakeLockSupported, setWakeLockSupported] = useState(false);
  
  // Refs
  const intervalsRef = useRef<{ [key: string]: NodeJS.Timeout }>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    checkNotificationPermission();
    checkWakeLockSupport();
    initializeAudio();
    
    return () => {
      cleanupTimers();
      releaseWakeLock();
    };
  }, []);

  useEffect(() => {
    // Update intervals when timers change
    updateTimerIntervals();
  }, [timers]);

  const checkNotificationPermission = async () => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
      
      if (Notification.permission === 'default') {
        try {
          const permission = await Notification.requestPermission();
          setNotificationPermission(permission);
        } catch (error) {
          console.error('Failed to request notification permission:', error);
        }
      }
    }
  };

  const checkWakeLockSupport = () => {
    if ('wakeLock' in navigator) {
      setWakeLockSupported(true);
    }
  };

  const initializeAudio = () => {
    // Create timer completion sound
    audioRef.current = new Audio();
    audioRef.current.src = 'data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAAFN3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyAFRQRTEAAAARAAAAU3dpdGNoIFBsdXMgMi4wAFRTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';
  };

  const acquireWakeLock = async () => {
    if (!wakeLockSupported || wakeLockRef.current) return;

    try {
      wakeLockRef.current = await navigator.wakeLock.request('screen');
      console.log('Wake lock acquired');
    } catch (error) {
      console.error('Failed to acquire wake lock:', error);
    }
  };

  const releaseWakeLock = async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
        console.log('Wake lock released');
      } catch (error) {
        console.error('Failed to release wake lock:', error);
      }
    }
  };

  const updateTimerIntervals = () => {
    // Clear existing intervals
    Object.values(intervalsRef.current).forEach(clearInterval);
    intervalsRef.current = {};

    // Create intervals for running timers
    timers.forEach(timer => {
      if (timer.status === 'running') {
        intervalsRef.current[timer.id] = setInterval(() => {
          updateTimer(timer.id);
        }, 1000);
      }
    });
  };

  const updateTimer = (timerId: string) => {
    setTimers(prevTimers => {
      return prevTimers.map(timer => {
        if (timer.id === timerId && timer.status === 'running') {
          const newRemainingTime = Math.max(0, timer.remainingTime - 1);
          
          if (newRemainingTime === 0) {
            handleTimerComplete(timer);
            return {
              ...timer,
              remainingTime: 0,
              status: 'completed' as const,
              completedAt: new Date(),
            };
          }
          
          return {
            ...timer,
            remainingTime: newRemainingTime,
          };
        }
        return timer;
      });
    });
  };

  const handleTimerComplete = async (timer: CookingTimerData) => {
    // Play sound
    if (soundEnabled && timer.soundEnabled && audioRef.current) {
      try {
        await audioRef.current.play();
      } catch (error) {
        console.error('Failed to play timer sound:', error);
      }
    }

    // Show notification
    if (timer.notificationEnabled && notificationPermission === 'granted') {
      showTimerNotification(timer);
    }

    // Vibrate if supported and enabled
    if (timer.vibrationEnabled && 'vibrate' in navigator) {
      navigator.vibrate([500, 200, 500, 200, 500]);
    }

    // Service worker notification for background timers
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        registration.showNotification(`Timer Complete: ${timer.name}`, {
          body: `Your ${timer.name} timer has finished!`,
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png',
          requireInteraction: true,
          tag: `timer-${timer.id}`,
          actions: [
            {
              action: 'dismiss',
              title: 'Dismiss'
            },
            {
              action: 'restart',
              title: 'Restart Timer'
            }
          ]
        });
      } catch (error) {
        console.error('Failed to show service worker notification:', error);
      }
    }

    // Callback
    if (onTimerComplete) {
      onTimerComplete(timer.id, timer.name);
    }

    // Release wake lock if no more running timers
    const hasRunningTimers = timers.some(t => t.status === 'running' && t.id !== timer.id);
    if (!hasRunningTimers) {
      releaseWakeLock();
    }
  };

  const showTimerNotification = (timer: CookingTimerData) => {
    if (notificationPermission === 'granted') {
      const notification = new Notification(`Timer Complete: ${timer.name}`, {
        body: `Your ${timer.name} timer has finished!`,
        icon: '/icon-192x192.png',
        requireInteraction: true,
        tag: `timer-${timer.id}`,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto-close after 10 seconds
      setTimeout(() => {
        notification.close();
      }, 10000);
    }
  };

  const createTimer = () => {
    const { name, hours, minutes, seconds, category } = newTimer;
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    
    if (!name.trim() || totalSeconds === 0) return;

    const timer: CookingTimerData = {
      id: `timer-${Date.now()}`,
      name: name.trim(),
      originalDuration: totalSeconds,
      remainingTime: totalSeconds,
      status: 'stopped',
      category,
      soundEnabled: true,
      vibrationEnabled: 'vibrate' in navigator,
      notificationEnabled: notificationPermission === 'granted',
      createdAt: new Date(),
    };

    setTimers(prev => [...prev, timer]);
    
    // Reset form
    setNewTimer({
      name: '',
      hours: 0,
      minutes: 5,
      seconds: 0,
      category: 'general',
    });
    
    setShowCreateDialog(false);
  };

  const createTimerFromPreset = (preset: TimerPreset) => {
    const timer: CookingTimerData = {
      id: `timer-${Date.now()}`,
      name: preset.name,
      originalDuration: preset.duration * 60,
      remainingTime: preset.duration * 60,
      status: 'stopped',
      category: preset.category,
      soundEnabled: true,
      vibrationEnabled: 'vibrate' in navigator,
      notificationEnabled: notificationPermission === 'granted',
      createdAt: new Date(),
    };

    setTimers(prev => [...prev, timer]);
  };

  const startTimer = async (timerId: string) => {
    await acquireWakeLock();
    
    setTimers(prev => prev.map(timer => {
      if (timer.id === timerId) {
        if (onTimerStart) {
          onTimerStart(timerId, timer.remainingTime);
        }
        
        return {
          ...timer,
          status: 'running' as const,
          startedAt: new Date(),
        };
      }
      return timer;
    }));
  };

  const pauseTimer = (timerId: string) => {
    setTimers(prev => prev.map(timer => 
      timer.id === timerId 
        ? { ...timer, status: 'paused' as const }
        : timer
    ));
  };

  const stopTimer = (timerId: string) => {
    setTimers(prev => prev.map(timer => 
      timer.id === timerId 
        ? { 
            ...timer, 
            status: 'stopped' as const,
            remainingTime: timer.originalDuration,
            startedAt: undefined,
            completedAt: undefined,
          }
        : timer
    ));
  };

  const resetTimer = (timerId: string) => {
    setTimers(prev => prev.map(timer => 
      timer.id === timerId 
        ? { 
            ...timer, 
            remainingTime: timer.originalDuration,
            status: 'stopped' as const,
            startedAt: undefined,
            completedAt: undefined,
          }
        : timer
    ));
  };

  const deleteTimer = (timerId: string) => {
    setTimers(prev => prev.filter(timer => timer.id !== timerId));
    
    if (intervalsRef.current[timerId]) {
      clearInterval(intervalsRef.current[timerId]);
      delete intervalsRef.current[timerId];
    }
  };

  const updateTimerSettings = (timerId: string, updates: Partial<CookingTimerData>) => {
    setTimers(prev => prev.map(timer => 
      timer.id === timerId 
        ? { ...timer, ...updates }
        : timer
    ));
  };

  const cleanupTimers = () => {
    Object.values(intervalsRef.current).forEach(clearInterval);
    intervalsRef.current = {};
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerProgress = (timer: CookingTimerData): number => {
    if (timer.originalDuration === 0) return 0;
    return ((timer.originalDuration - timer.remainingTime) / timer.originalDuration) * 100;
  };

  const getTimerStatusColor = (status: CookingTimerData['status']): string => {
    switch (status) {
      case 'running':
        return 'bg-green-100 border-green-500';
      case 'paused':
        return 'bg-yellow-100 border-yellow-500';
      case 'completed':
        return 'bg-blue-100 border-blue-500';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  const getTimerStatusIcon = (status: CookingTimerData['status']) => {
    switch (status) {
      case 'running':
        return <Play className="w-4 h-4 text-green-600" />;
      case 'paused':
        return <Pause className="w-4 h-4 text-yellow-600" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      default:
        return <Square className="w-4 h-4 text-gray-600" />;
    }
  };

  const runningTimersCount = timers.filter(t => t.status === 'running').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Timer className="w-6 h-6" />
          Cooking Timers
          {runningTimersCount > 0 && (
            <Badge variant="default">{runningTimersCount} active</Badge>
          )}
        </h2>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Timer
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Timer</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Timer Name</Label>
                  <Input
                    value={newTimer.name}
                    onChange={(e) => setNewTimer({ ...newTimer, name: e.target.value })}
                    placeholder="e.g., Pasta Cooking"
                  />
                </div>
                
                <div>
                  <Label>Duration</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-sm">Hours</Label>
                      <Input
                        type="number"
                        min="0"
                        max="23"
                        value={newTimer.hours}
                        onChange={(e) => setNewTimer({ ...newTimer, hours: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Minutes</Label>
                      <Input
                        type="number"
                        min="0"
                        max="59"
                        value={newTimer.minutes}
                        onChange={(e) => setNewTimer({ ...newTimer, minutes: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Seconds</Label>
                      <Input
                        type="number"
                        min="0"
                        max="59"
                        value={newTimer.seconds}
                        onChange={(e) => setNewTimer({ ...newTimer, seconds: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label>Category</Label>
                  <Select
                    value={newTimer.category}
                    onValueChange={(value) => setNewTimer({ ...newTimer, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMER_CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  onClick={createTimer}
                  disabled={!newTimer.name.trim() || (newTimer.hours + newTimer.minutes + newTimer.seconds === 0)}
                >
                  Create Timer
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Notification Permission Alert */}
      {notificationPermission !== 'granted' && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Enable notifications to get alerted when your timers complete.
            <Button
              variant="link"
              className="p-0 h-auto ml-2"
              onClick={checkNotificationPermission}
            >
              Enable Notifications
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Timer Presets */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Start Timers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {DEFAULT_PRESETS.map(preset => (
              <Button
                key={preset.name}
                variant="outline"
                size="sm"
                onClick={() => createTimerFromPreset(preset)}
                className="text-xs"
              >
                <Clock className="w-3 h-3 mr-1" />
                {preset.name}
                <Badge variant="secondary" className="ml-1 text-xs">
                  {preset.duration}m
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Timers */}
      {timers.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Timer className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No timers created</h3>
            <p className="text-gray-600 mb-4">
              Create a custom timer or choose from quick presets above
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Timer
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {timers.map(timer => (
            <Card key={timer.id} className={`border-2 ${getTimerStatusColor(timer.status)}`}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-base">
                  <span className="truncate">{timer.name}</span>
                  <div className="flex items-center gap-2">
                    {getTimerStatusIcon(timer.status)}
                    <Badge variant="outline" className="text-xs">
                      {timer.category}
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Time Display */}
                <div className="text-center">
                  <div className="text-3xl font-mono font-bold">
                    {formatTime(timer.remainingTime)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {timer.status === 'completed' ? 'Completed!' : 
                     timer.status === 'running' ? 'Running' :
                     timer.status === 'paused' ? 'Paused' : 'Ready'}
                  </div>
                </div>

                {/* Progress Bar */}
                <Progress 
                  value={getTimerProgress(timer)} 
                  className="h-2"
                />

                {/* Controls */}
                <div className="flex justify-center gap-2">
                  {timer.status === 'stopped' && (
                    <Button size="sm" onClick={() => startTimer(timer.id)}>
                      <Play className="w-4 h-4" />
                    </Button>
                  )}
                  
                  {timer.status === 'running' && (
                    <Button size="sm" onClick={() => pauseTimer(timer.id)} variant="outline">
                      <Pause className="w-4 h-4" />
                    </Button>
                  )}
                  
                  {timer.status === 'paused' && (
                    <>
                      <Button size="sm" onClick={() => startTimer(timer.id)}>
                        <Play className="w-4 h-4" />
                      </Button>
                      <Button size="sm" onClick={() => stopTimer(timer.id)} variant="outline">
                        <Square className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  
                  {(timer.status === 'completed' || timer.status === 'stopped') && (
                    <Button size="sm" onClick={() => resetTimer(timer.id)} variant="outline">
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  )}
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteTimer(timer.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Settings */}
                <div className="flex justify-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => updateTimerSettings(timer.id, { 
                      soundEnabled: !timer.soundEnabled 
                    })}
                    className={timer.soundEnabled ? 'text-blue-600' : 'text-gray-400'}
                  >
                    <Volume2 className="w-3 h-3" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => updateTimerSettings(timer.id, { 
                      notificationEnabled: !timer.notificationEnabled 
                    })}
                    className={timer.notificationEnabled ? 'text-blue-600' : 'text-gray-400'}
                  >
                    <Bell className="w-3 h-3" />
                  </Button>
                </div>

                {/* Timer Info */}
                <div className="text-xs text-gray-500 text-center">
                  Original: {formatTime(timer.originalDuration)}
                  {timer.startedAt && (
                    <div>Started: {timer.startedAt.toLocaleTimeString()}</div>
                  )}
                  {timer.completedAt && (
                    <div>Completed: {timer.completedAt.toLocaleTimeString()}</div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};