"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { DateRange } from "react-day-picker";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import type { Car } from "@/types";
import { useCarAvailability } from "@/hooks/useCarAvailability";
import CarDetailsView from "@/components/booking/CarDetailsView";
import BookingForm from "@/components/booking/BookingForm";
import PriceSummary from "@/components/booking/PriceSummary";
import { PREMIUM_OPTIONS } from "@/lib/booking-options";

interface CarBookingPageClientProps {
  carId: string;
  initialCar: Car;
  bookedDateRanges: { from: string; to: string; source: string }[];
}

export default function CarBookingPageClient({
  carId,
  initialCar,
  bookedDateRanges,
}: CarBookingPageClientProps) {
  const router = useRouter();
  const [car] = useState<Car | null>(initialCar);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    pickupDate: "",
    returnDate: "",
    pickupLocation: "Dauis",
    fullName: "",
    email: "",
    phone: "",
    notes: "",
  });

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const {
    status: availabilityStatus,
    message: availabilityMessage,
    selectedRangeOverlapsBooked,
  } = useCarAvailability({
    carId,
    pickupDate: formData.pickupDate,
    returnDate: formData.returnDate,
    bookedDateRanges,
  });

  const handleFormDataUpdate = (name: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateRangeSelect = (range: DateRange | undefined) => {
    const pickupDate = range?.from ? range.from.toISOString().split('T')[0] : "";
    const returnDate = range?.to ? range.to.toISOString().split('T')[0] : "";
    setFormData((prev) => ({ ...prev, pickupDate, returnDate }));
  };

  const calculateDays = (): number => {
    if (!formData.pickupDate || !formData.returnDate) return 0;
    const pickup = new Date(formData.pickupDate);
    const ret = new Date(formData.returnDate);
    const diffDays = Math.round((ret.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays);
  };

  const days = calculateDays();
  const isDateRangeComplete = !!(formData.pickupDate && formData.returnDate);
  const basePrice = days * (car?.price_per_day ?? 0);
  
  const optionsTotal = selectedOptions.reduce((acc, optionId) => {
    const option = PREMIUM_OPTIONS.find(o => o.id === optionId);
    return acc + (option?.pricePerDay ?? 0) * days;
  }, 0);

  const totalPrice = basePrice + optionsTotal;

  useEffect(() => {
    fetch("/api/bookings/cleanup", { method: "POST" }).catch((err) =>
      console.error("Expired booking cleanup failed:", err),
    );
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      if (!formData.pickupDate || !formData.returnDate)
        throw new Error("Please select pickup and return dates");

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
          total_price: totalPrice,
          status: "pending",
          options: selectedOptions,
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

  if (!car || (error && !car)) {
    return (
      <main>
        <Navbar />
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <p style={{ color: "var(--text)" }}>Car not found</p>
          <Link href="/cars" style={{ color: "var(--text3)" }}>Back to Fleet</Link>
        </div>
      </main>
    );
  }

  return (
    <main>
      <style>{`
        @media (min-width: 768px) { .booking-page-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 767px) { .car-details-section { order: 2; } .booking-form-section { order: 1; } }
        .cf-calendar { width: 100%; --rdp-accent-color: #D4A843; --rdp-day_button-border-radius: 6px; color: var(--text); }
        .cf-calendar-months { display: flex; justify-content: center; }
        .cf-calendar-month { width: 100%; }
        .cf-calendar-month-grid { width: 100%; border-collapse: separate; border-spacing: 0.18rem; }
        .cf-calendar-caption { color: #F0C96A; font-family: var(--font-dm-serif); font-size: 1.05rem; letter-spacing: 0; padding: 0.2rem 0 0.7rem; }
        .cf-calendar-nav { gap: 0.4rem; }
        .cf-calendar-nav-button { width: 34px; height: 34px; border: 1px solid rgba(212,168,67,0.28); border-radius: 6px; background: rgba(255,255,255,0.04); color: #F0C96A; cursor: pointer; }
        .cf-calendar-nav-button:hover:not(:disabled) { background: rgba(212,168,67,0.16); }
        .cf-calendar-nav-button:disabled { cursor: not-allowed; opacity: 0.35; }
        .cf-calendar-weekday { color: rgba(240,201,106,0.72); font-size: 0.7rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding-bottom: 0.35rem; }
        .cf-calendar-day { width: 14.285%; height: 40px; text-align: center; }
        .cf-calendar-day-button { width: 100%; height: 40px; border: 1px solid transparent; border-radius: 6px; background: rgba(255,255,255,0.03); color: var(--text); cursor: pointer; font: inherit; }
        .cf-calendar-day-button:hover:not(:disabled) { border-color: rgba(212,168,67,0.45); background: rgba(212,168,67,0.12); }
        .cf-calendar-today .cf-calendar-day-button { border-color: rgba(240,201,106,0.52); color: #F0C96A; }
        .cf-calendar-selected .cf-calendar-day-button, .cf-calendar-range-start .cf-calendar-day-button, .cf-calendar-range-end .cf-calendar-day-button { background: linear-gradient(135deg, #F0C96A 0%, #D4A843 100%); color: #110900; font-weight: 800; }
        .cf-calendar-range-middle .cf-calendar-day-button { background: rgba(212,168,67,0.2); color: #F8E2A0; }
        .cf-calendar-booked .cf-calendar-day-button, .cf-calendar-disabled .cf-calendar-day-button { background: rgba(148,139,126,0.12); color: rgba(207,199,186,0.38); text-decoration: line-through; cursor: not-allowed; }
        .cf-calendar-booked .cf-calendar-day-button { border-color: rgba(207,199,186,0.14); }
        .cf-calendar-outside .cf-calendar-day-button { color: rgba(207,199,186,0.24); }
        @media (max-width: 520px) { .date-selection-summary { grid-template-columns: 1fr !important; } .cf-calendar-day, .cf-calendar-day-button { height: 36px; } }
      `}</style>
      <Navbar />

      <section
        style={{
          padding: "clamp(1.5rem, 4vw, 2rem) var(--padding-mobile) clamp(2.5rem, 8vw, 4rem)",
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
            <CarDetailsView car={car} />
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
                background: "linear-gradient(160deg, rgba(255,215,80,.07) 0%, rgba(17,9,0,0.92) 100%)",
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

              <div
                style={{
                  height: "1px",
                  background: "linear-gradient(to right, rgba(212,168,67,0.45), transparent)",
                  margin: "clamp(0.8rem, 2vw, 1.2rem) 0",
                }}
              />

              <BookingForm
                formData={formData}
                formDataUpdate={handleFormDataUpdate}
                onDateRangeSelect={handleDateRangeSelect}
                onSubmit={handleSubmit}
                isLoading={isLoading}
                error={error}
                availabilityStatus={availabilityStatus}
                availabilityMessage={availabilityMessage}
                selectedRangeOverlapsBooked={selectedRangeOverlapsBooked}
                isDateRangeComplete={isDateRangeComplete}
                bookedDateRanges={bookedDateRanges}
                today={today}
                selectedOptions={selectedOptions}
                toggleOption={(id) => setSelectedOptions(prev => 
                  prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
                )}
              />

              <PriceSummary 
                dailyRate={car.price_per_day} 
                days={days} 
                pickupDate={formData.pickupDate} 
                returnDate={formData.returnDate}
                selectedOptions={selectedOptions}
              />
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
