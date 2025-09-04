import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Smartphone,
  Download,
  Wifi,
  WifiOff,
  HardDrive,
  Trash2,
  RefreshCw,
  Settings,
  Bell,
  BellOff,
  CheckCircle,
  AlertCircle,
  Info,
} from 'lucide-react';
import { 
  registerServiceWorker, 
  setupPWAInstallPrompt,
  clearCache,
  getCacheInfo,
  networkManager,
  offlineStorage,
  OfflineRecipeManager,
  OfflineShoppingManager,
} from '@/lib/pwaUtils';

interface PWAManagerProps {
  onInstallPrompt?: () => void;
  onCacheCleared?: () => void;
}

interface PWAStatus {
  isInstalled: boolean;
  isOnline: boolean;
  serviceWorkerActive: boolean;
  notificationsEnabled: boolean;
  cacheSize: number;
  cacheQuota: number;
  offlineRecipesCount: number;
  offlineShoppingListsCount: number;
}

export const PWAManager: React.FC<PWAManagerProps> = ({
  onInstallPrompt,
  onCacheCleared,
}) => {
  const [pwaStatus, setPwaStatus] = useState<PWAStatus>({
    isInstalled: false,
    isOnline: navigator.onLine,
    serviceWorkerActive: false,
    notificationsEnabled: false,
    cacheSize: 0,
    cacheQuota: 0,
    offlineRecipesCount: 0,
    offlineShoppingListsCount: 0,
  });

  const [showInstallButton, setShowInstallButton] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    initializePWA();
    setupEventListeners();
    
    return () => {
      // Cleanup if needed
    };
  }, []);

  const initializePWA = async () => {
    setLoading(true);
    try {
      // Register service worker
      const registration = await registerServiceWorker();
      
      // Set up install prompt
      setupPWAInstallPrompt();
      
      // Check PWA status
      await updatePWAStatus();
      
      // Setup network status listener
      const cleanup = networkManager.onStatusChange((online) => {
        setPwaStatus(prev => ({ ...prev, isOnline: online }));
      });

      setLoading(false);
      return cleanup;
    } catch (error) {
      console.error('Failed to initialize PWA:', error);
      setLoading(false);
    }
  };

  const setupEventListeners = () => {
    // Install prompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowInstallButton(true);
    });

    // App installed event
    window.addEventListener('appinstalled', () => {
      setInstallPrompt(null);
      setShowInstallButton(false);
      setPwaStatus(prev => ({ ...prev, isInstalled: true }));
    });

    // Service worker messages
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'SYNC_COMPLETE') {
          setLastSync(new Date());
          updatePWAStatus();
        }
      });
    }

    // Online/offline events
    window.addEventListener('online', () => {
      setPwaStatus(prev => ({ ...prev, isOnline: true }));
    });

    window.addEventListener('offline', () => {
      setPwaStatus(prev => ({ ...prev, isOnline: false }));
    });
  };

  const updatePWAStatus = async () => {
    try {
      // Check installation status
      const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                         window.matchMedia('(display-mode: fullscreen)').matches;

      // Check service worker
      const serviceWorkerActive = 'serviceWorker' in navigator && 
                                 !!(await navigator.serviceWorker.getRegistration());

      // Check notifications
      const notificationsEnabled = 'Notification' in window && 
                                   Notification.permission === 'granted';

      // Get cache info
      const cacheInfo = await getCacheInfo();

      // Initialize offline storage and get counts
      await offlineStorage.init();
      const recipeManager = new OfflineRecipeManager(offlineStorage);
      const shoppingManager = new OfflineShoppingManager(offlineStorage);
      
      const offlineRecipes = await recipeManager.getAllRecipes();
      const offlineShoppingLists = await shoppingManager.getAllShoppingLists();

      setPwaStatus({
        isInstalled,
        isOnline: navigator.onLine,
        serviceWorkerActive,
        notificationsEnabled,
        cacheSize: cacheInfo.size,
        cacheQuota: cacheInfo.quota,
        offlineRecipesCount: offlineRecipes.length,
        offlineShoppingListsCount: offlineShoppingLists.length,
      });
    } catch (error) {
      console.error('Failed to update PWA status:', error);
    }
  };

  const handleInstallApp = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setInstallPrompt(null);
        setShowInstallButton(false);
      }
      
      if (onInstallPrompt) {
        onInstallPrompt();
      }
    }
  };

  const handleClearCache = async () => {
    setLoading(true);
    try {
      await clearCache();
      await offlineStorage.clear('recipes');
      await offlineStorage.clear('shopping_lists');
      await offlineStorage.clear('cached_data');
      
      await updatePWAStatus();
      
      if (onCacheCleared) {
        onCacheCleared();
      }
      
      // Show success message
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        registration.showNotification('Cache Cleared', {
          body: 'All cached data has been cleared successfully.',
          icon: '/icon-192x192.png',
        });
      }
    } catch (error) {
      console.error('Failed to clear cache:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setPwaStatus(prev => ({ 
        ...prev, 
        notificationsEnabled: permission === 'granted' 
      }));
    }
  };

  const forceSync = async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration.sync) {
        try {
          await registration.sync.register('sync-all');
          setLastSync(new Date());
        } catch (error) {
          console.error('Background sync failed:', error);
        }
      }
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCacheUsagePercentage = (): number => {
    if (pwaStatus.cacheQuota === 0) return 0;
    return (pwaStatus.cacheSize / pwaStatus.cacheQuota) * 100;
  };

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="w-4 h-4 text-green-600" />
    ) : (
      <AlertCircle className="w-4 h-4 text-red-600" />
    );
  };

  const getConnectionIcon = () => {
    return pwaStatus.isOnline ? (
      <Wifi className="w-4 h-4 text-green-600" />
    ) : (
      <WifiOff className="w-4 h-4 text-red-600" />
    );
  };

  return (
    <div className="space-y-6">
      {/* PWA Installation Banner */}
      {showInstallButton && (
        <Alert>
          <Smartphone className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Install Teller Plan Magic as an app for the best experience!</span>
            <Button size="sm" onClick={handleInstallApp}>
              <Download className="w-4 h-4 mr-2" />
              Install App
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* PWA Status Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            PWA Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="status">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="status">Status</TabsTrigger>
              <TabsTrigger value="storage">Storage</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="status" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="flex items-center gap-2">
                      {getConnectionIcon()}
                      Connection
                    </span>
                    <Badge variant={pwaStatus.isOnline ? 'default' : 'destructive'}>
                      {pwaStatus.isOnline ? 'Online' : 'Offline'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="flex items-center gap-2">
                      {getStatusIcon(pwaStatus.isInstalled)}
                      App Installation
                    </span>
                    <Badge variant={pwaStatus.isInstalled ? 'default' : 'secondary'}>
                      {pwaStatus.isInstalled ? 'Installed' : 'Browser'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="flex items-center gap-2">
                      {getStatusIcon(pwaStatus.serviceWorkerActive)}
                      Service Worker
                    </span>
                    <Badge variant={pwaStatus.serviceWorkerActive ? 'default' : 'destructive'}>
                      {pwaStatus.serviceWorkerActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="flex items-center gap-2">
                      {getStatusIcon(pwaStatus.notificationsEnabled)}
                      Notifications
                    </span>
                    <Badge variant={pwaStatus.notificationsEnabled ? 'default' : 'secondary'}>
                      {pwaStatus.notificationsEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Offline Recipes</span>
                      <Badge variant="outline">{pwaStatus.offlineRecipesCount}</Badge>
                    </div>
                    <p className="text-xs text-gray-600">
                      Recipes available when offline
                    </p>
                  </div>

                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Shopping Lists</span>
                      <Badge variant="outline">{pwaStatus.offlineShoppingListsCount}</Badge>
                    </div>
                    <p className="text-xs text-gray-600">
                      Lists synced for offline use
                    </p>
                  </div>

                  {lastSync && (
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Last Sync</span>
                        <Badge variant="outline">
                          {lastSync.toLocaleTimeString()}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">
                        Data synchronized with server
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={forceSync} disabled={!pwaStatus.isOnline || loading}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Sync Now
                </Button>
                
                <Button variant="outline" onClick={updatePWAStatus}>
                  <Info className="w-4 h-4 mr-2" />
                  Refresh Status
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="storage" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Cache Usage</span>
                    <span className="text-sm text-gray-600">
                      {formatBytes(pwaStatus.cacheSize)} / {formatBytes(pwaStatus.cacheQuota)}
                    </span>
                  </div>
                  <Progress value={getCacheUsagePercentage()} className="h-2" />
                  <p className="text-xs text-gray-600 mt-1">
                    {getCacheUsagePercentage().toFixed(1)}% of available storage used
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <HardDrive className="w-4 h-4" />
                      <span className="font-medium">App Cache</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Static files and resources
                    </p>
                  </div>

                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <HardDrive className="w-4 h-4" />
                      <span className="font-medium">Recipe Data</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Offline recipe storage
                    </p>
                  </div>

                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <HardDrive className="w-4 h-4" />
                      <span className="font-medium">Shopping Lists</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Offline shopping data
                    </p>
                  </div>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Clearing cache will remove all offline data and force the app to re-download content.
                    This may be useful if you're experiencing issues.
                  </AlertDescription>
                </Alert>

                <Button 
                  variant="destructive" 
                  onClick={handleClearCache}
                  disabled={loading}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All Cache
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <div className="space-y-4">
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {pwaStatus.notificationsEnabled ? (
                        <Bell className="w-4 h-4 text-green-600" />
                      ) : (
                        <BellOff className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="font-medium">Push Notifications</span>
                    </div>
                    {!pwaStatus.notificationsEnabled && (
                      <Button size="sm" onClick={requestNotificationPermission}>
                        Enable
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    Get notified when timers complete and for important updates
                  </p>
                </div>

                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Download className="w-4 h-4" />
                    <span className="font-medium">App Installation</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Install the app on your device for faster access and better integration
                  </p>
                  {showInstallButton ? (
                    <Button size="sm" onClick={handleInstallApp}>
                      Install Now
                    </Button>
                  ) : pwaStatus.isInstalled ? (
                    <Badge variant="default">Already Installed</Badge>
                  ) : (
                    <Badge variant="secondary">Installation not available</Badge>
                  )}
                </div>

                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Settings className="w-4 h-4" />
                    <span className="font-medium">Offline Features</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Automatically cache recipes and shopping lists for offline use
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <Badge variant="outline">Auto-sync enabled</Badge>
                    <Badge variant="outline">Background updates</Badge>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};