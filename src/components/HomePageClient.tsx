import {
  ArrowUpRight,
  CalendarDays,
  CarFront,
  Headphones,
  MapPin,
  Route,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import Navbar from "@/components/Navbar";
import { TOUR_PACKAGES } from "@/lib/tours";
import styles from "./HomePageClient.module.css";

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
    price: 3500,
  },
  {
    id: "4edefa42-bcae-4999-9c2d-094b95cc49a8",
    name: "Toyota Rush",
    type: "SUV",
    seats: 7,
    color: "Metallic Brown",
    price: 2500,
  },
  {
    id: "d94ea4e9-cc1e-446b-aa63-70705b8fa7df",
    name: "Toyota Avanza",
    type: "MPV",
    seats: 7,
    color: "Silver",
    price: 2000,
  },
  {
    id: "66e1d48a-4ffa-4dfc-a2fb-106e63eb85ab",
    name: "Suzuki Celerio",
    type: "Hatchback",
    seats: 5,
    color: "Blue",
    price: 1500,
  },
];

const BENEFITS = [
  {
    Icon: MapPin,
    label: "Local route knowledge",
    description: "From Dauis pick-ups to quiet beach roads, travel with a driver who knows Bohol.",
  },
  {
    Icon: ShieldCheck,
    label: "Ready-to-go vehicles",
    description: "A practical fleet, prepared for airport runs, family days, and island itineraries.",
  },
  {
    Icon: Headphones,
    label: "Clear human support",
    description: "Ask a question, adjust a plan, or call directly. No automated maze.",
  },
];

const FEATURED_TOURS = TOUR_PACKAGES.slice(0, 3);

