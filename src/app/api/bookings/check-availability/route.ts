import {
  checkVehicleAvailability,
  dateRangeToDatetimes,
  formatConflictMessage,
} from '@/lib/checkVehicleAvailability'
import { NextRequest, NextResponse } from 'next/server'

type AvailabilityRequest = {
  vehicleId?: string
  startDatetime?: string
  endDatetime?: string
  startDate?: string
  endDate?: string
}

function normalizeRequest(body: AvailabilityRequest) {
  if (body.startDatetime && body.endDatetime) {
    return {
      startDatetime: body.startDatetime,
      endDatetime: body.endDatetime,
    }
  }

  if (body.startDate && body.endDate) {
    return dateRangeToDatetimes(body.startDate, body.endDate)
  }

  return null
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AvailabilityRequest
    const range = normalizeRequest(body)

    if (!body.vehicleId || !range) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: vehicleId, startDatetime, endDatetime',
        },
        { status: 400 },
      )
    }

    const result = await checkVehicleAvailability(
      body.vehicleId,
      range.startDatetime,
      range.endDatetime,
    )

    if (result.available) {
      return NextResponse.json({ available: true })
    }

    return NextResponse.json({
      available: false,
      reason: formatConflictMessage(result),
      conflictSource: result.conflictSource,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to check availability',
      },
      { status: 500 },
    )
  }
}
