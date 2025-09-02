import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Clock, 
  User, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Info,
  ChefHat,
  Timer,
  BarChart3
} from 'lucide-react';
import { calculateCookingTimeEstimate, CookingTimeEstimate } from '@/lib/recipeEnhancements';

interface CookingTimeEstimatorProps {
  recipeName: string;
  basePrepTime: number;
  baseCookTime: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  userSkillLevel?: 'beginner' | 'intermediate' | 'advanced';
  onSkillLevelChange?: (skillLevel: 'beginner' | 'intermediate' | 'advanced') => void;
}

export const CookingTimeEstimator = ({
  recipeName,
  basePrepTime,
  baseCookTime,
  difficulty,
  userSkillLevel = 'intermediate',
  onSkillLevelChange
}: CookingTimeEstimatorProps) => {
  const [selectedSkillLevel, setSelectedSkillLevel] = useState<'beginner' | 'intermediate' | 'advanced'>(userSkillLevel);
  const [showDetails, setShowDetails] = useState(false);
  
  // Calculate estimates for all skill levels
  const beginnerEstimate = calculateCookingTimeEstimate(basePrepTime, baseCookTime, 'beginner');
  const intermediateEstimate = calculateCookingTimeEstimate(basePrepTime, baseCookTime, 'intermediate');
  const advancedEstimate = calculateCookingTimeEstimate(basePrepTime, baseCookTime, 'advanced');
  
  const currentEstimate = selectedSkillLevel === 'beginner' ? beginnerEstimate :
                         selectedSkillLevel === 'intermediate' ? intermediateEstimate : advancedEstimate;

  useEffect(() => {
    setSelectedSkillLevel(userSkillLevel);
  }, [userSkillLevel]);

  const handleSkillLevelChange = (newSkillLevel: 'beginner' | 'intermediate' | 'advanced') => {
    setSelectedSkillLevel(newSkillLevel);
    onSkillLevelChange?.(newSkillLevel);
  };

  const getSkillLevelDescription = (level: 'beginner' | 'intermediate' | 'advanced') => {
    switch (level) {
      case 'beginner':
        return 'New to cooking, takes time with techniques';
      case 'intermediate':
        return 'Comfortable with basic techniques';
      case 'advanced':
        return 'Experienced, efficient with all techniques';
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
    }
    return `${mins}m`;
  };

  return (
    <div className="space-y-4">
      {/* Main Time Estimate Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Timer className="h-5 w-5" />
              <CardTitle>Cooking Time Estimate</CardTitle>
            </div>
            <Badge className={getDifficultyColor(difficulty)}>
              {difficulty} recipe
            </Badge>
          </div>
          <CardDescription>
            Personalized time estimate based on your cooking skill level
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Skill Level Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Skill Level</label>
            <Select value={selectedSkillLevel} onValueChange={handleSkillLevelChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <div>
                      <div>Beginner</div>
                      <div className="text-xs text-muted-foreground">
                        New to cooking
                      </div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="intermediate">
                  <div className="flex items-center gap-2">
                    <ChefHat className="h-4 w-4" />
                    <div>
                      <div>Intermediate</div>
                      <div className="text-xs text-muted-foreground">
                        Comfortable with basics
                      </div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="advanced">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    <div>
                      <div>Advanced</div>
                      <div className="text-xs text-muted-foreground">
                        Experienced cook
                      </div>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {getSkillLevelDescription(selectedSkillLevel)}
            </p>
          </div>

          {/* Time Breakdown */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-2">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <div className="text-lg font-semibold text-blue-600">
                  {formatTime(currentEstimate.estimated_prep_time)}
                </div>
                <div className="text-xs text-blue-600">Prep Time</div>
                {currentEstimate.estimated_prep_time !== currentEstimate.base_prep_time && (
                  <div className="text-xs text-muted-foreground">
                    (Base: {formatTime(currentEstimate.base_prep_time)})
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="p-3 bg-orange-50 rounded-lg">
                <ChefHat className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                <div className="text-lg font-semibold text-orange-600">
                  {formatTime(currentEstimate.estimated_cook_time)}
                </div>
                <div className="text-xs text-orange-600">Cook Time</div>
                {currentEstimate.estimated_cook_time !== currentEstimate.base_cook_time && (
                  <div className="text-xs text-muted-foreground">
                    (Base: {formatTime(currentEstimate.base_cook_time)})
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="p-3 bg-green-50 rounded-lg">
                <Timer className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <div className="text-lg font-semibold text-green-600">
                  {formatTime(currentEstimate.estimated_total_time)}
                </div>
                <div className="text-xs text-green-600">Total Time</div>
              </div>
            </div>
          </div>

          {/* Confidence Level */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Estimate Confidence</span>
              <span className={`text-sm font-medium ${getConfidenceColor(currentEstimate.confidence_level)}`}>
                {Math.round(currentEstimate.confidence_level * 100)}%
              </span>
            </div>
            <Progress 
              value={currentEstimate.confidence_level * 100} 
              className="h-2"
            />
            <p className="text-xs text-muted-foreground">
              {currentEstimate.confidence_level >= 0.8 
                ? 'High confidence - time estimate should be accurate'
                : currentEstimate.confidence_level >= 0.6
                ? 'Medium confidence - allow some extra time'
                : 'Lower confidence - complex recipe, allow extra time'
              }
            </p>
          </div>

          {/* Comparison with Other Skill Levels */}
          <div className="space-y-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="w-full"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              {showDetails ? 'Hide' : 'Show'} Skill Level Comparison
            </Button>
            
            {showDetails && (
              <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
                <h4 className="text-sm font-medium">Time Estimates by Skill Level</h4>
                
                {[
                  { level: 'beginner', estimate: beginnerEstimate, label: 'Beginner' },
                  { level: 'intermediate', estimate: intermediateEstimate, label: 'Intermediate' },
                  { level: 'advanced', estimate: advancedEstimate, label: 'Advanced' }
                ].map(({ level, estimate, label }) => (
                  <div 
                    key={level} 
                    className={`flex items-center justify-between p-2 rounded ${
                      level === selectedSkillLevel ? 'bg-primary/10 border border-primary/20' : 'bg-background'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{label}</span>
                      {level === selectedSkillLevel && (
                        <Badge variant="secondary" className="text-xs">Your Level</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span>Prep: {formatTime(estimate.estimated_prep_time)}</span>
                      <span>Cook: {formatTime(estimate.estimated_cook_time)}</span>
                      <span className="font-medium">Total: {formatTime(estimate.estimated_total_time)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Adjustment Factors */}
      {currentEstimate.factors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Time Adjustment Factors
            </CardTitle>
            <CardDescription>
              Factors that affect cooking time for {selectedSkillLevel} cooks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentEstimate.factors.map((factor, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="mt-1">
                    {factor.impact > 1 ? (
                      <TrendingUp className="h-4 w-4 text-red-500" />
                    ) : factor.impact < 1 ? (
                      <TrendingDown className="h-4 w-4 text-green-500" />
                    ) : (
                      <Target className="h-4 w-4 text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium capitalize">
                        {factor.factor.replace('_', ' ')}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {factor.impact > 1 
                          ? `+${Math.round((factor.impact - 1) * 100)}%` 
                          : factor.impact < 1
                          ? `-${Math.round((1 - factor.impact) * 100)}%`
                          : 'No change'
                        }
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {factor.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips for Better Time Management */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-2">Time Management Tips</h4>
              <div className="space-y-1 text-sm text-blue-800">
                {selectedSkillLevel === 'beginner' && (
                  <>
                    <p>• Read the entire recipe before starting</p>
                    <p>• Prep all ingredients before you begin cooking</p>
                    <p>• Don't rush - focus on technique over speed</p>
                  </>
                )}
                {selectedSkillLevel === 'intermediate' && (
                  <>
                    <p>• Start prep work while other components cook</p>
                    <p>• Use timers for multiple cooking tasks</p>
                    <p>• Keep frequently used tools within reach</p>
                  </>
                )}
                {selectedSkillLevel === 'advanced' && (
                  <>
                    <p>• Optimize your workflow by batching similar tasks</p>
                    <p>• Use all available burners and oven space efficiently</p>
                    <p>• Prep components for multiple meals simultaneously</p>
                  </>
                )}
                <p>• Clean as you go to save time at the end</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};