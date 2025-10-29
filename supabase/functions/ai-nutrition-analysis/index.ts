import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NutritionAnalysisRequest {
  model: string
  recipe: any
  serving_size?: number
  analysis_depth?: string
  include_features?: string[]
  dietary_context?: any
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { 
      model,
      recipe,
      serving_size = 1,
      analysis_depth = 'comprehensive',
      include_features = [],
      dietary_context = {}
    } = await req.json() as NutritionAnalysisRequest

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Validate OpenAI API key
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    if (!recipe || !recipe.ingredients) {
      throw new Error('No recipe provided for nutrition analysis')
    }

    // Prepare comprehensive nutrition analysis prompt
    const nutritionPrompt = `
You are a registered dietitian and nutrition expert specializing in comprehensive nutritional analysis of recipes.

Analyze the following recipe for detailed nutritional information:

Recipe: ${recipe.title}
Ingredients: ${JSON.stringify(recipe.ingredients, null, 2)}
Instructions: ${JSON.stringify(recipe.instructions, null, 2)}
Servings: ${recipe.servings || serving_size}
Serving Size: ${serving_size}

Please provide a comprehensive nutritional analysis including:

1. MACRONUTRIENTS (per serving):
   - Calories (kcal)
   - Protein (grams)
   - Total Carbohydrates (grams)
   - Dietary Fiber (grams)
   - Total Sugars (grams)
   - Total Fat (grams)
   - Saturated Fat (grams)
   - Cholesterol (mg)
   - Sodium (mg)

2. MICRONUTRIENTS (per serving):
   - Vitamins: A, C, D, E, K, B1, B2, B3, B6, B12, Folate
   - Minerals: Calcium, Iron, Magnesium, Phosphorus, Potassium, Zinc

3. ANTIOXIDANTS & PHYTONUTRIENTS:
   - Beta-carotene, Lycopene, Flavonoids, etc.
   - Estimated ORAC value if applicable

4. HEALTH METRICS:
   - Overall Health Score (0-100)
   - Glycemic Index estimation
   - Inflammatory Score (-10 to +10)
   - Nutrient Density Score

5. DIETARY ANALYSIS:
   - Dietary tags (vegan, vegetarian, gluten-free, etc.)
   - Allergen identification
   - Nutritional strengths and concerns

6. DETAILED INSIGHTS:
   - Key nutritional benefits
   - Health implications
   - Recommendations for nutritional optimization
   - Ideal food pairings for nutritional balance

7. INGREDIENT-SPECIFIC CONTRIBUTIONS:
   - Breakdown of which ingredients contribute most to each nutrient
   - Identify nutritional powerhouse ingredients

8. BIOAVAILABILITY CONSIDERATIONS:
   - How cooking methods affect nutrient absorption
   - Synergistic nutrient interactions
   - Factors that enhance or inhibit nutrient uptake

Consider the following cooking methods impact on nutrition:
${recipe.instructions ? 'Cooking methods: ' + recipe.instructions.map((inst: any) => inst.description).join(' ') : ''}

Provide confidence scores for all nutritional estimations.
Respond in detailed JSON format with all analysis results.
Be as accurate and scientific as possible in your estimations.
`

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are a registered dietitian and nutrition expert with extensive knowledge of food composition, nutrient interactions, and health implications. Always provide detailed, scientifically-based nutritional analysis in JSON format.'
          },
          {
            role: 'user',
            content: nutritionPrompt
          }
        ],
        temperature: 0.2, // Low temperature for consistent nutritional analysis
        max_tokens: 3000,
        response_format: { type: 'json_object' }
      })
    })

    if (!openaiResponse.ok) {
      const error = await openaiResponse.json()
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`)
    }

    const openaiResult = await openaiResponse.json()
    const analysisContent = openaiResult.choices[0]?.message?.content

    if (!analysisContent) {
      throw new Error('No nutrition analysis generated from OpenAI')
    }

    let nutritionData: any
    try {
      nutritionData = JSON.parse(analysisContent)
    } catch (parseError) {
      // Fallback nutrition estimation
      nutritionData = fallbackNutritionEstimation(recipe)
    }

    // Structure the response according to our interface
    const structuredAnalysis = {
      calories: nutritionData.calories || nutritionData.macronutrients?.calories || 0,
      protein: nutritionData.protein || nutritionData.macronutrients?.protein || 0,
      carbs: nutritionData.carbs || nutritionData.carbohydrates || nutritionData.macronutrients?.carbohydrates || 0,
      fat: nutritionData.fat || nutritionData.total_fat || nutritionData.macronutrients?.total_fat || 0,
      fiber: nutritionData.fiber || nutritionData.dietary_fiber || nutritionData.macronutrients?.fiber || 0,
      sugar: nutritionData.sugar || nutritionData.sugars || nutritionData.macronutrients?.sugars || 0,
      sodium: nutritionData.sodium || nutritionData.macronutrients?.sodium || 0,
      vitamins: nutritionData.vitamins || nutritionData.micronutrients?.vitamins || {},
      minerals: nutritionData.minerals || nutritionData.micronutrients?.minerals || {},
      antioxidants: nutritionData.antioxidants || nutritionData.phytonutrients || {},
      health_score: nutritionData.health_score || nutritionData.health_metrics?.health_score || 75,
      glycemic_index: nutritionData.glycemic_index || nutritionData.health_metrics?.glycemic_index || 50,
      inflammatory_score: nutritionData.inflammatory_score || nutritionData.health_metrics?.inflammatory_score || 0,
      nutrient_density: nutritionData.nutrient_density || nutritionData.health_metrics?.nutrient_density || 10,
      dietary_tags: extractDietaryTags(nutritionData, recipe),
      allergens: extractAllergens(nutritionData, recipe),
      insights: nutritionData.insights || nutritionData.detailed_insights || [],
      ingredient_breakdown: structureIngredientBreakdown(nutritionData.ingredient_contributions || []),
      pairing_suggestions: nutritionData.pairing_suggestions || nutritionData.food_pairings || [],
      health_benefits: nutritionData.health_benefits || nutritionData.key_benefits || [],
      confidence: calculateNutritionConfidence(nutritionData, recipe),
      analysis_metadata: {
        model_used: model,
        analysis_depth,
        features_analyzed: include_features,
        recipe_title: recipe.title,
        serving_size,
        original_servings: recipe.servings,
        prompt_tokens: openaiResult.usage?.prompt_tokens || 0,
        completion_tokens: openaiResult.usage?.completion_tokens || 0,
        total_tokens: openaiResult.usage?.total_tokens || 0,
        analyzed_at: new Date().toISOString(),
        cooking_methods_considered: dietary_context.consider_cooking_methods || false
      }
    }

    // Log API usage
    await supabaseClient.from('openai_api_calls').insert({
      function_name: 'ai-nutrition-analysis',
      model: model,
      prompt_tokens: openaiResult.usage?.prompt_tokens || 0,
      completion_tokens: openaiResult.usage?.completion_tokens || 0,
      total_tokens: openaiResult.usage?.total_tokens || 0,
      success: true,
      created_at: new Date().toISOString()
    })

    return new Response(
      JSON.stringify(structuredAnalysis),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('AI nutrition analysis error:', error)

    // Log error
    try {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? ''
      )
      
      await supabaseClient.from('openai_api_calls').insert({
        function_name: 'ai-nutrition-analysis',
        model: 'error',
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
        success: false,
        error_message: error.message,
        created_at: new Date().toISOString()
      })
    } catch (logError) {
      console.error('Failed to log error:', logError)
    }

    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'AI nutrition analysis failed'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

function extractDietaryTags(nutritionData: any, recipe: any): string[] {
  const tags = new Set<string>()
  
  // Extract from nutrition analysis
  if (nutritionData.dietary_tags) {
    nutritionData.dietary_tags.forEach((tag: string) => tags.add(tag))
  }
  
  // Infer from ingredients
  const ingredients = recipe.ingredients || []
  const ingredientText = ingredients.map((ing: any) => ing.name || ing).join(' ').toLowerCase()
  
  // Check for dietary patterns
  if (!ingredientText.includes('meat') && !ingredientText.includes('chicken') && 
      !ingredientText.includes('beef') && !ingredientText.includes('pork')) {
    tags.add('vegetarian')
  }
  
  if (!ingredientText.includes('dairy') && !ingredientText.includes('milk') && 
      !ingredientText.includes('cheese') && !ingredientText.includes('butter')) {
    tags.add('dairy-free')
  }
  
  if (!ingredientText.includes('wheat') && !ingredientText.includes('flour') && 
      !ingredientText.includes('bread')) {
    tags.add('gluten-free')
  }
  
  return Array.from(tags)
}

function extractAllergens(nutritionData: any, recipe: any): string[] {
  const allergens = new Set<string>()
  
  // Extract from nutrition analysis
  if (nutritionData.allergens) {
    nutritionData.allergens.forEach((allergen: string) => allergens.add(allergen))
  }
  
  // Common allergen detection
  const ingredients = recipe.ingredients || []
  const ingredientText = ingredients.map((ing: any) => ing.name || ing).join(' ').toLowerCase()
  
  const allergenMap = {
    'milk': ['milk', 'dairy', 'cheese', 'butter', 'cream', 'yogurt'],
    'eggs': ['egg'],
    'fish': ['fish', 'salmon', 'tuna', 'cod'],
    'shellfish': ['shrimp', 'crab', 'lobster', 'scallop'],
    'tree nuts': ['almond', 'walnut', 'pecan', 'cashew', 'pistachio'],
    'peanuts': ['peanut'],
    'wheat': ['wheat', 'flour', 'bread'],
    'soy': ['soy', 'tofu', 'miso']
  }
  
  Object.entries(allergenMap).forEach(([allergen, keywords]) => {
    if (keywords.some(keyword => ingredientText.includes(keyword))) {
      allergens.add(allergen)
    }
  })
  
  return Array.from(allergens)
}

function structureIngredientBreakdown(contributions: any[]): any[] {
  return contributions.map(contribution => ({
    ingredient: contribution.ingredient || contribution.name || '',
    calories: contribution.calories || 0,
    protein: contribution.protein || 0,
    carbs: contribution.carbs || contribution.carbohydrates || 0,
    fat: contribution.fat || 0,
    key_nutrients: contribution.key_nutrients || contribution.keyNutrients || [],
    nutritional_significance: contribution.significance || contribution.importance || ''
  }))
}

function calculateNutritionConfidence(nutritionData: any, recipe: any): number {
  let confidence = 0.7 // Base confidence for AI analysis
  
  // Increase confidence if we have detailed ingredient information
  const ingredients = recipe.ingredients || []
  if (ingredients.length > 0 && ingredients.every((ing: any) => ing.quantity && ing.unit)) {
    confidence += 0.1
  }
  
  // Increase confidence if cooking methods are considered
  if (recipe.instructions && recipe.instructions.length > 0) {
    confidence += 0.1
  }
  
  // Decrease confidence if nutritionData seems incomplete
  if (!nutritionData.vitamins || Object.keys(nutritionData.vitamins).length === 0) {
    confidence -= 0.1
  }
  
  // Check if analysis includes health metrics
  if (nutritionData.health_score || nutritionData.health_metrics) {
    confidence += 0.1
  }
  
  return Math.min(Math.max(confidence, 0.3), 1.0) // Clamp between 0.3 and 1.0
}

function fallbackNutritionEstimation(recipe: any): any {
  // Basic fallback estimation based on ingredient count and type
  const ingredientCount = recipe.ingredients?.length || 1
  const servings = recipe.servings || 1
  
  // Very basic estimation - in real implementation, you'd have a proper nutrition database
  const baseCalories = Math.max(200, ingredientCount * 50)
  
  return {
    calories: Math.round(baseCalories / servings),
    protein: Math.round(baseCalories * 0.15 / 4), // 15% protein
    carbohydrates: Math.round(baseCalories * 0.45 / 4), // 45% carbs
    total_fat: Math.round(baseCalories * 0.30 / 9), // 30% fat
    fiber: Math.round(ingredientCount * 2),
    sodium: Math.round(ingredientCount * 100),
    health_score: 65,
    glycemic_index: 50,
    inflammatory_score: 0,
    nutrient_density: 8,
    confidence: 0.4,
    vitamins: {},
    minerals: {},
    insights: ['Nutritional values are estimated based on ingredient analysis']
  }
}

/* To disable logging locally, uncomment the following */
// console.log('AI nutrition analysis function deployed!')