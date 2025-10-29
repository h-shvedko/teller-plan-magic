import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Download, FileText, Image, DollarSign, Calendar, Share2, Eye, Clock, CheckCircle, FileType, Palette, Settings, Zap } from 'lucide-react';
import { PremiumFeaturesService, ExportOptions, ExportResult, ExportCustomization } from '../lib/premiumFeatures';

const ExportManager: React.FC = () => {
  const [exportHistory, setExportHistory] = useState<ExportResult[]>([]);
  const [selectedExportType, setSelectedExportType] = useState<'Meal Plan' | 'Shopping List'>('Meal Plan');
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'PDF',
    includeImages: true,
    includeNutrition: true,
    includeCosts: true,
    includeNotes: true,
    customization: {
      template: 'Standard',
      colors: { primary: '#3b82f6', secondary: '#64748b', accent: '#10b981' },
      includeCoverPage: true,
      includeTableOfContents: false,
      pageLayout: 'Portrait',
      fontSize: 'Medium',
      language: 'English'
    }
  });
  const [selectedItemId, setSelectedItemId] = useState('');
  const [exportProgress, setExportProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const service = new PremiumFeaturesService();

  useEffect(() => {
    loadExportHistory();
  }, []);

  const loadExportHistory = async () => {
    setIsLoading(true);
    try {
      const userId = 'current-user'; // Would come from auth context
      const history = await service.getExportHistory(userId);
      setExportHistory(history);
    } catch (error) {
      console.error('Failed to load export history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    if (!selectedItemId) return;

    setIsExporting(true);
    setExportProgress(0);

    // Simulate export progress
    const progressInterval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 20;
      });
    }, 300);

    try {
      let result: ExportResult;
      if (selectedExportType === 'Meal Plan') {
        result = await service.exportMealPlan(selectedItemId, exportOptions);
      } else {
        result = await service.exportShoppingList(selectedItemId, exportOptions);
      }

      setExportProgress(100);
      setTimeout(() => {
        setExportHistory([result, ...exportHistory]);
        setShowExportDialog(false);
        setExportProgress(0);
        setIsExporting(false);
        clearInterval(progressInterval);
      }, 500);
    } catch (error) {
      console.error('Export failed:', error);
      setIsExporting(false);
      setExportProgress(0);
      clearInterval(progressInterval);
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format.toLowerCase()) {
      case 'pdf': return <FileText className="h-4 w-4 text-red-500" />;
      case 'excel': return <FileType className="h-4 w-4 text-green-500" />;
      case 'word': return <FileType className="h-4 w-4 text-blue-500" />;
      case 'csv': return <FileType className="h-4 w-4 text-gray-500" />;
      case 'json': return <FileType className="h-4 w-4 text-purple-500" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'default';
      case 'processing': return 'secondary';
      case 'failed': return 'destructive';
      case 'expired': return 'outline';
      default: return 'outline';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Mock data for available meal plans and shopping lists
  const availableItems = {
    'Meal Plan': [
      { id: 'plan-1', name: 'Mediterranean Week', description: 'Healthy Mediterranean-style meals for 7 days' },
      { id: 'plan-2', name: 'Quick & Easy', description: 'Fast weeknight dinners under 30 minutes' },
      { id: 'plan-3', name: 'Family Favorites', description: 'Kid-friendly meals the whole family will love' }
    ],
    'Shopping List': [
      { id: 'list-1', name: 'Weekly Groceries - March 15', description: 'Complete shopping list for Mediterranean Week' },
      { id: 'list-2', name: 'Pantry Restock', description: 'Essential pantry items and spices' },
      { id: 'list-3', name: 'Party Prep List', description: 'Ingredients for weekend dinner party' }
    ]
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading export manager...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Download className="h-8 w-8 text-blue-500" />
          Export Manager
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Export your meal plans and shopping lists in multiple formats with custom styling and branding options.
        </p>
      </div>

      {/* Quick Export Actions */}
      <div className="flex justify-center">
        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2">
              <Zap className="h-5 w-5" />
              Create New Export
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Custom Export</DialogTitle>
              <DialogDescription>
                Export your meal plans or shopping lists with custom formatting and styling options.
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="format">Format</TabsTrigger>
                <TabsTrigger value="style">Style</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Export Type</Label>
                    <Select value={selectedExportType} onValueChange={(value: any) => setSelectedExportType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Meal Plan">Meal Plan</SelectItem>
                        <SelectItem value="Shopping List">Shopping List</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Select Item</Label>
                    <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose item to export" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableItems[selectedExportType].map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {selectedItemId && (
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2">
                        {availableItems[selectedExportType].find(item => item.id === selectedItemId)?.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {availableItems[selectedExportType].find(item => item.id === selectedItemId)?.description}
                      </p>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-4">
                  <h4 className="font-medium">Content Options</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="include-images"
                        checked={exportOptions.includeImages}
                        onCheckedChange={(checked) => 
                          setExportOptions(prev => ({ ...prev, includeImages: checked }))
                        }
                      />
                      <Label htmlFor="include-images">Include Images</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="include-nutrition"
                        checked={exportOptions.includeNutrition}
                        onCheckedChange={(checked) => 
                          setExportOptions(prev => ({ ...prev, includeNutrition: checked }))
                        }
                      />
                      <Label htmlFor="include-nutrition">Nutrition Information</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="include-costs"
                        checked={exportOptions.includeCosts}
                        onCheckedChange={(checked) => 
                          setExportOptions(prev => ({ ...prev, includeCosts: checked }))
                        }
                      />
                      <Label htmlFor="include-costs">Cost Estimates</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="include-notes"
                        checked={exportOptions.includeNotes}
                        onCheckedChange={(checked) => 
                          setExportOptions(prev => ({ ...prev, includeNotes: checked }))
                        }
                      />
                      <Label htmlFor="include-notes">Personal Notes</Label>
                    </div>
                  </div>
                </div>

                {selectedExportType === 'Meal Plan' && (
                  <div>
                    <Label>Date Range (Optional)</Label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <Input type="date" placeholder="Start date" />
                      <Input type="date" placeholder="End date" />
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="format" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>File Format</Label>
                    <Select value={exportOptions.format} onValueChange={(value: any) => 
                      setExportOptions(prev => ({ ...prev, format: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PDF">PDF Document</SelectItem>
                        <SelectItem value="Excel">Excel Spreadsheet</SelectItem>
                        <SelectItem value="Word">Word Document</SelectItem>
                        <SelectItem value="CSV">CSV File</SelectItem>
                        <SelectItem value="JSON">JSON Data</SelectItem>
                        <SelectItem value="Print">Print-Optimized</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Page Layout</Label>
                    <Select value={exportOptions.customization.pageLayout} onValueChange={(value: any) => 
                      setExportOptions(prev => ({ 
                        ...prev, 
                        customization: { ...prev.customization, pageLayout: value }
                      }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Portrait">Portrait</SelectItem>
                        <SelectItem value="Landscape">Landscape</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Template Style</Label>
                    <Select value={exportOptions.customization.template} onValueChange={(value: any) => 
                      setExportOptions(prev => ({ 
                        ...prev, 
                        customization: { ...prev.customization, template: value }
                      }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Standard">Standard</SelectItem>
                        <SelectItem value="Detailed">Detailed</SelectItem>
                        <SelectItem value="Minimal">Minimal</SelectItem>
                        <SelectItem value="Custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Font Size</Label>
                    <Select value={exportOptions.customization.fontSize} onValueChange={(value: any) => 
                      setExportOptions(prev => ({ 
                        ...prev, 
                        customization: { ...prev.customization, fontSize: value }
                      }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Small">Small</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Document Structure</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="include-cover"
                        checked={exportOptions.customization.includeCoverPage}
                        onCheckedChange={(checked) => 
                          setExportOptions(prev => ({ 
                            ...prev, 
                            customization: { ...prev.customization, includeCoverPage: checked }
                          }))
                        }
                      />
                      <Label htmlFor="include-cover">Cover Page</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="include-toc"
                        checked={exportOptions.customization.includeTableOfContents}
                        onCheckedChange={(checked) => 
                          setExportOptions(prev => ({ 
                            ...prev, 
                            customization: { ...prev.customization, includeTableOfContents: checked }
                          }))
                        }
                      />
                      <Label htmlFor="include-toc">Table of Contents</Label>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="style" className="space-y-4">
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Color Scheme
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Primary Color</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Input
                          type="color"
                          value={exportOptions.customization.colors.primary}
                          onChange={(e) => 
                            setExportOptions(prev => ({
                              ...prev,
                              customization: {
                                ...prev.customization,
                                colors: { ...prev.customization.colors, primary: e.target.value }
                              }
                            }))
                          }
                          className="w-16 h-10"
                        />
                        <Input
                          value={exportOptions.customization.colors.primary}
                          onChange={(e) => 
                            setExportOptions(prev => ({
                              ...prev,
                              customization: {
                                ...prev.customization,
                                colors: { ...prev.customization.colors, primary: e.target.value }
                              }
                            }))
                          }
                          className="flex-1"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label>Secondary Color</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Input
                          type="color"
                          value={exportOptions.customization.colors.secondary}
                          onChange={(e) => 
                            setExportOptions(prev => ({
                              ...prev,
                              customization: {
                                ...prev.customization,
                                colors: { ...prev.customization.colors, secondary: e.target.value }
                              }
                            }))
                          }
                          className="w-16 h-10"
                        />
                        <Input
                          value={exportOptions.customization.colors.secondary}
                          onChange={(e) => 
                            setExportOptions(prev => ({
                              ...prev,
                              customization: {
                                ...prev.customization,
                                colors: { ...prev.customization.colors, secondary: e.target.value }
                              }
                            }))
                          }
                          className="flex-1"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label>Accent Color</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Input
                          type="color"
                          value={exportOptions.customization.colors.accent}
                          onChange={(e) => 
                            setExportOptions(prev => ({
                              ...prev,
                              customization: {
                                ...prev.customization,
                                colors: { ...prev.customization.colors, accent: e.target.value }
                              }
                            }))
                          }
                          className="w-16 h-10"
                        />
                        <Input
                          value={exportOptions.customization.colors.accent}
                          onChange={(e) => 
                            setExportOptions(prev => ({
                              ...prev,
                              customization: {
                                ...prev.customization,
                                colors: { ...prev.customization.colors, accent: e.target.value }
                              }
                            }))
                          }
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Branding (Optional)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="header-text">Header Text</Label>
                      <Input
                        id="header-text"
                        placeholder="e.g., My Meal Plans"
                        value={exportOptions.customization.headerText || ''}
                        onChange={(e) => 
                          setExportOptions(prev => ({
                            ...prev,
                            customization: { ...prev.customization, headerText: e.target.value }
                          }))
                        }
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="footer-text">Footer Text</Label>
                      <Input
                        id="footer-text"
                        placeholder="e.g., Created with TellerPlan"
                        value={exportOptions.customization.footerText || ''}
                        onChange={(e) => 
                          setExportOptions(prev => ({
                            ...prev,
                            customization: { ...prev.customization, footerText: e.target.value }
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Language</Label>
                  <Select value={exportOptions.customization.language} onValueChange={(value: any) => 
                    setExportOptions(prev => ({ 
                      ...prev, 
                      customization: { ...prev.customization, language: value }
                    }))
                  }>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Spanish">Español</SelectItem>
                      <SelectItem value="French">Français</SelectItem>
                      <SelectItem value="German">Deutsch</SelectItem>
                      <SelectItem value="Italian">Italiano</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
            </Tabs>

            {isExporting && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Exporting your {selectedExportType.toLowerCase()}...</span>
                  <span>{Math.round(exportProgress)}%</span>
                </div>
                <Progress value={exportProgress} className="h-2" />
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowExportDialog(false)} disabled={isExporting}>
                Cancel
              </Button>
              <Button onClick={handleExport} disabled={!selectedItemId || isExporting} className="gap-2">
                {isExporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Create Export
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Export History */}
      <Card>
        <CardHeader>
          <CardTitle>Export History</CardTitle>
          <CardDescription>Your recent exports and downloads</CardDescription>
        </CardHeader>
        <CardContent>
          {exportHistory.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">No Exports Yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first export to see it here
              </p>
              <Button onClick={() => setShowExportDialog(true)}>
                Create Export
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {exportHistory.map((exportItem) => (
                <div key={exportItem.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                      {getFormatIcon(exportItem.format)}
                    </div>
                    <div>
                      <h4 className="font-medium">
                        {exportItem.type} Export
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{exportItem.format}</span>
                        <span>•</span>
                        <span>{formatFileSize(exportItem.fileSize)}</span>
                        <span>•</span>
                        <span>{formatDate(exportItem.createdDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={getStatusColor(exportItem.status)}>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {exportItem.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Downloaded {exportItem.downloadCount} times
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {exportItem.isShared && (
                      <Button variant="outline" size="sm" className="gap-1">
                        <Share2 className="h-3 w-3" />
                        Shared
                      </Button>
                    )}
                    <Button variant="outline" size="sm" className="gap-1">
                      <Eye className="h-3 w-3" />
                      Preview
                    </Button>
                    <Button size="sm" className="gap-1">
                      <Download className="h-3 w-3" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Popular Export Templates</CardTitle>
          <CardDescription>Quick templates for common export formats</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                name: 'Weekly Menu PDF',
                description: 'Clean, printable meal plan with photos',
                format: 'PDF',
                features: ['Images', 'Nutrition', 'Shopping List'],
                color: 'blue'
              },
              {
                name: 'Shopping List Excel',
                description: 'Organized grocery list by store sections',
                format: 'Excel',
                features: ['Categories', 'Prices', 'Checkboxes'],
                color: 'green'
              },
              {
                name: 'Recipe Collection',
                description: 'Detailed recipes with instructions',
                format: 'Word',
                features: ['Step-by-step', 'Tips', 'Variations'],
                color: 'purple'
              }
            ].map((template, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{template.name}</h4>
                      <Badge variant="outline">{template.format}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {template.features.map((feature) => (
                        <Badge key={feature} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                    <Button size="sm" className="w-full gap-2">
                      <Zap className="h-3 w-3" />
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Export Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Exports</p>
                <p className="text-2xl font-bold">{exportHistory.length}</p>
              </div>
              <Download className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Most Used Format</p>
                <p className="text-2xl font-bold">PDF</p>
              </div>
              <FileText className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Downloads</p>
                <p className="text-2xl font-bold">
                  {exportHistory.reduce((acc, item) => acc + item.downloadCount, 0)}
                </p>
              </div>
              <Eye className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Shared Items</p>
                <p className="text-2xl font-bold">
                  {exportHistory.filter(item => item.isShared).length}
                </p>
              </div>
              <Share2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExportManager;