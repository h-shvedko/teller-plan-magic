import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Heart, 
  Zap, 
  Shield, 
  Target,
  Info,
  BarChart3,
  PieChart,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { calculateNutritionalInfo, NutritionalInfo, NutrientInfo } from '@/lib/recipeEnhancements';

interface NutritionalAnalysisProps {
  recipeName: string;
  ingredients: Array<{name: string, quantity: number, unit: string}>;
  servings: number;
  userProfile?: {
    age: number;
    gender: 'male' | 'female';
    activity_level: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';
    weight_kg?: number;
    height_cm?: number;
    health_goals?: string[];
  };
  onNutritionSave?: (nutrition: NutritionalInfo) => void;
}

// Recommended Daily Values (approximate)
const DAILY_VALUES = {
  calories: 2000,
  protein_grams: 50,
  carbs_grams: 300,
  fat_grams: 65,
  fiber_grams: 25,
  sugar_grams: 50,
  sodium_mg: 2300,
  cholesterol_mg: 300
};

// Health thresholds
const HEALTH_THRESHOLDS = {
  low_sodium: 140, // mg per serving
  high_fiber: 5,   // g per serving
  low_sugar: 6,    // g per serving
  high_protein: 20, // g per serving
  low_cholesterol: 20 // mg per serving
};

