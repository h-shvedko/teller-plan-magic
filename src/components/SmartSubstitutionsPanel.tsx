import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { 
  ArrowRight, 
  DollarSign, 
  Heart, 
  Leaf,
  TrendingDown,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Info,
  Sparkles
} from 'lucide-react';
import { findSubstitutions, ShoppingItem } from '@/lib/shoppingOptimization';

interface SmartSubstitutionsPanelProps {
  shoppingItems: ShoppingItem[];
  onSubstitutionApply?: (originalItem: string, substitute: string) => void;
  onSubstitutionReject?: (originalItem: string, substitute: string) => void;
}

interface SubstitutionRecommendation {
  original_item: ShoppingItem;
  substitute: string;
  price_factor: number;
  health_benefit: string;
  availability_factor: number;
  price_difference: number;
  confidence_score: number;
  reasons: string[];
}

export const SmartSubstitutionsPanel = ({
  shoppingItems,
  onSubstitutionApply,
  onSubstitutionReject
}: SmartSubstitutionsPanelProps) => {
  const [showOnlySavings, setShowOnlySavings] = useState(false);
  const [showHealthFocus, setShowHealthFocus] = useState(false);
  const [appliedSubstitutions, setAppliedSubstitutions] = useState<Set<string>>(new Set());
  const [rejectedSubstitutions, setRejectedSubstitutions] = useState<Set<string>>(new Set());

  const getSubstitutionRecommendations = (): SubstitutionRecommendation[] => {
    const recommendations: SubstitutionRecommendation[] = [];
    
    shoppingItems.forEach(item => {
      const substitutions = findSubstitutions(item.name);
      
      substitutions.forEach(sub => {
        const priceDifference = (sub.price_factor - 1) * item.estimated_price;
        const confidenceScore = calculateConfidenceScore(sub.price_factor, sub.availability_factor);
        
        const reasons: string[] = [];
        if (sub.price_factor < 1) reasons.push(`Save ${Math.round((1 - sub.price_factor) * 100)}% on cost`);
        if (sub.price_factor > 1) reasons.push(`Premium option (+${Math.round((sub.price_factor - 1) * 100)}%)`);
        if (sub.availability_factor > 1) reasons.push('Better availability');
        if (sub.health_benefit !== 'Similar nutritional value') reasons.push(sub.health_benefit);
        
        recommendations.push({
          original_item: item,
          substitute: sub.substitute,
          price_factor: sub.price_factor,
          health_benefit: sub.health_benefit,
          availability_factor: sub.availability_factor,
          price_difference: priceDifference,
          confidence_score: confidenceScore,
          reasons
        });
      });
    });

    return recommendations
      .filter(rec => {
        const key = `${rec.original_item.name}-${rec.substitute}`;
        if (appliedSubstitutions.has(key) || rejectedSubstitutions.has(key)) return false;
        if (showOnlySavings && rec.price_factor >= 1) return false;
        if (showHealthFocus && !rec.health_benefit.includes('health')) return false;
        return true;
      })
      .sort((a, b) => b.confidence_score - a.confidence_score);
  };

  const calculateConfidenceScore = (priceFactor: number, availabilityFactor: number): number => {
    let score = 50; // Base score
    
    // Price factor contribution (savings increase score)
    if (priceFactor < 1) {
      score += (1 - priceFactor) * 100; // Up to +30 for 30% savings
    } else {
      score -= (priceFactor - 1) * 50; // Penalty for higher cost
    }
    
    // Availability factor contribution
    if (availabilityFactor > 1) {
      score += (availabilityFactor - 1) * 20; // Bonus for better availability
    } else {
      score -= (1 - availabilityFactor) * 30; // Penalty for lower availability
    }
    
    return Math.max(0, Math.min(100, score));
  };

  const handleApplySubstitution = (rec: SubstitutionRecommendation) => {
    const key = `${rec.original_item.name}-${rec.substitute}`;
    setAppliedSubstitutions(prev => new Set([...prev, key]));
    onSubstitutionApply?.(rec.original_item.name, rec.substitute);
  };

  const handleRejectSubstitution = (rec: SubstitutionRecommendation) => {
    const key = `${rec.original_item.name}-${rec.substitute}`;
    setRejectedSubstitutions(prev => new Set([...prev, key]));
    onSubstitutionReject?.(rec.original_item.name, rec.substitute);
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getConfidenceLabel = (score: number) => {
    if (score >= 80) return 'High Confidence';
    if (score >= 60) return 'Medium Confidence';
    return 'Low Confidence';
  };

  const formatPrice = (price: number) => `$${Math.abs(price).toFixed(2)}`;

  const recommendations = getSubstitutionRecommendations();
  const totalSavings = recommendations
    .filter(rec => rec.price_difference < 0)
    .reduce((sum, rec) => sum + Math.abs(rec.price_difference), 0);

  return (
    <div className="space-y-4">
      {/* Header and Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Smart Substitutions
          </CardTitle>
          <CardDescription>
            AI-powered ingredient substitutions to save money and match your preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filter Controls */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="savings-only"
                checked={showOnlySavings}
                onCheckedChange={setShowOnlySavings}
              />
              <label htmlFor="savings-only" className="text-sm font-medium">
                Show only money-saving options
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="health-focus"
                checked={showHealthFocus}
                onCheckedChange={setShowHealthFocus}
              />
              <label htmlFor="health-focus" className="text-sm font-medium">
                Focus on health benefits
              </label>
            </div>
          </div>

          {/* Summary Stats */}
          {recommendations.length > 0 && (
            <div className="grid grid-cols-3 gap-4 p-3 bg-muted/30 rounded-lg">
              <div className="text-center">
                <div className="text-lg font-semibold text-primary">{recommendations.length}</div>
                <div className="text-xs text-muted-foreground">Suggestions Available</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600">
                  {formatPrice(totalSavings)}
                </div>
                <div className="text-xs text-muted-foreground">Potential Savings</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600">
                  {recommendations.filter(r => r.confidence_score >= 80).length}
                </div>
                <div className="text-xs text-muted-foreground">High Confidence</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Substitution Recommendations */}
      <div className="space-y-3">
        {recommendations.map((rec, index) => (
          <Card key={`${rec.original_item.name}-${rec.substitute}`} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="space-y-4">
                {/* Header with confidence score */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Substitution #{index + 1}</span>
                    <Badge className={`text-xs ${getConfidenceColor(rec.confidence_score)}`}>
                      {getConfidenceLabel(rec.confidence_score)} ({Math.round(rec.confidence_score)}%)
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {rec.price_difference < 0 && (
                      <Badge className="bg-green-100 text-green-800">
                        Save {formatPrice(rec.price_difference)}
                      </Badge>
                    )}
                    {rec.price_difference > 0 && (
                      <Badge className="bg-red-100 text-red-800">
                        +{formatPrice(rec.price_difference)}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Substitution Comparison */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 p-3 border rounded-lg">
                    <div className="font-medium capitalize text-center">
                      {rec.original_item.name.replace('_', ' ')}
                    </div>
                    <div className="text-sm text-muted-foreground text-center">
                      {formatPrice(rec.original_item.estimated_price)}
                    </div>
                  </div>
                  
                  <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  
                  <div className="flex-1 p-3 border rounded-lg bg-primary/5">
                    <div className="font-medium capitalize text-center text-primary">
                      {rec.substitute.replace('_', ' ')}
                    </div>
                    <div className="text-sm text-primary text-center">
                      {formatPrice(rec.original_item.estimated_price * rec.price_factor)}
                    </div>
                  </div>
                </div>

                {/* Benefits and Features */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Price Impact */}
                    <div className="flex items-center gap-2">
                      {rec.price_difference < 0 ? (
                        <TrendingDown className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingUp className="h-4 w-4 text-red-600" />
                      )}
                      <span className="text-sm">
                        {rec.price_difference < 0 ? 'Saves' : 'Costs'} {formatPrice(rec.price_difference)}
                      </span>
                    </div>

                    {/* Availability */}
                    <div className="flex items-center gap-2">
                      {rec.availability_factor >= 1 ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      )}
                      <span className="text-sm">
                        {rec.availability_factor >= 1 ? 'Good availability' : 'Limited availability'}
                      </span>
                    </div>
                  </div>

                  {/* Health Benefit */}
                  {rec.health_benefit && rec.health_benefit !== 'Similar nutritional value' && (
                    <div className="flex items-start gap-2 p-2 bg-blue-50 rounded-lg">
                      <Heart className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-blue-900">Health Benefit</div>
                        <div className="text-xs text-blue-800">{rec.health_benefit}</div>
                      </div>
                    </div>
                  )}

                  {/* Reasons */}
                  {rec.reasons.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-sm font-medium">Why this substitution?</div>
                      <ul className="space-y-1">
                        {rec.reasons.map((reason, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <div className="w-1 h-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0"></div>
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => handleRejectSubstitution(rec)}
                    className="flex-1"
                  >
                    Not Interested
                  </Button>
                  <Button 
                    onClick={() => handleApplySubstitution(rec)}
                    className="flex-1"
                  >
                    Apply Substitution
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {recommendations.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No substitutions available</h3>
            <p className="text-muted-foreground">
              {showOnlySavings || showHealthFocus 
                ? 'Try adjusting your filters to see more options.'
                : 'Your current shopping list doesn\'t have any suitable substitution options at this time.'
              }
            </p>
            {(showOnlySavings || showHealthFocus) && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowOnlySavings(false);
                  setShowHealthFocus(false);
                }}
                className="mt-3"
              >
                Reset Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Applied Substitutions Summary */}
      {appliedSubstitutions.size > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-800 mb-1">Substitutions Applied</h4>
                <p className="text-sm text-green-700">
                  {appliedSubstitutions.size} substitution{appliedSubstitutions.size !== 1 ? 's' : ''} applied to your shopping list.
                  Your changes will be reflected in the final list.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips for Better Substitutions */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-2">Substitution Tips</h4>
              <div className="space-y-1 text-sm text-blue-800">
                <p>• Consider your family's taste preferences when accepting substitutions</p>
                <p>• Check expiration dates - substitutes might have different shelf lives</p>
                <p>• Some substitutions may require recipe adjustments</p>
                <p>• Store brands often offer the same quality at lower prices</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};