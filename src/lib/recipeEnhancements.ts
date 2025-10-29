export interface RecipeRating {
  id: string;
  recipe_id: string;
  user_id: string;
  rating: number; // 1-5 stars
  review?: string;
  cooking_difficulty_actual: 'easier' | 'as_expected' | 'harder';
  time_taken_minutes: number;
  would_make_again: boolean;
  created_at: string;
  updated_at: string;
}

export interface RecipeReview {
  id: string;
  recipe_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  review_text: string;
  helpful_count: number;
  verified_cook: boolean; // User actually made the recipe
  cooking_tips?: string[];
  recipe_modifications?: string;
  created_at: string;
}

export interface NutritionalInfo {
  calories_per_serving: number;
  protein_grams: number;
  carbs_grams: number;
  fat_grams: number;
  fiber_grams: number;
  sugar_grams: number;
  sodium_mg: number;
  cholesterol_mg: number;
  vitamins: NutrientInfo[];
  minerals: NutrientInfo[];
}

export interface NutrientInfo {
  name: string;
  amount: number;
  unit: string;
  daily_value_percentage?: number;
}

export interface RecipeVariation {
  id: string;
  name: string;
  description: string;
  category: 'dietary' | 'spice_level' | 'cooking_method' | 'cuisine_style' | 'health_focus';
  difficulty_adjustment: -1 | 0 | 1; // Easier, same, harder
  time_adjustment_minutes: number;
  ingredient_substitutions: IngredientSubstitution[];
  instruction_modifications: string[];
  nutritional_impact?: string;
  tags: string[];
}

export interface IngredientSubstitution {
  original_ingredient: string;
  substitute_ingredient: string;
  conversion_ratio: number; // e.g., 1.5 means use 1.5x the amount
  notes?: string;
}

export interface CookingTimeEstimate {
  skill_level: 'beginner' | 'intermediate' | 'advanced';
  base_prep_time: number;
  base_cook_time: number;
  estimated_prep_time: number;
  estimated_cook_time: number;
  estimated_total_time: number;
  confidence_level: number; // 0-1
  factors: TimeAdjustmentFactor[];
}

export interface TimeAdjustmentFactor {
  factor: string;
  impact: number; // multiplier
  description: string;
}

export interface ScaledRecipe {
  original_servings: number;
  target_servings: number;
  scaling_factor: number;
  scaled_ingredients: ScaledIngredient[];
  scaled_instructions: string[];
  estimated_prep_time: number;
  estimated_cook_time: number;
  scaling_notes: string[];
  equipment_adjustments: string[];
}

export interface ScaledIngredient {
  name: string;
  original_quantity: number;
  scaled_quantity: number;
  unit: string;
  notes?: string;
  measurement_precision: 'exact' | 'rounded' | 'estimated';
}

