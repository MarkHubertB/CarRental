import { createAdminClient } from '@/lib/supabase'
import { createServerSupabaseClient } from '@/lib/supabase.server'
import {
  sendCustomerBookingCancelledEmail,
  sendCustomerBookingConfirmedEmail,
  tourBookingToCustomerEmailDetails,
} from '@/lib/email'
import { NextRequest, NextResponse } from 'next/server'

const allowedStatuses = ['pending', 'confirmed', 'cancelled', 'expired'] as const

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { status } = body

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 })
    }

    const adminClient = createAdminClient()
    const { data: existingBooking, error: existingBookingError } = await adminClient
      .from('tour_bookings')
      .select('status')
      .eq('id', id)
      .single()

    if (existingBookingError) {
      return NextResponse.json({ error: existingBookingError.message }, { status: 400 })
    }

    const { data, error } = await adminClient
      .from('tour_bookings')
      .update({ status })
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const statusChanged = existingBooking?.status !== status
    const customerEmailDetails = data
      ? tourBookingToCustomerEmailDetails(data)
      : null

    if (statusChanged && customerEmailDetails?.customerEmail && status === 'confirmed') {
      sendCustomerBookingConfirmedEmail(customerEmailDetails).catch(err =>
        console.error('Customer tour confirmed email failed silently:', err)
      )
    }

    if (statusChanged && customerEmailDetails?.customerEmail && status === 'cancelled') {
      sendCustomerBookingCancelledEmail(customerEmailDetails).catch(err =>
        console.error('Customer tour cancelled email failed silently:', err)
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
