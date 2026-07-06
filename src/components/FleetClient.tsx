"use client";

import { useState } from "react";
import Link from "next/link";
import { Filter, ChevronRight, Scale } from "lucide-react";
import { useComparison } from "@/context/ComparisonContext";
import type { Car } from "@/types";

interface FleetClientProps {
  initialCars: Car[];
}

const TYPE_LABEL: Record<string, string> = {
  van: "Group / Tour",
  suv: "Family SUV",
  mpv: "MPV",
  hatchback: "City / Solo",
};

const COLOR_DOT: Record<string, string> = {
  White: "#F0EDE5",
  "Metallic Brown": "#8B6540",
  Silver: "#B8BEC8",
  Blue: "#4A7FC1",
};

export default function FleetClient({ initialCars }: FleetClientProps) {
  const [filter, setFilter] = useState("All");
  const { selectedCars, toggleCarComparison, setComparisonOpen } = useComparison();

  const filteredCars = filter === "All" 
    ? initialCars 
    : initialCars.filter(car => car.type.toLowerCase() === filter.toLowerCase());

  return (
    <div className="py-12 px-6 max-w-7xl mx-auto">
      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-6">
        <div className="flex items-center gap-3 overflow-x-auto pb-2 w-full md:w-auto">
          <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-gold mr-2">
            <Filter className="w-4 h-4" />
          </div>
          {["All", "Van", "SUV", "MPV", "Hatchback"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${
                filter === f 
                  ? "bg-gold text-black shadow-[0_0_20px_rgba(212,168,67,0.4)]" 
                  : "bg-white/5 text-zinc-400 border border-white/10 hover:border-gold/50 hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="text-right hidden md:block">
          <span className="text-zinc-500 text-xs uppercase tracking-widest">{filteredCars.length} Vehicles Available</span>
        </div>
      </div>

      {/* Fleet Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCars.map((car) => {
          const isSelected = selectedCars.some(c => c.id === car.id);
          return (
            <div 
              key={car.id} 
              className="group relative rounded-3xl overflow-hidden bg-white/[0.03] border border-white/10 hover:border-gold/40 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black"
            >
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={car.image_urls?.[0] || "/cars/placeholder.jpg"} 
                  alt={car.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-gold text-[10px] font-bold uppercase tracking-widest">
                  {TYPE_LABEL[car.type.toLowerCase()] || car.type}
                </div>
                <div 
                  className="absolute bottom-4 right-4 w-3 h-3 rounded-full border border-white/50" 
                  style={{ backgroundColor: COLOR_DOT[car.color] || "#888" }} 
                />
                
                {/* Compare Toggle */}
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    toggleCarComparison(car);
                  }}
                  className={`absolute top-4 right-4 p-2 rounded-full backdrop-blur-md border transition-all duration-300 ${
                    isSelected 
                      ? "bg-gold border-gold text-black scale-110" 
                      : "bg-black/40 border-white/20 text-white hover:bg-white/20"
                  }`}
                  title="Compare this vehicle"
                >
                  <Scale className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-serif text-white">{car.name}</h3>
                  <div className="text-gold font-serif text-xl">₱{car.price_per_day.toLocaleString()}</div>
                </div>
                
                <div className="flex gap-4 mb-6 text-zinc-400 text-xs font-medium">
                  <span className="flex items-center gap-1">🪑 {car.seats} Seats</span>
                  <span className="flex items-center gap-1">🎨 {car.color}</span>
                </div>

                <p className="text-zinc-500 text-sm leading-relaxed mb-6 line-clamp-2">
                  {car.description}
                </p>

                <Link 
                  href={`/cars/${car.id}`} 
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold uppercase tracking-widest hover:bg-gold hover:text-black transition-all duration-300"
                >
                  View Details <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Comparison Bar */}
      {selectedCars.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 duration-500">
          <div className="glass-effect px-6 py-4 rounded-full flex items-center gap-6 shadow-2xl border-gold/40">
            <div className="flex -space-x-3">
              {selectedCars.map(car => (
                <div 
                  key={car.id} 
                  className="w-10 h-10 rounded-full border-2 border-black overflow-hidden"
                  title={car.name}
                >
                  <img
                    src={car.image_urls?.[0] || "/cars/placeholder.jpg"}
                    alt={`${car.name} comparison thumbnail`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-white text-sm font-medium">
              {selectedCars.length} {selectedCars.length === 1 ? 'Vehicle' : 'Vehicles'} Selected
            </div>
            <button 
              onClick={() => setComparisonOpen(true)}
              disabled={selectedCars.length < 2}
              className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                selectedCars.length < 2 
                  ? "bg-white/5 text-zinc-500 cursor-not-allowed" 
                  : "bg-gold text-black hover:bg-gold-light"
              }`}
            >
              Compare Now
            </button>
          </div>
        </div>
      )}

      {filteredCars.length === 0 && (
        <div className="text-center py-24">
          <div className="text-zinc-600 text-lg font-serif mb-4">No vehicles match your selection.</div>
          <button 
            onClick={() => setFilter("All")}
            className="text-gold hover:text-gold-light underline underline-offset-4 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
