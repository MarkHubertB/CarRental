import {
  BLOCKING_BOOKING_STATUSES,
  eachDateInRange,
  isActiveBlockingBooking,
  normalizeVehiclePreference,
  vehicleTypeMatchesPreference,
} from "@/lib/bookingAvailability";
import { createAdminClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type CarRow = {
  id: string;
  type: string | null;
};

type BookingRow = {
  car_id: string | null;
  pickup_date: string | null;
  return_date: string | null;
  status: string | null;
  expires_at: string | null;
};

type TourBookingRow = {
  vehicle_id: string | null;
  vehicle_type: string | null;
  travel_date: string | null;
  status: string | null;
  expires_at: string | null;
};

function getOccupiedVehicleSet(
  occupiedVehicleIdsByDate: Map<string, Set<string>>,
  date: string,
) {
  const existing = occupiedVehicleIdsByDate.get(date);

  if (existing) {
    return existing;
  }

  const next = new Set<string>();
  occupiedVehicleIdsByDate.set(date, next);
  return next;
}

function incrementAnonymousBooking(
  anonymousBookingsByDate: Map<string, number>,
  date: string,
) {
  anonymousBookingsByDate.set(
    date,
    (anonymousBookingsByDate.get(date) ?? 0) + 1,
  );
}

async function fetchTourBookings(
  supabase: ReturnType<typeof createAdminClient>,
) {
  const fullResult = await supabase
    .from("tour_bookings")
    .select("vehicle_id, vehicle_type, travel_date, status, expires_at")
    .in("status", BLOCKING_BOOKING_STATUSES);

  if (!fullResult.error) {
    return fullResult;
  }

  const fallbackResult = await supabase
    .from("tour_bookings")
    .select("vehicle_type, travel_date, status, expires_at")
    .in("status", BLOCKING_BOOKING_STATUSES);

  return {
    data:
      fallbackResult.data?.map((booking) => ({
        ...booking,
        vehicle_id: null,
      })) ?? null,
    error: fallbackResult.error,
  };
}

export async function GET(request: NextRequest) {
  try {
    const vehiclePreference = normalizeVehiclePreference(
      request.nextUrl.searchParams.get("vehiclePreference"),
    );
    const supabase = createAdminClient();
    const now = new Date();

    const { data: cars, error: carsError } = await supabase
      .from("cars")
      .select("id, type");

    if (carsError) {
      throw carsError;
    }

    const vehiclePool = ((cars ?? []) as CarRow[]).filter((car) =>
      vehicleTypeMatchesPreference(car.type, vehiclePreference),
    );
    const vehicleIds = new Set(vehiclePool.map((car) => car.id));

    if (vehiclePool.length === 0) {
      return NextResponse.json({
        unavailableDates: [],
        allUnavailable: true,
        vehicleCount: 0,
      });
    }

    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("car_id, pickup_date, return_date, status, expires_at")
      .in("status", BLOCKING_BOOKING_STATUSES);

    if (bookingsError) {
      throw bookingsError;
    }

    const { data: tourBookings, error: tourBookingsError } =
      await fetchTourBookings(supabase);

    if (tourBookingsError) {
      throw tourBookingsError;
    }

    const occupiedVehicleIdsByDate = new Map<string, Set<string>>();
    const anonymousBookingsByDate = new Map<string, number>();

    for (const booking of (bookings ?? []) as BookingRow[]) {
      if (
        !booking.car_id ||
        !booking.pickup_date ||
        !booking.return_date ||
        !vehicleIds.has(booking.car_id) ||
        !isActiveBlockingBooking(booking.status, booking.expires_at, now)
      ) {
        continue;
      }

      for (const date of eachDateInRange(
        booking.pickup_date,
        booking.return_date,
      )) {
        getOccupiedVehicleSet(occupiedVehicleIdsByDate, date).add(
          booking.car_id,
        );
      }
    }

    for (const tourBooking of (tourBookings ?? []) as TourBookingRow[]) {
      if (
        !tourBooking.travel_date ||
        !isActiveBlockingBooking(
          tourBooking.status,
          tourBooking.expires_at,
          now,
        )
      ) {
        continue;
      }

      if (tourBooking.vehicle_id) {
        if (vehicleIds.has(tourBooking.vehicle_id)) {
          getOccupiedVehicleSet(
            occupiedVehicleIdsByDate,
            tourBooking.travel_date,
          ).add(tourBooking.vehicle_id);
        }

        continue;
      }

      if (
        !vehiclePreference ||
        !tourBooking.vehicle_type ||
        vehicleTypeMatchesPreference(
          tourBooking.vehicle_type,
          vehiclePreference,
        )
      ) {
        incrementAnonymousBooking(
          anonymousBookingsByDate,
          tourBooking.travel_date,
        );
      }
    }

    const datesToCheck = new Set([
      ...occupiedVehicleIdsByDate.keys(),
      ...anonymousBookingsByDate.keys(),
    ]);
    const unavailableDates = [...datesToCheck]
      .filter((date) => {
        const occupiedVehicleCount =
          occupiedVehicleIdsByDate.get(date)?.size ?? 0;
        const anonymousBookingCount = anonymousBookingsByDate.get(date) ?? 0;

        return (
          occupiedVehicleCount + anonymousBookingCount >= vehiclePool.length
        );
      })
      .sort();

    return NextResponse.json({
      unavailableDates,
      allUnavailable: false,
      vehicleCount: vehiclePool.length,
    });
  } catch (error) {
    console.error("Tour availability error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch tour availability",
      },
      { status: 500 },
    );
  }
}
