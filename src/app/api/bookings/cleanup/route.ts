import { createAdminClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function expirePendingBookings() {
  const supabase = createAdminClient();
  const now = new Date().toISOString();

  const { data: bookings, error: bookingsError } = await supabase
    .from("bookings")
    .update({ status: "expired" })
    .eq("status", "pending")
    .lt("expires_at", now)
    .select("id");

  if (bookingsError) {
    throw bookingsError;
  }

  const { data: tourBookings, error: tourBookingsError } = await supabase
    .from("tour_bookings")
    .update({ status: "expired" })
    .eq("status", "pending")
    .lt("expires_at", now)
    .select("id");

  if (tourBookingsError) {
    throw tourBookingsError;
  }

  return {
    expiredBookings: bookings?.length ?? 0,
    expiredTourBookings: tourBookings?.length ?? 0,
  };
}

export async function GET() {
  try {
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

export async function POST() {
  return GET();
}
