import React, { useState, useEffect, useRef } from 'react';
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
  Scan, 
  Camera, 
  Package, 
  ShoppingCart, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Plus,
  Minus,
  Edit,
  Search,
  FileText,
  Archive,
  TrendingDown,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { barcodeScanningIntegration } from '@/lib/thirdPartyIntegrations';
import type { ScannedProduct, PantryItem, ScanSession, ProductDatabase } from '@/lib/thirdPartyIntegrations';

interface BarcodeScanningIntegrationProps {
  userId: string;
  onProductScanned?: (product: ScannedProduct) => void;
  onPantryUpdated?: (items: PantryItem[]) => void;
}

export function BarcodeScanningIntegration({ 
  userId, 
  onProductScanned, 
  onPantryUpdated 
}: BarcodeScanningIntegrationProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanHistory, setScanHistory] = useState<ScannedProduct[]>([]);
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [manualEntryForm, setManualEntryForm] = useState({
    barcode: '',
    name: '',
    brand: '',
    category: '',
    quantity: 1,
    unit: 'piece',
    expiryDate: ''
  });
  const [scanSettings, setScanSettings] = useState({
    autoAddToPantry: true,
    playSound: true,
    vibration: true,
    autoDetectExpiry: true,
    multiItemMode: false
  });
  const [currentScanSession, setCurrentScanSession] = useState<ScanSession | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const categories = [
    'Dairy & Eggs', 'Meat & Seafood', 'Fresh Produce', 'Pantry Staples',
    'Frozen Foods', 'Bakery', 'Beverages', 'Snacks', 'Condiments & Sauces',
    'Canned Goods', 'Household Items', 'Personal Care', 'Other'
  ];

  const units = [
    'piece', 'lb', 'kg', 'oz', 'g', 'ml', 'l', 'cup', 'tbsp', 'tsp', 'pack', 'bottle', 'can', 'box'
  ];

  useEffect(() => {
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    try {
      const [history, pantry] = await Promise.all([
        barcodeScanningIntegration.getScanHistory(userId),
        barcodeScanningIntegration.getPantryItems(userId)
      ]);

      setScanHistory(history);
      setPantryItems(pantry);
      
      if (onPantryUpdated) {
        onPantryUpdated(pantry);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsScanning(true);
      }
    } catch (error) {
      console.error('Failed to access camera:', error);
      alert('Camera access denied. Please enable camera permissions.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  const captureAndScan = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0);

    try {
      // Convert canvas to base64 image
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      
      const product = await barcodeScanningIntegration.scanBarcode(imageData);
      
      if (product) {
        await handleProductScanned(product);
      } else {
        alert('No barcode detected. Please try again.');
      }
    } catch (error) {
      console.error('Failed to scan barcode:', error);
      alert('Failed to scan barcode. Please try again.');
    }
  };

  const handleProductScanned = async (product: ScannedProduct) => {
    try {
      // Play sound if enabled
      if (scanSettings.playSound) {
        const audio = new Audio('/scan-beep.mp3');
        audio.play().catch(() => {}); // Ignore if sound fails
      }

      // Vibrate if enabled and supported
      if (scanSettings.vibration && navigator.vibrate) {
        navigator.vibrate(100);
      }

      // Add to scan history
      const updatedHistory = [product, ...scanHistory];
      setScanHistory(updatedHistory);

      // Auto-add to pantry if enabled
      if (scanSettings.autoAddToPantry) {
        const pantryItem: PantryItem = {
          id: `pantry-${Date.now()}`,
          productId: product.id,
          name: product.name,
          brand: product.brand,
          category: product.category,
          barcode: product.barcode,
          quantity: 1,
          unit: product.unit || 'piece',
          addedDate: new Date(),
          expiryDate: scanSettings.autoDetectExpiry ? 
            new Date(Date.now() + (product.shelfLifeDays || 30) * 24 * 60 * 60 * 1000) : 
            undefined,
          location: 'pantry',
          isLowStock: false
        };

        await barcodeScanningIntegration.addToPantry(userId, pantryItem);
        await loadUserData();
      }

      if (onProductScanned) {
        onProductScanned(product);
      }

      // Update current scan session
      if (currentScanSession) {
        const updatedSession = {
          ...currentScanSession,
          scannedItems: [...currentScanSession.scannedItems, product],
          totalItems: currentScanSession.totalItems + 1
        };
        setCurrentScanSession(updatedSession);
      }

    } catch (error) {
      console.error('Failed to process scanned product:', error);
    }
  };

  const handleManualEntry = async () => {
    if (!manualEntryForm.name) return;

    try {
      const product: ScannedProduct = {
        id: `manual-${Date.now()}`,
        barcode: manualEntryForm.barcode || '',
        name: manualEntryForm.name,
        brand: manualEntryForm.brand,
        category: manualEntryForm.category,
        unit: manualEntryForm.unit,
        confidence: 1.0,
        scannedAt: new Date(),
        isManualEntry: true
      };

      const pantryItem: PantryItem = {
        id: `pantry-${Date.now()}`,
        productId: product.id,
        name: product.name,
        brand: product.brand,
        category: product.category,
        barcode: product.barcode,
        quantity: manualEntryForm.quantity,
        unit: manualEntryForm.unit,
        addedDate: new Date(),
        expiryDate: manualEntryForm.expiryDate ? new Date(manualEntryForm.expiryDate) : undefined,
        location: 'pantry',
        isLowStock: false
      };

      await barcodeScanningIntegration.addToPantry(userId, pantryItem);
      await loadUserData();

      // Reset form
      setManualEntryForm({
        barcode: '',
        name: '',
        brand: '',
        category: '',
        quantity: 1,
        unit: 'piece',
        expiryDate: ''
      });

      if (onProductScanned) {
        onProductScanned(product);
      }

    } catch (error) {
      console.error('Failed to add manual entry:', error);
    }
  };

  const handleUpdatePantryItem = async (itemId: string, updates: Partial<PantryItem>) => {
    try {
      await barcodeScanningIntegration.updatePantryItem(userId, itemId, updates);
      await loadUserData();
    } catch (error) {
      console.error('Failed to update pantry item:', error);
    }
  };

  const handleRemovePantryItem = async (itemId: string) => {
    try {
      await barcodeScanningIntegration.removePantryItem(userId, itemId);
      await loadUserData();
    } catch (error) {
      console.error('Failed to remove pantry item:', error);
    }
  };

  const startScanSession = (type: 'shopping' | 'inventory' | 'expiry-check') => {
    const session: ScanSession = {
      id: `session-${Date.now()}`,
      type,
      startTime: new Date(),
      scannedItems: [],
      totalItems: 0,
      isActive: true
    };
    setCurrentScanSession(session);
  };

  const endScanSession = async () => {
    if (currentScanSession) {
      const endedSession = {
        ...currentScanSession,
        endTime: new Date(),
        isActive: false
      };
      
      await barcodeScanningIntegration.saveScanSession(userId, endedSession);
      setCurrentScanSession(null);
    }
  };

  const getItemStatusBadge = (item: PantryItem) => {
    const now = new Date();
    const expiryDate = item.expiryDate;
    
    if (item.isLowStock) {
      return <Badge variant="destructive">Low Stock</Badge>;
    }
    
    if (expiryDate) {
      const daysToExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysToExpiry < 0) {
        return <Badge variant="destructive">Expired</Badge>;
      } else if (daysToExpiry <= 3) {
        return <Badge variant="destructive">Expires Soon</Badge>;
      } else if (daysToExpiry <= 7) {
        return <Badge variant="outline">Expires This Week</Badge>;
      }
    }
    
    return <Badge variant="secondary">Good</Badge>;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getExpiringItems = () => {
    const now = new Date();
    return pantryItems.filter(item => {
      if (!item.expiryDate) return false;
      const daysToExpiry = Math.ceil((item.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysToExpiry <= 7;
    });
  };

  const getLowStockItems = () => {
    return pantryItems.filter(item => item.isLowStock || item.quantity <= 1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Scan className="w-5 h-5" />
                Barcode Scanning & Pantry Management
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Scan products to automatically manage your pantry inventory
              </p>
            </div>
            <div className="flex gap-2">
              {currentScanSession ? (
                <Button
                  onClick={endScanSession}
                  variant="destructive"
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  End Session ({currentScanSession.totalItems})
                </Button>
              ) : (
                <Select onValueChange={(value) => startScanSession(value as any)}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Start Session" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shopping">Shopping Trip</SelectItem>
                    <SelectItem value="inventory">Inventory Check</SelectItem>
                    <SelectItem value="expiry-check">Expiry Check</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{pantryItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Expiring Soon</p>
                <p className="text-2xl font-bold">{getExpiringItems().length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Low Stock</p>
                <p className="text-2xl font-bold">{getLowStockItems().length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Scanned Today</p>
                <p className="text-2xl font-bold">
                  {scanHistory.filter(item => 
                    new Date(item.scannedAt).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="scanner" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="scanner">Scanner</TabsTrigger>
          <TabsTrigger value="pantry">Pantry</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Scanner Tab */}
        <TabsContent value="scanner" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Camera Scanner */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  Camera Scanner
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
                  {isScanning ? (
                    <>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-48 h-32 border-2 border-blue-500 rounded-lg opacity-50"></div>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <Camera className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Camera not active</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <canvas ref={canvasRef} className="hidden" />
                
                <div className="flex gap-2">
                  {isScanning ? (
                    <>
                      <Button onClick={captureAndScan} className="flex-1">
                        <Scan className="w-4 h-4 mr-2" />
                        Scan
                      </Button>
                      <Button onClick={stopCamera} variant="outline">
                        Stop
                      </Button>
                    </>
                  ) : (
                    <Button onClick={startCamera} className="w-full">
                      <Camera className="w-4 h-4 mr-2" />
                      Start Camera
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Manual Entry */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Edit className="w-4 h-4" />
                  Manual Entry
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div>
                    <Label htmlFor="manual-barcode">Barcode (optional)</Label>
                    <Input
                      id="manual-barcode"
                      value={manualEntryForm.barcode}
                      onChange={(e) => setManualEntryForm(prev => ({ ...prev, barcode: e.target.value }))}
                      placeholder="Enter barcode number"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="manual-name">Product Name</Label>
                      <Input
                        id="manual-name"
                        value={manualEntryForm.name}
                        onChange={(e) => setManualEntryForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Product name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="manual-brand">Brand</Label>
                      <Input
                        id="manual-brand"
                        value={manualEntryForm.brand}
                        onChange={(e) => setManualEntryForm(prev => ({ ...prev, brand: e.target.value }))}
                        placeholder="Brand name"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="manual-category">Category</Label>
                    <Select
                      value={manualEntryForm.category}
                      onValueChange={(value) => setManualEntryForm(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="manual-quantity">Quantity</Label>
                      <Input
                        id="manual-quantity"
                        type="number"
                        value={manualEntryForm.quantity}
                        onChange={(e) => setManualEntryForm(prev => ({ 
                          ...prev, 
                          quantity: parseInt(e.target.value) || 1 
                        }))}
                        min="1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="manual-unit">Unit</Label>
                      <Select
                        value={manualEntryForm.unit}
                        onValueChange={(value) => setManualEntryForm(prev => ({ ...prev, unit: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {units.map(unit => (
                            <SelectItem key={unit} value={unit}>
                              {unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="manual-expiry">Expiry Date (optional)</Label>
                    <Input
                      id="manual-expiry"
                      type="date"
                      value={manualEntryForm.expiryDate}
                      onChange={(e) => setManualEntryForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleManualEntry}
                  className="w-full"
                  disabled={!manualEntryForm.name}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Pantry
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pantry Tab */}
        <TabsContent value="pantry" className="space-y-4">
          {pantryItems.length > 0 ? (
            <div className="space-y-3">
              {pantryItems.map(item => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{item.name}</h4>
                          {getItemStatusBadge(item)}
                        </div>
                        {item.brand && (
                          <p className="text-sm text-muted-foreground">{item.brand}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Qty: {item.quantity} {item.unit}</span>
                          <span>Added: {formatDate(item.addedDate)}</span>
                          {item.expiryDate && (
                            <span>Expires: {formatDate(item.expiryDate)}</span>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdatePantryItem(item.id, { 
                            quantity: Math.max(0, item.quantity - 1) 
                          })}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="min-w-[2ch] text-center">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdatePantryItem(item.id, { 
                            quantity: item.quantity + 1 
                          })}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRemovePantryItem(item.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  Your pantry is empty
                </p>
                <Button onClick={() => document.querySelector<HTMLButtonElement>('[data-tabs-value="scanner"]')?.click()}>
                  Start Scanning Items
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <div className="grid gap-4">
            {/* Expiring Items */}
            {getExpiringItems().length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    Items Expiring Soon
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {getExpiringItems().map(item => (
                      <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Expires {formatDate(item.expiryDate!)}
                          </p>
                        </div>
                        <Badge variant="destructive">
                          {Math.ceil((item.expiryDate!.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Low Stock Items */}
            {getLowStockItems().length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-red-500" />
                    Low Stock Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {getLowStockItems().map(item => (
                      <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Only {item.quantity} {item.unit} remaining
                          </p>
                        </div>
                        <Button size="sm">
                          <ShoppingCart className="w-3 h-3 mr-1" />
                          Add to List
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {getExpiringItems().length === 0 && getLowStockItems().length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
                  <p className="text-muted-foreground">
                    No alerts at the moment. Your pantry is well-stocked!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          {scanHistory.length > 0 ? (
            <div className="space-y-2">
              {scanHistory.map((item, index) => (
                <Card key={`${item.id}-${index}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium">{item.name}</h4>
                        {item.brand && (
                          <p className="text-sm text-muted-foreground">{item.brand}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Scanned: {formatDate(item.scannedAt)}</span>
                          <span>Barcode: {item.barcode}</span>
                          <span>Confidence: {Math.round(item.confidence * 100)}%</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">{item.category}</Badge>
                        {item.isManualEntry && (
                          <Badge variant="secondary" className="ml-2">Manual</Badge>
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
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No scan history yet
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Scanner Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-add to pantry</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically add scanned items to your pantry
                    </p>
                  </div>
                  <Switch
                    checked={scanSettings.autoAddToPantry}
                    onCheckedChange={(checked) => setScanSettings(prev => ({ 
                      ...prev, 
                      autoAddToPantry: checked 
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Play scan sound</Label>
                    <p className="text-sm text-muted-foreground">
                      Play audio feedback when scanning
                    </p>
                  </div>
                  <Switch
                    checked={scanSettings.playSound}
                    onCheckedChange={(checked) => setScanSettings(prev => ({ 
                      ...prev, 
                      playSound: checked 
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Vibration feedback</Label>
                    <p className="text-sm text-muted-foreground">
                      Vibrate on successful scan
                    </p>
                  </div>
                  <Switch
                    checked={scanSettings.vibration}
                    onCheckedChange={(checked) => setScanSettings(prev => ({ 
                      ...prev, 
                      vibration: checked 
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-detect expiry</Label>
                    <p className="text-sm text-muted-foreground">
                      Estimate expiry dates based on product type
                    </p>
                  </div>
                  <Switch
                    checked={scanSettings.autoDetectExpiry}
                    onCheckedChange={(checked) => setScanSettings(prev => ({ 
                      ...prev, 
                      autoDetectExpiry: checked 
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Multi-item mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Continue scanning without stopping camera
                    </p>
                  </div>
                  <Switch
                    checked={scanSettings.multiItemMode}
                    onCheckedChange={(checked) => setScanSettings(prev => ({ 
                      ...prev, 
                      multiItemMode: checked 
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}