import type { Metadata } from "next";
import { createClient } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import Image from "next/image";
import type { Car } from "@/types";

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
    return [];
  }
  return data || [];
}

const COLOR_DOT: Record<string, string> = {
  White: "#F0EDE5",
  "Metallic Brown": "#8B6540",
  Silver: "#B8BEC8",
  Blue: "#4A7FC1",
};
const TYPE_LABEL: Record<string, string> = {
  van: "Group / Tour",
  suv: "Family SUV",
  mpv: "MPV",
  hatchback: "City / Solo",
};

const CAR_IMAGES: Record<string, string> = {
  "hi-ace": "/cars/toyota_hi-ace.jpg",
  rush: "/cars/toyota rush.jpg",
  avanza: "/cars/toyota-avanza.jpg",
  celerio: "/cars/Maruti_Suzuki_Celerio.avif",
};

function getCarImage(carModel: string): string {
  // Try exact match first
  const modelKey = carModel.toLowerCase().replace(/\s+/g, "-");
  if (CAR_IMAGES[modelKey]) return CAR_IMAGES[modelKey];

  // Try partial matches
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

      {/* Page Header */}
      <header
        style={{
          padding:
            "clamp(2.5rem, 5vw, 4rem) var(--padding-mobile) clamp(1.5rem, 3vw, 2.5rem)",
          borderBottom: "1px solid var(--border-dim)",
          background:
            "linear-gradient(160deg, rgba(235,244,239,.06) 0%, var(--dark) 60%)",
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

      {/* Filters */}
      <section
        style={{
          padding: "clamp(0.8rem, 2vw, 1.25rem) var(--padding-mobile)",
          borderBottom: "1px solid var(--border-dim)",
          display: "flex",
          gap: "clamp(0.6rem, 2vw, 1rem)",
          flexWrap: "wrap",
          alignItems: "center",
          background: "rgba(255,210,60,.02)",
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {["All", "Van", "SUV", "MPV", "Hatchback"].map((f) => (
          <button
            key={f}
            style={{
              padding: "clamp(0.3rem, 1vw, 0.4rem) clamp(0.8rem, 2vw, 1.1rem)",
              borderRadius: "5px",
              fontSize: "clamp(0.65rem, 1vw, 0.72rem)",
              fontWeight: 600,
              letterSpacing: ".1em",
              textTransform: "uppercase",
              cursor: "pointer",
              background:
                f === "All"
                  ? "linear-gradient(135deg,#cfe9e3,#a9d8cf)"
                  : "rgba(235,244,239,.08)",
              color: f === "All" ? "#071414" : "var(--text3)",
              border: f === "All" ? "none" : "1px solid rgba(235,244,239,.18)",
              transition: "all .2s",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {f}
          </button>
        ))}
      </section>

      {/* Grid */}
      <section
        style={{
          padding:
            "clamp(2rem, 5vw, 3rem) var(--padding-mobile) clamp(3rem, 8vw, 5rem)",
        }}
      >
        <div className="fleet-grid">
          {cars.map((car) => (
            <article key={car.id} className="car-card">
              <div className="car-card-gloss" />
              <div className="car-img-wrap">
                {car.image_urls?.length > 0 ? (
                  <Image
                    src={car.image_urls[0]}
                    alt={car.name}
                    fill
                    sizes="(max-width: 700px) 100vw, (max-width: 1080px) 50vw, 25vw"
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <span className="car-placeholder-text">
                    {car.model.slice(0, 3).toUpperCase()}
                  </span>
                )}
                <span className="car-badge">
                  {TYPE_LABEL[car.type] ?? car.type}
                </span>
                <span
                  className="car-color-dot"
                  style={{
                    background: COLOR_DOT[car.color] ?? "#888",
                    boxShadow: `0 0 7px ${COLOR_DOT[car.color] ?? "#888"}`,
                  }}
                />
              </div>
              <div className="car-body">
                <h2 className="car-name">{car.name}</h2>
                <div className="car-meta">
                  <span>{car.seats} Seats</span>
                  <span className="car-meta-dot" />
                  <span style={{ textTransform: "capitalize" }}>
                    {car.type}
                  </span>
                  <span className="car-meta-dot" />
                  <span>{car.color}</span>
                </div>
                <p
                  style={{
                    fontSize: ".78rem",
                    color: "var(--text3)",
                    lineHeight: 1.6,
                    marginBottom: "1rem",
                    fontWeight: 300,
                  }}
                >
                  {car.description}
                </p>
                <div className="car-footer">
                  <div>
                    <p className="car-price-val gold-text">
                      {"\u20B1"}
                      {car.price_per_day.toLocaleString()}
                    </p>
                    <p className="car-price-label">per day</p>
                  </div>
                  <Link href={`/cars/${car.id}`} className="car-book-btn">
                    Book Now
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
