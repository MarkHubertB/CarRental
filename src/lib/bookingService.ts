import { createClient } from '@/lib/supabase'
import type { Booking, Car } from '@/types'

export async function getCar(carId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('cars')
    .select('*')
    .eq('id', carId)
    .single()

  if (error) {
    console.error('Car fetch error:', error)
    throw new Error(`Failed to fetch car: ${error.message}`)
  }

  return data as Car
}

export async function createBooking(bookingData: Omit<Booking, 'id' | 'created_at'>) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('bookings')
    .insert([bookingData])
    .select()
    .single()

  if (error) {
    console.error('Booking creation error:', error)
    throw new Error(`Failed to create booking: ${error.message}`)
  }

  return data as Booking
}

export async function getBooking(bookingId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('bookings')
    .select('*, car:cars(*)')
    .eq('id', bookingId)
    .single()

  if (error) {
    console.error('Booking fetch error:', error)
    throw new Error(`Failed to fetch booking: ${error.message}`)
  }

  return data as Booking
}

export async function updateBooking(bookingId: string, updates: Partial<Booking>) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('bookings')
    .update(updates)
    .eq('id', bookingId)
    .select()
    .single()

  if (error) {
    console.error('Booking update error:', error)
    throw new Error(`Failed to update booking: ${error.message}`)
  }

  return data as Booking
}

export async function cancelBooking(bookingId: string) {
  return updateBooking(bookingId, { status: 'cancelled' })
}

export async function getCarAvailability(carId: string, pickupDate: string, returnDate: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('bookings')
    .select('id')
    .eq('car_id', carId)
    .eq('status', 'confirmed')
    .or(`and(pickup_date.lte.${returnDate},return_date.gte.${pickupDate})`)

  if (error) {
    console.error('Availability check error:', error)
    return { available: true, conflictingBookings: [] }
  }

  return {
    available: (data?.length ?? 0) === 0,
    conflictingBookings: data || [],
  }
}
