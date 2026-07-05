import { createAdminClient } from '@/lib/supabase'
import { createServerSupabaseClient } from '@/lib/supabase.server'
import { verifyAdminSession } from '@/lib/auth'
import {
  carBookingToCustomerEmailDetails,
  sendCustomerBookingCancelledEmail,
  sendCustomerBookingConfirmedEmail,
} from '@/lib/email'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()

    const { isAdmin, error } = await verifyAdminSession(session)
    if (!isAdmin) return error!

    const { id } = await params
// ...
    const body = await request.json()
    const { status } = body

    const allowedStatuses = ['pending', 'confirmed', 'cancelled', 'completed', 'expired']
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 })
    }

    const adminClient = createAdminClient()
    const { data: existingBooking, error: existingBookingError } = await adminClient
      .from('bookings')
      .select('status')
      .eq('id', id)
      .single()

    if (existingBookingError) {
      console.error('Fetch booking before update error:', existingBookingError)
      return NextResponse.json({ error: existingBookingError.message }, { status: 400 })
    }

    const { data, error } = await adminClient
      .from('bookings')
      .update({ status })
      .eq('id', id)
      .select('*, cars(id, name, brand, model, year, type)')
      .single()

    if (error) {
      console.error('Update booking error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const statusChanged = existingBooking?.status !== status
    const customerEmailDetails = data
      ? carBookingToCustomerEmailDetails(data)
      : null

    if (statusChanged && customerEmailDetails?.customerEmail && status === 'confirmed') {
      sendCustomerBookingConfirmedEmail(customerEmailDetails).catch(err =>
        console.error('Customer confirmed email failed silently:', err)
      )
    }

    if (statusChanged && customerEmailDetails?.customerEmail && status === 'cancelled') {
      sendCustomerBookingCancelledEmail(customerEmailDetails).catch(err =>
        console.error('Customer cancelled email failed silently:', err)
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()

    const { isAdmin, error } = await verifyAdminSession(session)
    if (!isAdmin) return error!

    const { id } = await params
    const adminClient = createAdminClient()
    const { error } = await adminClient
      .from('bookings')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Delete booking error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    // 👇 Only change is here — prints the full error to your terminal
    console.error('FULL DELETE ERROR:', JSON.stringify(error, Object.getOwnPropertyNames(error)))
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
