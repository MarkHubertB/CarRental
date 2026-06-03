import type { Metadata } from "next";
import HomePageClient from "@/components/HomePageClient";

export const metadata: Metadata = {
  title: "Car Rental in Bohol",
  description:
    "Book car rental in Bohol with driver from My website in Dauis, Bohol. Choose from vans, SUVs, MPVs, and hatchbacks for airport transfers, island tours, and private travel.",
};

export default function HomePage() {
  return <HomePageClient />;
}
