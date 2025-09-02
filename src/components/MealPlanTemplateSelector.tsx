import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Users, DollarSign, Calendar, ChefHat, Lightbulb } from 'lucide-react';
import { 
  MealPlanTemplate, 
  getAllMealPlanTemplates, 
  getTemplatesByCategory,
  getCurrentSeason,
  getSeasonalIngredients 
} from '@/lib/mealPlanTemplates';

interface MealPlanTemplateSelectorProps {
  onSelectTemplate: (template: MealPlanTemplate) => void;
  onCustomCreate: () => void;
}

export const MealPlanTemplateSelector = ({ onSelectTemplate, onCustomCreate }: MealPlanTemplateSelectorProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<MealPlanTemplate | null>(null);
  
  const currentSeason = getCurrentSeason();
  const seasonalIngredients = getSeasonalIngredients();
  
  const templates = selectedCategory === 'all' 
    ? getAllMealPlanTemplates() 
    : getTemplatesByCategory(selectedCategory);

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBudgetIcon = (budget: string) => {
    switch (budget) {
      case 'low': return '$';
      case 'moderate': return '$$';
      case 'high': return '$$$';
      default: return '$$';
    }
  };

  return (
    <div className="space-y-6">
      {/* Seasonal Banner */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-600" />
            <CardTitle className="text-green-800">
              {currentSeason.charAt(0).toUpperCase() + currentSeason.slice(1)} Season
            </CardTitle>
          </div>
          <CardDescription className="text-green-700">
            Fresh seasonal ingredients available now: {seasonalIngredients.slice(0, 4).map(ing => ing.name).join(', ')}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Category Filter */}
      <div className="flex items-center gap-4">
        <label htmlFor="category-select" className="font-medium">Filter by Category:</label>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger id="category-select" className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Templates</SelectItem>
            <SelectItem value="quick">Quick & Easy</SelectItem>
            <SelectItem value="family">Family Friendly</SelectItem>
            <SelectItem value="budget">Budget Conscious</SelectItem>
            <SelectItem value="healthy">Healthy Focus</SelectItem>
            <SelectItem value="seasonal">Seasonal Specials</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Template Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <Card 
            key={template.id} 
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedTemplate?.id === template.id ? 'ring-2 ring-primary border-primary' : ''
            }`}
            onClick={() => setSelectedTemplate(template)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription className="mt-1">{template.description}</CardDescription>
                </div>
                <Badge className={getDifficultyColor(template.difficulty_level)}>
                  {template.difficulty_level}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Template Stats */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{template.prep_time_minutes}min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{template.household_size} people</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    <span>{getBudgetIcon(template.budget_range)}</span>
                  </div>
                </div>

                {/* Cooking Style & Goals */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1 text-sm">
                    <ChefHat className="h-4 w-4 text-muted-foreground" />
                    <span className="capitalize">{template.cooking_style} cooking</span>
                  </div>
                  {template.health_goals.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {template.health_goals.slice(0, 2).map((goal) => (
                        <Badge key={goal} variant="outline" className="text-xs">
                          {goal.replace('_', ' ')}
                        </Badge>
                      ))}
                      {template.health_goals.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.health_goals.length - 2} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                {/* Sample Meals Preview */}
                <div>
                  <h5 className="text-sm font-medium mb-2">Sample Meals:</h5>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {template.meal_suggestions.slice(0, 2).map((meal, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <span className="w-1 h-1 bg-primary rounded-full"></span>
                        {meal.recipe_name}
                      </li>
                    ))}
                    {template.meal_suggestions.length > 2 && (
                      <li className="text-xs italic">
                        ...and {template.meal_suggestions.length - 2} more meals
                      </li>
                    )}
                  </ul>
                </div>

                {/* Batch Cooking Tips Preview */}
                {template.batch_cooking_tips.length > 0 && (
                  <div className="flex items-center gap-1 text-xs text-blue-600">
                    <Lightbulb className="h-3 w-3" />
                    <span>{template.batch_cooking_tips.length} batch cooking tips included</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Template Details Panel */}
      {selectedTemplate && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Template Details: {selectedTemplate.name}</CardTitle>
            <CardDescription>{selectedTemplate.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Complete Meal List */}
            <div>
              <h4 className="font-medium mb-2">Complete Meal Plan ({selectedTemplate.meal_suggestions.length} meals):</h4>
              <div className="grid gap-2">
                {selectedTemplate.meal_suggestions.map((meal, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                    <div>
                      <span className="font-medium">Day {meal.day}: </span>
                      <span>{meal.recipe_name}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        ({meal.meal_type})
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      {meal.prep_time + meal.cook_time}min
                      {meal.batch_cookable && (
                        <Badge variant="secondary" className="text-xs">Batch Cook</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Batch Cooking Tips */}
            {selectedTemplate.batch_cooking_tips.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Batch Cooking Tips:</h4>
                <ul className="space-y-1">
                  {selectedTemplate.batch_cooking_tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Lightbulb className="h-4 w-4 mt-0.5 text-yellow-500 flex-shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button onClick={() => onSelectTemplate(selectedTemplate)} className="flex-1">
                Use This Template
              </Button>
              <Button variant="outline" onClick={onCustomCreate}>
                Create Custom Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Template Selected */}
      {!selectedTemplate && (
        <Card className="border-dashed">
          <CardContent className="text-center py-8">
            <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Choose a Template</h3>
            <p className="text-muted-foreground mb-4">
              Select a meal plan template above to see detailed information and use it as a starting point.
            </p>
            <Button variant="outline" onClick={onCustomCreate}>
              Or Create Your Own Plan
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};