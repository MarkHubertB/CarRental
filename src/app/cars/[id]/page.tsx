import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CarBookingPageClient from "@/components/CarBookingPageClient";
import { createAdminClient } from "@/lib/supabase";
import type { Car } from "@/types";

export const revalidate = 60;

type BookedDateRange = {
  from: string;
  to: string;
  source: "booking" | "tour";
};

export const metadata: Metadata = {
  title: "Book a Car in Bohol | My website",
  description:
    "Book car rental Bohol with My website in Dauis, Bohol. Rent van Dauis Bohol and reserve a vehicle for your airport transfer, island tour, or private trip.",
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
    return null;
  }

  return data as Car | null;
}

async function getBookedDateRanges(carId: string): Promise<BookedDateRange[]> {
  const supabase = createAdminClient();
  const blockingStatuses = ["pending", "confirmed"];

  const { data: bookings, error: bookingsError } = await supabase
    .from("bookings")
    .select("pickup_date, return_date")
    .eq("car_id", carId)
    .in("status", blockingStatuses);

  if (bookingsError) {
    console.error("Booked rental ranges fetch error:", bookingsError);
  }

  const { data: tourBookings, error: tourBookingsError } = await supabase
    .from("tour_bookings")
    .select("travel_date")
    .eq("vehicle_id", carId)
    .in("status", blockingStatuses);

  if (tourBookingsError) {
    console.error("Booked tour ranges fetch error:", tourBookingsError);
  }

  const rentalRanges =
    bookings
      ?.filter((booking) => booking.pickup_date && booking.return_date)
      .map((booking) => ({
        from: booking.pickup_date as string,
        to: booking.return_date as string,
        source: "booking" as const,
      })) ?? [];

  const tourRanges =
    tourBookings
      ?.filter((tourBooking) => tourBooking.travel_date)
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
