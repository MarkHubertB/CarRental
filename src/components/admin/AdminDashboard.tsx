"use client";

import React, { useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  Car, 
  DollarSign, 
  Search, 
  Clock,
  X,
  Calendar,
  Info
} from 'lucide-react';
import StatCard from './StatCard';
import BookingTable, { type AdminBookingRow } from './BookingTable';

interface AdminDashboardProps {
  carBookings: AdminBookingRow[];
  tourBookings: AdminBookingRow[];
  onStatusUpdate: (id: string, status: string, type: 'car' | 'tour') => Promise<void>;
  onDelete: (id: string, type: 'car' | 'tour') => Promise<void>;
}

export default function AdminDashboard({ 
  carBookings, 
  tourBookings, 
  onStatusUpdate, 
  onDelete 
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'cars' | 'tours'>('cars');
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<AdminBookingRow | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const currentBookings = activeTab === 'cars' ? carBookings : tourBookings;
  const type = activeTab === 'cars' ? 'car' : 'tour';

  const filteredBookings = currentBookings.filter(b => 
    (b.customer_name || b.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
    (b.id || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { label: "Total Revenue", value: "₱1,240,000", icon: <DollarSign className="w-5 h-5" />, trend: "+12%", color: "text-gold" },
    { label: "Active Rentals", value: "14", icon: <Car className="w-5 h-5" />, trend: "+4", color: "text-blue-400" },
    { label: "Total Guests", value: "482", icon: <Users className="w-5 h-5" />, trend: "+24", color: "text-green-400" },
    { label: "Fleet Utilization", value: "88%", icon: <TrendingUp className="w-5 h-5" />, trend: "+2%", color: "text-purple-400" },
  ];

  return (
    <div className="space-y-10 p-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-serif text-white mb-2">Command Center</h1>
          <p className="text-zinc-500 text-sm">Real-time fleet overview and reservation management.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all">
            Export Report
          </button>
          <button className="px-4 py-2 rounded-lg bg-gold text-black text-xs font-bold uppercase tracking-widest hover:bg-gold-light transition-all">
            Add Vehicle
          </button>
        </div>
      </header>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-3 p-1 bg-white/5 rounded-2xl w-fit border border-white/10">
        <button 
          onClick={() => { setActiveTab('cars'); setSelectedBooking(null); }}
          className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'cars' ? 'bg-gold text-black shadow-lg' : 'text-zinc-400 hover:text-white'}`}
        >
          Car Bookings
        </button>
        <button 
          onClick={() => { setActiveTab('tours'); setSelectedBooking(null); }}
          className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'tours' ? 'bg-gold text-black shadow-lg' : 'text-zinc-400 hover:text-white'}`}
        >
          Tour Bookings
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Bookings Table */}
        <div className="xl:col-span-2 p-8 rounded-3xl bg-white/[0.03] border border-white/10 shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <h3 className="text-xl font-serif text-white">
              {activeTab === 'cars' ? 'Car Reservations' : 'Tour Reservations'}
            </h3>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input 
                type="text" 
                placeholder="Search bookings..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white outline-none focus:border-gold/50 transition-all"
              />
            </div>
          </div>

          <BookingTable 
            bookings={filteredBookings} 
            selectedId={selectedBooking?.id ?? null} 
            onSelect={(id) => {
              setSelectedBooking(currentBookings.find((booking) => booking.id === id) ?? null);
            }}
            onStatusUpdate={(id, status) => {
              setUpdatingId(id);
              onStatusUpdate(id, status, type).finally(() => setUpdatingId(null));
            }}
            onDelete={(id) => {
              setDeletingId(id);
              onDelete(id, type).finally(() => setDeletingId(null));
            }}
            updatingId={updatingId}
            deletingId={deletingId}
          />
        </div>

        {/* Detail Panel */}
        {selectedBooking ? (
          <div className="p-8 rounded-3xl bg-white/[0.03] border border-gold/30 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <button onClick={() => setSelectedBooking(null)} className="text-zinc-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center text-gold mx-auto mb-4">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-serif text-white">{selectedBooking.customer_name || selectedBooking.full_name}</h3>
              <p className="text-zinc-500 text-xs uppercase tracking-widest">{selectedBooking.id}</p>
            </div>

            <div className="space-y-4">
              {[
                { label: "Vehicle/Tour", value: selectedBooking.cars?.name || selectedBooking.package_name || selectedBooking.car_id, icon: <Car className="w-4 h-4" /> },
                { label: "Date", value: selectedBooking.pickup_date || selectedBooking.travel_date, icon: <Calendar className="w-4 h-4" /> },
                { label: "Status", value: selectedBooking.status, icon: <Clock className="w-4 h-4" /> },
                { label: "Price", value: selectedBooking.total_price ? `₱${selectedBooking.total_price?.toLocaleString()}` : '—', icon: <DollarSign className="w-4 h-4" /> },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3 text-zinc-500">
                    {item.icon}
                    <span className="text-xs uppercase tracking-wider">{item.label}</span>
                  </div>
                  <span className="text-sm text-white font-medium">{item.value}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-white/10">
              <div className="text-xs text-zinc-500 uppercase tracking-widest mb-4 text-center">Quick Actions</div>
              <div className="grid grid-cols-2 gap-3">
                <button className="py-2 rounded-lg bg-white/5 border border-white/10 text-white text-[10px] font-bold uppercase hover:bg-white/10 transition-all">
                  Send Email
                </button>
                <button className="py-2 rounded-lg bg-white/5 border border-white/10 text-white text-[10px] font-bold uppercase hover:bg-white/10 transition-all">
                  Modify
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 rounded-3xl bg-white/[0.02] border border-dashed border-white/10 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-zinc-600 mb-4">
              <Info className="w-6 h-6" />
            </div>
            <p className="text-zinc-500 text-sm">Select a booking to view detailed information and manage the reservation.</p>
          </div>
        )}
      </div>
    </div>
  );
}
