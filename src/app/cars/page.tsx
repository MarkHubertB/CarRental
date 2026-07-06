import type { Metadata } from "next";
import { createClient } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import FleetClient from "@/components/FleetClient";
import type { Car } from "@/types";
import { DEMO_CARS } from "@/lib/demo-cars";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Our Fleet | My website",
  description:
    "Browse our fleet for van rental Bohol, self drive car Bohol, and SUV hire Panglao with My website in Dauis, Bohol, Philippines.",
};

async function getCars(): Promise<Car[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("cars")
    .select("*")
    .order("price_per_day", { ascending: false });
  if (error) {
    console.error(error);
    return DEMO_CARS;
  }
  return data?.length ? data : DEMO_CARS;
}

const CAR_IMAGES: Record<string, string> = {
  "hi-ace": "/cars/toyota_hi-ace.jpg",
  rush: "/cars/toyota rush.jpg",
  avanza: "/cars/toyota-avanza.jpg",
  celerio: "/cars/Maruti_Suzuki_Celerio.avif",
};

function getCarImage(carModel: string): string {
  const modelKey = carModel.toLowerCase().replace(/\s+/g, "-");
  if (CAR_IMAGES[modelKey]) return CAR_IMAGES[modelKey];

  for (const [key, path] of Object.entries(CAR_IMAGES)) {
    if (carModel.toLowerCase().includes(key)) return path;
  }

  return "/cars/placeholder.jpg";
}

export default async function CarsPage() {
  const cars = await getCars().then((carsList) =>
    carsList.map((car) => ({
      ...car,
      image_urls: [getCarImage(car.model)],
    })),
  );

  return (
    <main>
      <Navbar />

      <header
        style={{
          padding:
            "clamp(2.5rem, 5vw, 4rem) var(--padding-mobile) clamp(1.5rem, 3vw, 2.5rem)",
          borderBottom: "1px solid var(--border-dim)",
          background:
            "linear-gradient(160deg, rgba(255,215,80,.06) 0%, var(--dark) 60%)",
        }}
      >
        <div className="section-eyebrow">Our Fleet</div>
        <h1
          style={{
            fontFamily: "var(--font-dm-serif)",
            fontSize: "clamp(2rem, 4vw, 3rem)",
            color: "var(--text)",
            marginBottom: ".5rem",
          }}
        >
          Choose Your Ride
        </h1>
        <p
          style={{
            fontSize: "clamp(0.8rem, 1.5vw, 0.9rem)",
            color: "var(--text3)",
            fontWeight: 300,
          }}
        >
          {cars.length} vehicles available in Dauis, Bohol
        </p>
      </header>

      <FleetClient initialCars={cars} />
    </main>
  );
}
