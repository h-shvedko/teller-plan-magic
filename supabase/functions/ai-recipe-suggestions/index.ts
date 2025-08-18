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

    console.log('Generating recipe suggestions for prompt:', prompt);

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
            content: `You are a professional chef and recipe creator. Generate 3 recipe suggestions based on the user's prompt. 
            
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
            
            Make sure recipes are practical, delicious, and match the user's request.`
          },
          { role: 'user', content: prompt }
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
    console.error('Error in ai-recipe-suggestions function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to generate recipe suggestions' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});