// Recipe Variations Database
export const RECIPE_VARIATIONS: RecipeVariation[] = [
  {
    id: 'make_vegetarian',
    name: 'Make it Vegetarian',
    description: 'Replace meat with plant-based alternatives',
    category: 'dietary',
    difficulty_adjustment: 0,
    time_adjustment_minutes: 0,
    ingredient_substitutions: [
      {
        original_ingredient: 'ground_beef',
        substitute_ingredient: 'lentils_cooked',
        conversion_ratio: 1.2,
        notes: 'Use cooked lentils or plant-based ground meat'
      },
      {
        original_ingredient: 'chicken_breast',
        substitute_ingredient: 'tofu_firm',
        conversion_ratio: 0.8,
        notes: 'Press tofu well and marinate for better flavor'
      },
      {
        original_ingredient: 'bacon',
        substitute_ingredient: 'mushrooms_shiitake',
        conversion_ratio: 0.6,
        notes: 'Sauté mushrooms until crispy for bacon-like texture'
      }
    ],
    instruction_modifications: [
      'Cook plant proteins separately and add at the end',
      'Increase seasoning to compensate for meat flavors',
      'Consider adding umami-rich ingredients like soy sauce or nutritional yeast'
    ],
    nutritional_impact: 'Generally lower in protein and saturated fat, higher in fiber',
    tags: ['vegetarian', 'plant_based', 'dietary_restriction']
  },
  {
    id: 'make_spicy',
    name: 'Make it Spicy',
    description: 'Add heat and spice to the recipe',
    category: 'spice_level',
    difficulty_adjustment: 0,
    time_adjustment_minutes: 5,
    ingredient_substitutions: [
      {
        original_ingredient: 'black_pepper',
        substitute_ingredient: 'cayenne_pepper',
        conversion_ratio: 0.25,
        notes: 'Start with less and adjust to taste'
      }
    ],
    instruction_modifications: [
      'Add jalapeños or other hot peppers, diced finely',
      'Include hot sauce or sriracha to taste',
      'Toast and grind whole spices for maximum heat',
      'Add red pepper flakes during cooking for even distribution'
    ],
    nutritional_impact: 'May boost metabolism slightly',
    tags: ['spicy', 'heat', 'peppers']
  },
  {
    id: 'make_vegan',
    name: 'Make it Vegan',
    description: 'Remove all animal products',
    category: 'dietary',
    difficulty_adjustment: 0,
    time_adjustment_minutes: 10,
    ingredient_substitutions: [
      {
        original_ingredient: 'butter',
        substitute_ingredient: 'olive_oil',
        conversion_ratio: 0.8,
        notes: 'Use olive oil or vegan butter substitute'
      },
      {
        original_ingredient: 'milk',
        substitute_ingredient: 'almond_milk',
        conversion_ratio: 1.0,
        notes: 'Use unsweetened plant milk of choice'
      },
      {
        original_ingredient: 'eggs',
        substitute_ingredient: 'flax_eggs',
        conversion_ratio: 1.0,
        notes: '1 tbsp ground flaxseed + 3 tbsp water per egg'
      },
      {
        original_ingredient: 'cheese',
        substitute_ingredient: 'nutritional_yeast',
        conversion_ratio: 0.3,
        notes: 'Add nutritional yeast for cheesy flavor'
      }
    ],
    instruction_modifications: [
      'Let flax eggs sit for 5 minutes to thicken before using',
      'Adjust liquid ratios when using plant milks',
      'Season more generously to compensate for dairy flavors'
    ],
    nutritional_impact: 'Lower in saturated fat and cholesterol, may be lower in protein',
    tags: ['vegan', 'plant_based', 'dairy_free']
  },
  {
    id: 'make_gluten_free',
    name: 'Make it Gluten-Free',
    description: 'Replace gluten-containing ingredients',
    category: 'dietary',
    difficulty_adjustment: 1,
    time_adjustment_minutes: 5,
    ingredient_substitutions: [
      {
        original_ingredient: 'all_purpose_flour',
        substitute_ingredient: 'gluten_free_flour_blend',
        conversion_ratio: 1.0,
        notes: 'Use 1:1 gluten-free flour blend for best results'
      },
      {
        original_ingredient: 'breadcrumbs',
        substitute_ingredient: 'gluten_free_breadcrumbs',
        conversion_ratio: 1.0,
        notes: 'Or use crushed gluten-free crackers'
      },
      {
        original_ingredient: 'soy_sauce',
        substitute_ingredient: 'tamari',
        conversion_ratio: 1.0,
        notes: 'Tamari is gluten-free soy sauce alternative'
      }
    ],
    instruction_modifications: [
      'Add xanthan gum if not included in flour blend (1/4 tsp per cup)',
      'Let batter rest longer for better texture',
      'Check all seasonings and condiments for gluten'
    ],
    nutritional_impact: 'Similar nutritional profile with different fiber sources',
    tags: ['gluten_free', 'celiac_friendly', 'dietary_restriction']
  },
  {
    id: 'make_low_carb',
    name: 'Make it Low-Carb',
    description: 'Reduce carbohydrates significantly',
    category: 'health_focus',
    difficulty_adjustment: 0,
    time_adjustment_minutes: 0,
    ingredient_substitutions: [
      {
        original_ingredient: 'pasta',
        substitute_ingredient: 'zucchini_noodles',
        conversion_ratio: 1.5,
        notes: 'Spiralize zucchini or use shirataki noodles'
      },
      {
        original_ingredient: 'rice',
        substitute_ingredient: 'cauliflower_rice',
        conversion_ratio: 1.2,
        notes: 'Pulse cauliflower in food processor until rice-sized'
      },
      {
        original_ingredient: 'potatoes',
        substitute_ingredient: 'turnips',
        conversion_ratio: 1.0,
        notes: 'Turnips have similar texture with fewer carbs'
      }
    ],
    instruction_modifications: [
      'Sauté cauliflower rice briefly to avoid mushiness',
      'Salt zucchini noodles and drain excess water',
      'Increase healthy fats to maintain satiety'
    ],
    nutritional_impact: 'Significantly lower in carbohydrates, may be higher in fiber',
    tags: ['low_carb', 'keto_friendly', 'weight_loss']
  },
  {
    id: 'make_kid_friendly',
    name: 'Make it Kid-Friendly',
    description: 'Adjust flavors and presentation for children',
    category: 'dietary',
    difficulty_adjustment: -1,
    time_adjustment_minutes: 10,
    ingredient_substitutions: [
      {
        original_ingredient: 'spicy_seasonings',
        substitute_ingredient: 'mild_herbs',
        conversion_ratio: 1.0,
        notes: 'Replace with oregano, basil, or garlic powder'
      }
    ],
    instruction_modifications: [
      'Reduce or eliminate spicy ingredients',
      'Cut ingredients into fun shapes',
      'Serve components separately for picky eaters',
      'Add a side of familiar foods like cheese or crackers'
    ],
    nutritional_impact: 'Focus on hiding vegetables and reducing sodium',
    tags: ['kid_friendly', 'mild_flavors', 'family_meals']
  }
];

