"use client";

import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useEffect } from "react";
import { TOUR_PACKAGES } from "@/lib/tours";
import { ArrowRight, Star, ShieldCheck, Clock, MapPin, ChevronRight } from "lucide-react";

const CAR_IMAGES: Record<string, string> = {
  "Toyota Hi-Ace Van": "/cars/toyota_hi-ace.jpg",
  "Toyota Rush": "/cars/toyota rush.jpg",
  "Toyota Avanza": "/cars/toyota-avanza.jpg",
  "Suzuki Celerio": "/cars/Maruti_Suzuki_Celerio.avif",
};

const FLEET = [
  {
    id: "c93cf1b7-51ce-4d91-891d-821b1c1b4d8c",
    name: "Toyota Hi-Ace Van",
    type: "Van",
    seats: 12,
    color: "White",
    colorHex: "#e8e8e8",
    price: 3500,
    featured: true,
    tags: ["Group", "Island Tour"],
  },
  {
    id: "4edefa42-bcae-4999-9c2d-094b95cc49a8",
    name: "Toyota Rush",
    type: "SUV",
    seats: 7,
    color: "Metallic Brown",
    colorHex: "#7B5E3A",
    price: 2500,
    featured: true,
    tags: ["Family", "Off-road"],
  },
  {
    id: "d94ea4e9-cc1e-446b-aa63-70705b8fa7df",
    name: "Toyota Avanza",
    type: "MPV",
    seats: 7,
    color: "Silver",
    colorHex: "#A8A8A8",
    price: 2000,
    featured: false,
    tags: ["Urban", "Economical"],
  },
  {
    id: "66e1d48a-4ffa-4dfc-a2fb-106e63eb85ab",
    name: "Suzuki Celerio",
    type: "Hatchback",
    seats: 5,
    color: "Blue",
    colorHex: "#2B5BA8",
    price: 1500,
    featured: false,
    tags: ["Solo", "City"],
  },
];

const WHY_US = [
  {
    icon: <MapPin className="w-6 h-6" />,
    title: "Local Knowledge",
    desc: "Based in Dauis, Bohol - we know every route, road, and hidden gem tourists miss.",
  },
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    title: "Elite Fleet",
    desc: "Every vehicle is rigorously maintained and ready for Bohol's diverse terrain.",
  },
  {
    icon: <Clock className="w-6 h-6" />,
    title: "Instant Booking",
    desc: "Seamless online reservations with immediate confirmation. No hidden fees.",
  },
  {
    icon: <Star className="w-6 h-6" />,
    title: "Premium Service",
    desc: "Family-owned and locally operated with a legacy of trust and luxury.",
  },
];

const FEATURED_TOURS = TOUR_PACKAGES.slice(0, 3);

