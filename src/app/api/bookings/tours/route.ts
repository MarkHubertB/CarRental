import { getPendingExpiresAt } from "@/lib/bookingAvailability";
import {
  sendCustomerBookingRequestEmail,
  tourBookingToCustomerEmailDetails,
} from "@/lib/email";
import { createAdminClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

type TourBookingRequest = {
  full_name?: string;
  contact_number?: string;
  email?: string;
  travel_date?: string;
  package_name?: string;
  num_passengers?: number;
  pickup_location?: string;
  vehicle_type?: string | null;
  special_requests?: string | null;
};

function isValidDateOnly(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as TourBookingRequest;
    const fullName = body.full_name?.trim();
    const contactNumber = body.contact_number?.trim();
    const email = body.email?.trim() || null;
    const travelDate = body.travel_date?.trim();
    const packageName = body.package_name?.trim();
    const passengers = Number(body.num_passengers);
    const pickupLocation = body.pickup_location?.trim();
    const vehicleType = body.vehicle_type?.trim() || null;
    const specialRequests = body.special_requests?.trim() || null;

    if (
      !fullName ||
      !contactNumber ||
      !travelDate ||
      !packageName ||
      !Number.isFinite(passengers) ||
      passengers < 1 ||
      !pickupLocation
    ) {
      return NextResponse.json(
        { error: "Missing required tour booking fields" },
        { status: 400 },
      );
    }

    if (!isValidDateOnly(travelDate)) {
      return NextResponse.json(
        { error: "Invalid travel date" },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("tour_bookings")
      .insert({
        full_name: fullName,
        contact_number: contactNumber,
        email,
        travel_date: travelDate,
        package_name: packageName,
        num_passengers: passengers,
        pickup_location: pickupLocation,
        vehicle_type: vehicleType,
        special_requests: specialRequests,
        status: "pending",
        expires_at: getPendingExpiresAt(),
      })
      .select("*")
      .single();

    if (error) {
      console.error("Tour booking error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to create tour booking" },
        { status: 400 },
      );
    }

    const customerEmailDetails = tourBookingToCustomerEmailDetails(data);
    if (customerEmailDetails.customerEmail) {
      sendCustomerBookingRequestEmail(customerEmailDetails).catch((err) =>
        console.error("Customer tour request email failed silently:", err),
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Tour booking API error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
