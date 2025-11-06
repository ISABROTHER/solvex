import { serve } from 'https.deno.land/std@0.177.0/http/server.ts'
import { createClient, SupabaseClient } from 'https.esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

// Function to check if a user is an admin
const isAdmin = async (supabaseAdminClient: SupabaseClient, userId: string): Promise<boolean> => {
  if (!userId) return false;
  try {
    const { data, error } = await supabaseAdminClient
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data.role === 'admin';
  } catch (error) {
    console.error('Error checking admin role:', error.message);
    return false;
  }
}

serve(async (req: Request) => {
  // This is needed for CORS, which is required for functions
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the SERVICE_ROLE key
    // This bypasses all RLS policies
    const supabaseAdminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Get the user's JWT from the request
    const authHeader = req.headers.get('Authorization')!
    const jwt = authHeader.split(' ')[1]
    const { data: { user } } = await supabaseAdminClient.auth.getUser(jwt)
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    // 2. Check if the *calling* user is an admin
    const isCallerAdmin = await isAdmin(supabaseAdminClient, user.id);
    if (!isCallerAdmin) {
      return new Response(JSON.stringify({ error: 'Not authorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      })
    }

    // 3. Get the action and payload from the request body
    const { action, userId, newRole } = await req.json()
    let resultData: any = null;
    let resultError: any = null;

    if (action === 'delete') {
      // --- Handle Delete ---
      const { data: authUser, error: authError } = await supabaseAdminClient.auth.admin.deleteUser(userId);
      if (authError) throw authError;
      resultData = authUser;

    } else if (action === 'block') {
      // --- Handle Block/Unblock ---
      if (!newRole || !['employee', 'blocked'].includes(newRole)) {
        throw new Error('Invalid newRole provided. Must be "employee" or "blocked".');
      }
      const { data, error } = await supabaseAdminClient
        .from('profiles')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();
      
      if (error) throw error;
      resultData = data;

    } else {
      throw new Error('Invalid action provided.');
    }

    // 4. Return success
    return new Response(JSON.stringify({ data: resultData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Function error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})