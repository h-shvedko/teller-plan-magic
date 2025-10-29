import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ChefHat, 
  Thermometer, 
  Timer, 
  Power, 
  Settings,
  CheckCircle,
  AlertCircle,
  Wifi,
  WifiOff,
  Smartphone,
  Zap,
  Clock,
  Bell,
  Activity,
  TrendingUp,
  Home,
  Shield
} from 'lucide-react';
import { smartAppliancesIntegration } from '@/lib/thirdPartyIntegrations';
import type { SmartAppliance, ApplianceCommand, CookingProgram } from '@/lib/thirdPartyIntegrations';

interface SmartApplianceIntegrationProps {
  userId: string;
  currentRecipe?: {
    id: string;
    name: string;
    cookingSteps: Array<{
      step: number;
      instruction: string;
      temperature?: number;
      duration?: number;
      appliance?: string;
    }>;
    totalTime: number;
  };
  onApplianceUpdate?: (appliance: SmartAppliance) => void;
}

export function SmartApplianceIntegration({ 
  userId, 
  currentRecipe, 
  onApplianceUpdate 
}: SmartApplianceIntegrationProps) {
  const [connectedAppliances, setConnectedAppliances] = useState<SmartAppliance[]>([]);
  const [discoveredDevices, setDiscoveredDevices] = useState<SmartAppliance[]>([]);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [selectedAppliance, setSelectedAppliance] = useState<string | null>(null);
  const [customCommand, setCustomCommand] = useState({
    temperature: 350,
    duration: 30,
    function: 'bake',
    powerLevel: 50
  });

  const applianceTypes = [
    {
      type: 'smart-oven',
      name: 'Smart Oven',
      icon: <ChefHat className="w-5 h-5" />,
      brands: ['Breville', 'June', 'Tovala', 'Wolf', 'KitchenAid'],
      features: ['Temperature control', 'Timer', 'Presets', 'Remote monitoring']
    },
    {
      type: 'induction-cooktop',
      name: 'Induction Cooktop',
      icon: <Zap className="w-5 h-5" />,
      brands: ['Bosch', 'GE', 'Samsung', 'LG', 'Miele'],
      features: ['Precise temperature', 'Power control', 'Safety features', 'Energy monitoring']
    },
    {
      type: 'sous-vide',
      name: 'Sous Vide Cooker',
      icon: <Thermometer className="w-5 h-5" />,
      brands: ['Anova', 'ChefSteps Joule', 'Instant Pot', 'SousVide Supreme'],
      features: ['Precision cooking', 'Remote monitoring', 'Recipe integration', 'Temperature alerts']
    },
    {
      type: 'smart-refrigerator',
      name: 'Smart Refrigerator',
      icon: <Home className="w-5 h-5" />,
      brands: ['Samsung', 'LG', 'GE', 'Whirlpool', 'Bosch'],
      features: ['Temperature monitoring', 'Inventory tracking', 'Energy management', 'Diagnostics']
    },
    {
      type: 'multicooker',
      name: 'Smart Multicooker',
      icon: <Timer className="w-5 h-5" />,
      brands: ['Instant Pot', 'Ninja', 'Crock-Pot', 'Breville', 'Cuisinart'],
      features: ['Multiple functions', 'Pressure cooking', 'Slow cooking', 'Recipe programs']
    },
    {
      type: 'air-fryer',
      name: 'Smart Air Fryer',
      icon: <Activity className="w-5 h-5" />,
      brands: ['Ninja', 'Cosori', 'Philips', 'Instant Pot', 'Breville'],
      features: ['Air frying', 'Temperature control', 'Timer', 'Recipe presets']
    }
  ];

  const cookingFunctions = [
    'bake', 'roast', 'broil', 'toast', 'reheat', 'dehydrate', 'air-fry', 
    'steam', 'sous-vide', 'pressure-cook', 'slow-cook', 'sauté'
  ];

  useEffect(() => {
    loadConnectedAppliances();
  }, [userId]);

  const loadConnectedAppliances = async () => {
    try {
      const appliances = await smartAppliancesIntegration.getConnectedAppliances(userId);
      setConnectedAppliances(appliances);
    } catch (error) {
      console.error('Failed to load appliances:', error);
    }
  };

  const handleDiscoverDevices = async () => {
    setIsDiscovering(true);
    try {
      const devices = await smartAppliancesIntegration.discoverDevices();
      setDiscoveredDevices(devices);
    } catch (error) {
      console.error('Failed to discover devices:', error);
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleConnectAppliance = async (appliance: SmartAppliance) => {
    try {
      await smartAppliancesIntegration.connectAppliance(userId, appliance.id);
      await loadConnectedAppliances();
      setDiscoveredDevices(prev => prev.filter(d => d.id !== appliance.id));
    } catch (error) {
      console.error('Failed to connect appliance:', error);
    }
  };

  const handleDisconnectAppliance = async (applianceId: string) => {
    try {
      await smartAppliancesIntegration.disconnectAppliance(userId, applianceId);
      await loadConnectedAppliances();
    } catch (error) {
      console.error('Failed to disconnect appliance:', error);
    }
  };

  const handleSendCommand = async (applianceId: string, command: ApplianceCommand) => {
    try {
      await smartAppliancesIntegration.sendCommand(applianceId, command);
      await loadConnectedAppliances(); // Refresh status
    } catch (error) {
      console.error('Failed to send command:', error);
    }
  };

  const handleStartRecipeCooking = async () => {
    if (!currentRecipe || !selectedAppliance) return;

    try {
      const program: CookingProgram = {
        name: currentRecipe.name,
        steps: currentRecipe.cookingSteps.map((step, index) => ({
          stepNumber: index + 1,
          instruction: step.instruction,
          temperature: step.temperature,
          duration: step.duration,
          appliance: step.appliance || 'oven'
        })),
        totalDuration: currentRecipe.totalTime,
        notifications: true
      };

      await smartAppliancesIntegration.startProgram(selectedAppliance, program);
      await loadConnectedAppliances();
    } catch (error) {
      console.error('Failed to start cooking program:', error);
    }
  };

  const getConnectionStatusIcon = (isConnected: boolean, isOnline: boolean) => {
    if (!isConnected) return <WifiOff className="w-4 h-4 text-gray-400" />;
    if (!isOnline) return <AlertCircle className="w-4 h-4 text-orange-500" />;
    return <Wifi className="w-4 h-4 text-green-500" />;
  };

  const getApplianceIcon = (type: string) => {
    const applianceType = applianceTypes.find(t => t.type === type);
    return applianceType?.icon || <ChefHat className="w-5 h-5" />;
  };

  const formatTemperature = (temp: number, unit: string = 'F') => {
    return `${temp}°${unit}`;
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ChefHat className="w-5 h-5" />
                Smart Kitchen Appliances
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Connect and control your smart kitchen appliances for automated cooking
              </p>
            </div>
            <Button
              onClick={handleDiscoverDevices}
              disabled={isDiscovering}
              className="flex items-center gap-2"
            >
              {isDiscovering && <Clock className="w-4 h-4 animate-spin" />}
              Discover Devices
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="connected" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="connected">Connected</TabsTrigger>
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="control">Control</TabsTrigger>
          <TabsTrigger value="programs">Programs</TabsTrigger>
        </TabsList>

        {/* Connected Appliances Tab */}
        <TabsContent value="connected" className="space-y-4">
          {connectedAppliances.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {connectedAppliances.map(appliance => (
                <Card key={appliance.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getApplianceIcon(appliance.type)}
                        <div>
                          <CardTitle className="text-base">{appliance.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {appliance.brand} • {appliance.model}
                          </p>
                        </div>
                      </div>
                      {getConnectionStatusIcon(true, appliance.isOnline)}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Status:</span>
                      <Badge variant={appliance.status === 'idle' ? 'secondary' : 
                                   appliance.status === 'cooking' ? 'default' : 'destructive'}>
                        {appliance.status}
                      </Badge>
                    </div>

                    {appliance.currentProgram && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Program:</span>
                          <span className="font-medium">{appliance.currentProgram}</span>
                        </div>
                        {appliance.remainingTime && (
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Time remaining:</span>
                              <span>{formatDuration(appliance.remainingTime)}</span>
                            </div>
                            <Progress 
                              value={appliance.progress || 0} 
                              className="h-2"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {appliance.currentTemp && (
                        <div>
                          <span className="text-muted-foreground">Temp:</span>
                          <p className="font-medium">{formatTemperature(appliance.currentTemp)}</p>
                        </div>
                      )}
                      {appliance.targetTemp && (
                        <div>
                          <span className="text-muted-foreground">Target:</span>
                          <p className="font-medium">{formatTemperature(appliance.targetTemp)}</p>
                        </div>
                      )}
                      {appliance.powerLevel && (
                        <div>
                          <span className="text-muted-foreground">Power:</span>
                          <p className="font-medium">{appliance.powerLevel}%</p>
                        </div>
                      )}
                      <div>
                        <span className="text-muted-foreground">Energy:</span>
                        <p className="font-medium">{appliance.energyUsage}W</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedAppliance(appliance.id)}
                      >
                        Control
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDisconnectAppliance(appliance.id)}
                      >
                        Disconnect
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <ChefHat className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  No appliances connected yet
                </p>
                <Button onClick={() => document.querySelector<HTMLButtonElement>('[data-tabs-value="discover"]')?.click()}>
                  Discover Devices
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Discover Devices Tab */}
        <TabsContent value="discover" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Available Device Types */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Supported Appliances</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {applianceTypes.map(type => (
                  <div key={type.type} className="space-y-2">
                    <div className="flex items-center gap-2">
                      {type.icon}
                      <span className="font-medium">{type.name}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {type.brands.map(brand => (
                        <Badge key={brand} variant="outline" className="text-xs">
                          {brand}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Discovered Devices */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Discovered Devices</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Found {discoveredDevices.length} device(s) on your network
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {discoveredDevices.length > 0 ? (
                  discoveredDevices.map(device => (
                    <div key={device.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getApplianceIcon(device.type)}
                        <div>
                          <p className="font-medium">{device.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {device.brand} • {device.ipAddress}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleConnectAppliance(device)}
                      >
                        Connect
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Wifi className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {isDiscovering ? 'Scanning network...' : 'Click "Discover Devices" to scan for appliances'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Control Panel Tab */}
        <TabsContent value="control" className="space-y-4">
          {selectedAppliance ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Manual Control</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Send custom commands to your appliance
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3">
                    <div>
                      <Label htmlFor="function">Cooking Function</Label>
                      <Select
                        value={customCommand.function}
                        onValueChange={(value) => setCustomCommand(prev => ({ ...prev, function: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {cookingFunctions.map(func => (
                            <SelectItem key={func} value={func}>
                              {func.charAt(0).toUpperCase() + func.slice(1).replace('-', ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="temperature">Temperature (°F)</Label>
                        <Input
                          id="temperature"
                          type="number"
                          value={customCommand.temperature}
                          onChange={(e) => setCustomCommand(prev => ({ 
                            ...prev, 
                            temperature: parseInt(e.target.value) || 0 
                          }))}
                          min="100"
                          max="500"
                        />
                      </div>
                      <div>
                        <Label htmlFor="duration">Duration (min)</Label>
                        <Input
                          id="duration"
                          type="number"
                          value={customCommand.duration}
                          onChange={(e) => setCustomCommand(prev => ({ 
                            ...prev, 
                            duration: parseInt(e.target.value) || 0 
                          }))}
                          min="1"
                          max="480"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="power-level">Power Level (%)</Label>
                      <div className="space-y-2">
                        <Input
                          id="power-level"
                          type="range"
                          value={customCommand.powerLevel}
                          onChange={(e) => setCustomCommand(prev => ({ 
                            ...prev, 
                            powerLevel: parseInt(e.target.value) 
                          }))}
                          min="10"
                          max="100"
                          step="10"
                        />
                        <div className="text-center text-sm text-muted-foreground">
                          {customCommand.powerLevel}%
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => handleSendCommand(selectedAppliance, {
                        type: 'start',
                        parameters: customCommand
                      })}
                      className="flex items-center gap-2"
                    >
                      <Power className="w-4 h-4" />
                      Start
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleSendCommand(selectedAppliance, {
                        type: 'stop'
                      })}
                      className="flex items-center gap-2"
                    >
                      <Power className="w-4 h-4" />
                      Stop
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    onClick={() => handleSendCommand(selectedAppliance, {
                      type: 'preheat',
                      parameters: { temperature: 350 }
                    })}
                    className="w-full justify-start"
                  >
                    <Thermometer className="w-4 h-4 mr-2" />
                    Preheat to 350°F
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => handleSendCommand(selectedAppliance, {
                      type: 'timer',
                      parameters: { duration: 30 }
                    })}
                    className="w-full justify-start"
                  >
                    <Timer className="w-4 h-4 mr-2" />
                    Set 30 min timer
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => handleSendCommand(selectedAppliance, {
                      type: 'light',
                      parameters: { state: 'toggle' }
                    })}
                    className="w-full justify-start"
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    Toggle Light
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => handleSendCommand(selectedAppliance, {
                      type: 'notifications',
                      parameters: { enabled: true }
                    })}
                    className="w-full justify-start"
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    Enable Notifications
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Settings className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  Select an appliance to control
                </p>
                <Select onValueChange={setSelectedAppliance}>
                  <SelectTrigger className="w-64 mx-auto">
                    <SelectValue placeholder="Choose appliance" />
                  </SelectTrigger>
                  <SelectContent>
                    {connectedAppliances.map(appliance => (
                      <SelectItem key={appliance.id} value={appliance.id}>
                        {appliance.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Cooking Programs Tab */}
        <TabsContent value="programs" className="space-y-4">
          {currentRecipe ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recipe: {currentRecipe.name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Automatically execute cooking steps with your smart appliances
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {currentRecipe.cookingSteps.map((step, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                      <Badge variant="outline">{step.step}</Badge>
                      <div className="flex-1">
                        <p className="text-sm">{step.instruction}</p>
                        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                          {step.temperature && (
                            <span>Temp: {formatTemperature(step.temperature)}</span>
                          )}
                          {step.duration && (
                            <span>Time: {formatDuration(step.duration)}</span>
                          )}
                          {step.appliance && (
                            <span>Appliance: {step.appliance}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid gap-3">
                  <div>
                    <Label>Target Appliance</Label>
                    <Select value={selectedAppliance || ''} onValueChange={setSelectedAppliance}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose appliance for this recipe" />
                      </SelectTrigger>
                      <SelectContent>
                        {connectedAppliances.map(appliance => (
                          <SelectItem key={appliance.id} value={appliance.id}>
                            {appliance.name} ({appliance.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={handleStartRecipeCooking}
                    disabled={!selectedAppliance}
                    className="w-full"
                  >
                    <ChefHat className="w-4 h-4 mr-2" />
                    Start Automated Cooking
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <ChefHat className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Select a recipe to see automated cooking options
                </p>
              </CardContent>
            </Card>
          )}

          {/* Pre-built Programs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pre-built Programs</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {[
                { name: 'Perfect Steak', temp: 400, time: 12, type: 'Sear & Finish' },
                { name: 'Roast Chicken', temp: 375, time: 60, type: 'Roast' },
                { name: 'Bake Cookies', temp: 350, time: 12, type: 'Bake' },
                { name: 'Steam Vegetables', temp: 212, time: 8, type: 'Steam' },
                { name: 'Reheat Pizza', temp: 350, time: 5, type: 'Reheat' },
                { name: 'Dehydrate Fruit', temp: 135, time: 480, type: 'Dehydrate' }
              ].map((program, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{program.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatTemperature(program.temp)} • {formatDuration(program.time)}
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    Start
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}