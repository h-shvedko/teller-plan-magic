import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Verify the user is authenticated and has admin role
    const token = authHeader.replace('Bearer ', '')
    const { data: user, error: userError } = await supabaseAdmin.auth.getUser(token)
    
    if (userError || !user.user) {
      throw new Error('Invalid token')
    }

    // Check if user is admin
    const { data: adminCheck } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.user.id)
      .eq('role', 'administrator')
      .single()

    if (!adminCheck) {
      throw new Error('Unauthorized: Admin access required')
    }

    const { action, userId, role } = await req.json()

    if (action === 'update') {
      // Remove existing roles
      await supabaseAdmin
        .from('user_roles')
        .delete()
        .eq('user_id', userId)

      // Insert new role
      const { error } = await supabaseAdmin
        .from('user_roles')
        .insert({ user_id: userId, role })

      if (error) throw error

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    throw new Error('Invalid action')

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})