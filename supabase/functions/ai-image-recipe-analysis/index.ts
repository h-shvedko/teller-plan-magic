import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ImageAnalysisRequest {
  image: string // base64 encoded image
  model?: string
  analysis_type?: string
  detail_level?: string
  features?: string[]
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { 
      image, 
      model = 'gpt-4-vision-preview',
      analysis_type = 'recipe_extraction',
      detail_level = 'high',
      features = []
    } = await req.json() as ImageAnalysisRequest

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

    if (!image) {
      throw new Error('No image provided for analysis')
    }

    // Prepare comprehensive analysis prompt
    const analysisPrompt = `
Analyze this food/recipe image in detail. I need a comprehensive analysis for recipe creation and ingredient identification.

Please analyze the following aspects:

1. INGREDIENT IDENTIFICATION:
   - List all visible ingredients with confidence scores (0-1)
   - Estimate quantities where possible
   - Note preparation state (raw, cooked, chopped, etc.)
   - Assess freshness level (1-10)

2. RECIPE ESTIMATION:
   - Suggest what dish this might be
   - Estimate cooking method used
   - Guess preparation steps
   - Estimate serving size
   - Suggest cooking time and temperature

3. VISUAL ANALYSIS:
   - Describe presentation style
   - Note cooking stage (raw, in-progress, finished)
   - Assess portion size
   - Describe color palette
   - Analyze texture appearance

4. DIETARY INFORMATION:
   - Identify potential dietary restrictions (vegan, gluten-free, etc.)
   - Note allergen concerns
   - Estimate nutritional profile

5. COOKING METHODS:
   - Identify cooking techniques used
   - Suggest equipment needed
   - Note any special preparation methods

6. SUGGESTIONS:
   - Recipe improvement ideas
   - Presentation suggestions
   - Ingredient substitution options

Respond in JSON format with all analysis results. Be as specific and detailed as possible.
Include confidence scores for all identifications and estimations.
`

    // Call OpenAI Vision API
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
            role: 'user',
            content: [
              {
                type: 'text',
                text: analysisPrompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${image}`,
                  detail: detail_level
                }
              }
            ]
          }
        ],
        max_tokens: 2000,
        temperature: 0.3 // Lower temperature for more consistent analysis
      })
    })

    if (!openaiResponse.ok) {
      const error = await openaiResponse.json()
      throw new Error(`OpenAI Vision API error: ${error.error?.message || 'Unknown error'}`)
    }

    const openaiResult = await openaiResponse.json()
    const analysisContent = openaiResult.choices[0]?.message?.content

    if (!analysisContent) {
      throw new Error('No analysis generated from OpenAI Vision')
    }

    // Parse JSON response or create structured response
    let analysis: any
    try {
      analysis = JSON.parse(analysisContent)
    } catch (parseError) {
      // If JSON parsing fails, extract information using text processing
      analysis = parseTextAnalysis(analysisContent)
    }

    // Structure the response according to our interface
    const structuredAnalysis = {
      ingredients: normalizeIngredients(analysis.ingredients || analysis.ingredient_identification || []),
      recipe: analysis.recipe || analysis.recipe_estimation || null,
      cooking_methods: analysis.cooking_methods || analysis.cooking_techniques || [],
      dietary_info: analysis.dietary_info || analysis.dietary_information || {},
      confidence: calculateOverallConfidence(analysis),
      visual_elements: {
        presentation: analysis.visual_analysis?.presentation || analysis.presentation || '',
        cooking_stage: analysis.visual_analysis?.cooking_stage || analysis.cooking_stage || '',
        portion_size: analysis.visual_analysis?.portion_size || analysis.portion_size || '',
        color_profile: analysis.visual_analysis?.color_palette || analysis.colors || [],
        texture: analysis.visual_analysis?.texture || analysis.texture || ''
      },
      improvement_suggestions: analysis.suggestions || analysis.improvement_suggestions || [],
      analysis_metadata: {
        model_used: model,
        analysis_type,
        detail_level,
        features_analyzed: features,
        prompt_tokens: openaiResult.usage?.prompt_tokens || 0,
        completion_tokens: openaiResult.usage?.completion_tokens || 0,
        total_tokens: openaiResult.usage?.total_tokens || 0,
        analyzed_at: new Date().toISOString()
      }
    }

    // Log API usage
    await supabaseClient.from('openai_api_calls').insert({
      function_name: 'ai-image-recipe-analysis',
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
    console.error('AI image recipe analysis error:', error)

    // Log error
    try {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? ''
      )
      
      await supabaseClient.from('openai_api_calls').insert({
        function_name: 'ai-image-recipe-analysis',
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
        details: 'AI image recipe analysis failed'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

function normalizeIngredients(ingredients: any[]): any[] {
  return ingredients.map(ingredient => {
    if (typeof ingredient === 'string') {
      return {
        name: ingredient,
        confidence: 0.8,
        estimated_quantity: '',
        freshness: 8,
        preparation: ''
      }
    }
    
    return {
      name: ingredient.name || ingredient.ingredient || '',
      confidence: ingredient.confidence || 0.8,
      estimated_quantity: ingredient.quantity || ingredient.estimated_quantity || '',
      freshness: ingredient.freshness || 8,
      preparation: ingredient.preparation || ingredient.state || ''
    }
  })
}

function calculateOverallConfidence(analysis: any): number {
  const confidenceFactors: number[] = []
  
  // Ingredient identification confidence
  if (analysis.ingredients?.length > 0) {
    const avgIngredientConfidence = analysis.ingredients.reduce((sum: number, ing: any) => {
      return sum + (ing.confidence || 0.5)
    }, 0) / analysis.ingredients.length
    confidenceFactors.push(avgIngredientConfidence)
  }
  
  // Recipe estimation confidence
  if (analysis.recipe?.confidence) {
    confidenceFactors.push(analysis.recipe.confidence)
  }
  
  // Default confidence based on analysis completeness
  if (analysis.cooking_methods?.length > 0) confidenceFactors.push(0.8)
  if (analysis.visual_analysis) confidenceFactors.push(0.9)
  if (analysis.dietary_info) confidenceFactors.push(0.7)
  
  if (confidenceFactors.length === 0) return 0.6
  
  return confidenceFactors.reduce((sum, conf) => sum + conf, 0) / confidenceFactors.length
}

function parseTextAnalysis(text: string): any {
  // Fallback text parsing if JSON parsing fails
  const analysis: any = {
    ingredients: [],
    recipe: null,
    cooking_methods: [],
    dietary_info: {},
    visual_analysis: {}
  }
  
  // Extract ingredients using regex patterns
  const ingredientMatches = text.match(/ingredients?[:\-][\s\S]*?(?=\n\n|\d+\.|recipe|cooking|visual)/i)
  if (ingredientMatches) {
    const ingredientText = ingredientMatches[0]
    const ingredients = ingredientText.split('\n')
      .filter(line => line.trim().startsWith('-') || line.trim().startsWith('•'))
      .map(line => line.replace(/^[-•]\s*/, '').trim())
      .filter(line => line.length > 0)
    
    analysis.ingredients = ingredients.map((name: string) => ({
      name,
      confidence: 0.7,
      estimated_quantity: '',
      freshness: 7,
      preparation: ''
    }))
  }
  
  // Extract cooking methods
  const cookingMatches = text.match(/cooking methods?[:\-][\s\S]*?(?=\n\n|\d+\.)/i)
  if (cookingMatches) {
    analysis.cooking_methods = cookingMatches[0]
      .split('\n')
      .filter(line => line.trim().startsWith('-') || line.trim().startsWith('•'))
      .map(line => line.replace(/^[-•]\s*/, '').trim())
      .filter(line => line.length > 0)
  }
  
  return analysis
}

/* To disable logging locally, uncomment the following */
// console.log('AI image recipe analysis function deployed!')