import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CarBookingPageClient from "@/components/CarBookingPageClient";
import { createAdminClient } from "@/lib/supabase";
import type { Car } from "@/types";

export const revalidate = 60;

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

export default async function CarDetailsPage(props: CarDetailsPageProps) {
  const params = await props.params;
  const car = await getCar(params.id);

  if (!car) {
    notFound();
  }

  return <CarBookingPageClient carId={params.id} initialCar={car} />;
}
