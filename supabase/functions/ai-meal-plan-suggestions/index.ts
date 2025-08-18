import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    const { prompt } = await req.json();

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
            content: `You are a professional meal planning expert. Generate 2-3 complete meal plan suggestions based on the user's prompt. 
            
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
            
            Make sure meal plans are balanced, practical, and match the user's dietary preferences and lifestyle.`
          },
          { role: 'user', content: prompt }
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
      
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
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
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to generate meal plan suggestions' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});