// ponytail: Static page sections stay co-located; extract only if a section gains independent state or behavior.
export default function HomePageClient() {
  return (
    <div className={styles.page}>
      <Navbar />

      <main>
        <section className={styles.hero} aria-labelledby="home-hero-title">
          {/* ponytail: MotionSites used video; local licensed fleet photography keeps this refresh frontend-only. Replace with a licensed loop only when one is supplied. */}
          <Image
            src="/cars/toyota_hi-ace.jpg"
            alt="Toyota Hi-Ace van ready for travel in Bohol"
            fill
            priority
            sizes="100vw"
            className={styles.heroImage}
          />
          <div className={styles.heroWash} aria-hidden="true" />

          <div className={styles.heroLayout}>
            <div className={styles.heroCopy}>
              <p className={styles.heroKicker}>
                <Route aria-hidden="true" size={15} />
                Bohol travel, at your pace
              </p>

              <h1 id="home-hero-title" className={styles.heroTitle}>
                Take the long way
                <span>through Bohol.</span>
              </h1>

              <p className={styles.heroDescription}>
                A local car rental service for airport arrivals, easy family days,
                and every stop worth making between them.
              </p>

              <div className={styles.heroActions}>
                <Link href="/cars" className={styles.primaryAction}>
                  Browse the fleet
                  <ArrowUpRight aria-hidden="true" size={18} />
                </Link>
                <Link href="#tours" className={styles.secondaryAction}>
                  Explore local trips
                </Link>
              </div>

              <dl className={styles.heroStats}>
                <div>
                  <dt>Based in</dt>
                  <dd>Dauis, Bohol</dd>
                </div>
                <div>
                  <dt>For groups up to</dt>
                  <dd>12 passengers</dd>
                </div>
                <div>
                  <dt>Need help?</dt>
                  <dd>Call anytime</dd>
                </div>
              </dl>
            </div>

            <form action="/cars" className={styles.availabilityPanel}>
              <div className={styles.availabilityHeading}>
                <div>
                  <p>Plan your pickup</p>
                  <strong>Find a vehicle</strong>
                </div>
                <CalendarDays aria-hidden="true" size={22} />
              </div>

              <div className={styles.availabilityFields}>
                <label className={styles.field} htmlFor="pickup-date">
                  Pick-up date
                  <input id="pickup-date" name="pickup_date" type="date" />
                </label>

                <label className={styles.field} htmlFor="return-date">
                  Return date
                  <input id="return-date" name="return_date" type="date" />
                </label>

                <label className={styles.field} htmlFor="vehicle-type">
                  Vehicle type
                  <select id="vehicle-type" name="vehicle_type" defaultValue="">
                    <option value="">All vehicles</option>
                    <option value="van">Van</option>
                    <option value="suv">SUV</option>
                    <option value="mpv">MPV</option>
                    <option value="hatchback">Hatchback</option>
                  </select>
                </label>

                <button type="submit" className={styles.availabilityAction}>
                  Check availability
                  <ArrowUpRight aria-hidden="true" size={17} />
                </button>
              </div>
            </form>
          </div>
        </section>

        <section className={styles.fleetSection} aria-labelledby="fleet-title">
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.sectionKicker}>The road-ready collection</p>
              <h2 id="fleet-title">Choose space for the day ahead.</h2>
            </div>
            <Link href="/cars" className={styles.textAction}>
              View every vehicle
              <ArrowUpRight aria-hidden="true" size={17} />
            </Link>
          </div>

          <div className={styles.fleetGrid}>
            {FLEET.map((car, index) => (
              <article key={car.id} className={styles.vehicleCard}>
                <div className={styles.vehicleImageWrap}>
                  <Image
                    src={CAR_IMAGES[car.name]}
                    alt={`${car.name} available for rent in Bohol`}
                    fill
                    sizes="(max-width: 700px) 100vw, (max-width: 1080px) 50vw, 25vw"
                    className={styles.vehicleImage}
                  />
                  <span className={styles.vehicleNumber}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className={styles.vehicleType}>{car.type}</span>
                </div>

                <div className={styles.vehicleBody}>
                  <div>
                    <p className={styles.vehicleName}>{car.name}</p>
                    <p className={styles.vehicleMeta}>
                      <UsersRound aria-hidden="true" size={15} />
                      {car.seats} seats
                      <span aria-hidden="true">•</span>
                      {car.color}
                    </p>
                  </div>

                  <div className={styles.vehicleFooter}>
                    <p>
                      <strong>₱{car.price.toLocaleString()}</strong>
                      <span>per day</span>
                    </p>
                    <Link href={`/cars/${car.id}`} className={styles.cardAction}>
                      Book this car
                      <ArrowUpRight aria-hidden="true" size={16} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.benefitSection} aria-labelledby="benefits-title">
          <div className={styles.benefitLead}>
            <p className={styles.sectionKicker}>A calmer way to get around</p>
            <h2 id="benefits-title">Your island time should feel like yours.</h2>
            <p>
              Keep the itinerary loose. We handle the ride, the local details, and
              the drive between the places you came to see.
            </p>
          </div>

          <div className={styles.benefitGrid}>
            {BENEFITS.map((benefit, index) => {
              const BenefitIcon = benefit.Icon;

              return (
                <article key={benefit.label} className={styles.benefitCard}>
                  <span className={styles.benefitNumber}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <BenefitIcon aria-hidden="true" size={27} strokeWidth={1.5} />
                  <h3>{benefit.label}</h3>
                  <p>{benefit.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section id="tours" className={styles.tourSection} aria-labelledby="tours-title">
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.sectionKicker}>Go beyond the transfer</p>
              <h2 id="tours-title">Make the drive part of the day.</h2>
            </div>
            <Link href="/tours" className={styles.textAction}>
              See all tours
              <ArrowUpRight aria-hidden="true" size={17} />
            </Link>
          </div>

          <div className={styles.tourGrid}>
            {FEATURED_TOURS.map((tour) => (
              <article key={tour.id} className={styles.tourCard}>
                <div className={styles.tourImageWrap}>
                  <Image
                    src={tour.image}
                    alt={tour.name}
                    fill
                    sizes="(max-width: 800px) 100vw, 33vw"
                    className={styles.tourImage}
                  />
                  <span className={styles.tourBadge}>{tour.badge}</span>
                </div>

                <div className={styles.tourBody}>
                  <p className={styles.tourDuration}>{tour.duration}</p>
                  <h3>{tour.name}</h3>
                  <p>{tour.description}</p>
                  <Link href={tour.ctaHref} className={styles.cardAction}>
                    {tour.ctaLabel}
                    <ArrowUpRight aria-hidden="true" size={16} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.closingSection} aria-labelledby="closing-title">
          <div>
            <p className={styles.sectionKicker}>Start where you are</p>
            <h2 id="closing-title">One call, one clear plan, one good road.</h2>
            <p>
              Tell us where you&apos;re arriving and where you want to go. We&apos;ll help
              you choose the right ride for it.
            </p>
            <div className={styles.closingActions}>
              <a href="tel:09274549343" className={styles.primaryAction}>
                Call 09274 549 343
                <ArrowUpRight aria-hidden="true" size={18} />
              </a>
              <Link href="/contact" className={styles.secondaryAction}>
                Send an inquiry
              </Link>
            </div>
          </div>

          <div className={styles.locationCard}>
            <MapPin aria-hidden="true" size={28} strokeWidth={1.5} />
            <p>Pick-up base</p>
            <strong>Purok 7, Tabalong</strong>
            <span>Dauis, Bohol, Philippines</span>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <CarFront aria-hidden="true" size={20} />
        <span>My website · Travel &amp; Tours Services · Bohol</span>
        <span>© 2025</span>
      </footer>
    </div>
  );
}
