import React from 'react';
import { PREMIUM_OPTIONS } from '@/lib/booking-options';

interface PriceSummaryProps {
  dailyRate: number;
  days: number;
  pickupDate?: string;
  returnDate?: string;
  selectedOptions: string[];
}

export default function PriceSummary({
  dailyRate,
  days,
  pickupDate,
  returnDate,
  selectedOptions,
}: PriceSummaryProps) {
  const basePrice = days * dailyRate;
  const optionsTotal = selectedOptions.reduce((acc, id) => {
    const option = PREMIUM_OPTIONS.find(o => o.id === id);
    return acc + (option?.pricePerDay ?? 0) * days;
  }, 0);
  const totalPrice = basePrice + optionsTotal;
// ...

  return (
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
          {"\u20B1"}
          {dailyRate.toLocaleString()}
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
          {pickupDate && returnDate
            ? `${days} day${days !== 1 ? "s" : ""}`
            : "\u2014"}
        </span>
      </div>
      {selectedOptions.map(id => {
        const option = PREMIUM_OPTIONS.find(o => o.id === id);
        return (
          <div key={id} style={{ display: "flex", justifyContent: "space-between", fontSize: ".85rem", color: "var(--text3)", marginBottom: ".4rem" }}>
            <span>{option?.name}</span>
            <span style={{ color: "var(--text)" }}>
              {"\u20B1"}
              {(option?.pricePerDay ?? 0 * days).toLocaleString()}
            </span>
          </div>
        );
      })}
      {pickupDate &&
        returnDate &&
        pickupDate === returnDate && (
          <div
            style={{
              fontSize: ".72rem",
              color: "rgba(212,168,67,0.55)",
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
          borderTop: "1px solid rgba(212,168,67,0.2)",
          fontWeight: 700,
          fontSize: "1.05rem",
        }}
      >
        <span>Total</span>
        <span style={{ color: "#D4A843" }}>
          {pickupDate && returnDate
            ? `\u20B1${totalPrice.toLocaleString()}`
            : "\u20B10"}
        </span>
      </div>
    </div>
  );
}
