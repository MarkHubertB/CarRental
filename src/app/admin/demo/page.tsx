"use client";

import AdminDashboard from "@/components/admin/AdminDashboard";
import { DEMO_CARS } from "@/lib/demo-cars";

const carBookings = [
  {
    id: "BK-DEMO-9012",
    customer_name: "Juan Dela Cruz",
    car_id: DEMO_CARS[0].id,
    cars: { name: DEMO_CARS[0].name },
    pickup_date: "2026-07-12",
    status: "confirmed",
    total_price: 12500,
  },
  {
    id: "BK-DEMO-7721",
    customer_name: "Mika Santos",
    car_id: DEMO_CARS[1].id,
    cars: { name: DEMO_CARS[1].name },
    pickup_date: "2026-07-16",
    status: "pending",
    total_price: 8000,
  },
  {
    id: "BK-DEMO-6543",
    customer_name: "Alex Reyes",
    car_id: DEMO_CARS[2].id,
    cars: { name: DEMO_CARS[2].name },
    pickup_date: "2026-07-22",
    status: "completed",
    total_price: 6000,
  },
];

const tourBookings = [
  {
    id: "TR-DEMO-8432",
    full_name: "Clara Lim",
    package_name: "Bohol Countryside Tour",
    travel_date: "2026-07-18",
    status: "confirmed",
  },
  {
    id: "TR-DEMO-5590",
    full_name: "Daniel Cruz",
    package_name: "Island Hopping Tour",
    travel_date: "2026-07-25",
    status: "pending",
  },
];

export default function AdminDemoPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white">
      <div className="border-b border-gold/20 bg-gold/10 px-6 py-3 text-center text-xs font-bold uppercase tracking-[0.25em] text-gold">
        Demo Command Center · Non-mutating sample data
      </div>
      <AdminDashboard
        carBookings={carBookings}
        tourBookings={tourBookings}
        onStatusUpdate={async () => undefined}
        onDelete={async () => undefined}
      />
    </main>
  );
}