// Skill-based time adjustments
export const SKILL_TIME_MULTIPLIERS = {
  beginner: {
    prep_multiplier: 1.5,
    cook_multiplier: 1.2,
    factors: [
      { factor: 'knife_skills', impact: 1.4, description: 'Slower chopping and prep work' },
      { factor: 'multitasking', impact: 1.3, description: 'Sequential cooking vs parallel tasks' },
      { factor: 'technique_familiarity', impact: 1.2, description: 'Learning new cooking methods' }
    ]
  },
  intermediate: {
    prep_multiplier: 1.0,
    cook_multiplier: 1.0,
    factors: [
      { factor: 'confidence', impact: 1.0, description: 'Standard cooking pace' },
      { factor: 'technique_knowledge', impact: 0.95, description: 'Familiar with most methods' }
    ]
  },
  advanced: {
    prep_multiplier: 0.8,
    cook_multiplier: 0.9,
    factors: [
      { factor: 'efficiency', impact: 0.8, description: 'Optimized workflow and prep' },
      { factor: 'multitasking', impact: 0.85, description: 'Can manage multiple components' },
      { factor: 'experience', impact: 0.9, description: 'Intuitive cooking adjustments' }
    ]
  }
};

// Nutritional database for common ingredients (per 100g)
export const INGREDIENT_NUTRITION: Record<string, NutritionalInfo> = {
  chicken_breast: {
    calories_per_serving: 165,
    protein_grams: 31,
    carbs_grams: 0,
    fat_grams: 3.6,
    fiber_grams: 0,
    sugar_grams: 0,
    sodium_mg: 74,
    cholesterol_mg: 85,
    vitamins: [
      { name: 'Vitamin B6', amount: 0.5, unit: 'mg', daily_value_percentage: 30 },
      { name: 'Niacin', amount: 8.5, unit: 'mg', daily_value_percentage: 53 }
    ],
    minerals: [
      { name: 'Selenium', amount: 22, unit: 'mcg', daily_value_percentage: 40 },
      { name: 'Phosphorus', amount: 196, unit: 'mg', daily_value_percentage: 20 }
    ]
  },
  brown_rice: {
    calories_per_serving: 123,
    protein_grams: 2.6,
    carbs_grams: 23,
    fat_grams: 0.9,
    fiber_grams: 1.8,
    sugar_grams: 0.4,
    sodium_mg: 7,
    cholesterol_mg: 0,
    vitamins: [
      { name: 'Thiamine', amount: 0.1, unit: 'mg', daily_value_percentage: 8 },
      { name: 'Niacin', amount: 2.3, unit: 'mg', daily_value_percentage: 14 }
    ],
    minerals: [
      { name: 'Magnesium', amount: 44, unit: 'mg', daily_value_percentage: 11 },
      { name: 'Manganese', amount: 1.1, unit: 'mg', daily_value_percentage: 48 }
    ]
  },
  olive_oil: {
    calories_per_serving: 884,
    protein_grams: 0,
    carbs_grams: 0,
    fat_grams: 100,
    fiber_grams: 0,
    sugar_grams: 0,
    sodium_mg: 2,
    cholesterol_mg: 0,
    vitamins: [
      { name: 'Vitamin E', amount: 14.3, unit: 'mg', daily_value_percentage: 95 },
      { name: 'Vitamin K', amount: 60.2, unit: 'mcg', daily_value_percentage: 50 }
    ],
    minerals: []
  },
  spinach: {
    calories_per_serving: 23,
    protein_grams: 2.9,
    carbs_grams: 3.6,
    fat_grams: 0.4,
    fiber_grams: 2.2,
    sugar_grams: 0.4,
    sodium_mg: 79,
    cholesterol_mg: 0,
    vitamins: [
      { name: 'Vitamin K', amount: 483, unit: 'mcg', daily_value_percentage: 402 },
      { name: 'Vitamin A', amount: 469, unit: 'mcg', daily_value_percentage: 52 },
      { name: 'Folate', amount: 194, unit: 'mcg', daily_value_percentage: 49 }
    ],
    minerals: [
      { name: 'Iron', amount: 2.7, unit: 'mg', daily_value_percentage: 15 },
      { name: 'Magnesium', amount: 79, unit: 'mg', daily_value_percentage: 20 }
    ]
  }
};

