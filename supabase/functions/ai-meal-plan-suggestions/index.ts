import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, preferences } = await req.json();
    const startTime = Date.now();
    
    // Get user ID from request headers
    const authHeader = req.headers.get('authorization');
    let userId = null;
    if (authHeader) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
      userId = user?.id;
    }

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Generating meal plan suggestions for prompt:', prompt);
    
    // Create initial log entry
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    let logId = null;
    
    if (userId) {
      const { data: logData } = await supabase
        .from('openai_api_calls')
        .insert({
          user_id: userId,
          function_name: 'ai-meal-plan-suggestions',
          prompt: prompt,
          model_used: 'gpt-4o-mini',
          status: 'pending'
        })
        .select()
        .single();
      logId = logData?.id;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a professional meal planning expert. Generate 2-3 complete meal plan suggestions based on the user's prompt and preferences. 
            
            Return a JSON object with a "suggestions" array containing meal plan objects with these exact fields:
            - name: string (meal plan name)
            - description: string (brief description of the meal plan)
            - days: number (number of days in the plan, usually 7)
            - week_start_date: string (suggested start date in YYYY-MM-DD format, default to next Monday)
            - is_active: boolean (always true)
            - meals: array of meal objects with these fields:
              - day: number (day of the plan, 1-7)
              - meal_type: string (one of: "breakfast", "lunch", "dinner", "snack")
              - recipe_name: string (name of the recipe)
              - recipe_description: string (brief description)
              - cuisine: string (cuisine type)
              - prep_time: number (prep time in minutes)
              - cook_time: number (cooking time in minutes)
              - difficulty: string (one of: "beginner", "intermediate", "advanced")
            
            Make sure meal plans are balanced, practical, and match the user's dietary preferences and lifestyle.
            
            ${preferences ? `
            IMPORTANT: Consider these user preferences:
            - Favorite cuisines: ${preferences.cuisines?.join(', ') || 'None specified'}
            - Dietary preferences: ${preferences.dietaryPreferences?.join(', ') || 'None specified'}
            - Health goals: ${preferences.healthGoals?.join(', ') || 'None specified'}
            - Cooking style: ${preferences.cookingStyle || 'Mixed'}
            - Household size: ${preferences.householdSize || 2} people
            - Difficulty level: ${preferences.difficultyLevel || 'intermediate'}
            - Budget range: ${preferences.budgetRange || 'medium'}
            
            Ensure recipes match these preferences, especially dietary restrictions and cooking difficulty.
            ` : ''}`
          },
          { role: 'user', content: prompt || 'Create a balanced weekly meal plan' }
        ],
        max_tokens: 3000,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    let suggestions;
    
    try {
      const content = data.choices[0].message.content;
      console.log('Raw OpenAI response:', content);
      
      // Parse the JSON response from OpenAI
      suggestions = JSON.parse(content);
      
      // Ensure we have the suggestions array
      if (!suggestions.suggestions || !Array.isArray(suggestions.suggestions)) {
        throw new Error('Invalid response format from AI');
      }

      console.log('Parsed suggestions:', suggestions);
      
      // Calculate cost (rough estimate)
      const inputTokens = Math.ceil(prompt.length / 4);
      const outputTokens = Math.ceil(JSON.stringify(suggestions).length / 4);
      const totalTokens = inputTokens + outputTokens;
      const cost = (inputTokens * 0.000000150) + (outputTokens * 0.000000600);
      const executionTime = Date.now() - startTime;
      
      // Update log entry
      if (logId && userId) {
        await supabase
          .from('openai_api_calls')
          .update({
            response: JSON.stringify(suggestions).substring(0, 1000),
            input_tokens: inputTokens,
            output_tokens: outputTokens,
            total_tokens: totalTokens,
            cost_usd: cost,
            status: 'success',
            execution_time_ms: executionTime
          })
          .eq('id', logId);
      }
      
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      
      // Update log entry with error
      if (logId && userId) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        await supabase
          .from('openai_api_calls')
          .update({
            status: 'error',
            error_message: 'Failed to parse AI response',
            execution_time_ms: Date.now() - startTime
          })
          .eq('id', logId);
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to parse AI response' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(JSON.stringify(suggestions), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-meal-plan-suggestions function:', error);
    
    // Update log entry with error
    if (logId && userId) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      await supabase
        .from('openai_api_calls')
        .update({
          status: 'error',
          error_message: error.message || 'Unknown error',
          execution_time_ms: Date.now() - startTime
        })
        .eq('id', logId);
    }
    
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to generate meal plan suggestions' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});