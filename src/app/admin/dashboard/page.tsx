'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import AdminDashboard from '@/components/admin/AdminDashboard'

type BookingCar = {
  id: string
  name: string
  brand?: string
  model?: string
  year?: number
  type?: string
}

type Booking = {
  id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  car_id: string
  cars: BookingCar | null
  pickup_date: string
  return_date: string
  pickup_location: string
  total_price: number
  status: string
  notes?: string
  created_at: string
}

type TourBooking = {
  id: string
  created_at: string
  full_name: string
  contact_number: string
  email: string | null
  travel_date: string
  package_name: string
  num_passengers: number
  pickup_location: string
  vehicle_type: string | null
  special_requests: string | null
  status: string
}

export default function AdminDashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [tourBookings, setTourBookings] = useState<TourBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  const fetchBookings = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/bookings')
      if (res.status === 401) { router.push('/admin'); return }
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch bookings')
      setBookings(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }, [router])

  const fetchTourBookings = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/tour-bookings')
      if (res.status === 401) { router.push('/admin'); return }
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch tour bookings')
      setTourBookings(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }, [router])

  useEffect(() => {
    async function loadAll() {
      setLoading(true)
      await Promise.all([fetchBookings(), fetchTourBookings()])
      setLoading(false)
    }
    loadAll()
  }, [fetchBookings, fetchTourBookings])

  const handleStatusUpdate = async (id: string, status: string, type: 'car' | 'tour') => {
    const endpoint = type === 'car' ? `/api/admin/bookings/${id}` : `/api/admin/tour-bookings/${id}`;
    try {
      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Update failed');
      await Promise.all([fetchBookings(), fetchTourBookings()]);
    } catch {
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id: string, type: 'car' | 'tour') => {
    const endpoint = type === 'car' ? `/api/admin/bookings/${id}` : `/api/admin/tour-bookings/${id}`;
    try {
      const res = await fetch(endpoint, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      await Promise.all([fetchBookings(), fetchTourBookings()]);
    } catch {
      alert('Failed to delete booking');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-gold font-serif text-2xl animate-pulse">
        Initializing Command Center...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-red-400 p-4 text-center">
        <div>
          <p className="text-xl mb-4">System Error</p>
          <p className="text-sm text-zinc-500">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-6 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs uppercase tracking-widest">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <AdminDashboard 
        carBookings={bookings} 
        tourBookings={tourBookings} 
        onStatusUpdate={handleStatusUpdate}
        onDelete={handleDelete}
      />
    </div>
  );
}