export function calculateCookingTimeEstimate(
  basePrep: number,
  baseCook: number,
  skillLevel: 'beginner' | 'intermediate' | 'advanced'
): CookingTimeEstimate {
  const multipliers = SKILL_TIME_MULTIPLIERS[skillLevel];
  
  const estimatedPrep = Math.round(basePrep * multipliers.prep_multiplier);
  const estimatedCook = Math.round(baseCook * multipliers.cook_multiplier);
  const estimatedTotal = estimatedPrep + estimatedCook;
  
  // Confidence decreases with complexity and increases with skill
  const complexity = (basePrep + baseCook) / 60; // hours
  const skillBonus = { beginner: 0, intermediate: 0.2, advanced: 0.4 }[skillLevel];
  const confidence = Math.max(0.3, Math.min(0.95, 0.8 - complexity * 0.1 + skillBonus));
  
  return {
    skill_level: skillLevel,
    base_prep_time: basePrep,
    base_cook_time: baseCook,
    estimated_prep_time: estimatedPrep,
    estimated_cook_time: estimatedCook,
    estimated_total_time: estimatedTotal,
    confidence_level: confidence,
    factors: multipliers.factors
  };
}

export function scaleRecipe(
  ingredients: Array<{name: string, quantity: number, unit: string}>,
  instructions: string[],
  originalServings: number,
  targetServings: number,
  originalPrepTime: number,
  originalCookTime: number
): ScaledRecipe {
  const scalingFactor = targetServings / originalServings;
  
  const scaledIngredients: ScaledIngredient[] = ingredients.map(ingredient => {
    const rawScaled = ingredient.quantity * scalingFactor;
    let scaledQuantity = rawScaled;
    let precision: 'exact' | 'rounded' | 'estimated' = 'exact';
    
    // Round based on quantity and unit for practical cooking
    if (ingredient.unit === 'cup' || ingredient.unit === 'cups') {
      if (rawScaled < 0.125) {
        scaledQuantity = Math.round(rawScaled * 16) / 16; // To nearest tablespoon
        precision = 'rounded';
      } else if (rawScaled < 1) {
        scaledQuantity = Math.round(rawScaled * 4) / 4; // To nearest quarter
        precision = 'rounded';
      } else {
        scaledQuantity = Math.round(rawScaled * 2) / 2; // To nearest half
        precision = 'rounded';
      }
    } else if (ingredient.unit === 'tsp' || ingredient.unit === 'tbsp') {
      scaledQuantity = Math.round(rawScaled * 2) / 2; // To nearest half
      precision = 'rounded';
    } else if (ingredient.unit === 'piece' || ingredient.unit === 'pieces') {
      scaledQuantity = Math.round(rawScaled);
      precision = rawScaled === Math.round(rawScaled) ? 'exact' : 'estimated';
    }
    
    return {
      name: ingredient.name,
      original_quantity: ingredient.quantity,
      scaled_quantity: scaledQuantity,
      unit: ingredient.unit,
      measurement_precision: precision,
      notes: precision === 'estimated' ? 'Adjust to taste' : undefined
    };
  });
  
  // Time adjustments for scaling
  const prepTimeAdjustment = scalingFactor > 2 ? 1.2 : scalingFactor < 0.5 ? 0.9 : 1.0;
  const cookTimeAdjustment = scalingFactor > 2 ? 1.1 : 1.0; // Cooking time doesn't scale linearly
  
  const scaledInstructions = instructions.map(instruction => {
    // Replace quantity references in instructions
    let scaledInstruction = instruction;
    scaledIngredients.forEach(ingredient => {
      const pattern = new RegExp(`\\b${ingredient.original_quantity}\\s*(${ingredient.unit})\\b`, 'gi');
      scaledInstruction = scaledInstruction.replace(
        pattern,
        `${ingredient.scaled_quantity} $1`
      );
    });
    return scaledInstruction;
  });
  
  const scalingNotes = [];
  if (scalingFactor > 2) {
    scalingNotes.push('Large batch: Consider cooking in multiple pans or increasing cooking time');
    scalingNotes.push('Check seasoning carefully - you may need less salt per serving');
  } else if (scalingFactor < 0.5) {
    scalingNotes.push('Small batch: Use smaller cookware to prevent burning');
    scalingNotes.push('Reduce cooking time and watch carefully to avoid overcooking');
  }
  
  const equipmentAdjustments = [];
  if (scalingFactor > 1.5) {
    equipmentAdjustments.push('Consider using larger pots, pans, or multiple cooking vessels');
    if (scalingFactor > 3) {
      equipmentAdjustments.push('May need to cook in batches');
    }
  }
  
  return {
    original_servings: originalServings,
    target_servings: targetServings,
    scaling_factor: scalingFactor,
    scaled_ingredients: scaledIngredients,
    scaled_instructions: scaledInstructions,
    estimated_prep_time: Math.round(originalPrepTime * prepTimeAdjustment),
    estimated_cook_time: Math.round(originalCookTime * cookTimeAdjustment),
    scaling_notes: scalingNotes,
    equipment_adjustments: equipmentAdjustments
  };
}

