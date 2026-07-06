"use client";

import React from 'react';
import { useComparison } from '@/context/ComparisonContext';
import { X, Check, Info } from 'lucide-react';
import Link from 'next/link';

export default function ComparisonModal() {
  const { selectedCars, clearComparison, setComparisonOpen } = useComparison();
  const { isComparisonOpen } = useComparison();

  if (!isComparisonOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md" 
        onClick={() => setComparisonOpen(false)} 
      />
      
      <div className="relative w-full max-w-6xl bg-[#111] border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <div>
            <h2 className="text-2xl font-serif text-white">Fleet Comparison</h2>
            <p className="text-zinc-500 text-xs uppercase tracking-widest">Select the perfect ride for your journey</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={clearComparison}
              className="px-4 py-2 rounded-lg text-xs font-bold text-zinc-400 hover:text-white transition-colors"
            >
              Clear All
            </button>
            <button 
              onClick={() => setComparisonOpen(false)}
              className="p-2 rounded-lg bg-white/5 text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="p-6 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="p-4 text-zinc-500 text-xs uppercase tracking-widest font-bold w-48">Feature</th>
                {selectedCars.map(car => (
                  <th key={car.id} className="p-4 text-center relative">
                    <div className="relative z-10">
                      <div className="text-white font-serif text-lg mb-2">{car.name}</div>
                      <div className="text-gold text-xs font-bold uppercase">{car.type}</div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr>
                <td className="p-4 text-zinc-400 text-sm font-medium">Price per Day</td>
                {selectedCars.map(car => (
                  <td key={car.id} className="p-4 text-center text-white font-serif text-xl">
                    ₱{car.price_per_day.toLocaleString()}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 text-zinc-400 text-sm font-medium">Capacity</td>
                {selectedCars.map(car => (
                  <td key={car.id} className="p-4 text-center text-white">
                    {car.seats} Seats
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 text-zinc-400 text-sm font-medium">Exterior Color</td>
                {selectedCars.map(car => (
                  <td key={car.id} className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: car.color }} />
                      <span className="text-zinc-300 text-sm">{car.color}</span>
                    </div>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 text-zinc-400 text-sm font-medium">Recommendation</td>
                {selectedCars.map((car, idx) => (
                  <td key={car.id} className="p-4 text-center">
                    {idx === 0 && car.price_per_day === Math.min(...selectedCars.map(c => c.price_per_day)) ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gold/20 text-gold text-[10px] font-bold uppercase">
                        <Check className="w-3 h-3" /> Best Value
                      </span>
                    ) : idx === 0 && car.seats === Math.max(...selectedCars.map(c => c.seats)) ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-500/20 text-blue-400 text-[10px] font-bold uppercase">
                        <Info className="w-3 h-3" /> Most Spacious
                      </span>
                    ) : null}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4"></td>
                {selectedCars.map(car => (
                  <td key={car.id} className="p-4 text-center">
                    <Link 
                      href={`/cars/${car.id}`}
                      onClick={() => setComparisonOpen(false)}
                      className="inline-block px-6 py-2 rounded-full bg-gold text-black text-xs font-bold uppercase tracking-widest hover:bg-gold-light transition-all"
                    >
                      Reserve
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {selectedCars.length === 0 && (
          <div className="p-20 text-center">
            <div className="text-zinc-600 text-lg font-serif mb-4">No vehicles selected for comparison.</div>
            <p className="text-zinc-500 text-sm mb-8">Add up to 3 vehicles from the fleet to compare them side-by-side.</p>
            <button 
              onClick={() => setComparisonOpen(false)}
              className="px-6 py-2 rounded-lg bg-white/5 text-white text-xs font-bold uppercase tracking-widest border border-white/10 hover:bg-white/10 transition-all"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
