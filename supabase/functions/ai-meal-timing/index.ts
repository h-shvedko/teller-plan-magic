import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MealTimingRequest {
  model: string
  user_profile: any
  recipes: any[]
  preferences: any
  constraints: any[]
  analysis_factors?: string[]
  optimization_goals?: string[]
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { 
      model,
      user_profile,
      recipes = [],
      preferences,
      constraints = [],
      analysis_factors = [],
      optimization_goals = []
    } = await req.json() as MealTimingRequest

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

    if (!user_profile || !preferences) {
      throw new Error('User profile and preferences required for meal timing analysis')
    }

    // Prepare comprehensive meal timing analysis prompt
    const timingPrompt = `
You are a certified nutritionist and chronobiology expert specializing in optimal meal timing for health and performance.

Analyze the following information and provide intelligent meal timing suggestions:

USER PROFILE:
- Age: ${user_profile.age || 30}
- Activity Level: ${user_profile.activityLevel || 'moderate'}
- Health Goals: ${JSON.stringify(user_profile.healthGoals || [])}
- Schedule Type: ${user_profile.schedule || 'standard'}
- Timezone: ${user_profile.timezone || 'UTC'}

PREFERENCES:
- Wake Up Time: ${preferences.wakeUpTime}
- Bed Time: ${preferences.bedTime}
- Energy Pattern: ${preferences.energyPattern} (when they feel most energetic)
- Exercise Time: ${preferences.exerciseTime}
- Social Eating: ${preferences.socialEating}
- Max Cooking Time: ${preferences.maxCookingTime} minutes
- Intermittent Fasting: ${preferences.intermittentFasting}
- Fasting Hours: ${preferences.fastingHours || 0}

AVAILABLE RECIPES:
${JSON.stringify(recipes.slice(0, 10), null, 2)} (showing first 10)

CONSTRAINTS:
${JSON.stringify(constraints, null, 2)}

ANALYSIS FACTORS TO CONSIDER:
${analysis_factors.join(', ')}

OPTIMIZATION GOALS:
${optimization_goals.join(', ')}

Please provide comprehensive meal timing recommendations including:

1. OPTIMAL DAILY SCHEDULE:
   - Breakfast timing and recommended recipes
   - Lunch timing and meal suggestions
   - Dinner timing and recommendations
   - Snack windows if appropriate
   - Preparation times for each meal

2. WEEKLY PATTERN OPTIMIZATION:
   - Day-by-day variations based on schedule
   - Weekend vs weekday adjustments
   - Complexity distribution throughout week
   - Special considerations for different days

3. MEAL PREP STRATEGY:
   - Batch cooking recommendations
   - Prep scheduling suggestions
   - Time-saving tips
   - Storage and reheating guidelines

4. TIMING INSIGHTS:
   - Optimal meal spacing based on metabolism
   - Energy level optimization
   - Digestive considerations
   - Exercise-meal timing coordination

5. PERSONALIZED RECOMMENDATIONS:
   - Tips specific to user's energy patterns
   - Social eating accommodations
   - Intermittent fasting integration (if applicable)
   - Lifestyle-specific advice

6. SEASONAL ADJUSTMENTS:
   - How timing should change with seasons
   - Light exposure considerations
   - Seasonal ingredient timing

7. ENERGY OPTIMIZATION:
   - Peak performance meal timing
   - Avoiding energy crashes
   - Pre/post workout nutrition timing
   - Mental clarity optimization

8. DIGESTIVE TIMING:
   - Optimal spacing between meals
   - Late-night eating guidelines
   - Meal size recommendations by time
   - Foods to avoid at certain times

Consider circadian rhythm science, metabolic research, and chronobiology principles.
Provide confidence scores for all recommendations.
Respond in comprehensive JSON format with all timing analysis.
Be specific with times and practical with suggestions.
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
            content: 'You are a certified nutritionist and chronobiology expert with deep knowledge of meal timing, circadian rhythms, and metabolic optimization. Always provide detailed, science-based meal timing recommendations in JSON format.'
          },
          {
            role: 'user',
            content: timingPrompt
          }
        ],
        temperature: 0.3, // Moderate temperature for creative but consistent suggestions
        max_tokens: 3500,
        response_format: { type: 'json_object' }
      })
    })

    if (!openaiResponse.ok) {
      const error = await openaiResponse.json()
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`)
    }

    const openaiResult = await openaiResponse.json()
    const timingContent = openaiResult.choices[0]?.message?.content

    if (!timingContent) {
      throw new Error('No meal timing analysis generated from OpenAI')
    }

    let timingData: any
    try {
      timingData = JSON.parse(timingContent)
    } catch (parseError) {
      // Fallback timing suggestions
      timingData = fallbackTimingSuggestions(user_profile, preferences)
    }

    // Structure the response according to our interface
    const structuredSuggestions = {
      daily_schedule: structureDailySchedule(timingData.daily_schedule || timingData.optimal_daily_schedule || {}),
      weekly_pattern: structureWeeklyPattern(timingData.weekly_pattern || timingData.weekly_optimization || {}),
      prep_strategy: structurePrepStrategy(timingData.prep_strategy || timingData.meal_prep_strategy || {}),
      breakfast_timing: timingData.breakfast_timing || timingData.timing_insights?.breakfast || '7:00 AM',
      lunch_timing: timingData.lunch_timing || timingData.timing_insights?.lunch || '12:30 PM',
      dinner_timing: timingData.dinner_timing || timingData.timing_insights?.dinner || '7:00 PM',
      snack_windows: timingData.snack_windows || [],
      cooking_windows: extractCookingWindows(timingData, preferences),
      seasonal_adjustments: timingData.seasonal_adjustments || {},
      personalized_tips: timingData.personalized_tips || timingData.personalized_recommendations || [],
      energy_optimization: timingData.energy_optimization || {},
      digestive_timing: timingData.digestive_timing || timingData.digestive_considerations || {},
      confidence: calculateTimingConfidence(timingData, preferences, constraints),
      analysis_metadata: {
        model_used: model,
        user_profile,
        preferences,
        constraints_count: constraints.length,
        recipes_analyzed: recipes.length,
        analysis_factors,
        optimization_goals,
        prompt_tokens: openaiResult.usage?.prompt_tokens || 0,
        completion_tokens: openaiResult.usage?.completion_tokens || 0,
        total_tokens: openaiResult.usage?.total_tokens || 0,
        analyzed_at: new Date().toISOString()
      }
    }

    // Log API usage
    await supabaseClient.from('openai_api_calls').insert({
      function_name: 'ai-meal-timing',
      model: model,
      prompt_tokens: openaiResult.usage?.prompt_tokens || 0,
      completion_tokens: openaiResult.usage?.completion_tokens || 0,
      total_tokens: openaiResult.usage?.total_tokens || 0,
      success: true,
      created_at: new Date().toISOString()
    })

    return new Response(
      JSON.stringify(structuredSuggestions),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('AI meal timing analysis error:', error)

    // Log error
    try {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? ''
      )
      
      await supabaseClient.from('openai_api_calls').insert({
        function_name: 'ai-meal-timing',
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
        details: 'AI meal timing analysis failed'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

function structureDailySchedule(schedule: any): any {
  const defaultSchedule = {
    breakfast: {
      suggestedTime: '7:00 AM',
      preparationTime: 15,
      nutritionalFocus: 'Energy and protein for morning fuel',
      energyAlignment: 'High'
    },
    lunch: {
      suggestedTime: '12:30 PM',
      preparationTime: 20,
      nutritionalFocus: 'Balanced macronutrients for sustained energy',
      energyAlignment: 'Moderate'
    },
    dinner: {
      suggestedTime: '7:00 PM',
      preparationTime: 30,
      nutritionalFocus: 'Recovery and satisfaction with vegetables',
      energyAlignment: 'Low'
    }
  }

  // Merge with AI suggestions if available
  return {
    ...defaultSchedule,
    ...schedule
  }
}

function structureWeeklyPattern(pattern: any): any {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  const weeklyPattern: any = {}

  days.forEach(day => {
    weeklyPattern[day] = {
      complexity: pattern[day]?.complexity || 'medium',
      breakfast: {
        time: pattern[day]?.breakfast?.time || '7:00 AM'
      },
      lunch: {
        time: pattern[day]?.lunch?.time || '12:00 PM'
      },
      dinner: {
        time: pattern[day]?.dinner?.time || '7:00 PM'
      },
      specialConsiderations: pattern[day]?.specialConsiderations || ''
    }
  })

  return weeklyPattern
}

function structurePrepStrategy(strategy: any): any {
  return {
    batchCookingDays: strategy.batchCookingDays || strategy.batch_cooking_days || ['sunday'],
    prepTasks: strategy.prepTasks || strategy.prep_tasks || [
      { task: 'Wash and prep vegetables', estimatedTime: 20 },
      { task: 'Cook grains and proteins in batch', estimatedTime: 45 },
      { task: 'Prepare grab-and-go snacks', estimatedTime: 15 }
    ],
    timeSavingTips: strategy.timeSavingTips || strategy.time_saving_tips || [
      'Use a slow cooker for hands-off cooking',
      'Prep ingredients the night before',
      'Keep a well-stocked pantry for quick meals'
    ]
  }
}

function extractCookingWindows(timingData: any, preferences: any): any[] {
  const cookingWindows = timingData.cooking_windows || []
  
  // If no specific windows provided, generate based on meal times and cooking time preference
  if (cookingWindows.length === 0) {
    const maxCookingTime = preferences.maxCookingTime || 60
    
    return [
      {
        meal: 'breakfast',
        start: '6:45 AM',
        end: '7:15 AM',
        maxDuration: Math.min(maxCookingTime, 30)
      },
      {
        meal: 'lunch',
        start: '12:00 PM',
        end: '12:30 PM', 
        maxDuration: Math.min(maxCookingTime, 30)
      },
      {
        meal: 'dinner',
        start: '6:00 PM',
        end: '7:00 PM',
        maxDuration: maxCookingTime
      }
    ]
  }
  
  return cookingWindows
}

function calculateTimingConfidence(timingData: any, preferences: any, constraints: any[]): number {
  let confidence = 0.8 // Base confidence
  
  // Increase confidence if we have detailed user preferences
  if (preferences.wakeUpTime && preferences.bedTime) confidence += 0.05
  if (preferences.exerciseTime) confidence += 0.05
  if (preferences.intermittentFasting) confidence += 0.05
  
  // Consider constraints complexity
  if (constraints.length > 0) {
    confidence += Math.min(constraints.length * 0.02, 0.1)
  }
  
  // Check if timing data is comprehensive
  if (timingData.daily_schedule) confidence += 0.05
  if (timingData.weekly_pattern) confidence += 0.05
  if (timingData.energy_optimization) confidence += 0.05
  
  return Math.min(confidence, 1.0)
}

function fallbackTimingSuggestions(userProfile: any, preferences: any): any {
  // Basic fallback if AI analysis fails
  const wakeTime = preferences.wakeUpTime || '7:00'
  const bedTime = preferences.bedTime || '22:00'
  
  // Calculate meal times based on wake/sleep schedule
  const wakeHour = parseInt(wakeTime.split(':')[0])
  const breakfastTime = `${wakeHour}:30`
  const lunchTime = `${wakeHour + 5}:00`
  const dinnerTime = `${wakeHour + 12}:00`
  
  return {
    daily_schedule: {
      breakfast: {
        suggestedTime: `${breakfastTime} AM`,
        preparationTime: 15,
        nutritionalFocus: 'Morning energy'
      },
      lunch: {
        suggestedTime: `${lunchTime} PM`,
        preparationTime: 20,
        nutritionalFocus: 'Midday fuel'
      },
      dinner: {
        suggestedTime: `${dinnerTime} PM`,
        preparationTime: 30,
        nutritionalFocus: 'Evening satisfaction'
      }
    },
    personalized_tips: [
      'Eat your largest meal when you have the most energy',
      'Allow 3 hours between dinner and bedtime',
      'Stay consistent with meal times to regulate circadian rhythms'
    ],
    confidence: 0.6
  }
}

/* To disable logging locally, uncomment the following */
// console.log('AI meal timing function deployed!')