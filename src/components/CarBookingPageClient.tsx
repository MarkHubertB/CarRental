"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  DayPicker,
  getDefaultClassNames,
  type DateRange,
  type Matcher,
} from "react-day-picker";
import Navbar from "@/components/Navbar";
import type { Car } from "@/types";

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

interface CarBookingPageClientProps {
  carId: string;
  initialCar: Car;
  bookedDateRanges: BookedDateRange[];
}

type BookedDateRange = {
  from: string;
  to: string;
  source: "booking" | "tour";
};

function parseDateOnly(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDateOnly(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function rangeOverlapsBookedRange(
  selectedRange: { from: Date; to: Date },
  bookedRange: { from: Date; to: Date },
) {
  return selectedRange.from <= bookedRange.to && bookedRange.from <= selectedRange.to;
}

export default function CarBookingPageClient({
  carId,
  initialCar,
  bookedDateRanges,
}: CarBookingPageClientProps) {
  const router = useRouter();
  const [car] = useState<Car | null>(initialCar);
  const [loading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availabilityStatus, setAvailabilityStatus] = useState<'unchecked' | 'checking' | 'available' | 'unavailable'>('unchecked');
  const [availabilityMessage, setAvailabilityMessage] = useState<string>('');
  const [formData, setFormData] = useState({
    pickupDate: "",
    returnDate: "",
    pickupLocation: "Dauis",
    fullName: "",
    email: "",
    phone: "",
    notes: "",
  });

  const today = useMemo(() => startOfToday(), []);
  const defaultCalendarClassNames = useMemo(() => getDefaultClassNames(), []);
  const bookedCalendarRanges = useMemo(
    () =>
      bookedDateRanges.map((range) => ({
        from: parseDateOnly(range.from),
        to: parseDateOnly(range.to),
        source: range.source,
      })),
    [bookedDateRanges],
  );
  const bookedCalendarMatchers = useMemo<Matcher[]>(
    () => bookedCalendarRanges.map(({ from, to }) => ({ from, to })),
    [bookedCalendarRanges],
  );
  const selectedCalendarRange = useMemo<DateRange | undefined>(() => {
    if (!formData.pickupDate) return undefined;

    return {
      from: parseDateOnly(formData.pickupDate),
      to: formData.returnDate ? parseDateOnly(formData.returnDate) : undefined,
    };
  }, [formData.pickupDate, formData.returnDate]);
  const selectedRangeOverlapsBooked = useMemo(() => {
    if (!selectedCalendarRange?.from || !selectedCalendarRange.to) return false;

    return bookedCalendarRanges.some((bookedRange) =>
      rangeOverlapsBookedRange(
        { from: selectedCalendarRange.from!, to: selectedCalendarRange.to! },
        bookedRange,
      ),
    );
  }, [bookedCalendarRanges, selectedCalendarRange]);
  const isDateRangeComplete = Boolean(
    selectedCalendarRange?.from && selectedCalendarRange.to,
  );
  const effectiveAvailabilityStatus = selectedRangeOverlapsBooked
    ? "unavailable"
    : availabilityStatus;
  const effectiveAvailabilityMessage = selectedRangeOverlapsBooked
    ? "Not available for selected dates"
    : availabilityMessage;

  useEffect(() => {
    fetch("/api/bookings/cleanup", { method: "POST" }).catch((err) =>
      console.error("Expired booking cleanup failed:", err),
    );
  }, []);

  // ✅ NEW: Check vehicle availability when dates change
  useEffect(() => {
    if (!formData.pickupDate || !formData.returnDate || !carId) {
      return;
    }

    // Don't check if return date is before pickup date
    if (new Date(formData.returnDate) < new Date(formData.pickupDate)) {
      return;
    }

    if (selectedRangeOverlapsBooked) {
      return;
    }

    const endDate = new Date(`${formData.returnDate}T00:00:00`);
    endDate.setDate(endDate.getDate() + 1);

    const checkAvailability = async () => {
      setAvailabilityStatus('checking');
      try {
        const response = await fetch('/api/bookings/check-availability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vehicleId: carId,
            startDatetime: `${formData.pickupDate}T00:00:00`,
            endDatetime: endDate.toISOString(),
          }),
        });

        const data = await response.json();

        if (data.available) {
          setAvailabilityStatus('available');
          setAvailabilityMessage('Vehicle is available for these dates');
        } else {
          setAvailabilityStatus('unavailable');
          setAvailabilityMessage(data.reason || 'Not available for selected dates');
        }
      } catch (err) {
        console.error('Availability check failed:', err);
        setAvailabilityStatus('unchecked');
        setAvailabilityMessage('Could not verify availability');
      }
    };

    // Debounce to avoid excessive API calls
    const debounceTimer = setTimeout(checkAvailability, 500);
    return () => clearTimeout(debounceTimer);
  }, [formData.pickupDate, formData.returnDate, carId, selectedRangeOverlapsBooked]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "pickupDate" || name === "returnDate") {
      setAvailabilityStatus("unchecked");
      setAvailabilityMessage("");
    }
  };

  const handleDateRangeSelect = (range: DateRange | undefined) => {
    const pickupDate = range?.from ? formatDateOnly(range.from) : "";
    const returnDate = range?.to ? formatDateOnly(range.to) : "";
    const nextSelectedRange =
      range?.from && range.to ? { from: range.from, to: range.to } : null;
    const overlapsBooked =
      nextSelectedRange !== null &&
      bookedCalendarRanges.some((bookedRange) =>
        rangeOverlapsBookedRange(nextSelectedRange, bookedRange),
      );

    setFormData((prev) => ({
      ...prev,
      pickupDate,
      returnDate,
    }));

    if (!nextSelectedRange) {
      setAvailabilityStatus("unchecked");
      setAvailabilityMessage("");
      return;
    }

    if (overlapsBooked) {
      setAvailabilityStatus("unavailable");
      setAvailabilityMessage("Not available for selected dates");
      return;
    }

    setAvailabilityStatus("available");
    setAvailabilityMessage("Available");
  };

  // Same-day = 1 day, next-day = 1 day, then +1 per extra calendar day.
  // Logic: days = max(1, returnDate - pickupDate in calendar days)
  // Examples:
  //   May 11 -> May 11: diff = 0 -> max(1, 0) = 1 day
  //   May 11 -> May 12: diff = 1 -> max(1, 1) = 1 day
  //   May 11 -> May 13: diff = 2 -> max(1, 2) = 2 days
  const calculateDays = (): number => {
    if (!formData.pickupDate || !formData.returnDate) return 0;
    const pickup = new Date(formData.pickupDate);
    const ret = new Date(formData.returnDate);
    const diffDays = Math.round(
      (ret.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24),
    );
    return Math.max(1, diffDays);
  };

  const getCarImage = () => {
    if (car?.image_urls && car.image_urls.length > 0) return car.image_urls[0];
    const modelLower = car?.model?.toLowerCase() || "";
    if (modelLower.includes("hi-ace") || modelLower.includes("hiace"))
      return "/cars/toyota_hi-ace.jpg";
    if (modelLower.includes("rush")) return "/cars/toyota rush.jpg";
    if (modelLower.includes("avanza")) return "/cars/toyota-avanza.jpg";
    if (modelLower.includes("celerio"))
      return "/cars/Maruti_Suzuki_Celerio.avif";
    return "/cars/placeholder.jpg";
  };

  const days = calculateDays();
  const totalPrice = days * (car?.price_per_day ?? 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      if (!formData.pickupDate || !formData.returnDate)
        throw new Error("Please select pickup and return dates");

      // Allow same-day; only block return before pickup.
      if (new Date(formData.returnDate) < new Date(formData.pickupDate))
        throw new Error("Return date cannot be before the pickup date");

      if (selectedRangeOverlapsBooked)
        throw new Error("Not available for selected dates");

      if (!carId) throw new Error("Car ID not found");

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          car_id: carId,
          pickup_date: formData.pickupDate,
          return_date: formData.returnDate,
          pickup_location: formData.pickupLocation,
          notes: formData.notes,
          customer_name: formData.fullName,
          customer_email: formData.email,
          customer_phone: formData.phone,
          total_price: totalPrice, // already uses the corrected days
          status: "pending",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create booking");
      }

      const booking = await response.json();
      router.push(`/booking/confirmation/${booking.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "clamp(0.55rem, 1.5vw, 0.75rem) clamp(0.75rem, 2vw, 1rem)",
    border: "1px solid rgba(235,244,239,0.2)",
    borderRadius: "6px",
    background: "rgba(255,255,255,0.03)",
    color: "var(--text)",
    fontSize: "clamp(0.8rem, 1.5vw, 0.9rem)",
    outline: "none",
    boxSizing: "border-box",
    minHeight: "44px",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    marginBottom: "clamp(0.3rem, 1vw, 0.4rem)",
    fontSize: "clamp(0.65rem, 1vw, 0.72rem)",
    fontWeight: 600,
    letterSpacing: "0.09em",
    textTransform: "uppercase",
    color: "var(--text3)",
  };

  const goldDivider = (
    <div
      style={{
        height: "1px",
        background:
          "linear-gradient(to right, rgba(235,244,239,0.45), transparent)",
        margin: "clamp(0.8rem, 2vw, 1.2rem) 0",
      }}
    />
  );

  if (loading) {
    return (
      <main>
        <Navbar />
        <div
          style={{
            padding: "2rem",
            textAlign: "center",
            color: "var(--text3)",
          }}
        >
          Loading car details...
        </div>
      </main>
    );
  }

  if (!car || (error && !car)) {
    return (
      <main>
        <Navbar />
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <p style={{ color: "var(--text)" }}>Car not found</p>
          <Link href="/cars" style={{ color: "var(--text3)" }}>
            Back to Fleet
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main>
      <style>{`
        @media (min-width: 768px) {
          .booking-page-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 767px) {
          .car-details-section {
            order: 2;
          }
          .booking-form-section {
            order: 1;
          }
        }
        .cf-calendar {
          width: 100%;
          --rdp-accent-color: #a9d8cf;
          --rdp-day_button-border-radius: 6px;
          color: var(--text);
        }
        .cf-calendar-months {
          display: flex;
          justify-content: center;
        }
        .cf-calendar-month {
          width: 100%;
        }
        .cf-calendar-month-grid {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0.18rem;
        }
        .cf-calendar-caption {
          color: #cfe9e3;
          font-family: var(--font-dm-serif);
          font-size: 1.05rem;
          letter-spacing: 0;
          padding: 0.2rem 0 0.7rem;
        }
        .cf-calendar-nav {
          gap: 0.4rem;
        }
        .cf-calendar-nav-button {
          width: 34px;
          height: 34px;
          border: 1px solid rgba(235,244,239,0.28);
          border-radius: 6px;
          background: rgba(255,255,255,0.04);
          color: #cfe9e3;
          cursor: pointer;
        }
        .cf-calendar-nav-button:hover:not(:disabled) {
          background: rgba(235,244,239,0.16);
        }
        .cf-calendar-nav-button:disabled {
          cursor: not-allowed;
          opacity: 0.35;
        }
        .cf-calendar-weekday {
          color: rgba(207,233,227,0.72);
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding-bottom: 0.35rem;
        }
        .cf-calendar-day {
          width: 14.285%;
          height: 40px;
          text-align: center;
        }
        .cf-calendar-day-button {
          width: 100%;
          height: 40px;
          border: 1px solid transparent;
          border-radius: 6px;
          background: rgba(255,255,255,0.03);
          color: var(--text);
          cursor: pointer;
          font: inherit;
        }
        .cf-calendar-day-button:hover:not(:disabled) {
          border-color: rgba(235,244,239,0.45);
          background: rgba(235,244,239,0.12);
        }
        .cf-calendar-today .cf-calendar-day-button {
          border-color: rgba(207,233,227,0.52);
          color: #cfe9e3;
        }
        .cf-calendar-selected .cf-calendar-day-button,
        .cf-calendar-range-start .cf-calendar-day-button,
        .cf-calendar-range-end .cf-calendar-day-button {
          background: linear-gradient(135deg, #cfe9e3 0%, #a9d8cf 100%);
          color: #071414;
          font-weight: 800;
        }
        .cf-calendar-range-middle .cf-calendar-day-button {
          background: rgba(235,244,239,0.2);
          color: #cfe9e3;
        }
        .cf-calendar-booked .cf-calendar-day-button,
        .cf-calendar-disabled .cf-calendar-day-button {
          background: rgba(203,216,210,0.12);
          color: rgba(203,216,210,0.38);
          text-decoration: line-through;
          cursor: not-allowed;
        }
        .cf-calendar-booked .cf-calendar-day-button {
          border-color: rgba(203,216,210,0.14);
        }
        .cf-calendar-outside .cf-calendar-day-button {
          color: rgba(203,216,210,0.24);
        }
        @media (max-width: 520px) {
          .date-selection-summary {
            grid-template-columns: 1fr !important;
          }
          .cf-calendar-day,
          .cf-calendar-day-button {
            height: 36px;
          }
        }
      `}</style>
      <Navbar />

      <section
        style={{
          padding:
            "clamp(1.5rem, 4vw, 2rem) var(--padding-mobile) clamp(2.5rem, 8vw, 4rem)",
        }}
      >
        <Link
          href="/cars"
          style={{
            color: "var(--text3)",
            fontSize: "clamp(0.8rem, 1.5vw, 0.85rem)",
            display: "inline-block",
            textDecoration: "none",
            letterSpacing: "0.03em",
            marginBottom: "clamp(1rem, 2vw, 1.5rem)",
          }}
        >
          ← Back to Fleet
        </Link>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "clamp(1.5rem, 4vw, 2.5rem)",
            alignItems: "stretch",
          }}
          className="booking-page-grid"
        >
          <section
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "clamp(1rem, 2vw, 1.5rem)",
            }}
            className="car-details-section"
          >
            <div
              style={{
                position: "relative",
                width: "100%",
                paddingBottom: "58%",
                borderRadius: "12px",
                overflow: "hidden",
                background:
                  "radial-gradient(ellipse at center, #102324 0%, #071414 70%)",
                border: "1px solid rgba(235,244,239,0.35)",
                boxShadow:
                  "0 0 0 1px rgba(235,244,239,0.08), 0 8px 40px rgba(0,0,0,0.6)",
                flexShrink: 0,
              }}
            >
              <Image
                src={getCarImage()}
                alt={`${car.name} for rent in Bohol Philippines`}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: "contain", filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.5))" }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "30%",
                  background:
                    "linear-gradient(to top, rgba(17,9,0,0.65) 0%, transparent 100%)",
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "1rem",
                  left: "1rem",
                  background: "rgba(235,244,239,0.15)",
                  border: "1px solid rgba(235,244,239,0.4)",
                  borderRadius: "4px",
                  padding: "3px 10px",
                  fontSize: ".72rem",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  color: "#a9d8cf",
                  textTransform: "uppercase",
                }}
              >
                {car.type}
              </div>
            </div>

            <article
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                background:
                  "linear-gradient(135deg, rgba(235,244,239,.06) 0%, rgba(17,9,0,0.85) 100%)",
                padding: "1.8rem",
                borderRadius: "10px",
                border: "1px solid rgba(235,244,239,0.2)",
              }}
            >
              <h2
                style={{
                  fontFamily: "var(--font-dm-serif)",
                  fontSize: "1.8rem",
                  marginBottom: "0",
                  letterSpacing: "-0.01em",
                }}
              >
                {car.name}
              </h2>

              {goldDivider}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1.2rem",
                  marginBottom: "1.2rem",
                }}
              >
                {[
                  { label: "Type", value: TYPE_LABEL[car.type] ?? car.type },
                  { label: "Seats", value: `${car.seats} Seats` },
                  { label: "Transmission", value: car.transmission },
                  { label: "Color", value: car.color, isColor: true },
                ].map(({ label, value, isColor }) => (
                  <div key={label}>
                    <p
                      style={{
                        color: "var(--text3)",
                        fontSize: ".72rem",
                        marginBottom: ".3rem",
                        letterSpacing: "0.09em",
                        textTransform: "uppercase",
                      }}
                    >
                      {label}
                    </p>
                    {isColor ? (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: ".5rem",
                        }}
                      >
                        <span
                          style={{
                            width: "13px",
                            height: "13px",
                            borderRadius: "50%",
                            background: COLOR_DOT[value] ?? "#888",
                            border: "1px solid rgba(255,255,255,0.2)",
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            fontSize: ".9rem",
                            textTransform: "capitalize",
                          }}
                        >
                          {value}
                        </span>
                      </div>
                    ) : (
                      <p
                        style={{
                          fontSize: ".9rem",
                          textTransform: "capitalize",
                        }}
                      >
                        {value}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {goldDivider}

              <p
                style={{
                  color: "var(--text3)",
                  fontSize: ".9rem",
                  lineHeight: 1.75,
                  flex: 1,
                }}
              >
                {car.description}
              </p>

              <div
                style={{
                  marginTop: "1.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "rgba(235,244,239,0.08)",
                  border: "1px solid rgba(235,244,239,0.22)",
                  borderRadius: "8px",
                  padding: ".8rem 1.2rem",
                }}
              >
                <span
                  style={{
                    fontSize: ".8rem",
                    color: "var(--text3)",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  }}
                >
                  Rate per day
                </span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: ".3rem",
                  }}
                >
                  <span
                    style={{
                      fontSize: "1.6rem",
                      fontWeight: 700,
                      color: "#a9d8cf",
                    }}
                  >
                    {"\u20B1"}
                    {car.price_per_day.toLocaleString()}
                  </span>
                  <span style={{ fontSize: ".8rem", color: "var(--text3)" }}>
                    /day
                  </span>
                </div>
              </div>
            </article>
          </section>

          <section
            style={{ display: "flex", flexDirection: "column" }}
            className="booking-form-section"
            aria-labelledby="booking-form-title"
          >
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                background:
                  "linear-gradient(160deg, rgba(235,244,239,.07) 0%, rgba(17,9,0,0.92) 100%)",
                padding: "2rem",
                borderRadius: "10px",
                border: "1px solid rgba(235,244,239,0.2)",
                boxShadow: "0 4px 30px rgba(0,0,0,0.4)",
              }}
            >
              <header>
                <h1
                  id="booking-form-title"
                  style={{
                    fontFamily: "var(--font-dm-serif)",
                    fontSize: "1.5rem",
                    marginBottom: ".3rem",
                  }}
                >
                  Book Your Bohol Car Rental
                </h1>
                <p
                  style={{
                    color: "var(--text3)",
                    fontSize: ".85rem",
                    marginBottom: "0",
                  }}
                >
                  Fill in the details below to reserve this vehicle.
                </p>
              </header>

              {goldDivider}

              <form
                onSubmit={handleSubmit}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                  flex: 1,
                }}
              >
                {error && (
                  <div
                    style={{
                      padding: ".8rem 1rem",
                      background: "rgba(220,38,38,0.1)",
                      border: "1px solid rgba(220,38,38,0.3)",
                      borderRadius: "6px",
                      color: "#DC2626",
                      fontSize: ".9rem",
                    }}
                  >
                    {error}
                  </div>
                )}

                {/* ✅ NEW: Availability status display */}
                {(effectiveAvailabilityStatus === 'available' || effectiveAvailabilityStatus === 'unavailable') && (
                  <div
                    style={{
                      padding: ".8rem 1rem",
                      background: effectiveAvailabilityStatus === 'available'
                        ? "rgba(34,197,94,0.1)"
                        : "rgba(220,38,38,0.1)",
                      border: effectiveAvailabilityStatus === 'available'
                        ? "1px solid rgba(34,197,94,0.3)"
                        : "1px solid rgba(220,38,38,0.3)",
                      borderRadius: "6px",
                      color: effectiveAvailabilityStatus === 'available'
                        ? "#22C55E"
                        : "#DC2626",
                      fontSize: ".9rem",
                    }}
                  >
                    {effectiveAvailabilityStatus === "available" ? (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          borderRadius: "999px",
                          background: "rgba(34,197,94,0.14)",
                          border: "1px solid rgba(34,197,94,0.35)",
                          padding: "0.18rem 0.55rem",
                          color: "#4ade80",
                          fontSize: ".78rem",
                          fontWeight: 800,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                        }}
                      >
                        Available
                      </span>
                    ) : (
                      effectiveAvailabilityMessage || "Not available for selected dates"
                    )}
                  </div>
                )}

                {/* ✅ NEW: Loading state while checking */}
                {availabilityStatus === 'checking' && !selectedRangeOverlapsBooked && (
                  <div
                    style={{
                      padding: ".8rem 1rem",
                      background: "rgba(235,244,239,0.1)",
                      border: "1px solid rgba(235,244,239,0.3)",
                      borderRadius: "6px",
                      color: "#a9d8cf",
                      fontSize: ".9rem",
                    }}
                  >
                    Checking availability...
                  </div>
                )}

                {[
                  {
                    label: "Full Name",
                    name: "fullName",
                    type: "text",
                    placeholder: "Juan Dela Cruz",
                  },
                  {
                    label: "Email",
                    name: "email",
                    type: "email",
                    placeholder: "juan@example.com",
                  },
                  {
                    label: "Phone",
                    name: "phone",
                    type: "tel",
                    placeholder: "+63 912 345 6789",
                  },
                ].map(({ label, name, type, placeholder }) => (
                  <div key={name}>
                    <label htmlFor={name} style={labelStyle}>
                      {label} <span style={{ color: "#a9d8cf" }}>*</span>
                    </label>
                    <input
                      id={name}
                      type={type}
                      name={name}
                      value={formData[name as keyof typeof formData]}
                      onChange={handleChange}
                      required
                      placeholder={placeholder}
                      style={inputStyle}
                    />
                  </div>
                ))}

                <div>
                  <label id="booking-date-range-label" style={labelStyle}>
                    Rental Dates <span style={{ color: "#a9d8cf" }}>*</span>
                  </label>
                  <div
                    style={{
                      border: "1px solid rgba(235,244,239,0.2)",
                      borderRadius: "8px",
                      background: "rgba(255,255,255,0.03)",
                      padding: "clamp(0.65rem, 2vw, 1rem)",
                    }}
                  >
                    <DayPicker
                      mode="range"
                      selected={selectedCalendarRange}
                      onSelect={handleDateRangeSelect}
                      disabled={[{ before: today }, ...bookedCalendarMatchers]}
                      modifiers={{ booked: bookedCalendarMatchers }}
                      modifiersClassNames={{ booked: "cf-calendar-booked" }}
                      numberOfMonths={1}
                      showOutsideDays
                      aria-labelledby="booking-date-range-label"
                      classNames={{
                        ...defaultCalendarClassNames,
                        root: "cf-calendar",
                        months: "cf-calendar-months",
                        month: "cf-calendar-month",
                        month_grid: "cf-calendar-month-grid",
                        caption_label: "cf-calendar-caption",
                        nav: "cf-calendar-nav",
                        button_previous: "cf-calendar-nav-button",
                        button_next: "cf-calendar-nav-button",
                        weekday: "cf-calendar-weekday",
                        day: "cf-calendar-day",
                        day_button: "cf-calendar-day-button",
                        selected: "cf-calendar-selected",
                        range_start: "cf-calendar-range-start",
                        range_middle: "cf-calendar-range-middle",
                        range_end: "cf-calendar-range-end",
                        disabled: "cf-calendar-disabled",
                        outside: "cf-calendar-outside",
                        today: "cf-calendar-today",
                      }}
                    />
                    <div
                      className="date-selection-summary"
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "0.7rem",
                        marginTop: "0.85rem",
                      }}
                    >
                      <div>
                        <span style={labelStyle}>Pickup Date</span>
                        <div style={inputStyle}>
                          {formData.pickupDate || "Select start date"}
                        </div>
                      </div>
                      <div>
                        <span style={labelStyle}>Return Date</span>
                        <div style={inputStyle}>
                          {formData.returnDate || "Select return date"}
                        </div>
                      </div>
                    </div>
                    {bookedDateRanges.length > 0 && (
                      <p
                        style={{
                          color: "rgba(203,216,210,0.62)",
                          fontSize: ".74rem",
                          lineHeight: 1.5,
                          marginTop: "0.75rem",
                        }}
                      >
                        Gray dates are already reserved and cannot be selected.
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="pickupLocation" style={labelStyle}>
                    Pickup Location
                  </label>
                  <select
                    id="pickupLocation"
                    name="pickupLocation"
                    value={formData.pickupLocation}
                    onChange={handleChange}
                    style={inputStyle}
                  >
                    <option value="Dauis">Dauis, Bohol</option>
                    <option value="Panglao">Panglao, Bohol</option>
                    <option value="Tagbilaran">Tagbilaran, Bohol</option>
                  </select>
                </div>

                <div
                  style={{ flex: 1, display: "flex", flexDirection: "column" }}
                >
                  <label htmlFor="notes" style={labelStyle}>
                    Special Requests
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Any special requests? (optional)"
                    style={{
                      ...inputStyle,
                      flex: 1,
                      minHeight: "80px",
                      resize: "vertical",
                      fontFamily: "inherit",
                    }}
                  />
                </div>

                <div
                  style={{
                    background: "rgba(235,244,239,0.07)",
                    padding: "1rem 1.2rem",
                    borderRadius: "8px",
                    border: "1px solid rgba(235,244,239,0.2)",
                  }}
                >
                  <h3
                    style={{
                      fontSize: ".85rem",
                      color: "var(--text3)",
                      marginBottom: ".8rem",
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                    }}
                  >
                    Price Summary
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: ".85rem",
                      color: "var(--text3)",
                      marginBottom: ".4rem",
                    }}
                  >
                    <span>Daily Rate</span>
                    <span style={{ color: "var(--text)" }}>
                      {"\u20B1"}
                      {car.price_per_day.toLocaleString()}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: ".85rem",
                      color: "var(--text3)",
                      marginBottom: ".4rem",
                    }}
                  >
                    <span>Duration</span>
                    <span style={{ color: "var(--text)" }}>
                      {formData.pickupDate && formData.returnDate
                        ? `${days} day${days !== 1 ? "s" : ""}`
                        : "\u2014"}
                    </span>
                  </div>
                  {formData.pickupDate &&
                    formData.returnDate &&
                    formData.pickupDate === formData.returnDate && (
                      <div
                        style={{
                          fontSize: ".72rem",
                          color: "rgba(235,244,239,0.55)",
                          marginBottom: ".4rem",
                          letterSpacing: "0.03em",
                        }}
                      >
                        Same-day rental {"\u2014"} minimum 1 day applies
                      </div>
                    )}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      paddingTop: ".8rem",
                      borderTop: "1px solid rgba(235,244,239,0.2)",
                      fontWeight: 700,
                      fontSize: "1.05rem",
                    }}
                  >
                    <span>Total</span>
                    <span style={{ color: "#a9d8cf" }}>
                      {formData.pickupDate && formData.returnDate
                        ? `\u20B1${totalPrice.toLocaleString()}`
                        : "\u20B10"}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || availabilityStatus === 'checking' || availabilityStatus === 'unavailable' || selectedRangeOverlapsBooked || !isDateRangeComplete}
                  style={{
                    padding: "1rem",
                    background: (isLoading || availabilityStatus === 'checking' || availabilityStatus === 'unavailable' || selectedRangeOverlapsBooked || !isDateRangeComplete)
                      ? "rgba(235,244,239,0.3)"
                      : "linear-gradient(135deg, #cfe9e3 0%, #a9d8cf 100%)",
                    color: "#071414",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: ".95rem",
                    fontWeight: 700,
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                    cursor: (isLoading || availabilityStatus === 'checking' || availabilityStatus === 'unavailable' || selectedRangeOverlapsBooked || !isDateRangeComplete) ? "not-allowed" : "pointer",
                    transition: "all .2s",
                    opacity: (isLoading || availabilityStatus === 'checking' || availabilityStatus === 'unavailable' || selectedRangeOverlapsBooked || !isDateRangeComplete) ? 0.6 : 1,
                    boxShadow: (isLoading || availabilityStatus === 'checking' || availabilityStatus === 'unavailable' || selectedRangeOverlapsBooked || !isDateRangeComplete)
                      ? "none"
                      : "0 4px 20px rgba(235,244,239,0.3)",
                  }}
                  title={availabilityStatus === 'unavailable' || selectedRangeOverlapsBooked ? 'Vehicle not available for selected dates' : undefined}
                >
                  {isLoading ? "Processing..." : availabilityStatus === 'checking' ? "Checking Availability..." : availabilityStatus === 'unavailable' || selectedRangeOverlapsBooked ? "Not available for selected dates" : "Confirm Booking →"}
                </button>
              </form>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
