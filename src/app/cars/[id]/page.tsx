import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CarBookingPageClient from "@/components/CarBookingPageClient";
import {
  BLOCKING_BOOKING_STATUSES,
  isActiveBlockingBooking,
} from "@/lib/bookingAvailability";
import { createAdminClient } from "@/lib/supabase";
import type { Car } from "@/types";
import { findDemoCar } from "@/lib/demo-cars";

export const revalidate = 60;

type BookedDateRange = {
  from: string;
  to: string;
  source: "booking" | "tour";
};

export const metadata: Metadata = {
  title: "Reserve Your Luxury Ride | CarRental Bohol",
  description:
    "Experience the zenith of travel in Bohol. Reserve our premium fleet for island tours, airport transfers, and exclusive private journeys.",
};

interface CarDetailsPageProps {
  params: Promise<{ id: string }>;
}

async function getCar(id: string): Promise<Car | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("cars")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Car detail fetch error:", error);
    return findDemoCar(id);
  }

  return (data as Car | null) ?? findDemoCar(id);
}

async function getBookedDateRanges(carId: string): Promise<BookedDateRange[]> {
  const supabase = createAdminClient();
  const now = new Date();

  const { data: bookings, error: bookingsError } = await supabase
    .from("bookings")
    .select("pickup_date, return_date, status, expires_at")
    .eq("car_id", carId)
    .in("status", BLOCKING_BOOKING_STATUSES);

  if (bookingsError) {
    console.error("Booked rental ranges fetch error:", bookingsError);
    return [];
  }

  const { data: tourBookings, error: tourBookingsError } = await supabase
    .from("tour_bookings")
    .select("travel_date, status, expires_at")
    .eq("vehicle_id", carId)
    .in("status", BLOCKING_BOOKING_STATUSES);

  if (tourBookingsError) {
    console.error("Booked tour ranges fetch error:", tourBookingsError);
  }

  const rentalRanges =
    bookings
      ?.filter(
        (booking) =>
          booking.pickup_date &&
          booking.return_date &&
          isActiveBlockingBooking(
            booking.status as string | null,
            booking.expires_at as string | null,
            now,
          ),
      )
      .map((booking) => ({
        from: booking.pickup_date as string,
        to: booking.return_date as string,
        source: "booking" as const,
      })) ?? [];

  const tourRanges =
    tourBookings
      ?.filter(
        (tourBooking) =>
          tourBooking.travel_date &&
          isActiveBlockingBooking(
            tourBooking.status as string | null,
            tourBooking.expires_at as string | null,
            now,
          ),
      )
      .map((tourBooking) => ({
        from: tourBooking.travel_date as string,
        to: tourBooking.travel_date as string,
        source: "tour" as const,
      })) ?? [];

  return [...rentalRanges, ...tourRanges];
}

export default async function CarDetailsPage(props: CarDetailsPageProps) {
  const params = await props.params;
  const [car, bookedDateRanges] = await Promise.all([
    getCar(params.id),
    getBookedDateRanges(params.id),
  ]);

  if (!car) {
    notFound();
  }

  return (
    <CarBookingPageClient
      carId={params.id}
      initialCar={car}
      bookedDateRanges={bookedDateRanges}
    />
  );
}