export default function HomePageClient() {
  useEffect(() => {
    const handleScroll = () => document.documentElement.style.setProperty("--scroll-y", `${window.scrollY}`);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <style>{`
        .hero-gradient {
          background: radial-gradient(circle at 20% 30%, rgba(212,168,67,0.15) 0%, transparent 50%),
                      radial-gradient(circle at 80% 70%, rgba(180,130,30,0.1) 0%, transparent 50%),
                      #0a0a0a;
        }
        .glass-effect {
          background: rgba(26, 26, 26, 0.6);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(212, 168, 67, 0.15);
        }
        .bento-card {
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .bento-card:hover {
          transform: translateY(-8px) scale(1.01);
          border-color: rgba(212, 168, 67, 0.4);
          box-shadow: 0 20px 40px rgba(0,0,0,0.6), 0 0 20px rgba(212,168,67,0.1);
        }
        .text-gold {
          background: linear-gradient(135deg, #f0c96a 0%, #d4a843 55%, #b8882a 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>

      <Navbar />

      <main className="relative z-10">
        {/* --- HERO SECTION --- */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden hero-gradient px-6 py-20">
        <div className="absolute inset-0 opacity-30 pointer-events-none" 
             style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")', backgroundRepeat: 'repeat' }} />
        
        <div className="relative z-10 max-w-6xl w-full text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gold text-xs font-bold uppercase tracking-widest mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            Experience the Zenith of Travel
          </div>

          <h1 className="text-6xl md:text-8xl lg:text-9xl font-serif text-white mb-6 leading-tight tracking-tighter">
            DRIVE THE <br />
            <span className="text-gold italic">EXTRAORDINARY</span>
          </h1>

          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-12 font-light leading-relaxed">
            Bohol&apos;s most exclusive car rental experience. From rugged highlands to 
            crystalline shores, arrive in absolute luxury.
          </p>

          {/* Floating Search Bar */}
          <div className="glass-effect max-w-4xl mx-auto p-4 rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-4 items-end shadow-2xl">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gold uppercase tracking-wider ml-1">Pickup Date</label>
              <input type="date" className="bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-gold/50 transition-colors" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gold uppercase tracking-wider ml-1">Return Date</label>
              <input type="date" className="bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-gold/50 transition-colors" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gold uppercase tracking-wider ml-1">Vehicle Type</label>
              <select className="bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-gold/50 transition-colors appearance-none">
                <option value="all">All Categories</option>
                <option value="van">Luxury Vans</option>
                <option value="suv">Premium SUVs</option>
                <option value="mpv">Family MPVs</option>
                <option value="hatch">City Hatchbacks</option>
              </select>
            </div>
            <Link href="/cars" className="bg-gold text-black font-bold py-3 px-6 rounded-xl text-center hover:bg-gold-light transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
              Check Availability <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Bottom Decorative Elements */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
      </section>

      {/* --- FEATURED FLEET (Bento Grid) --- */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <div className="text-gold text-xs font-bold uppercase tracking-[0.3em] mb-4">The Collection</div>
            <h2 className="text-4xl md:text-6xl font-serif text-white leading-tight">Curated Excellence <br /> For Every Journey</h2>
          </div>
          <Link href="/cars" className="group flex items-center gap-2 text-gold hover:text-gold-light transition-colors font-medium">
            Explore Full Fleet <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {FLEET.map((car, idx) => (
            <div 
              key={car.id} 
              className={`bento-card glass-effect rounded-3xl overflow-hidden group relative ${
                car.featured ? (idx === 0 ? 'md:col-span-2 md:row-span-2' : 'md:col-span-1') : 'md:col-span-1'
              }`}
            >
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={CAR_IMAGES[car.name] || "/cars/placeholder.jpg"} 
                  alt={car.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-gold text-[10px] font-bold uppercase tracking-widest">
                  {car.type}
                </div>
                <div className="absolute bottom-4 right-4 w-4 h-4 rounded-full border-2 border-white/50" style={{ backgroundColor: car.colorHex }} />
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-serif text-white">{car.name}</h3>
                  <div className="text-gold font-serif text-lg">₱{car.price.toLocaleString()} <span className="text-xs text-zinc-500">/day</span></div>
                </div>
                <div className="flex gap-2 mb-6">
                  {car.tags?.map(tag => (
                    <span key={tag} className="text-[10px] px-2 py-1 rounded-md bg-white/5 text-zinc-400 border border-white/5">
                      {tag}
                    </span>
                  ))}
                  <span className="text-[10px] px-2 py-1 rounded-md bg-white/5 text-zinc-400 border border-white/5">
                    {car.seats} Seats
                  </span>
                </div>
                <Link 
                  href={`/cars/${car.id}`} 
                  className="block w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white text-center text-xs font-bold uppercase tracking-widest hover:bg-gold hover:text-black transition-all"
                >
                  Reserve Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- WHY CHOOSE US (Modern Grid) --- */}
      <section className="py-24 bg-[#0f0f0f] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <div className="text-gold text-xs font-bold uppercase tracking-[0.3em] mb-4">The Standard</div>
            <h2 className="text-4xl md:text-5xl font-serif text-white">Uncompromising Quality</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {WHY_US.map((item, i) => (
              <div key={i} className="group p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-gold/30 transition-all duration-500 hover:bg-white/[0.05]">
                <div className="w-12 h-12 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold mb-6 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h3 className="text-white font-serif text-xl mb-3">{item.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- TOURS TEASER (Cinematic Cards) --- */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <div className="text-gold text-xs font-bold uppercase tracking-[0.3em] mb-4">Curated Journeys</div>
            <h2 className="text-4xl md:text-6xl font-serif text-white leading-tight">Beyond the Destination</h2>
          </div>
          <Link href="/tours" className="group flex items-center gap-2 text-gold hover:text-gold-light transition-colors font-medium">
            View All Packages <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {FEATURED_TOURS.map((tour) => (
            <div key={tour.id} className="group relative rounded-3xl overflow-hidden aspect-[4/5] cursor-pointer">
              <img src={tour.image} alt={tour.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8 w-full">
                <div className="text-gold text-[10px] font-bold uppercase tracking-widest mb-2">{tour.badge}</div>
                <h3 className="text-2xl font-serif text-white mb-3">{tour.name}</h3>
                <p className="text-zinc-400 text-sm mb-6 line-clamp-2">{tour.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-white font-serif text-lg">{tour.pricing}</span>
                  <Link href={tour.ctaHref} className="p-3 rounded-full bg-gold text-black hover:bg-gold-light transition-colors">
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- FINAL CTA --- */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gold/5" />
        <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl md:text-6xl font-serif text-white mb-6">Ready to Experience Bohol?</h2>
          <p className="text-zinc-400 text-lg mb-10 max-w-xl mx-auto font-light">
            Join hundreds of travelers who discovered the island in absolute luxury.
          </p>
          <Link href="/cars" className="bg-gold text-black px-10 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-gold-light transition-all transform hover:scale-105 inline-flex items-center gap-2">
            Book Your Vehicle Now <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 px-6 border-t border-white/5 bg-black text-center">
        <div className="text-gold font-serif text-2xl mb-4">CarRental Bohol</div>
        <p className="text-zinc-500 text-xs uppercase tracking-widest mb-8">Luxury. Precision. Adventure.</p>
        <div className="flex justify-center gap-8 text-zinc-400 text-xs mb-8">
          <Link href="/cars" className="hover:text-gold transition-colors">Fleet</Link>
          <Link href="/tours" className="hover:text-gold transition-colors">Tours</Link>
          <Link href="/contact" className="hover:text-gold transition-colors">Contact</Link>
        </div>
        <div className="text-zinc-600 text-[10px] uppercase tracking-widest">
          © 2026 CarRental Bohol. All Rights Reserved.
        </div>
      </footer>
    </main>
    </>
  );
}
