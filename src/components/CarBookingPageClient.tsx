"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase";
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
}

export default function CarBookingPageClient({
  carId,
}: CarBookingPageClientProps) {
  const router = useRouter();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
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
  const loadedCarIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (loadedCarIdRef.current === carId) {
      return;
    }

    loadedCarIdRef.current = carId;
    let isActive = true;

    const fetchCarData = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("cars")
          .select("*")
          .eq("id", carId)
          .single();

        if (error) {
          console.error("Car fetch error:", error);
          throw new Error(`Failed to fetch car: ${error.message}`);
        }

        if (!isActive) return;
        setCar(data as Car);
      } catch (error) {
        if (!isActive) return;
        console.error("Error loading car:", error);
        setError("Failed to load car details");
      } finally {
        if (!isActive) return;
        setLoading(false);
      }
    };

    fetchCarData();

    return () => {
      isActive = false;
    };
  }, [carId]);

  // ✅ NEW: Check vehicle availability when dates change
  useEffect(() => {
    if (!formData.pickupDate || !formData.returnDate || !carId) {
      return;
    }

    // Don't check if return date is before pickup date
    if (new Date(formData.returnDate) < new Date(formData.pickupDate)) {
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
  }, [formData.pickupDate, formData.returnDate, carId]);

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

  // â”€â”€ FIXED: same-day = 1 day, next-day = 1 day, then +1 per extra calendar day â”€â”€
  // Logic: days = max(1, returnDate âˆ’ pickupDate in calendar days)
  // Examples:
  //   May 11 â†’ May 11  : diff = 0  â†’ max(1, 0) = 1 day  âœ“
  //   May 11 â†’ May 12  : diff = 1  â†’ max(1, 1) = 1 day  âœ“
  //   May 11 â†’ May 13  : diff = 2  â†’ max(1, 2) = 2 days âœ“
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

      // â”€â”€ FIXED: allow same-day; only block return BEFORE pickup â”€â”€
      if (new Date(formData.returnDate) < new Date(formData.pickupDate))
        throw new Error("Return date cannot be before the pickup date");

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
    border: "1px solid rgba(212,168,67,0.2)",
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
          "linear-gradient(to right, rgba(212,168,67,0.45), transparent)",
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
                  "radial-gradient(ellipse at center, #2a1f0a 0%, #110900 70%)",
                border: "1px solid rgba(212,168,67,0.35)",
                boxShadow:
                  "0 0 0 1px rgba(212,168,67,0.08), 0 8px 40px rgba(0,0,0,0.6)",
                flexShrink: 0,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getCarImage()}
                alt={`${car.name} for rent in Bohol Philippines`}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "88%",
                  height: "88%",
                  objectFit: "contain",
                  filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.5))",
                }}
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
                  background: "rgba(212,168,67,0.15)",
                  border: "1px solid rgba(212,168,67,0.4)",
                  borderRadius: "4px",
                  padding: "3px 10px",
                  fontSize: ".72rem",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  color: "#D4A843",
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
                  "linear-gradient(135deg, rgba(255,215,80,.06) 0%, rgba(17,9,0,0.85) 100%)",
                padding: "1.8rem",
                borderRadius: "10px",
                border: "1px solid rgba(212,168,67,0.2)",
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
                  background: "rgba(212,168,67,0.08)",
                  border: "1px solid rgba(212,168,67,0.22)",
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
                      color: "#D4A843",
                    }}
                  >
                    â‚±{car.price_per_day.toLocaleString()}
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
                  "linear-gradient(160deg, rgba(255,215,80,.07) 0%, rgba(17,9,0,0.92) 100%)",
                padding: "2rem",
                borderRadius: "10px",
                border: "1px solid rgba(212,168,67,0.2)",
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
                {(availabilityStatus === 'available' || availabilityStatus === 'unavailable') && (
                  <div
                    style={{
                      padding: ".8rem 1rem",
                      background: availabilityStatus === 'available'
                        ? "rgba(34,197,94,0.1)"
                        : "rgba(220,38,38,0.1)",
                      border: availabilityStatus === 'available'
                        ? "1px solid rgba(34,197,94,0.3)"
                        : "1px solid rgba(220,38,38,0.3)",
                      borderRadius: "6px",
                      color: availabilityStatus === 'available'
                        ? "#22C55E"
                        : "#DC2626",
                      fontSize: ".9rem",
                    }}
                  >
                    {availabilityMessage}
                  </div>
                )}

                {/* ✅ NEW: Loading state while checking */}
                {availabilityStatus === 'checking' && (
                  <div
                    style={{
                      padding: ".8rem 1rem",
                      background: "rgba(212,168,67,0.1)",
                      border: "1px solid rgba(212,168,67,0.3)",
                      borderRadius: "6px",
                      color: "#D4A843",
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
                      {label} <span style={{ color: "#D4A843" }}>*</span>
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

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                  }}
                >
                  <div>
                    <label htmlFor="pickupDate" style={labelStyle}>
                      Pickup Date <span style={{ color: "#D4A843" }}>*</span>
                    </label>
                    <input
                      id="pickupDate"
                      type="date"
                      name="pickupDate"
                      value={formData.pickupDate}
                      onChange={handleChange}
                      required
                      min={new Date().toISOString().split("T")[0]}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label htmlFor="returnDate" style={labelStyle}>
                      Return Date <span style={{ color: "#D4A843" }}>*</span>
                    </label>
                    <input
                      id="returnDate"
                      type="date"
                      name="returnDate"
                      value={formData.returnDate}
                      onChange={handleChange}
                      required
                      // â”€â”€ FIXED: min = pickupDate so same day is selectable â”€â”€
                      min={
                        formData.pickupDate ||
                        new Date().toISOString().split("T")[0]
                      }
                      style={inputStyle}
                    />
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
                    background: "rgba(212,168,67,0.07)",
                    padding: "1rem 1.2rem",
                    borderRadius: "8px",
                    border: "1px solid rgba(212,168,67,0.2)",
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
                      â‚±{car.price_per_day.toLocaleString()}
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
                        : "â€”"}
                    </span>
                  </div>
                  {formData.pickupDate &&
                    formData.returnDate &&
                    formData.pickupDate === formData.returnDate && (
                      <div
                        style={{
                          fontSize: ".72rem",
                          color: "rgba(212,168,67,0.55)",
                          marginBottom: ".4rem",
                          letterSpacing: "0.03em",
                        }}
                      >
                        Same-day rental â€” minimum 1 day applies
                      </div>
                    )}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      paddingTop: ".8rem",
                      borderTop: "1px solid rgba(212,168,67,0.2)",
                      fontWeight: 700,
                      fontSize: "1.05rem",
                    }}
                  >
                    <span>Total</span>
                    <span style={{ color: "#D4A843" }}>
                      {formData.pickupDate && formData.returnDate
                        ? `â‚±${totalPrice.toLocaleString()}`
                        : "â‚±0"}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || availabilityStatus === 'checking' || availabilityStatus === 'unavailable'}
                  style={{
                    padding: "1rem",
                    background: (isLoading || availabilityStatus === 'checking' || availabilityStatus === 'unavailable')
                      ? "rgba(212,168,67,0.3)"
                      : "linear-gradient(135deg, #F0C96A 0%, #D4A843 100%)",
                    color: "#110900",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: ".95rem",
                    fontWeight: 700,
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                    cursor: (isLoading || availabilityStatus === 'checking' || availabilityStatus === 'unavailable') ? "not-allowed" : "pointer",
                    transition: "all .2s",
                    opacity: (isLoading || availabilityStatus === 'checking' || availabilityStatus === 'unavailable') ? 0.6 : 1,
                    boxShadow: (isLoading || availabilityStatus === 'checking' || availabilityStatus === 'unavailable')
                      ? "none"
                      : "0 4px 20px rgba(212,168,67,0.3)",
                  }}
                  title={availabilityStatus === 'unavailable' ? 'Vehicle not available for selected dates' : undefined}
                >
                  {isLoading ? "Processing..." : availabilityStatus === 'checking' ? "Checking Availability..." : availabilityStatus === 'unavailable' ? "Not available for selected dates" : "Confirm Booking →"}
                </button>
              </form>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
