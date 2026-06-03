import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TOUR_PACKAGES } from "@/lib/tours";
import TourBookingPageClient from "@/components/TourBookingPageClient";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tour = TOUR_PACKAGES.find((item) => item.slug === slug);

  if (!tour) {
    return {
      title: "Tour Booking | My website",
    };
  }

  return {
    title: `${tour.name} | Tour Booking`,
    description: tour.description,
  };
}

export default async function TourBookingPage({ params }: PageProps) {
  const { slug } = await params;
  const tour = TOUR_PACKAGES.find((item) => item.slug === slug);

  if (!tour) notFound();

  return <TourBookingPageClient slug={slug} />;
}
