import { createAdminClient } from "@/lib/supabase";
import {
  carBookingToCustomerEmailDetails,
  sendCustomerBookingExpiredEmail,
  tourBookingToCustomerEmailDetails,
} from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase.server";

export const dynamic = "force-dynamic";

async function expirePendingBookings() {
  const supabase = createAdminClient();
  const now = new Date().toISOString();

  const { data: bookings, error: bookingsError } = await supabase
    .from("bookings")
    .update({ status: "expired" })
    .eq("status", "pending")
    .lt("expires_at", now)
    .select("*, cars(id, name, brand, model, year, type)");

  if (bookingsError) {
    throw bookingsError;
  }

  const { data: tourBookings, error: tourBookingsError } = await supabase
    .from("tour_bookings")
    .update({ status: "expired" })
    .eq("status", "pending")
    .lt("expires_at", now)
    .select("*");

  if (tourBookingsError) {
    throw tourBookingsError;
  }

  for (const booking of bookings ?? []) {
    const customerEmailDetails = carBookingToCustomerEmailDetails(booking);

    if (customerEmailDetails.customerEmail) {
      sendCustomerBookingExpiredEmail(customerEmailDetails).catch((err) =>
        console.error("Customer booking expired email failed silently:", err),
      );
    }
  }

  for (const tourBooking of tourBookings ?? []) {
    const customerEmailDetails = tourBookingToCustomerEmailDetails(tourBooking);

    if (customerEmailDetails.customerEmail) {
      sendCustomerBookingExpiredEmail(customerEmailDetails).catch((err) =>
        console.error("Customer tour expired email failed silently:", err),
      );
    }
  }

  return {
    expiredBookings: bookings?.length ?? 0,
    expiredTourBookings: tourBookings?.length ?? 0,
  };
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(await expirePendingBookings());
  } catch (error) {
    console.error("Expired booking cleanup error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to clean up expired bookings",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
