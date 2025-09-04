import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  Refrigerator,
  Snowflake,
  Clock,
  AlertTriangle,
  CheckCircle,
  Plus,
  RotateCcw,
  Star,
  Calendar,
  Utensils,
  ThermometerSun,
} from 'lucide-react';
import {
  LeftoverItem,
  MealRotation,
  RotationRule,
  advancedPlanningService,
} from '@/lib/advancedPlanningTools';

interface LeftoverManagerProps {
  mealPlanId: string;
}

export const LeftoverManager: React.FC<LeftoverManagerProps> = ({
  mealPlanId,
}) => {
  const [leftovers, setLeftovers] = useState<LeftoverItem[]>([]);
  const [mealRotation, setMealRotation] = useState<MealRotation | null>(null);
  const [showAddLeftover, setShowAddLeftover] = useState(false);
  const [newLeftover, setNewLeftover] = useState<Partial<LeftoverItem>>({
    recipeName: '',
    servingsRemaining: 1,
    storageLocation: 'fridge',
    reheatingInstructions: '',
    qualityRating: 4,
    tags: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mealPlanId) {
      loadLeftovers();
      loadMealRotation();
    }
  }, [mealPlanId]);

  const loadLeftovers = async () => {
    setLoading(true);
    try {
      const mockMealPlan = { id: mealPlanId };
      const result = await advancedPlanningService.manageLeftovers(mockMealPlan);
      setLeftovers(result);
    } catch (error) {
      console.error('Error loading leftovers:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMealRotation = async () => {
    try {
      const mockMealPlan = { id: mealPlanId };
      const result = await advancedPlanningService.createMealRotation(mockMealPlan, 'weekly');
      setMealRotation(result);
    } catch (error) {
      console.error('Error loading meal rotation:', error);
    }
  };

  const addLeftover = () => {
    const leftover: LeftoverItem = {
      id: `leftover-${Date.now()}`,
      mealPlanId,
      recipeName: newLeftover.recipeName || '',
      servingsRemaining: newLeftover.servingsRemaining || 1,
      storageLocation: newLeftover.storageLocation || 'fridge',
      dateStored: new Date(),
      expirationDate: new Date(Date.now() + (newLeftover.storageLocation === 'freezer' ? 30 : 3) * 24 * 60 * 60 * 1000),
      reheatingInstructions: newLeftover.reheatingInstructions || '',
      qualityRating: newLeftover.qualityRating || 4,
      tags: [],
    };

    setLeftovers([...leftovers, leftover]);
    setNewLeftover({
      recipeName: '',
      servingsRemaining: 1,
      storageLocation: 'fridge',
      reheatingInstructions: '',
      qualityRating: 4,
      tags: [],
    });
    setShowAddLeftover(false);
  };

  const updateLeftover = (id: string, updates: Partial<LeftoverItem>) => {
    setLeftovers(leftovers.map(leftover => 
      leftover.id === id ? { ...leftover, ...updates } : leftover
    ));
  };

  const removeLeftover = (id: string) => {
    setLeftovers(leftovers.filter(leftover => leftover.id !== id));
  };

  const getDaysUntilExpiration = (expirationDate: Date) => {
    const now = new Date();
    const diffTime = expirationDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpirationStatus = (expirationDate: Date) => {
    const days = getDaysUntilExpiration(expirationDate);
    if (days < 0) return 'expired';
    if (days <= 1) return 'urgent';
    if (days <= 3) return 'warning';
    return 'good';
  };

  const getExpirationColor = (status: string) => {
    switch (status) {
      case 'expired':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'urgent':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-green-100 text-green-800 border-green-300';
    }
  };

  const renderLeftoverItem = (leftover: LeftoverItem) => {
    const expirationStatus = getExpirationStatus(leftover.expirationDate);
    const daysLeft = getDaysUntilExpiration(leftover.expirationDate);

    return (
      <Card key={leftover.id} className={`mb-3 border-l-4 ${getExpirationColor(expirationStatus)}`}>
        <CardContent className="pt-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-medium">{leftover.recipeName}</h4>
                {leftover.storageLocation === 'freezer' ? (
                  <Snowflake className="w-4 h-4 text-blue-500" />
                ) : (
                  <Refrigerator className="w-4 h-4 text-blue-600" />
                )}
              </div>
              
              <div className="flex items-center gap-4 mb-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Utensils className="w-3 h-3" />
                  {leftover.servingsRemaining} servings
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  {leftover.qualityRating}/5 quality
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Stored {new Date(leftover.dateStored).toLocaleDateString()}
                </div>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-3 h-3" />
                <span className="text-sm">
                  {expirationStatus === 'expired' 
                    ? `Expired ${Math.abs(daysLeft)} days ago`
                    : `Expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`
                  }
                </span>
                <Badge variant={
                  expirationStatus === 'expired' ? 'destructive' :
                  expirationStatus === 'urgent' ? 'destructive' :
                  expirationStatus === 'warning' ? 'default' : 'secondary'
                }>
                  {expirationStatus}
                </Badge>
              </div>

              {leftover.reheatingInstructions && (
                <div className="flex items-start gap-2 text-sm">
                  <ThermometerSun className="w-3 h-3 mt-0.5" />
                  <span className="text-muted-foreground">{leftover.reheatingInstructions}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateLeftover(leftover.id, { 
                  servingsRemaining: Math.max(0, leftover.servingsRemaining - 1) 
                })}
                disabled={leftover.servingsRemaining <= 0}
              >
                Use 1
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => removeLeftover(leftover.id)}
              >
                Remove
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderRotationRule = (rule: RotationRule) => {
    return (
      <div key={rule.ruleType} className="flex items-center justify-between p-3 bg-muted/50 rounded">
        <div className="flex-1">
          <div className="font-medium">
            {rule.ruleType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </div>
          <div className="text-sm text-muted-foreground">
            Priority: {rule.priority}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={rule.enabled ? 'default' : 'secondary'}>
            {rule.enabled ? 'Enabled' : 'Disabled'}
          </Badge>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Refrigerator className="w-6 h-6" />
          Leftover Management
        </h2>
        <Dialog open={showAddLeftover} onOpenChange={setShowAddLeftover}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Leftover
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Leftover</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Recipe Name</Label>
                <Input
                  value={newLeftover.recipeName || ''}
                  onChange={(e) => setNewLeftover({ ...newLeftover, recipeName: e.target.value })}
                  placeholder="Enter recipe name"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Servings Remaining</Label>
                  <Input
                    type="number"
                    min="1"
                    value={newLeftover.servingsRemaining || 1}
                    onChange={(e) => setNewLeftover({ ...newLeftover, servingsRemaining: parseInt(e.target.value) })}
                  />
                </div>
                
                <div>
                  <Label>Storage Location</Label>
                  <Select
                    value={newLeftover.storageLocation || 'fridge'}
                    onValueChange={(value) => setNewLeftover({ ...newLeftover, storageLocation: value as 'fridge' | 'freezer' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fridge">Refrigerator</SelectItem>
                      <SelectItem value="freezer">Freezer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Quality Rating (1-5)</Label>
                <Input
                  type="number"
                  min="1"
                  max="5"
                  value={newLeftover.qualityRating || 4}
                  onChange={(e) => setNewLeftover({ ...newLeftover, qualityRating: parseInt(e.target.value) })}
                />
              </div>

              <div>
                <Label>Reheating Instructions</Label>
                <Input
                  value={newLeftover.reheatingInstructions || ''}
                  onChange={(e) => setNewLeftover({ ...newLeftover, reheatingInstructions: e.target.value })}
                  placeholder="e.g., Microwave for 2-3 minutes"
                />
              </div>

              <Button onClick={addLeftover} className="w-full">
                Add Leftover
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {leftovers.filter(l => getExpirationStatus(l.expirationDate) === 'urgent' || getExpirationStatus(l.expirationDate) === 'expired').length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You have {leftovers.filter(l => getExpirationStatus(l.expirationDate) === 'urgent' || getExpirationStatus(l.expirationDate) === 'expired').length} leftover(s) that need immediate attention!
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Refrigerator className="w-5 h-5" />
            Current Leftovers ({leftovers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {leftovers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Refrigerator className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No leftovers tracked yet</p>
              <p className="text-sm">Add leftovers to keep track of expiration dates and reduce waste</p>
            </div>
          ) : (
            <div>
              {leftovers
                .sort((a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime())
                .map(renderLeftoverItem)}
            </div>
          )}
        </CardContent>
      </Card>

      {mealRotation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5" />
              Meal Rotation Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded">
                <div>
                  <div className="font-medium">Rotation Type</div>
                  <div className="text-sm text-muted-foreground capitalize">
                    {mealRotation.rotationType} rotation
                  </div>
                </div>
                <Badge variant="outline">
                  Last updated: {new Date(mealRotation.lastRotationDate).toLocaleDateString()}
                </Badge>
              </div>

              <div>
                <h4 className="font-medium mb-3">Rotation Rules</h4>
                <div className="space-y-2">
                  {mealRotation.rotationRules.map(renderRotationRule)}
                </div>
              </div>

              {mealRotation.favoriteRotations.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Favorite Rotation Groups</h4>
                  <div className="space-y-2">
                    {mealRotation.favoriteRotations.map((group, index) => (
                      <div key={index} className="p-3 bg-muted/30 rounded">
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="font-medium">Group {index + 1}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {group.join(' → ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {mealRotation.avoidanceList.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Recipes to Avoid</h4>
                  <div className="flex flex-wrap gap-2">
                    {mealRotation.avoidanceList.map((recipe, index) => (
                      <Badge key={index} variant="secondary">
                        {recipe}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};