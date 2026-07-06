import React from 'react';
import { X, CheckCircle2 } from 'lucide-react';

export interface AdminBookingRow {
  id: string;
  customer_name?: string;
  full_name?: string;
  car_id?: string;
  cars?: { name?: string } | null;
  package_name?: string;
  pickup_date?: string;
  travel_date?: string;
  total_price?: number;
  status?: string;
}

export default function BookingTable({ 
  bookings, 
  selectedId, 
  onSelect, 
  onStatusUpdate, 
  onDelete, 
  updatingId, 
  deletingId 
}: { 
  bookings: AdminBookingRow[]; 
  selectedId: string | null; 
  onSelect: (id: string) => void;
  onStatusUpdate: (id: string, status: string) => void;
  onDelete: (id: string) => void;
  updatingId?: string | null;
  deletingId?: string | null;
}) {
  const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    pending:   { bg: 'rgba(212,168,67,0.12)',  text: '#D4A843', border: 'rgba(212,168,67,0.35)' },
    confirmed: { bg: 'rgba(34,197,94,0.10)',   text: '#4ade80', border: 'rgba(34,197,94,0.30)'  },
    cancelled: { bg: 'rgba(239,68,68,0.10)',   text: '#f87171', border: 'rgba(239,68,68,0.30)'  },
    completed: { bg: 'rgba(240,201,106,0.10)', text: '#F0C96A', border: 'rgba(240,201,106,0.30)'},
    expired:   { bg: 'rgba(148,163,184,0.10)', text: '#cbd5e1', border: 'rgba(148,163,184,0.30)' },
  };

  return (
    <div className="overflow-x-auto rounded-3xl border border-white/10 bg-white/[0.02]">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-white/5 border-b border-white/10">
            <th className="p-4 text-zinc-500 text-[10px] uppercase tracking-widest font-bold">Customer</th>
            <th className="p-4 text-zinc-500 text-[10px] uppercase tracking-widest font-bold">Vehicle/Tour</th>
            <th className="p-4 text-zinc-500 text-[10px] uppercase tracking-widest font-bold">Date</th>
            <th className="p-4 text-zinc-500 text-[10px] uppercase tracking-widest font-bold">Status</th>
            <th className="p-4 text-zinc-500 text-[10px] uppercase tracking-widest font-bold">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {bookings.map((b) => {
            const status = b.status ?? 'pending';
            const sc = STATUS_COLORS[status] || STATUS_COLORS.pending;
            const isSelected = selectedId === b.id;
            return (
              <tr 
                key={b.id} 
                onClick={() => onSelect(b.id)}
                className={`cursor-pointer transition-colors ${isSelected ? "bg-gold/10" : "hover:bg-white/[0.02]"}`}
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold text-xs font-bold">
                      {(b.customer_name || b.full_name)?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <span className="text-sm text-white font-medium">{b.customer_name || b.full_name || 'Guest'}</span>
                  </div>
                </td>
                <td className="p-4 text-sm text-zinc-400">
                  {b.cars?.name || b.package_name || b.car_id || '—'}
                </td>
                <td className="p-4 text-sm text-zinc-400">{b.pickup_date || b.travel_date}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tighter border ${sc.bg} ${sc.text} ${sc.border}`}>
                    {status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                    <button 
                      onClick={() => onStatusUpdate(b.id, 'confirmed')}
                      disabled={updatingId === b.id}
                      className="p-1.5 rounded-md bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors"
                      title="Confirm"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onDelete(b.id)}
                      disabled={deletingId === b.id}
                      className="p-1.5 rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                      title="Delete"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
