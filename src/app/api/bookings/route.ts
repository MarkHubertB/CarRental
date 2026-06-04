import {
  checkVehicleAvailability,
  dateRangeToDatetimes,
  formatConflictMessage,
} from "@/lib/checkVehicleAvailability";
import { sendOwnerBookingNotification } from "@/lib/email";
import { createAdminClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

type BookingRequest = {
  vehicleId?: string;
  startDatetime?: string;
  endDatetime?: string;
  car_id?: string;
  pickup_date?: string;
  return_date?: string;
  pickup_location?: string;
  total_price?: number;
  notes?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
};

function normalizeBookingRequest(body: BookingRequest) {
  const vehicleId = body.vehicleId ?? body.car_id;

  if (!vehicleId) {
    return null;
  }

  if (body.startDatetime && body.endDatetime) {
    return {
      vehicleId,
      startDatetime: body.startDatetime,
      endDatetime: body.endDatetime,
      pickupDate: body.pickup_date ?? body.startDatetime.slice(0, 10),
      returnDate: body.return_date ?? body.endDatetime.slice(0, 10),
    };
  }

  if (body.pickup_date && body.return_date) {
    const range = dateRangeToDatetimes(body.pickup_date, body.return_date);

    return {
      vehicleId,
      ...range,
      pickupDate: body.pickup_date,
      returnDate: body.return_date,
    };
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as BookingRequest;
    const normalized = normalizeBookingRequest(body);

    if (!normalized) {
      return NextResponse.json(
        {
          error: "Missing required fields: car_id, pickup_date, return_date",
        },
        { status: 400 },
      );
    }

    const availabilityCheck = await checkVehicleAvailability(
      normalized.vehicleId,
      normalized.startDatetime,
      normalized.endDatetime,
    );

    if (!availabilityCheck.available) {
      return NextResponse.json(
        {
          error: formatConflictMessage(availabilityCheck),
          reason: "VEHICLE_UNAVAILABLE",
          conflictSource: availabilityCheck.conflictSource,
        },
        { status: 409 },
      );
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("bookings")
      .insert([
        {
          car_id: normalized.vehicleId,
          pickup_date: normalized.pickupDate,
          return_date: normalized.returnDate,
          pickup_location: body.pickup_location,
          total_price: body.total_price,
          status: "pending",
          notes: body.notes,
          customer_name: body.customer_name,
          customer_email: body.customer_email,
          customer_phone: body.customer_phone,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Booking error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to create booking" },
        { status: 400 },
      );
    }

    sendOwnerBookingNotification(data).catch((err) =>
      console.error("Owner notification email failed silently:", err),
    );

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
