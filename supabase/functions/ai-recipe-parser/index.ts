import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RecipeParsingRequest {
  model: string
  recipe_text: string
  parsing_strategy?: string
  extract_features?: string[]
  normalize_units?: boolean
  detect_substitutions?: boolean
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { 
      model,
      recipe_text,
      parsing_strategy = 'comprehensive',
      extract_features = [],
      normalize_units = true,
      detect_substitutions = true
    } = await req.json() as RecipeParsingRequest

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

    if (!recipe_text?.trim()) {
      throw new Error('No recipe text provided for parsing')
    }

    // Prepare comprehensive parsing prompt
    const parsingPrompt = `
You are an expert recipe parser specializing in extracting structured data from unstructured recipe text.

Parse the following recipe text and extract all relevant information:

"${recipe_text}"

Please extract and structure the following information:

1. RECIPE METADATA:
   - Recipe title (infer if not explicit)
   - Description/summary
   - Cuisine type (if identifiable)
   - Difficulty level (beginner/intermediate/advanced)
   - Estimated servings/yield

2. TIMING INFORMATION:
   - Preparation time (in minutes)
   - Cooking time (in minutes)
   - Total time
   - Any specific timing mentions in steps

3. INGREDIENTS:
   - Extract each ingredient with quantity and unit
   - Normalize units to standard measurements
   - Identify preparation methods (chopped, diced, etc.)
   - Note any substitution suggestions mentioned
   - Categorize ingredients (protein, vegetable, spice, etc.)

4. INSTRUCTIONS:
   - Break down into numbered steps
   - Extract cooking temperatures
   - Identify timing for each step
   - Extract cooking techniques used
   - Note any tips or warnings

5. EQUIPMENT & TOOLS:
   - List all mentioned equipment
   - Infer standard equipment needed

6. ADDITIONAL DETAILS:
   - Extract any temperature mentions
   - Note storage instructions
   - Identify dietary tags (vegetarian, gluten-free, etc.)
   - Extract any nutritional claims
   - Find serving suggestions

7. CONFIDENCE ASSESSMENT:
   - Rate parsing confidence (0-1) for each section
   - Note any ambiguous or unclear parts

${normalize_units ? 'Normalize all measurements to standard units (cups, tablespoons, teaspoons, ounces, pounds, etc.)' : ''}
${detect_substitutions ? 'Identify and extract any ingredient substitution suggestions.' : ''}

Respond in JSON format with all extracted information structured clearly.
Include confidence scores for parsing accuracy.
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
            content: 'You are a professional recipe parser that extracts structured data from unstructured recipe text. Always respond with properly formatted JSON containing all extracted recipe information.'
          },
          {
            role: 'user',
            content: parsingPrompt
          }
        ],
        temperature: 0.1, // Low temperature for consistent parsing
        max_tokens: 2500,
        response_format: { type: 'json_object' }
      })
    })

    if (!openaiResponse.ok) {
      const error = await openaiResponse.json()
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`)
    }

    const openaiResult = await openaiResponse.json()
    const parsingContent = openaiResult.choices[0]?.message?.content

    if (!parsingContent) {
      throw new Error('No parsing result generated from OpenAI')
    }

    let parsedData: any
    try {
      parsedData = JSON.parse(parsingContent)
    } catch (parseError) {
      // Fallback parsing if JSON parsing fails
      parsedData = fallbackTextParsing(recipe_text)
    }

    // Structure the response according to our interface
    const structuredRecipe = {
      title: parsedData.title || parsedData.recipe_title || 'Untitled Recipe',
      description: parsedData.description || parsedData.summary || '',
      ingredients: normalizeIngredientsData(parsedData.ingredients || []),
      instructions: normalizeInstructions(parsedData.instructions || parsedData.steps || []),
      prep_time: extractTimeValue(parsedData.prep_time || parsedData.preparation_time) || 0,
      cook_time: extractTimeValue(parsedData.cook_time || parsedData.cooking_time) || 0,
      servings: extractServingValue(parsedData.servings || parsedData.yield) || 1,
      difficulty: parsedData.difficulty || inferDifficulty(parsedData),
      equipment: parsedData.equipment || parsedData.tools || [],
      tags: extractTags(parsedData),
      nutrition: parsedData.nutrition || null,
      confidence: calculateParsingConfidence(parsedData, recipe_text),
      temperatures: extractTemperatures(parsedData, recipe_text),
      timings: extractTimings(parsedData, recipe_text),
      techniques: extractTechniques(parsedData, recipe_text),
      possible_substitutions: detect_substitutions ? extractSubstitutions(parsedData, recipe_text) : [],
      parsing_metadata: {
        model_used: model,
        parsing_strategy,
        features_extracted: extract_features,
        normalize_units,
        detect_substitutions,
        original_text_length: recipe_text.length,
        prompt_tokens: openaiResult.usage?.prompt_tokens || 0,
        completion_tokens: openaiResult.usage?.completion_tokens || 0,
        total_tokens: openaiResult.usage?.total_tokens || 0,
        parsed_at: new Date().toISOString()
      }
    }

    // Log API usage
    await supabaseClient.from('openai_api_calls').insert({
      function_name: 'ai-recipe-parser',
      model: model,
      prompt_tokens: openaiResult.usage?.prompt_tokens || 0,
      completion_tokens: openaiResult.usage?.completion_tokens || 0,
      total_tokens: openaiResult.usage?.total_tokens || 0,
      success: true,
      created_at: new Date().toISOString()
    })

    return new Response(
      JSON.stringify(structuredRecipe),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('AI recipe parser error:', error)

    // Log error
    try {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? ''
      )
      
      await supabaseClient.from('openai_api_calls').insert({
        function_name: 'ai-recipe-parser',
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
        details: 'AI recipe parsing failed'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

function normalizeIngredientsData(ingredients: any[]): any[] {
  return ingredients.map((ingredient, index) => {
    if (typeof ingredient === 'string') {
      return {
        name: ingredient,
        quantity: '',
        unit: '',
        preparation: '',
        category: 'other',
        substitutions: []
      }
    }
    
    return {
      name: ingredient.name || ingredient.ingredient || '',
      quantity: ingredient.quantity || ingredient.amount || '',
      unit: ingredient.unit || ingredient.measurement || '',
      preparation: ingredient.preparation || ingredient.prep || '',
      category: ingredient.category || 'other',
      substitutions: ingredient.substitutions || ingredient.alternatives || []
    }
  })
}

function normalizeInstructions(instructions: any[]): any[] {
  return instructions.map((instruction, index) => {
    if (typeof instruction === 'string') {
      return {
        step: index + 1,
        description: instruction,
        duration: extractTimeFromText(instruction),
        temperature: extractTemperatureFromText(instruction),
        techniques: extractTechniquesFromText(instruction),
        tips: []
      }
    }
    
    return {
      step: instruction.step || index + 1,
      description: instruction.description || instruction.instruction || instruction.text || '',
      duration: instruction.duration || instruction.time || extractTimeFromText(instruction.description || ''),
      temperature: instruction.temperature || extractTemperatureFromText(instruction.description || ''),
      techniques: instruction.techniques || extractTechniquesFromText(instruction.description || ''),
      tips: instruction.tips || []
    }
  })
}

function extractTimeValue(timeStr: any): number {
  if (typeof timeStr === 'number') return timeStr
  if (!timeStr || typeof timeStr !== 'string') return 0
  
  const matches = timeStr.match(/(\d+)\s*(min|minute|hour|hr)/i)
  if (!matches) return 0
  
  const value = parseInt(matches[1])
  const unit = matches[2].toLowerCase()
  
  if (unit.startsWith('hour') || unit === 'hr') {
    return value * 60
  }
  return value
}

function extractServingValue(servingStr: any): number {
  if (typeof servingStr === 'number') return servingStr
  if (!servingStr || typeof servingStr !== 'string') return 1
  
  const match = servingStr.match(/(\d+)/)
  return match ? parseInt(match[1]) : 1
}

function inferDifficulty(parsedData: any): string {
  const instructions = parsedData.instructions || []
  const equipment = parsedData.equipment || []
  
  // Count complexity indicators
  let complexity = 0
  
  // More than 8 steps = intermediate
  if (instructions.length > 8) complexity++
  
  // Special equipment = advanced
  if (equipment.some((eq: string) => ['stand mixer', 'food processor', 'sous vide'].includes(eq.toLowerCase()))) {
    complexity += 2
  }
  
  // Complex techniques = advanced
  const complexTechniques = ['flambé', 'tempering', 'emulsion', 'confit', 'sous vide']
  if (instructions.some((inst: any) => 
    complexTechniques.some(tech => (inst.description || '').toLowerCase().includes(tech))
  )) {
    complexity += 2
  }
  
  if (complexity >= 3) return 'advanced'
  if (complexity >= 1) return 'intermediate'
  return 'beginner'
}

function extractTags(parsedData: any): string[] {
  const tags: string[] = []
  
  // Extract from explicit tags
  if (parsedData.tags) tags.push(...parsedData.tags)
  if (parsedData.dietary_tags) tags.push(...parsedData.dietary_tags)
  
  // Infer from ingredients and instructions
  const allText = JSON.stringify(parsedData).toLowerCase()
  
  if (allText.includes('vegetarian') || !allText.includes('meat')) tags.push('vegetarian')
  if (allText.includes('vegan')) tags.push('vegan')
  if (allText.includes('gluten-free') || allText.includes('gluten free')) tags.push('gluten-free')
  if (allText.includes('dairy-free') || allText.includes('dairy free')) tags.push('dairy-free')
  
  return [...new Set(tags)] // Remove duplicates
}

function calculateParsingConfidence(parsedData: any, originalText: string): number {
  let confidence = 0.5 // Base confidence
  
  // Higher confidence if we extracted key components
  if (parsedData.title && parsedData.title.length > 3) confidence += 0.1
  if (parsedData.ingredients && parsedData.ingredients.length > 0) confidence += 0.2
  if (parsedData.instructions && parsedData.instructions.length > 0) confidence += 0.2
  if (parsedData.prep_time || parsedData.cook_time) confidence += 0.1
  
  // Check if we captured a good portion of the original text
  const extractedTextLength = JSON.stringify(parsedData).length
  const textCoverageRatio = Math.min(extractedTextLength / originalText.length, 1)
  confidence += textCoverageRatio * 0.1
  
  return Math.min(confidence, 1.0)
}

function extractTemperatures(parsedData: any, originalText: string): string[] {
  const temps = new Set<string>()
  
  // Extract from parsed data
  if (parsedData.temperatures) temps.add(...parsedData.temperatures)
  
  // Extract from original text using regex
  const tempMatches = originalText.match(/\d+\s*°?\s*[FfCc]|\d+\s*degrees?/gi)
  if (tempMatches) {
    tempMatches.forEach(temp => temps.add(temp))
  }
  
  return Array.from(temps)
}

function extractTimings(parsedData: any, originalText: string): string[] {
  const timings = new Set<string>()
  
  // Extract from parsed data
  if (parsedData.timings) timings.add(...parsedData.timings)
  
  // Extract from original text
  const timeMatches = originalText.match(/\d+\s*(min|minute|hour|hr)s?|\d+\s*-\s*\d+\s*(min|minute)/gi)
  if (timeMatches) {
    timeMatches.forEach(time => timings.add(time))
  }
  
  return Array.from(timings)
}

function extractTechniques(parsedData: any, originalText: string): string[] {
  const techniques = new Set<string>()
  
  // Extract from parsed data
  if (parsedData.techniques) techniques.add(...parsedData.techniques)
  
  // Common cooking techniques to look for
  const commonTechniques = [
    'sauté', 'braise', 'roast', 'grill', 'bake', 'fry', 'steam', 'poach',
    'blanch', 'simmer', 'boil', 'whip', 'fold', 'knead', 'cream', 'caramelize'
  ]
  
  const lowerText = originalText.toLowerCase()
  commonTechniques.forEach(technique => {
    if (lowerText.includes(technique)) {
      techniques.add(technique)
    }
  })
  
  return Array.from(techniques)
}

function extractSubstitutions(parsedData: any, originalText: string): any[] {
  const substitutions: any[] = []
  
  // Extract from parsed data
  if (parsedData.substitutions) substitutions.push(...parsedData.substitutions)
  
  // Look for common substitution patterns in text
  const subPatterns = [
    /substitute\s+(.+?)\s+(?:with|for)\s+(.+?)(?:\.|,|$)/gi,
    /use\s+(.+?)\s+instead\s+of\s+(.+?)(?:\.|,|$)/gi,
    /replace\s+(.+?)\s+with\s+(.+?)(?:\.|,|$)/gi
  ]
  
  subPatterns.forEach(pattern => {
    const matches = Array.from(originalText.matchAll(pattern))
    matches.forEach(match => {
      substitutions.push({
        original: match[2].trim(),
        substitute: match[1].trim(),
        type: 'ingredient'
      })
    })
  })
  
  return substitutions
}

function fallbackTextParsing(text: string): any {
  // Fallback parsing if JSON parsing fails
  return {
    title: 'Parsed Recipe',
    description: '',
    ingredients: extractIngredientsFromText(text),
    instructions: extractInstructionsFromText(text),
    prep_time: 0,
    cook_time: 0,
    servings: 1,
    difficulty: 'intermediate',
    equipment: [],
    confidence: 0.4
  }
}

function extractIngredientsFromText(text: string): any[] {
  // Simple ingredient extraction
  const lines = text.split('\n')
  const ingredientLines = lines.filter(line => 
    line.trim().match(/^[-•*]\s/) || 
    line.trim().match(/^\d+/) ||
    line.includes('cup') || line.includes('tablespoon') || line.includes('teaspoon')
  )
  
  return ingredientLines.map(line => ({
    name: line.replace(/^[-•*\d\s]+/, '').trim(),
    quantity: '',
    unit: '',
    preparation: ''
  }))
}

function extractInstructionsFromText(text: string): any[] {
  const sentences = text.split(/[.!]\s+/).filter(s => s.trim().length > 10)
  return sentences.map((sentence, index) => ({
    step: index + 1,
    description: sentence.trim() + '.',
    duration: null,
    temperature: null
  }))
}

function extractTimeFromText(text: string): number | null {
  const match = text.match(/(\d+)\s*(min|minute|hour|hr)/i)
  if (!match) return null
  
  const value = parseInt(match[1])
  const unit = match[2].toLowerCase()
  
  return unit.startsWith('hour') || unit === 'hr' ? value * 60 : value
}

function extractTemperatureFromText(text: string): string | null {
  const match = text.match(/(\d+)\s*°?\s*[FfCc]/)
  return match ? match[0] : null
}

function extractTechniquesFromText(text: string): string[] {
  const techniques = ['sauté', 'bake', 'roast', 'grill', 'fry', 'steam', 'boil', 'simmer']
  return techniques.filter(tech => text.toLowerCase().includes(tech))
}

/* To disable logging locally, uncomment the following */
// console.log('AI recipe parser function deployed!')