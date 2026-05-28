import { createAdminClient } from '@/lib/supabase'
import { sendOwnerBookingNotification } from '@/lib/email'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Using admin client to bypass RLS for public bookings
    const supabase = createAdminClient()

    // Create booking in database
    const { data, error } = await supabase
      .from('bookings')
      .insert([
        {
          car_id: body.car_id,
          pickup_date: body.pickup_date,
          return_date: body.return_date,
          pickup_location: body.pickup_location,
          total_price: body.total_price,
          status: body.status || 'pending',
          notes: body.notes,
          customer_name: body.customer_name,
          customer_email: body.customer_email,
          customer_phone: body.customer_phone,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('Booking error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to create booking' },
        { status: 400 }
      )
    }

    // Send owner notification email (non-blocking — booking succeeds even if email fails)
    sendOwnerBookingNotification(data).catch(err =>
      console.error('Owner notification email failed silently:', err)
    )

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}