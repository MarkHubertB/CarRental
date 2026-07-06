"use client";

import React, { useState } from 'react';
import { Calendar, FileText, CreditCard, Clock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface Booking {
  id: string;
  carName: string;
  date: string;
  status: 'Confirmed' | 'Completed' | 'Cancelled' | 'Pending';
  total: number;
  type: 'Car' | 'Tour';
}

const MOCK_BOOKINGS: Booking[] = [
  { id: 'BK-9012', carName: 'Toyota Hi-Ace Van', date: '2026-07-12', status: 'Confirmed', total: 12500, type: 'Car' },
  { id: 'BK-8432', carName: 'Countryside Tour', date: '2026-06-15', status: 'Completed', total: 4500, type: 'Tour' },
  { id: 'BK-7721', carName: 'Toyota Rush', date: '2026-05-20', status: 'Completed', total: 8000, type: 'Car' },
  { id: 'BK-6543', carName: 'Chocolate Hills Trip', date: '2026-04-10', status: 'Cancelled', total: 3000, type: 'Tour' },
];

export default function PortalPage() {
  const activeBooking = MOCK_BOOKINGS[0];

  return (
    <div className="space-y-12">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-serif text-white mb-2">Welcome back, <span className="text-gold">Juan</span></h1>
          <p className="text-zinc-500 text-sm">Manage your exclusive rentals and upcoming island adventures.</p>
        </div>
        <Link href="/cars" className="bg-gold text-black px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gold-light transition-all">
          Book New Vehicle
        </Link>
      </header>

      {/* Active Rental Spotlight */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 p-8 rounded-3xl bg-gradient-to-br from-gold/20 to-transparent border border-gold/30 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <div className="text-8xl font-serif text-gold rotate-12">RESERVED</div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-gold text-xs font-bold uppercase tracking-widest mb-6">
              <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
              Active Reservation
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
              <div>
                <h2 className="text-3xl font-serif text-white mb-2">{activeBooking.carName}</h2>
                <div className="flex flex-wrap gap-4 text-zinc-400 text-sm">
                  <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {activeBooking.date}</span>
                  <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-400" /> {activeBooking.status}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Total Amount</div>
                <div className="text-3xl font-serif text-gold">₱{activeBooking.total.toLocaleString()}</div>
              </div>
            </div>

            <div className="mt-10 flex gap-4">
              <button className="px-6 py-3 rounded-xl bg-white/10 border border-white/10 text-white text-xs font-bold uppercase hover:bg-white/20 transition-all flex items-center gap-2">
                <FileText className="w-4 h-4" /> Invoice
              </button>
              <button className="px-6 py-3 rounded-xl bg-white/10 border border-white/10 text-white text-xs font-bold uppercase hover:bg-white/20 transition-all flex items-center gap-2">
                <Clock className="w-4 h-4" /> Reschedule
              </button>
            </div>
          </div>
        </div>

        <div className="p-8 rounded-3xl bg-white/5 border border-white/10 flex flex-col justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold mx-auto mb-6">
            <CreditCard className="w-8 h-8" />
          </div>
          <h3 className="text-white font-serif text-xl mb-2">Payment Method</h3>
          <p className="text-zinc-500 text-sm mb-6">VISA ending in •••• 4242</p>
          <button className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold uppercase hover:bg-white/10 transition-all">
            Update Payment
          </button>
        </div>
      </section>

      {/* Booking History */}
      <section>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-serif text-white">Travel History</h2>
          <div className="text-zinc-500 text-xs uppercase tracking-widest">All Records</div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="p-6 text-zinc-500 text-xs uppercase tracking-widest font-bold">Booking ID</th>
                <th className="p-6 text-zinc-500 text-xs uppercase tracking-widest font-bold">Vehicle/Tour</th>
                <th className="p-6 text-zinc-500 text-xs uppercase tracking-widest font-bold">Date</th>
                <th className="p-6 text-zinc-500 text-xs uppercase tracking-widest font-bold">Status</th>
                <th className="p-6 text-zinc-500 text-xs uppercase tracking-widest font-bold">Total</th>
                <th className="p-6 text-zinc-500 text-xs uppercase tracking-widest font-bold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {MOCK_BOOKINGS.map((booking) => (
                <tr key={booking.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="p-6 text-zinc-400 text-xs font-mono">{booking.id}</td>
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gold">
                        {booking.type === 'Car' ? '🚗' : '🌴'}
                      </div>
                      <span className="text-white font-medium">{booking.carName}</span>
                    </div>
                  </td>
                  <td className="p-6 text-zinc-400 text-sm">{booking.date}</td>
                  <td className="p-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      booking.status === 'Confirmed' ? "bg-green-500/10 text-green-400 border border-green-500/20" :
                      booking.status === 'Completed' ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                      booking.status === 'Cancelled' ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                      "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20"
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="p-6 text-white font-serif">₱{booking.total.toLocaleString()}</td>
                  <td className="p-6">
                    <button className="p-2 rounded-lg bg-white/5 text-zinc-500 hover:text-white hover:bg-white/10 transition-all">
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
