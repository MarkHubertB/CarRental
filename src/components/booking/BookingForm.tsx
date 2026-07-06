import React, { useState } from 'react';
import { DayPicker, type DateRange } from 'react-day-picker';
import { PREMIUM_OPTIONS } from '@/lib/booking-options';

interface BookingFormData {
  pickupDate: string;
  returnDate: string;
  pickupLocation: string;
  fullName: string;
  email: string;
  phone: string;
  notes: string;
}

interface BookingFormProps {
  formData: BookingFormData;
  formDataUpdate: (name: keyof BookingFormData, value: string) => void;
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
  selectedOptions: string[];
  toggleOption: (optionId: string) => void;
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
  selectedOptions,
  toggleOption,
}: BookingFormProps) {
  const [step, setStep] = useState(1);

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

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
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(e); }} className="flex flex-col gap-6">
      {/* Step Indicator */}
      <div className="flex justify-between items-center mb-8 px-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
              step === s ? "bg-gold text-black scale-125 shadow-[0_0_15px_rgba(212,168,67,0.5)]" : 
              step > s ? "bg-white/20 text-white" : "bg-white/5 text-zinc-500 border border-white/10"
            }`}>
              {step > s ? "✓" : s}
            </div>
            {s < 3 && <div className={`h-px flex-1 w-12 ${step > s ? "bg-gold" : "bg-white/10"}`} />}
          </div>
        ))}
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs">
          {error}
        </div>
      )}

      {/* STEP 1: DATES & AVAILABILITY */}
      {step === 1 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label id="booking-date-range-label" style={labelStyle}>Rental Dates <span style={{ color: "#D4A843" }}>*</span></label>
              <span className="text-[10px] text-gold uppercase tracking-widest font-bold">{availabilityStatus}</span>
            </div>
            
            <div className="border border-white/10 rounded-xl bg-white/5 p-4">
              <DayPicker
                mode="range"
                selected={formData.pickupDate ? { 
                  from: new Date(formData.pickupDate), 
                  to: formData.returnDate ? new Date(formData.returnDate) : undefined 
                } : undefined}
                onSelect={onDateRangeSelect}
                disabled={[{ before: today }, ...bookedDateRanges.map(r => ({ from: new Date(r.from), to: new Date(r.to) }))]}
                modifiers={{ booked: bookedDateRanges.map(r => ({ from: new Date(r.from), to: new Date(r.to) })) }}
                modifiersClassNames={{ booked: "cf-calendar-booked" }}
                numberOfMonths={1}
                showOutsideDays
                aria-labelledby="booking-date-range-label"
                classNames={{
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
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                  <span className="text-[10px] text-zinc-500 uppercase block mb-1">Pickup</span>
                  <span className="text-xs text-white font-medium">{formData.pickupDate || "Select date"}</span>
                </div>
                <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                  <span className="text-[10px] text-zinc-500 uppercase block mb-1">Return</span>
                  <span className="text-xs text-white font-medium">{formData.returnDate || "Select date"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="pickupLocation" style={labelStyle}>Pickup Location</label>
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

          <button 
            type="button" 
            onClick={nextStep}
            disabled={!isDateRangeComplete || selectedRangeOverlapsBooked}
            className="w-full py-4 bg-gold text-black font-bold rounded-xl uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:bg-gold-light"
          >
            Continue to Options →
          </button>
        </div>
      )}

      {/* STEP 2: PREMIUM OPTIONS */}
      {step === 2 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="text-center mb-6">
            <h3 className="text-white font-serif text-xl mb-2">Elevate Your Experience</h3>
            <p className="text-zinc-500 text-xs">Select premium add-ons for your journey</p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {PREMIUM_OPTIONS.map(option => (
              <div 
                key={option.id} 
                onClick={() => toggleOption(option.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${
                  selectedOptions.includes(option.id) 
                    ? "bg-gold/10 border-gold text-white" 
                    : "bg-white/5 border-white/10 text-zinc-400 hover:border-white/20"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-colors ${
                  selectedOptions.includes(option.id) ? "bg-gold text-black" : "bg-white/5 text-zinc-500"
                }`}>
                  {option.icon}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-bold">{option.name}</span>
                    <span className="text-xs font-serif text-gold">₱{option.pricePerDay}/day</span>
                  </div>
                  <p className="text-[11px] opacity-60">{option.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={prevStep} className="flex-1 py-4 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all">
              Back
            </button>
            <button type="button" onClick={nextStep} className="flex-[2] py-4 bg-gold text-black font-bold rounded-xl uppercase tracking-widest hover:bg-gold-light transition-all">
              Personal Details →
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: PERSONAL DETAILS */}
      {step === 3 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="text-center mb-6">
            <h3 className="text-white font-serif text-xl mb-2">Guest Information</h3>
            <p className="text-zinc-500 text-xs">Please provide your details for the reservation</p>
          </div>

          <div className="space-y-4">
            <div className="form-group">
              <label style={labelStyle}>Full Name</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => formDataUpdate("fullName", e.target.value)}
                placeholder="Juan Dela Cruz"
                style={inputStyle}
                required
              />
            </div>
            <div className="form-group">
              <label style={labelStyle}>Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => formDataUpdate("email", e.target.value)}
                placeholder="juan@example.com"
                style={inputStyle}
                required
              />
            </div>
            <div className="form-group">
              <label style={labelStyle}>Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => formDataUpdate("phone", e.target.value)}
                placeholder="+63 912 345 6789"
                style={inputStyle}
                required
              />
            </div>
            <div className="form-group">
              <label style={labelStyle}>Special Requests</label>
              <textarea
                value={formData.notes}
                onChange={(e) => formDataUpdate("notes", e.target.value)}
                placeholder="Any specific requirements? (optional)"
                style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={prevStep} className="flex-1 py-4 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all">
              Back
            </button>
            <button 
              type="submit" 
              disabled={isLoading}
              className="flex-[2] py-4 bg-gold text-black font-bold rounded-xl uppercase tracking-widest hover:bg-gold-light transition-all disabled:opacity-50"
            >
              {isLoading ? "Processing..." : "Confirm Booking →"}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
