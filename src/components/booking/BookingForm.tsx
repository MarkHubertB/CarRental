import React from 'react';
import {
  DayPicker,
  getDefaultClassNames,
  type DateRange,
  type Matcher,
} from 'react-day-picker';

interface BookingFormProps {
  formData: {
    pickupDate: string;
    returnDate: string;
    pickupLocation: string;
    fullName: string;
    email: string;
    phone: string;
    notes: string;
  };
  formDataUpdate: (name: string, value: any) => void;
  onDateRangeSelect: (range: DateRange | undefined) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  error: string | null;
  availabilityStatus: string;
  availabilityMessage: string;
  selectedRangeOverlapsBooked: boolean;
  isDateRangeComplete: boolean;
  bookedDateRanges: { from: string; to: string; source: string }[];
  today: Date;
}

export default function BookingForm({
  formData,
  formDataUpdate,
  onDateRangeSelect,
  onSubmit,
  isLoading,
  error,
  availabilityStatus,
  availabilityMessage,
  selectedRangeOverlapsBooked,
  isDateRangeComplete,
  bookedDateRanges,
  today,
}: BookingFormProps) {
  const defaultCalendarClassNames = React.useMemo(() => getDefaultClassNames(), []);
  
  const bookedCalendarRanges = React.useMemo(
    () =>
      bookedDateRanges.map((range) => ({
        from: new Date(range.from),
        to: new Date(range.to),
        source: range.source,
      })),
    [bookedDateRanges],
  );

  const bookedCalendarMatchers = React.useMemo<Matcher[]>(
    () => bookedCalendarRanges.map(({ from, to }) => ({ from, to })),
    [bookedCalendarRanges],
  );

  const selectedCalendarRange = React.useMemo<DateRange | undefined>(() => {
    if (!formData.pickupDate) return undefined;
    const [y, m, d] = formData.pickupDate.split("-").map(Number);
    const from = new Date(y, m - 1, d);
    let to;
    if (formData.returnDate) {
      const [ry, rm, rd] = formData.returnDate.split("-").map(Number);
      to = new Date(ry, rm - 1, rd);
    }
    return { from, to };
  }, [formData.pickupDate, formData.returnDate]);

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

  return (
    <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem", flex: 1 }}>
      {error && (
        <div style={{ padding: ".8rem 1rem", background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)", borderRadius: "6px", color: "#DC2626", fontSize: ".9rem" }}>
          {error}
        </div>
      )}

      {(availabilityStatus === 'available' || availabilityStatus === 'unavailable') && (
        <div style={{ padding: ".8rem 1rem", background: availabilityStatus === 'available' ? "rgba(34,197,94,0.1)" : "rgba(220,38,38,0.1)", border: availabilityStatus === 'available' ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(220,38,38,0.3)", borderRadius: "6px", color: availabilityStatus === 'available' ? "#22C55E" : "#DC2626", fontSize: ".9rem" }}>
          {availabilityStatus === "available" ? (
            <span style={{ display: "inline-flex", alignItems: "center", borderRadius: "999px", background: "rgba(34,197,94,0.14)", border: "1px solid rgba(34,197,94,0.35)", padding: "0.18rem 0.55rem", color: "#4ade80", fontSize: ".78rem", fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Available
            </span>
          ) : (
            availabilityMessage || "Not available for selected dates"
          )}
        </div>
      )}

      {availabilityStatus === 'checking' && !selectedRangeOverlapsBooked && (
        <div style={{ padding: ".8rem 1rem", background: "rgba(212,168,67,0.1)", border: "1px solid rgba(212,168,67,0.3)", borderRadius: "6px", color: "#D4A843", fontSize: ".9rem" }}>
          Checking Availability...
        </div>
      )}

      {[
        { label: "Full Name", name: "fullName", type: "text", placeholder: "Juan Dela Cruz" },
        { label: "Email", name: "email", type: "email", placeholder: "juan@example.com" },
        { label: "Phone", name: "phone", type: "tel", placeholder: "+63 912 345 6789" },
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
            onChange={(e) => formDataUpdate(name, e.target.value)}
            required
            placeholder={placeholder}
            style={inputStyle}
          />
        </div>
      ))}

      <div>
        <label id="booking-date-range-label" style={labelStyle}>
          Rental Dates <span style={{ color: "#D4A843" }}>*</span>
        </label>
        <div style={{ border: "1px solid rgba(212,168,67,0.2)", borderRadius: "8px", background: "rgba(255,255,255,0.03)", padding: "clamp(0.65rem, 2vw, 1rem)" }}>
          <DayPicker
            mode="range"
            selected={selectedCalendarRange}
            onSelect={onDateRangeSelect}
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
          <div className="date-selection-summary" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.7rem", marginTop: "0.85rem" }}>
            <div>
              <span style={labelStyle}>Pickup Date</span>
              <div style={inputStyle}>{formData.pickupDate || "Select start date"}</div>
            </div>
            <div>
              <span style={labelStyle}>Return Date</span>
              <div style={inputStyle}>{formData.returnDate || "Select return date"}</div>
            </div>
          </div>
          {bookedDateRanges.length > 0 && (
            <p style={{ color: "rgba(207,199,186,0.62)", fontSize: ".74rem", lineHeight: 1.5, marginTop: "0.75rem" }}>
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
          onChange={(e) => formDataUpdate("pickupLocation", e.target.value)}
          style={inputStyle}
        >
          <option value="Dauis">Dauis, Bohol</option>
          <option value="Panglao">Panglao, Bohol</option>
          <option value="Tagbilaran">Tagbilaran, Bohol</option>
        </select>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <label htmlFor="notes" style={labelStyle}>
          Special Requests
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={(e) => formDataUpdate("notes", e.target.value)}
          placeholder="Any special requests? (optional)"
          style={{ ...inputStyle, flex: 1, minHeight: "80px", resize: "vertical", fontFamily: "inherit" }}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading || availabilityStatus === 'checking' || availabilityStatus === 'unavailable' || selectedRangeOverlapsBooked || !isDateRangeComplete}
        style={{
          padding: "1rem",
          background: (isLoading || availabilityStatus === 'checking' || availabilityStatus === 'unavailable' || selectedRangeOverlapsBooked || !isDateRangeComplete)
            ? "rgba(212,168,67,0.3)"
            : "linear-gradient(135deg, #F0C96A 0%, #D4A843 100%)",
          color: "#110900",
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
            : "0 4px 20px rgba(212,168,67,0.3)",
        }}
        title={availabilityStatus === 'unavailable' || selectedRangeOverlapsBooked ? 'Vehicle not available for selected dates' : undefined}
      >
        {isLoading ? "Processing..." : availabilityStatus === 'checking' ? "Checking Availability..." : availabilityStatus === 'unavailable' || selectedRangeOverlapsBooked ? "Not available for selected dates" : "Confirm Booking →"}
      </button>
    </form>
  );
}
