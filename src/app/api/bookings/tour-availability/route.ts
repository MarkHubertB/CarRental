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
  expires_at?: string | null;
};

type TourBookingRow = {
  vehicle_id: string | null;
  vehicle_type: string | null;
  travel_date: string | null;
  status: string | null;
  expires_at?: string | null;
};

type QueryError = {
  code?: string;
  message?: string;
  details?: string | null;
  hint?: string | null;
};

type QueryResult<T> = {
  data: T[] | null;
  error: QueryError | null;
};

function describeError(error: unknown) {
  if (!error || typeof error !== "object") {
    return { message: String(error) };
  }

  const errorLike = error as QueryError & { name?: string };

  return {
    name: errorLike.name,
    code: errorLike.code,
    message: errorLike.message,
    details: errorLike.details,
    hint: errorLike.hint,
  };
}

function logQueryError(
  table: string,
  columns: string,
  error: unknown,
  vehiclePreference: string | null,
) {
  console.error("[tour-availability] Supabase query failed", {
    table,
    columns,
    vehiclePreference,
    error: describeError(error),
  });
}

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

async function fetchRentalBookings(
  supabase: ReturnType<typeof createAdminClient>,
  vehiclePreference: string | null,
): Promise<QueryResult<BookingRow>> {
  const baseColumns = "car_id, pickup_date, return_date, status";
  const baseResult = await supabase
    .from("bookings")
    .select(baseColumns)
    .in("status", BLOCKING_BOOKING_STATUSES);

  if (baseResult.error) {
    logQueryError("bookings", baseColumns, baseResult.error, vehiclePreference);

    return {
      data: null,
      error: baseResult.error,
    };
  }

  return {
    data:
      baseResult.data?.map((booking) => ({
        ...booking,
        expires_at: null,
      })) ?? [],
    error: null,
  };
}

async function fetchTourBookings(
  supabase: ReturnType<typeof createAdminClient>,
  vehiclePreference: string | null,
): Promise<QueryResult<TourBookingRow>> {
  const attempts = [
    {
      columns: "vehicle_type, travel_date, status",
      normalize: (booking: Partial<TourBookingRow>) => ({
        ...booking,
        vehicle_id: null,
        expires_at: null,
      }),
    },
    {
      columns: "travel_date, status",
      normalize: (booking: Partial<TourBookingRow>) => ({
        ...booking,
        vehicle_id: null,
        vehicle_type: null,
        expires_at: null,
      }),
    },
  ];
  let lastError: QueryError | null = null;

  for (const attempt of attempts) {
    const result = await supabase
      .from("tour_bookings")
      .select(attempt.columns)
      .in("status", BLOCKING_BOOKING_STATUSES);

    if (!result.error) {
      const normalizedBookings = (result.data?.map((booking) =>
        attempt.normalize(booking as Partial<TourBookingRow>),
      ) ?? []) as TourBookingRow[];

      return {
        data: normalizedBookings,
        error: null,
      };
    }

    lastError = result.error;
    logQueryError(
      "tour_bookings",
      attempt.columns,
      result.error,
      vehiclePreference,
    );
  }

  return {
    data: null,
    error: lastError,
  };
}

export async function GET(request: NextRequest) {
  let vehiclePreference: string | null = null;

  try {
    vehiclePreference = normalizeVehiclePreference(
      request.nextUrl.searchParams.get("vehiclePreference"),
    );
    const supabase = createAdminClient();
    const now = new Date();

    const { data: cars, error: carsError } = await supabase
      .from("cars")
      .select("id, type");

    if (carsError) {
      logQueryError("cars", "id, type", carsError, vehiclePreference);
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

    const { data: bookings, error: bookingsError } =
      await fetchRentalBookings(supabase, vehiclePreference);

    if (bookingsError) {
      throw bookingsError;
    }

    const { data: tourBookings, error: tourBookingsError } =
      await fetchTourBookings(supabase, vehiclePreference);

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
    const errorDetails = describeError(error);

    console.error("[tour-availability] Request failed", {
      vehiclePreference,
      error: errorDetails,
    });
    return NextResponse.json(
      {
        error:
          errorDetails.message || "Failed to fetch tour availability",
      },
      { status: 500 },
    );
  }
}
