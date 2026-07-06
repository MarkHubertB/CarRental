import { createAdminClient } from '@/lib/supabase'
import { createServerSupabaseClient } from '@/lib/supabase.server'
import { verifyAdminSession } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()

    const { isAdmin, error: authError } = await verifyAdminSession(session)
    if (!isAdmin) return authError!

    const adminClient = createAdminClient()
    const { data, error } = await adminClient
      .from('tour_bookings')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data ?? [])
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