export const NutritionalAnalysis = ({
  recipeName,
  ingredients,
  servings,
  userProfile,
  onNutritionSave
}: NutritionalAnalysisProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [trackNutrition, setTrackNutrition] = useState(false);

  const nutritionalInfo = useMemo(() => {
    return calculateNutritionalInfo(ingredients, servings);
  }, [ingredients, servings]);

  const healthBadges = useMemo(() => {
    if (!nutritionalInfo) return [];
    
    const badges = [];
    
    // Low sodium
    if (nutritionalInfo.sodium_mg <= HEALTH_THRESHOLDS.low_sodium) {
      badges.push({ label: 'Low Sodium', color: 'bg-green-100 text-green-800', icon: <Shield className="w-3 h-3" /> });
    }
    
    // High fiber
    if (nutritionalInfo.fiber_grams >= HEALTH_THRESHOLDS.high_fiber) {
      badges.push({ label: 'High Fiber', color: 'bg-blue-100 text-blue-800', icon: <Activity className="w-3 h-3" /> });
    }
    
    // Low sugar
    if (nutritionalInfo.sugar_grams <= HEALTH_THRESHOLDS.low_sugar) {
      badges.push({ label: 'Low Sugar', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-3 h-3" /> });
    }
    
    // High protein
    if (nutritionalInfo.protein_grams >= HEALTH_THRESHOLDS.high_protein) {
      badges.push({ label: 'High Protein', color: 'bg-purple-100 text-purple-800', icon: <TrendingUp className="w-3 h-3" /> });
    }
    
    // Low cholesterol
    if (nutritionalInfo.cholesterol_mg <= HEALTH_THRESHOLDS.low_cholesterol) {
      badges.push({ label: 'Low Cholesterol', color: 'bg-green-100 text-green-800', icon: <Heart className="w-3 h-3" /> });
    }
    
    return badges;
  }, [nutritionalInfo]);

  const calculateDailyValuePercentage = (value: number, nutrient: keyof typeof DAILY_VALUES) => {
    return Math.round((value / DAILY_VALUES[nutrient]) * 100);
  };

  const getNutrientColor = (percentage: number) => {
    if (percentage >= 20) return 'text-green-600';
    if (percentage >= 10) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getMacroColor = (macro: 'protein' | 'carbs' | 'fat') => {
    switch (macro) {
      case 'protein': return 'bg-purple-500';
      case 'carbs': return 'bg-blue-500';
      case 'fat': return 'bg-orange-500';
    }
  };

  const calculateCaloriesFromMacros = () => {
    if (!nutritionalInfo) return { protein: 0, carbs: 0, fat: 0 };
    
    return {
      protein: nutritionalInfo.protein_grams * 4,
      carbs: nutritionalInfo.carbs_grams * 4,
      fat: nutritionalInfo.fat_grams * 9
    };
  };

  const macroCalories = calculateCaloriesFromMacros();
  const totalMacroCalories = macroCalories.protein + macroCalories.carbs + macroCalories.fat;

  if (!nutritionalInfo) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Nutrition Data Unavailable</h3>
          <p className="text-muted-foreground">
            Nutritional information cannot be calculated for this recipe. This may be because the ingredient database doesn't contain nutrition data for all ingredients.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Nutrition Overview Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-6 w-6" />
              <div>
                <CardTitle>Nutritional Analysis</CardTitle>
                <CardDescription>Per serving analysis for "{recipeName}"</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {healthBadges.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {healthBadges.slice(0, 2).map((badge, index) => (
                    <Badge key={index} className={`${badge.color} text-xs flex items-center gap-1`}>
                      {badge.icon}
                      {badge.label}
                    </Badge>
                  ))}
                  {healthBadges.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{healthBadges.length - 2} more
                    </Badge>
                  )}
                </div>
              )}
              {onNutritionSave && (
                <Button
                  variant={trackNutrition ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setTrackNutrition(!trackNutrition);
                    if (!trackNutrition) {
                      onNutritionSave(nutritionalInfo);
                    }
                  }}
                >
                  {trackNutrition ? 'Tracking' : 'Track Nutrition'}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="macros">Macronutrients</TabsTrigger>
          <TabsTrigger value="micros">Micronutrients</TabsTrigger>
          <TabsTrigger value="health">Health Analysis</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Calories */}
            <Card>
              <CardContent className="p-4 text-center">
                <Zap className="h-6 w-6 text-orange-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-500">
                  {nutritionalInfo.calories_per_serving}
                </div>
                <div className="text-sm text-muted-foreground">Calories</div>
                <div className="text-xs text-muted-foreground">
                  {calculateDailyValuePercentage(nutritionalInfo.calories_per_serving, 'calories')}% DV
                </div>
              </CardContent>
            </Card>

            {/* Protein */}
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-500">
                  {nutritionalInfo.protein_grams}g
                </div>
                <div className="text-sm text-muted-foreground">Protein</div>
                <div className="text-xs text-muted-foreground">
                  {calculateDailyValuePercentage(nutritionalInfo.protein_grams, 'protein_grams')}% DV
                </div>
              </CardContent>
            </Card>

            {/* Carbs */}
            <Card>
              <CardContent className="p-4 text-center">
                <Activity className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-500">
                  {nutritionalInfo.carbs_grams}g
                </div>
                <div className="text-sm text-muted-foreground">Carbs</div>
                <div className="text-xs text-muted-foreground">
                  {calculateDailyValuePercentage(nutritionalInfo.carbs_grams, 'carbs_grams')}% DV
                </div>
              </CardContent>
            </Card>

            {/* Fat */}
            <Card>
              <CardContent className="p-4 text-center">
                <Target className="h-6 w-6 text-orange-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-500">
                  {nutritionalInfo.fat_grams}g
                </div>
                <div className="text-sm text-muted-foreground">Fat</div>
                <div className="text-xs text-muted-foreground">
                  {calculateDailyValuePercentage(nutritionalInfo.fat_grams, 'fat_grams')}% DV
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Key Nutrients */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Key Nutrients</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Fiber', value: nutritionalInfo.fiber_grams, unit: 'g', key: 'fiber_grams', icon: <Activity className="w-4 h-4" /> },
                { label: 'Sugar', value: nutritionalInfo.sugar_grams, unit: 'g', key: 'sugar_grams', icon: <AlertCircle className="w-4 h-4" /> },
                { label: 'Sodium', value: nutritionalInfo.sodium_mg, unit: 'mg', key: 'sodium_mg', icon: <Shield className="w-4 h-4" /> },
                { label: 'Cholesterol', value: nutritionalInfo.cholesterol_mg, unit: 'mg', key: 'cholesterol_mg', icon: <Heart className="w-4 h-4" /> }
              ].map((nutrient) => {
                const percentage = calculateDailyValuePercentage(nutrient.value, nutrient.key as keyof typeof DAILY_VALUES);
                return (
                  <div key={nutrient.key} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {nutrient.icon}
                      <span className="font-medium">{nutrient.label}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-32">
                        <Progress value={Math.min(percentage, 100)} className="h-2" />
                      </div>
                      <div className="text-right min-w-[80px]">
                        <div className="font-medium">
                          {nutrient.value}{nutrient.unit}
                        </div>
                        <div className={`text-xs ${getNutrientColor(percentage)}`}>
                          {percentage}% DV
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Macronutrients Tab */}
        <TabsContent value="macros" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Macro Breakdown Pie Chart Representation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Macronutrient Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Visual representation of macros */}
                  <div className="h-4 bg-gray-200 rounded-full overflow-hidden flex">
                    <div 
                      className="bg-purple-500" 
                      style={{ width: `${(macroCalories.protein / totalMacroCalories) * 100}%` }}
                    ></div>
                    <div 
                      className="bg-blue-500" 
                      style={{ width: `${(macroCalories.carbs / totalMacroCalories) * 100}%` }}
                    ></div>
                    <div 
                      className="bg-orange-500" 
                      style={{ width: `${(macroCalories.fat / totalMacroCalories) * 100}%` }}
                    ></div>
                  </div>
                  
                  <div className="space-y-2">
                    {[
                      { label: 'Protein', value: nutritionalInfo.protein_grams, calories: macroCalories.protein, color: 'purple' },
                      { label: 'Carbohydrates', value: nutritionalInfo.carbs_grams, calories: macroCalories.carbs, color: 'blue' },
                      { label: 'Fat', value: nutritionalInfo.fat_grams, calories: macroCalories.fat, color: 'orange' }
                    ].map((macro) => (
                      <div key={macro.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full bg-${macro.color}-500`}></div>
                          <span className="text-sm font-medium">{macro.label}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{macro.value}g</div>
                          <div className="text-xs text-muted-foreground">
                            {macro.calories} cal ({Math.round((macro.calories / totalMacroCalories) * 100)}%)
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Macro Details */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Value Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'Protein', value: nutritionalInfo.protein_grams, unit: 'g', key: 'protein_grams' as const, color: 'purple' },
                  { label: 'Carbohydrates', value: nutritionalInfo.carbs_grams, unit: 'g', key: 'carbs_grams' as const, color: 'blue' },
                  { label: 'Fat', value: nutritionalInfo.fat_grams, unit: 'g', key: 'fat_grams' as const, color: 'orange' }
                ].map((macro) => {
                  const percentage = calculateDailyValuePercentage(macro.value, macro.key);
                  return (
                    <div key={macro.key}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{macro.label}</span>
                        <span className="text-sm">
                          {macro.value}{macro.unit} / {DAILY_VALUES[macro.key]}g
                        </span>
                      </div>
                      <Progress value={Math.min(percentage, 100)} className="h-2" />
                      <div className="text-xs text-muted-foreground mt-1">
                        {percentage}% of daily value
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Micronutrients Tab */}
        <TabsContent value="micros" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Vitamins */}
            {nutritionalInfo.vitamins.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Vitamins
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {nutritionalInfo.vitamins.map((vitamin, index) => (
                      <NutrientRow key={index} nutrient={vitamin} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Minerals */}
            {nutritionalInfo.minerals.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Minerals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {nutritionalInfo.minerals.map((mineral, index) => (
                      <NutrientRow key={index} nutrient={mineral} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {nutritionalInfo.vitamins.length === 0 && nutritionalInfo.minerals.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center">
                <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Limited Micronutrient Data</h3>
                <p className="text-muted-foreground">
                  Detailed vitamin and mineral information is not available for all ingredients in this recipe.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Health Analysis Tab */}
        <TabsContent value="health" className="space-y-4">
          {/* Health Badges */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Health Highlights
              </CardTitle>
            </CardHeader>
            <CardContent>
              {healthBadges.length > 0 ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {healthBadges.map((badge, index) => (
                    <div key={index} className={`p-3 rounded-lg ${badge.color}`}>
                      <div className="flex items-center gap-2">
                        {badge.icon}
                        <span className="font-medium">{badge.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  This recipe doesn't meet specific health criteria thresholds.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Health Recommendations */}
          <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-2">Nutrition Tips</h4>
                  <div className="space-y-1 text-sm text-blue-800">
                    {nutritionalInfo.sodium_mg > HEALTH_THRESHOLDS.low_sodium * 2 && (
                      <p>• Consider reducing salt or using herbs and spices for flavor instead</p>
                    )}
                    {nutritionalInfo.fiber_grams < 3 && (
                      <p>• Add vegetables or whole grains to increase fiber content</p>
                    )}
                    {nutritionalInfo.protein_grams < 10 && (
                      <p>• Consider adding lean protein sources to make this more filling</p>
                    )}
                    {nutritionalInfo.sugar_grams > HEALTH_THRESHOLDS.low_sugar * 2 && (
                      <p>• This recipe is relatively high in sugar - enjoy in moderation</p>
                    )}
                    <p>• Pair with a variety of colorful vegetables for balanced nutrition</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Helper component for nutrient rows
const NutrientRow = ({ nutrient }: { nutrient: NutrientInfo }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm font-medium">{nutrient.name}</span>
    <div className="text-right">
      <div className="text-sm">
        {nutrient.amount.toFixed(1)} {nutrient.unit}
      </div>
      {nutrient.daily_value_percentage && (
        <div className="text-xs text-muted-foreground">
          {nutrient.daily_value_percentage}% DV
        </div>
      )}
    </div>
  </div>
);