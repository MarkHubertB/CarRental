import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { TOUR_PACKAGES } from "@/lib/tours";

export const metadata: Metadata = {
  title: "Tour Packages | CF Udtohan Travel & Tours",
  description:
    "Explore Bohol tour packages from CF Udtohan-Bagotchay Travel & Tours Services in Dauis, Bohol, including countryside, Panglao beach, island hopping, and custom private tours.",
};

export default function ToursPage() {
  return (
    <main>
      <Navbar />

      <header
        style={{
          padding: "4rem 3.5rem 2.5rem",
          borderBottom: "1px solid var(--border-dim)",
          background:
            "linear-gradient(160deg, rgba(255,215,80,.06) 0%, var(--dark) 60%)",
        }}
      >
        <div className="section-eyebrow">Our Tours</div>
        <h1
          style={{
            fontFamily: "var(--font-dm-serif)",
            fontSize: "clamp(2rem, 4vw, 3rem)",
            color: "var(--text)",
            marginBottom: ".5rem",
          }}
        >
          Explore Bohol Your Way
        </h1>
        <p
          style={{ fontSize: ".9rem", color: "var(--text3)", fontWeight: 300 }}
        >
          Full tour packages, transfer combos, and private custom itineraries.
        </p>
      </header>

      <section style={{ padding: "3rem 3.5rem 5rem" }}>
        <div className="fleet-grid">
          {TOUR_PACKAGES.map((tour) => (
            <article key={tour.id} className="car-card">
              <div className="car-card-gloss" />
              <div className="car-img-wrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={tour.image}
                  alt={tour.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
                <span className="car-badge">{tour.badge}</span>
              </div>
              <div className="car-body">
                <h2 className="car-name">{tour.name}</h2>
                <div className="car-meta">
                  <span>{tour.duration}</span>
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
                  {tour.description}
                </p>
                <div
                  style={{
                    fontSize: ".75rem",
                    color: "var(--text3)",
                    lineHeight: 1.6,
                    marginBottom: ".9rem",
                  }}
                >
                  <p
                    style={{
                      color: "var(--text2)",
                      letterSpacing: ".14em",
                      textTransform: "uppercase",
                      fontSize: ".63rem",
                      marginBottom: ".3rem",
                    }}
                  >
                    {tour.stopsLabel}
                  </p>
                  {tour.stops.join(" · ")}
                </div>
                {tour.note && (
                  <p
                    style={{
                      fontSize: ".75rem",
                      color: "var(--text3)",
                      lineHeight: 1.6,
                      marginBottom: "1rem",
                      paddingLeft: ".9rem",
                      borderLeft: "1px solid rgba(212,168,67,.18)",
                    }}
                  >
                    <span
                      style={{
                        display: "block",
                        marginBottom: ".3rem",
                        color: "var(--text2)",
                        letterSpacing: ".14em",
                        textTransform: "uppercase",
                        fontSize: ".63rem",
                      }}
                    >
                      Note
                    </span>
                    {tour.note}
                  </p>
                )}
                <div className="car-footer">
                  <div>
                    <p
                      className="car-price-val gold-text"
                      style={{ fontSize: ".82rem", lineHeight: 1.45 }}
                    >
                      {tour.pricing}
                    </p>
                  </div>
                  <Link href={tour.ctaHref} className="car-book-btn">
                    {tour.ctaLabel}
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
