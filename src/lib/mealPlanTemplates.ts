export interface MealPlanTemplate {
  id: string;
  name: string;
  description: string;
  category: 'quick' | 'family' | 'budget' | 'healthy' | 'seasonal';
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  prep_time_minutes: number;
  cooking_style: 'quick' | 'elaborate' | 'mixed';
  household_size: number;
  budget_range: 'low' | 'moderate' | 'high';
  dietary_restrictions: string[];
  health_goals: string[];
  favorite_cuisines: string[];
  meal_suggestions: TemplateMealSuggestion[];
  batch_cooking_tips: string[];
  seasonal_focus?: 'spring' | 'summer' | 'fall' | 'winter';
  created_at: string;
  updated_at: string;
}

export interface TemplateMealSuggestion {
  day: number;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  recipe_name: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  batch_cookable: boolean;
  leftover_friendly: boolean;
  seasonal_ingredients: string[];
}

export interface SeasonalIngredient {
  name: string;
  season: 'spring' | 'summer' | 'fall' | 'winter';
  peak_months: string[];
  substitutes: string[];
}

export interface BatchCookingSuggestion {
  recipe_group: string;
  recipes: string[];
  batch_size: number;
  storage_days: number;
  prep_tips: string[];
  reheating_instructions: string;
}

export const MEAL_PLAN_TEMPLATES: MealPlanTemplate[] = [
  {
    id: 'busy-week',
    name: 'Busy Week',
    description: 'Quick and easy meals for hectic schedules with minimal prep time',
    category: 'quick',
    difficulty_level: 'beginner',
    prep_time_minutes: 15,
    cooking_style: 'quick',
    household_size: 2,
    budget_range: 'moderate',
    dietary_restrictions: [],
    health_goals: ['time_saving'],
    favorite_cuisines: ['american', 'italian', 'asian'],
    meal_suggestions: [
      {
        day: 1,
        meal_type: 'dinner',
        recipe_name: 'Sheet Pan Chicken and Vegetables',
        prep_time: 10,
        cook_time: 25,
        servings: 4,
        batch_cookable: true,
        leftover_friendly: true,
        seasonal_ingredients: ['chicken', 'mixed_vegetables']
      },
      {
        day: 2,
        meal_type: 'dinner',
        recipe_name: '15-Minute Pasta Primavera',
        prep_time: 5,
        cook_time: 10,
        servings: 2,
        batch_cookable: false,
        leftover_friendly: true,
        seasonal_ingredients: ['pasta', 'seasonal_vegetables']
      },
      {
        day: 3,
        meal_type: 'dinner',
        recipe_name: 'Slow Cooker Beef Stew',
        prep_time: 15,
        cook_time: 240,
        servings: 6,
        batch_cookable: true,
        leftover_friendly: true,
        seasonal_ingredients: ['beef', 'root_vegetables']
      }
    ],
    batch_cooking_tips: [
      'Prep vegetables for the week on Sunday',
      'Cook grains in bulk and store in refrigerator',
      'Marinate proteins the night before',
      'Use sheet pan meals for easy cleanup'
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'family-friendly',
    name: 'Family Friendly',
    description: 'Kid-approved meals that adults love too, with hidden vegetables',
    category: 'family',
    difficulty_level: 'intermediate',
    prep_time_minutes: 25,
    cooking_style: 'mixed',
    household_size: 4,
    budget_range: 'moderate',
    dietary_restrictions: [],
    health_goals: ['balanced_nutrition', 'kid_friendly'],
    favorite_cuisines: ['american', 'italian', 'mexican'],
    meal_suggestions: [
      {
        day: 1,
        meal_type: 'dinner',
        recipe_name: 'Hidden Veggie Mac and Cheese',
        prep_time: 15,
        cook_time: 30,
        servings: 6,
        batch_cookable: true,
        leftover_friendly: true,
        seasonal_ingredients: ['pasta', 'cheese', 'cauliflower', 'carrots']
      },
      {
        day: 2,
        meal_type: 'dinner',
        recipe_name: 'Turkey and Veggie Meatballs',
        prep_time: 20,
        cook_time: 25,
        servings: 4,
        batch_cookable: true,
        leftover_friendly: true,
        seasonal_ingredients: ['ground_turkey', 'zucchini', 'spinach']
      },
      {
        day: 3,
        meal_type: 'dinner',
        recipe_name: 'Chicken Quesadillas with Sweet Potato',
        prep_time: 15,
        cook_time: 15,
        servings: 4,
        batch_cookable: false,
        leftover_friendly: true,
        seasonal_ingredients: ['chicken', 'sweet_potato', 'cheese']
      }
    ],
    batch_cooking_tips: [
      'Make extra meatballs and freeze for quick meals',
      'Prep and freeze smoothie ingredients in bags',
      'Cook sweet potatoes in bulk for multiple uses',
      'Hide vegetables by blending into sauces'
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'budget-conscious',
    name: 'Budget Conscious',
    description: 'Delicious, nutritious meals that won\'t break the bank',
    category: 'budget',
    difficulty_level: 'intermediate',
    prep_time_minutes: 20,
    cooking_style: 'mixed',
    household_size: 3,
    budget_range: 'low',
    dietary_restrictions: [],
    health_goals: ['budget_friendly', 'filling_meals'],
    favorite_cuisines: ['american', 'mexican', 'asian'],
    meal_suggestions: [
      {
        day: 1,
        meal_type: 'dinner',
        recipe_name: 'Lentil and Rice Bowl',
        prep_time: 10,
        cook_time: 30,
        servings: 4,
        batch_cookable: true,
        leftover_friendly: true,
        seasonal_ingredients: ['lentils', 'rice', 'onions', 'carrots']
      },
      {
        day: 2,
        meal_type: 'dinner',
        recipe_name: 'Bean and Cheese Quesadillas',
        prep_time: 10,
        cook_time: 15,
        servings: 4,
        batch_cookable: false,
        leftover_friendly: true,
        seasonal_ingredients: ['beans', 'cheese', 'tortillas']
      },
      {
        day: 3,
        meal_type: 'dinner',
        recipe_name: 'Pasta with Chickpea Sauce',
        prep_time: 15,
        cook_time: 20,
        servings: 4,
        batch_cookable: true,
        leftover_friendly: true,
        seasonal_ingredients: ['pasta', 'chickpeas', 'tomatoes', 'onions']
      }
    ],
    batch_cooking_tips: [
      'Buy ingredients in bulk when on sale',
      'Cook dried beans and lentils in large batches',
      'Use seasonal vegetables for better prices',
      'Stretch meat with beans and grains'
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const SEASONAL_INGREDIENTS: SeasonalIngredient[] = [
  {
    name: 'asparagus',
    season: 'spring',
    peak_months: ['March', 'April', 'May'],
    substitutes: ['green_beans', 'broccoli']
  },
  {
    name: 'strawberries',
    season: 'spring',
    peak_months: ['April', 'May', 'June'],
    substitutes: ['blueberries', 'raspberries']
  },
  {
    name: 'tomatoes',
    season: 'summer',
    peak_months: ['June', 'July', 'August'],
    substitutes: ['canned_tomatoes', 'cherry_tomatoes']
  },
  {
    name: 'zucchini',
    season: 'summer',
    peak_months: ['July', 'August', 'September'],
    substitutes: ['yellow_squash', 'eggplant']
  },
  {
    name: 'butternut_squash',
    season: 'fall',
    peak_months: ['September', 'October', 'November'],
    substitutes: ['sweet_potato', 'pumpkin']
  },
  {
    name: 'apples',
    season: 'fall',
    peak_months: ['September', 'October', 'November'],
    substitutes: ['pears', 'persimmons']
  },
  {
    name: 'brussels_sprouts',
    season: 'winter',
    peak_months: ['December', 'January', 'February'],
    substitutes: ['cabbage', 'kale']
  },
  {
    name: 'citrus',
    season: 'winter',
    peak_months: ['December', 'January', 'February'],
    substitutes: ['frozen_citrus', 'citrus_juice']
  }
];

export const BATCH_COOKING_SUGGESTIONS: BatchCookingSuggestion[] = [
  {
    recipe_group: 'Grain Base',
    recipes: ['Brown Rice', 'Quinoa', 'Pasta'],
    batch_size: 6,
    storage_days: 5,
    prep_tips: [
      'Cook extra grains at the beginning of the week',
      'Store in airtight containers in refrigerator',
      'Add different seasonings throughout the week'
    ],
    reheating_instructions: 'Microwave with a splash of water, covered, for 1-2 minutes'
  },
  {
    recipe_group: 'Protein Prep',
    recipes: ['Grilled Chicken', 'Baked Tofu', 'Cooked Ground Turkey'],
    batch_size: 4,
    storage_days: 4,
    prep_tips: [
      'Season proteins differently for variety',
      'Cook using sheet pan method for efficiency',
      'Portion into meal-sized containers'
    ],
    reheating_instructions: 'Reheat in oven at 350°F for 10-15 minutes or microwave covered'
  },
  {
    recipe_group: 'Vegetable Prep',
    recipes: ['Roasted Vegetables', 'Sautéed Greens', 'Raw Chopped Vegetables'],
    batch_size: 5,
    storage_days: 3,
    prep_tips: [
      'Prep vegetables by cooking method',
      'Store raw and cooked vegetables separately',
      'Keep some vegetables raw for salads and snacks'
    ],
    reheating_instructions: 'Steam or sauté briefly to reheat cooked vegetables'
  }
];

export function getCurrentSeason(): 'spring' | 'summer' | 'fall' | 'winter' {
  const month = new Date().getMonth() + 1; // getMonth() returns 0-11
  
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'fall';
  return 'winter';
}

export function getSeasonalIngredients(season?: 'spring' | 'summer' | 'fall' | 'winter'): SeasonalIngredient[] {
  const targetSeason = season || getCurrentSeason();
  return SEASONAL_INGREDIENTS.filter(ingredient => ingredient.season === targetSeason);
}

export function getMealPlanTemplate(id: string): MealPlanTemplate | undefined {
  return MEAL_PLAN_TEMPLATES.find(template => template.id === id);
}

export function getAllMealPlanTemplates(): MealPlanTemplate[] {
  return MEAL_PLAN_TEMPLATES;
}

export function getTemplatesByCategory(category: string): MealPlanTemplate[] {
  return MEAL_PLAN_TEMPLATES.filter(template => template.category === category);
}