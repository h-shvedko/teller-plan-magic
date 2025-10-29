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

    console.log('Generating recipe suggestions for prompt:', prompt);
    
    // Create initial log entry
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    let logId = null;
    
    if (userId) {
      const { data: logData } = await supabase
        .from('openai_api_calls')
        .insert({
          user_id: userId,
          function_name: 'ai-recipe-suggestions',
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
            content: `You are a professional chef and recipe creator. Generate 3 recipe suggestions based on the user's prompt and preferences. 
            
            Return a JSON object with a "suggestions" array containing recipe objects with these exact fields:
            - name: string (recipe name)
            - cuisine: string (cuisine type)
            - description: string (brief description)
            - prep_time: number (prep time in minutes)
            - cook_time: number (cooking time in minutes)
            - difficulty: string (one of: "beginner", "intermediate", "advanced")
            - ingredients: array of strings (ingredient list)
            - instructions: array of strings (step-by-step instructions)
            - dietary_tags: array of strings (dietary tags like "vegetarian", "gluten-free", etc.)
            - meal_type: string (one of: "breakfast", "lunch", "dinner", "snack")
            - servings: number (number of servings)
            
            Make sure recipes are practical, delicious, and match the user's request.
            
            ${preferences ? `
            IMPORTANT: Consider these user preferences:
            - Favorite cuisines: ${preferences.cuisines?.join(', ') || 'None specified'}
            - Dietary preferences: ${preferences.dietaryPreferences?.join(', ') || 'None specified'}
            - Meal type: ${preferences.mealType || 'dinner'}
            - Difficulty level: ${preferences.difficulty || 'intermediate'}
            - Max prep time: ${preferences.maxPrepTime || 60} minutes
            - Max cook time: ${preferences.maxCookTime || 60} minutes
            - Servings: ${preferences.servings || 4} people
            
            Ensure recipes match these preferences, especially dietary restrictions, time constraints, and difficulty level.
            ` : ''}`
          },
          { role: 'user', content: prompt || 'Suggest some delicious recipes' }
        ],
        max_tokens: 2000,
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
      
      // Calculate cost (rough estimate: $0.150 per 1M input tokens, $0.600 per 1M output tokens for gpt-4o-mini)
      const inputTokens = Math.ceil(prompt.length / 4); // rough estimate
      const outputTokens = Math.ceil(JSON.stringify(suggestions).length / 4);
      const totalTokens = inputTokens + outputTokens;
      const cost = (inputTokens * 0.000000150) + (outputTokens * 0.000000600);
      const executionTime = Date.now() - startTime;
      
      // Update log entry
      if (logId && userId) {
        await supabase
          .from('openai_api_calls')
          .update({
            response: JSON.stringify(suggestions).substring(0, 1000), // truncate for storage
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
    console.error('Error in ai-recipe-suggestions function:', error);
    
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
      JSON.stringify({ error: error.message || 'Failed to generate recipe suggestions' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});