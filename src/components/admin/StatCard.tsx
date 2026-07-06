import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend: string;
  color: string;
}

export default function StatCard({ label, value, icon, trend, color }: StatCardProps) {
  return (
    <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-gold/30 transition-all group relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl bg-white/5 border border-white/10 ${color}`}>
          {icon}
        </div>
        <span className="text-[10px] font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
          {trend}
        </span>
      </div>
      <div className="text-zinc-500 text-xs uppercase tracking-widest mb-1">{label}</div>
      <div className="text-3xl font-serif text-white">{value}</div>
    </div>
  );
}