export function calculateNutritionalInfo(
  ingredients: Array<{name: string, quantity: number, unit: string}>,
  servings: number
): NutritionalInfo | null {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let totalFiber = 0;
  let totalSugar = 0;
  let totalSodium = 0;
  let totalCholesterol = 0;
  
  const vitaminTotals: Record<string, number> = {};
  const mineralTotals: Record<string, number> = {};
  
  let foundNutritionData = false;
  
  for (const ingredient of ingredients) {
    const nutritionData = INGREDIENT_NUTRITION[ingredient.name.toLowerCase().replace(/ /g, '_')];
    if (!nutritionData) continue;
    
    foundNutritionData = true;
    
    // Convert quantity to grams (simplified conversion)
    let grams = 100; // default
    if (ingredient.unit === 'cup' || ingredient.unit === 'cups') {
      grams = ingredient.quantity * 150; // rough average
    } else if (ingredient.unit === 'oz') {
      grams = ingredient.quantity * 28.35;
    } else if (ingredient.unit === 'lb') {
      grams = ingredient.quantity * 453.592;
    } else if (ingredient.unit === 'g') {
      grams = ingredient.quantity;
    }
    
    const portionFactor = grams / 100; // nutrition data is per 100g
    
    totalCalories += nutritionData.calories_per_serving * portionFactor;
    totalProtein += nutritionData.protein_grams * portionFactor;
    totalCarbs += nutritionData.carbs_grams * portionFactor;
    totalFat += nutritionData.fat_grams * portionFactor;
    totalFiber += nutritionData.fiber_grams * portionFactor;
    totalSugar += nutritionData.sugar_grams * portionFactor;
    totalSodium += nutritionData.sodium_mg * portionFactor;
    totalCholesterol += nutritionData.cholesterol_mg * portionFactor;
    
    // Aggregate vitamins and minerals
    nutritionData.vitamins.forEach(vitamin => {
      vitaminTotals[vitamin.name] = (vitaminTotals[vitamin.name] || 0) + vitamin.amount * portionFactor;
    });
    
    nutritionData.minerals.forEach(mineral => {
      mineralTotals[mineral.name] = (mineralTotals[mineral.name] || 0) + mineral.amount * portionFactor;
    });
  }
  
  if (!foundNutritionData) return null;
  
  // Convert totals to per-serving values
  const perServing = {
    calories_per_serving: Math.round(totalCalories / servings),
    protein_grams: Math.round((totalProtein / servings) * 10) / 10,
    carbs_grams: Math.round((totalCarbs / servings) * 10) / 10,
    fat_grams: Math.round((totalFat / servings) * 10) / 10,
    fiber_grams: Math.round((totalFiber / servings) * 10) / 10,
    sugar_grams: Math.round((totalSugar / servings) * 10) / 10,
    sodium_mg: Math.round(totalSodium / servings),
    cholesterol_mg: Math.round(totalCholesterol / servings),
    vitamins: Object.entries(vitaminTotals).map(([name, amount]) => ({
      name,
      amount: Math.round((amount / servings) * 100) / 100,
      unit: 'mg' // simplified
    })),
    minerals: Object.entries(mineralTotals).map(([name, amount]) => ({
      name,
      amount: Math.round((amount / servings) * 100) / 100,
      unit: 'mg' // simplified
    }))
  };
  
  return perServing;
}

