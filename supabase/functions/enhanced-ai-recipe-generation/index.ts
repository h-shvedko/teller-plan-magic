import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RecipeGenerationRequest {
  model: string
  prompt: string
  preferences: any
  temperature?: number
  max_tokens?: number
  fine_tuning_data?: any
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { model, prompt, preferences, temperature = 0.7, max_tokens = 2000, fine_tuning_data } = await req.json() as RecipeGenerationRequest

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

    // Prepare enhanced prompt with fine-tuning context
    const enhancedPrompt = `
You are a professional chef and recipe developer specializing in ${fine_tuning_data?.cuisine_expertise || 'international'} cuisine.

User Profile:
- Dietary Restrictions: ${fine_tuning_data?.dietary_restrictions?.join(', ') || 'None'}
- Skill Level: ${fine_tuning_data?.skill_level || 'intermediate'}
- Max Cooking Time: ${fine_tuning_data?.cooking_time_preference || 60} minutes

Create a detailed, professional recipe based on: ${prompt}

Requirements:
1. Include precise ingredient measurements with metric and imperial units
2. Provide step-by-step instructions with timing
3. Include cooking techniques and professional tips
4. Estimate nutritional information per serving
5. Suggest equipment needed and possible substitutions
6. Add difficulty rating and skill-building notes
7. Include flavor profile analysis and pairing suggestions

Format the response as a structured JSON object with all recipe details.
Focus on authenticity, technique, and creating an educational cooking experience.
`

    // Call OpenAI API with fine-tuned model
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model.includes('ft:') ? model : 'gpt-4-turbo-preview', // Use fine-tuned model if available
        messages: [
          {
            role: 'system',
            content: 'You are an expert chef specializing in recipe development and culinary education. Always respond with detailed, professional recipes in JSON format.'
          },
          {
            role: 'user',
            content: enhancedPrompt
          }
        ],
        temperature,
        max_tokens,
        response_format: { type: 'json_object' }
      })
    })

    if (!openaiResponse.ok) {
      const error = await openaiResponse.json()
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`)
    }

    const openaiResult = await openaiResponse.json()
    const recipeContent = openaiResult.choices[0]?.message?.content

    if (!recipeContent) {
      throw new Error('No recipe generated from OpenAI')
    }

    let recipe: any
    try {
      recipe = JSON.parse(recipeContent)
    } catch (parseError) {
      // If JSON parsing fails, create structured response from text
      recipe = {
        title: 'AI Generated Recipe',
        description: 'Recipe generated from natural language prompt',
        content: recipeContent,
        confidence: 0.8,
        generated_at: new Date().toISOString()
      }
    }

    // Enhance recipe with additional AI analysis
    const enhancedRecipe = {
      ...recipe,
      ai_generated: true,
      fine_tuned_model: model,
      user_preferences: preferences,
      generation_metadata: {
        model_used: model,
        temperature,
        max_tokens,
        prompt_tokens: openaiResult.usage?.prompt_tokens || 0,
        completion_tokens: openaiResult.usage?.completion_tokens || 0,
        total_tokens: openaiResult.usage?.total_tokens || 0,
        generated_at: new Date().toISOString(),
        fine_tuning_data
      },
      confidence: calculateRecipeConfidence(recipe, preferences),
      skill_building: extractSkillBuildingElements(recipe),
      customization_options: generateCustomizationOptions(recipe, preferences)
    }

    // Log API usage for monitoring
    await supabaseClient.from('openai_api_calls').insert({
      function_name: 'enhanced-ai-recipe-generation',
      model: model,
      prompt_tokens: openaiResult.usage?.prompt_tokens || 0,
      completion_tokens: openaiResult.usage?.completion_tokens || 0,
      total_tokens: openaiResult.usage?.total_tokens || 0,
      success: true,
      created_at: new Date().toISOString()
    })

    return new Response(
      JSON.stringify({ recipe: enhancedRecipe }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Enhanced AI recipe generation error:', error)

    // Log error for monitoring
    try {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? ''
      )
      
      await supabaseClient.from('openai_api_calls').insert({
        function_name: 'enhanced-ai-recipe-generation',
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
        details: 'Enhanced AI recipe generation failed'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

function calculateRecipeConfidence(recipe: any, preferences: any): number {
  let confidence = 0.8 // Base confidence for fine-tuned models
  
  // Increase confidence if recipe matches preferences
  if (recipe.cuisine && preferences.cuisine?.includes(recipe.cuisine)) {
    confidence += 0.1
  }
  
  // Check if dietary restrictions are respected
  if (preferences.dietaryRestrictions?.length > 0) {
    const hasDietaryTags = recipe.dietary_tags?.some((tag: string) => 
      preferences.dietaryRestrictions.includes(tag)
    )
    if (hasDietaryTags) confidence += 0.1
  }
  
  // Check if cooking time fits preferences
  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0)
  if (totalTime <= preferences.maxCookingTime) {
    confidence += 0.05
  }
  
  return Math.min(confidence, 1.0)
}

function extractSkillBuildingElements(recipe: any): string[] {
  const skillElements: string[] = []
  
  // Extract techniques from instructions
  const techniques = recipe.techniques || []
  techniques.forEach((technique: string) => {
    skillElements.push(`Learn ${technique} technique`)
  })
  
  // Add equipment-based skills
  const equipment = recipe.equipment || []
  equipment.forEach((tool: string) => {
    if (['stand mixer', 'food processor', 'mandoline'].includes(tool.toLowerCase())) {
      skillElements.push(`Master ${tool} usage`)
    }
  })
  
  // Add difficulty-based skills
  if (recipe.difficulty === 'advanced') {
    skillElements.push('Advanced knife skills', 'Complex flavor balancing', 'Professional plating')
  }
  
  return skillElements
}

function generateCustomizationOptions(recipe: any, preferences: any): any[] {
  const options: any[] = []
  
  // Dietary customizations
  if (!preferences.dietaryRestrictions?.includes('vegetarian')) {
    options.push({
      type: 'dietary',
      name: 'Make Vegetarian',
      changes: 'Replace meat with plant-based proteins',
      difficulty: 'easy'
    })
  }
  
  // Spice level customizations
  options.push({
    type: 'flavor',
    name: 'Adjust Spice Level',
    changes: 'Increase or decrease heat to preference',
    difficulty: 'easy'
  })
  
  // Serving size customizations
  options.push({
    type: 'portion',
    name: 'Scale Recipe',
    changes: 'Double or halve ingredients proportionally',
    difficulty: 'easy'
  })
  
  return options
}

/* To disable logging locally, uncomment the following */
// console.log('Enhanced AI recipe generation function deployed!')