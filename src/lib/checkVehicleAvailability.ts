import { createAdminClient } from '@/lib/supabase'

export type ConflictSource = 'booking' | 'tour' | null

export interface AvailabilityCheckResult {
  available: boolean
  conflictSource: ConflictSource
}

type BookingConflict = {
  id: string
  pickup_date?: string
  return_date?: string
}

type TourSchedule = {
  id: string
  tour_date: string
  start_time: string
  end_time: string
}

const BLOCKING_STATUSES = ['confirmed', 'pending']

function toDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid date/time value')
  }

  return date
}

function normalizeDateOnlyStart(date: string) {
  return `${date}T00:00:00`
}

function normalizeDateOnlyEnd(date: string) {
  const end = new Date(`${date}T00:00:00`)
  end.setDate(end.getDate() + 1)
  return end.toISOString()
}

export function dateRangeToDatetimes(startDate: string, endDate: string) {
  return {
    startDatetime: normalizeDateOnlyStart(startDate),
    endDatetime: normalizeDateOnlyEnd(endDate),
  }
}

function buildTourDatetime(tourDate: string, time: string) {
  return new Date(`${tourDate}T${time}`)
}

function tourOverlapsRequest(
  tour: TourSchedule,
  requestedStart: Date,
  requestedEnd: Date,
) {
  const tourStart = buildTourDatetime(tour.tour_date, tour.start_time)
  const tourEnd = buildTourDatetime(tour.tour_date, tour.end_time)

  return tourStart < requestedEnd && requestedStart < tourEnd
}

function legacyBookingOverlapsRequest(
  booking: BookingConflict,
  requestedStart: Date,
  requestedEnd: Date,
) {
  if (!booking.pickup_date || !booking.return_date) {
    return false
  }

  const bookingStart = new Date(normalizeDateOnlyStart(booking.pickup_date))
  const bookingEnd = new Date(normalizeDateOnlyEnd(booking.return_date))

  return bookingStart < requestedEnd && requestedStart < bookingEnd
}

async function findBookingConflict(
  vehicleId: string,
  startDatetime: string,
  endDatetime: string,
): Promise<BookingConflict | null> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('bookings')
    .select('id')
    .eq('vehicle_id', vehicleId)
    .in('status', BLOCKING_STATUSES)
    .lt('start_datetime', endDatetime)
    .gt('end_datetime', startDatetime)
    .limit(1)

  if (!error) {
    return data?.[0] ?? null
  }

  const requestedStart = toDate(startDatetime)
  const requestedEnd = toDate(endDatetime)

  const legacyResult = await supabase
    .from('bookings')
    .select('id, pickup_date, return_date')
    .eq('car_id', vehicleId)
    .in('status', BLOCKING_STATUSES)

  if (legacyResult.error) {
    console.error('Booking availability check error:', legacyResult.error)
    return null
  }

  const conflict = legacyResult.data?.find((booking) =>
    legacyBookingOverlapsRequest(
      booking as BookingConflict,
      requestedStart,
      requestedEnd,
    )
  )

  return (conflict as BookingConflict | undefined) ?? null
}

async function findTourConflict(
  vehicleId: string,
  startDatetime: string,
  endDatetime: string,
): Promise<TourSchedule | null> {
  const supabase = createAdminClient()
  const requestedStart = toDate(startDatetime)
  const requestedEnd = toDate(endDatetime)

  const { data, error } = await supabase
    .from('tours')
    .select('id, tour_date, start_time, end_time')
    .eq('vehicle_id', vehicleId)
    .in('status', BLOCKING_STATUSES)

  if (error) {
    console.error('Tour availability check error:', error)
    return null
  }

  const conflict = data?.find((tour) =>
    tourOverlapsRequest(tour as TourSchedule, requestedStart, requestedEnd)
  )

  return (conflict as TourSchedule | undefined) ?? null
}

/**
 * Checks vehicle availability across rental bookings and tour schedules.
 *
 * Conflict logic: existing.start < requested.end AND existing.end > requested.start.
 */
export async function checkVehicleAvailability(
  vehicleId: string,
  startDatetime: string,
  endDatetime: string,
): Promise<AvailabilityCheckResult> {
  const requestedStart = toDate(startDatetime)
  const requestedEnd = toDate(endDatetime)

  if (!(requestedStart < requestedEnd)) {
    throw new Error('End date/time must be after start date/time')
  }

  const bookingConflict = await findBookingConflict(
    vehicleId,
    requestedStart.toISOString(),
    requestedEnd.toISOString(),
  )

  if (bookingConflict) {
    return { available: false, conflictSource: 'booking' }
  }

  const tourConflict = await findTourConflict(
    vehicleId,
    requestedStart.toISOString(),
    requestedEnd.toISOString(),
  )

  if (tourConflict) {
    return { available: false, conflictSource: 'tour' }
  }

  return { available: true, conflictSource: null }
}

export function formatConflictMessage(result: AvailabilityCheckResult): string {
  if (result.available) {
    return ''
  }

  if (result.conflictSource === 'booking') {
    return 'This vehicle already has a booking during the selected date/time range.'
  }

  if (result.conflictSource === 'tour') {
    return 'This vehicle is assigned to a tour during the selected date/time range.'
  }

  return 'Not available for selected dates.'
}
