import type { Metadata } from 'next'
import CarBookingPageClient from '@/components/CarBookingPageClient'

export const metadata: Metadata = {
  title: 'Book a Car in Bohol | CF Udtohan Travel & Tours',
  description:
    'Book car rental Bohol with CF Udtohan Travel & Tours in Dauis, Bohol. Rent van Dauis Bohol and reserve a vehicle for your airport transfer, island tour, or private trip.',
}

interface CarDetailsPageProps {
  params: Promise<{ id: string }>
}

export default async function CarDetailsPage(props: CarDetailsPageProps) {
  const params = await props.params

  return <CarBookingPageClient carId={params.id} />
}
