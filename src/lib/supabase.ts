import { createBrowserClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import {
  getSupabaseAdminEnv,
  getSupabasePublicEnv,
} from '@/lib/supabaseEnv'

export { getSupabasePublicEnv } from '@/lib/supabaseEnv'

// Use this for client-side/browser usage.
export function createClient() {
  const { url, anonKey } = getSupabasePublicEnv()
  return createBrowserClient(url, anonKey)
}

// Use this for server-side API routes. Requires the service role key to bypass RLS.
export function createAdminClient() {
  const { url, serviceRoleKey } = getSupabaseAdminEnv()
  return createSupabaseClient(url, serviceRoleKey)
}