export function getRecipeVariations(
  recipeIngredients: string[],
  recipeTags: string[] = [],
  userDietaryRestrictions: string[] = []
): RecipeVariation[] {
  const availableVariations = [];
  
  // Always show common variations
  availableVariations.push(
    RECIPE_VARIATIONS.find(v => v.id === 'make_spicy')!,
    RECIPE_VARIATIONS.find(v => v.id === 'make_kid_friendly')!
  );
  
  // Add dietary variations based on current ingredients
  const hasAnimalProducts = recipeIngredients.some(ing => 
    ['chicken', 'beef', 'pork', 'fish', 'meat', 'bacon', 'ham'].some(animal => 
      ing.toLowerCase().includes(animal)
    )
  );
  
  const hasDairy = recipeIngredients.some(ing =>
    ['milk', 'cheese', 'butter', 'cream', 'yogurt'].some(dairy =>
      ing.toLowerCase().includes(dairy)
    )
  );
  
  const hasGluten = recipeIngredients.some(ing =>
    ['flour', 'bread', 'pasta', 'wheat', 'barley', 'rye'].some(gluten =>
      ing.toLowerCase().includes(gluten)
    )
  );
  
  const hasHighCarbs = recipeIngredients.some(ing =>
    ['pasta', 'rice', 'potato', 'bread', 'noodle'].some(carb =>
      ing.toLowerCase().includes(carb)
    )
  );
  
  if (hasAnimalProducts) {
    availableVariations.push(RECIPE_VARIATIONS.find(v => v.id === 'make_vegetarian')!);
  }
  
  if (hasAnimalProducts || hasDairy) {
    availableVariations.push(RECIPE_VARIATIONS.find(v => v.id === 'make_vegan')!);
  }
  
  if (hasGluten) {
    availableVariations.push(RECIPE_VARIATIONS.find(v => v.id === 'make_gluten_free')!);
  }
  
  if (hasHighCarbs) {
    availableVariations.push(RECIPE_VARIATIONS.find(v => v.id === 'make_low_carb')!);
  }
  
  return availableVariations.filter(v => v !== undefined);
}

export function calculateAverageRating(ratings: RecipeRating[]): {
  average: number;
  count: number;
  distribution: Record<number, number>;
} {
  if (ratings.length === 0) {
    return {
      average: 0,
      count: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  }
  
  const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
  const average = sum / ratings.length;
  
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  ratings.forEach(rating => {
    distribution[rating.rating as keyof typeof distribution]++;
  });
  
  return {
    average: Math.round(average * 10) / 10,
    count: ratings.length,
    distribution
  };
}