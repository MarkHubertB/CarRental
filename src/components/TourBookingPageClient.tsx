'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  DayPicker,
  getDefaultClassNames,
  type Matcher,
} from 'react-day-picker'
import { Bus, Car, CarFront, type LucideIcon } from 'lucide-react'
import Navbar from '@/components/Navbar'
import {
  formatDateOnly,
  parseDateOnly,
} from '@/lib/bookingAvailability'
import { TOUR_PACKAGES } from '@/lib/tours'

interface TourBookingPageClientProps {
  slug: string
}

const vehiclePreferenceOptions: Array<{
  value: string
  label: string
  Icon: LucideIcon
}> = [
  { value: 'No preference', label: 'Any', Icon: Car },
  { value: 'Sedan', label: 'Sedan', Icon: CarFront },
  { value: 'SUV', label: 'SUV', Icon: Car },
  { value: 'Van', label: 'Van', Icon: Bus },
]

function startOfToday() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

export default function TourBookingPageClient({ slug }: TourBookingPageClientProps) {
  const tour = TOUR_PACKAGES.find((item) => item.slug === slug) ?? null
  const [formData, setFormData] = useState({
    fullName: '',
    contactNumber: '',
    email: '',
    travelDate: '',
    numPassengers: '',
    packageName: tour?.name ?? '',
    pickupLocation: '',
    vehiclePreference: 'No preference',
    specialRequests: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [unavailableDates, setUnavailableDates] = useState<string[]>([])
  const [allDatesUnavailable, setAllDatesUnavailable] = useState(false)
  const [availabilityLoading, setAvailabilityLoading] = useState(false)
  const [availabilityError, setAvailabilityError] = useState<string | null>(null)

  const today = useMemo(() => startOfToday(), [])
  const defaultCalendarClassNames = useMemo(() => getDefaultClassNames(), [])
  const selectedTravelDate = useMemo(
    () => (formData.travelDate ? parseDateOnly(formData.travelDate) : undefined),
    [formData.travelDate],
  )
  const unavailableDateMatchers = useMemo<Matcher[]>(
    () => unavailableDates.map((date) => parseDateOnly(date)),
    [unavailableDates],
  )
  const allFutureDatesMatcher = useMemo<Matcher>(
    () => (date) => date >= today,
    [today],
  )
  const bookedCalendarMatchers = useMemo<Matcher[]>(
    () =>
      allDatesUnavailable
        ? [allFutureDatesMatcher]
        : unavailableDateMatchers,
    [allDatesUnavailable, allFutureDatesMatcher, unavailableDateMatchers],
  )
  const disabledCalendarMatchers = useMemo<Matcher[]>(
    () => [{ before: today }, ...bookedCalendarMatchers],
    [bookedCalendarMatchers, today],
  )
  const selectedTravelDateUnavailable = useMemo(() => {
    if (!formData.travelDate) return false

    return allDatesUnavailable || unavailableDates.includes(formData.travelDate)
  }, [allDatesUnavailable, formData.travelDate, unavailableDates])
  const submitDisabled =
    isLoading ||
    availabilityLoading ||
    Boolean(availabilityError) ||
    selectedTravelDateUnavailable ||
    !formData.travelDate

  useEffect(() => {
    fetch('/api/bookings/cleanup', { method: 'POST' }).catch((err) =>
      console.error('Expired booking cleanup failed:', err),
    )
  }, [])

  useEffect(() => {
    let cancelled = false

    const fetchAvailability = async () => {
      setAvailabilityLoading(true)
      setAvailabilityError(null)

      try {
        const params = new URLSearchParams({
          vehiclePreference: formData.vehiclePreference,
        })
        const response = await fetch(
          `/api/bookings/tour-availability?${params.toString()}`,
        )
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch tour availability')
        }

        if (cancelled) return

        setUnavailableDates(
          Array.isArray(data.unavailableDates) ? data.unavailableDates : [],
        )
        setAllDatesUnavailable(Boolean(data.allUnavailable))
      } catch (err) {
        if (cancelled) return

        console.error('Tour availability fetch failed:', err)
        setUnavailableDates([])
        setAllDatesUnavailable(false)
        setAvailabilityError('Could not load availability')
      } finally {
        if (!cancelled) {
          setAvailabilityLoading(false)
        }
      }
    }

    fetchAvailability()

    return () => {
      cancelled = true
    }
  }, [formData.vehiclePreference])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleTravelDateSelect = (date: Date | undefined) => {
    setFormData((prev) => ({
      ...prev,
      travelDate: date ? formatDateOnly(date) : '',
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tour) return

    setError(null)
    setSuccess(null)
    setIsLoading(true)

    try {
      if (
        !formData.fullName.trim() ||
        !formData.contactNumber.trim() ||
        !formData.travelDate ||
        !formData.numPassengers ||
        !formData.pickupLocation.trim()
      ) {
        throw new Error('Please fill in all required fields')
      }

      if (!selectedTravelDate || selectedTravelDate < today) {
        throw new Error('Please select a valid travel date')
      }

      if (availabilityError) {
        throw new Error('Please wait for availability to load')
      }

      if (selectedTravelDateUnavailable) {
        throw new Error('Selected travel date is unavailable')
      }

      const response = await fetch('/api/bookings/tours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.fullName.trim(),
          contact_number: formData.contactNumber.trim(),
          email: formData.email.trim() || null,
          travel_date: formData.travelDate,
          package_name: tour.name,
          num_passengers: Number(formData.numPassengers),
          pickup_location: formData.pickupLocation.trim(),
          vehicle_type:
            formData.vehiclePreference === 'No preference'
              ? null
              : formData.vehiclePreference,
          special_requests: formData.specialRequests.trim() || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create tour booking')
      }

      setSuccess('Your tour booking has been sent. We will contact you soon.')
      setFormData({
        fullName: '',
        contactNumber: '',
        email: '',
        travelDate: '',
        numPassengers: '',
        packageName: tour.name,
        pickupLocation: '',
        vehiclePreference: 'No preference',
        specialRequests: '',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '.75rem 1rem',
    border: '1px solid rgba(235,244,239,0.2)',
    borderRadius: '6px',
    background: 'rgba(255,255,255,0.03)',
    color: 'var(--text)',
    fontSize: '.9rem',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '.4rem',
    fontSize: '.72rem',
    fontWeight: 600,
    letterSpacing: '0.09em',
    textTransform: 'uppercase',
    color: 'var(--text3)',
  }

  const goldDivider = (
    <div
      style={{
        height: '1px',
        background: 'linear-gradient(to right, rgba(235,244,239,0.45), transparent)',
        margin: '1.2rem 0',
      }}
    />
  )

  if (!tour) {
    return (
      <main>
        <Navbar />
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text)' }}>Tour package not found</p>
          <Link href="/tours" style={{ color: 'var(--text3)' }}>
            Back to Tours
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main>
      <style>{`
        @media (max-width: 900px) {
          .tour-booking-grid { grid-template-columns: 1fr !important; }
          .tour-detail-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 700px) {
          .tour-detail-grid { grid-template-columns: 1fr !important; }
          .tour-form-grid { grid-template-columns: 1fr !important; }
          .vehicle-preference-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
        }
        @media (max-width: 380px) {
          .vehicle-preference-grid { grid-template-columns: 1fr !important; }
        }
        .vehicle-preference-button:hover {
          border-color: rgba(207,233,227,0.48) !important;
          color: #cfe9e3 !important;
        }
        .vehicle-preference-button:focus-visible {
          outline: 2px solid rgba(207,233,227,0.58);
          outline-offset: 2px;
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
        .cf-calendar-selected .cf-calendar-day-button {
          background: linear-gradient(135deg, #cfe9e3 0%, #a9d8cf 100%);
          color: #071414;
          font-weight: 800;
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
          .cf-calendar-day,
          .cf-calendar-day-button {
            height: 36px;
          }
        }
      `}</style>
      <Navbar />

      <section style={{ padding: '2rem 3.5rem 4rem' }}>
        <Link
          href="/tours"
          style={{
            color: 'var(--text3)',
            fontSize: '.85rem',
            display: 'inline-block',
            textDecoration: 'none',
            letterSpacing: '0.03em',
            marginBottom: '1.5rem',
          }}
        >
          ← Back to Tours
        </Link>

        <div
          className="tour-booking-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '2.5rem',
            alignItems: 'stretch',
          }}
        >
          <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div
              style={{
                position: 'relative',
                width: '100%',
                paddingBottom: '58%',
                borderRadius: '12px',
                overflow: 'hidden',
                background: 'radial-gradient(ellipse at center, #102324 0%, #071414 70%)',
                border: '1px solid rgba(235,244,239,0.35)',
                boxShadow: '0 0 0 1px rgba(235,244,239,0.08), 0 8px 40px rgba(0,0,0,0.6)',
                flexShrink: 0,
              }}
            >
              <Image
                src={tour.image}
                alt={`${tour.name} tour in Bohol`}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: 'cover' }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'linear-gradient(to top, rgba(17,9,0,0.65) 0%, transparent 100%)',
                  pointerEvents: 'none',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '1rem',
                  left: '1rem',
                  background: 'rgba(235,244,239,0.15)',
                  border: '1px solid rgba(235,244,239,0.4)',
                  borderRadius: '4px',
                  padding: '3px 10px',
                  fontSize: '.72rem',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  color: '#a9d8cf',
                  textTransform: 'uppercase',
                }}
              >
                {tour.badge}
              </div>
            </div>

            <article
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                background: 'linear-gradient(135deg, rgba(235,244,239,.06) 0%, rgba(17,9,0,0.85) 100%)',
                padding: '1.8rem',
                borderRadius: '10px',
                border: '1px solid rgba(235,244,239,0.2)',
              }}
            >
              <h2
                style={{
                  fontFamily: 'var(--font-dm-serif)',
                  fontSize: '1.8rem',
                  marginBottom: '0',
                  letterSpacing: '-0.01em',
                }}
              >
                {tour.name}
              </h2>

              {goldDivider}

              <div
                  className="tour-detail-grid"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1.2rem',
                    marginBottom: '1.2rem',
                }}
              >
                {[
                  { label: 'Duration', value: tour.bookingDuration },
                  { label: 'Passengers', value: tour.passengers },
                  { label: 'Vehicle', value: tour.vehicle },
                  { label: 'Pickup', value: tour.pickup },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p
                      style={{
                        color: 'var(--text3)',
                        fontSize: '.72rem',
                        marginBottom: '.3rem',
                        letterSpacing: '0.09em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {label}
                    </p>
                    <p style={{ fontSize: '.9rem', textTransform: 'capitalize' }}>{value}</p>
                  </div>
                ))}
              </div>

              {goldDivider}

              <p style={{ color: 'var(--text3)', fontSize: '.9rem', lineHeight: 1.75, flex: 1 }}>
                {tour.description}
              </p>
              <p
                style={{
                  color: 'var(--text3)',
                  fontSize: '.82rem',
                  lineHeight: 1.7,
                  marginTop: '1rem',
                }}
              >
                <strong
                  style={{
                    display: 'block',
                    color: 'var(--text2)',
                    letterSpacing: '0.09em',
                    textTransform: 'uppercase',
                    fontSize: '.68rem',
                    marginBottom: '.35rem',
                  }}
                >
                  {tour.stopsLabel}
                </strong>
                {tour.stops.join(' · ')}
              </p>

              {tour.note && (
                <p
                  style={{
                    color: 'var(--text3)',
                    fontSize: '.82rem',
                    lineHeight: 1.7,
                    marginTop: '.8rem',
                    paddingLeft: '.9rem',
                    borderLeft: '1px solid rgba(235,244,239,0.18)',
                  }}
                >
                  <strong
                    style={{
                      display: 'block',
                      color: 'var(--text2)',
                      letterSpacing: '0.09em',
                      textTransform: 'uppercase',
                      fontSize: '.68rem',
                      marginBottom: '.35rem',
                    }}
                  >
                    Note
                  </strong>
                  {tour.note}
                </p>
              )}

              <div
                style={{
                  marginTop: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(235,244,239,0.08)',
                  border: '1px solid rgba(235,244,239,0.22)',
                  borderRadius: '8px',
                  padding: '.8rem 1.2rem',
                }}
              >
                <span
                  style={{
                    fontSize: '.8rem',
                    color: 'var(--text3)',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}
                >
                  Starting at
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '.3rem' }}>
                  <span style={{ fontSize: '1.6rem', fontWeight: 700, color: '#a9d8cf' }}>
                    {tour.priceSummary}
                  </span>
                </div>
              </div>
            </article>
          </section>

          <section style={{ display: 'flex', flexDirection: 'column' }} aria-labelledby="booking-form-title">
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                background: 'linear-gradient(160deg, rgba(235,244,239,.07) 0%, rgba(17,9,0,0.92) 100%)',
                padding: '2rem',
                borderRadius: '10px',
                border: '1px solid rgba(235,244,239,0.2)',
                boxShadow: '0 4px 30px rgba(0,0,0,0.4)',
              }}
            >
              <header>
                <h1
                  id="booking-form-title"
                  style={{ fontFamily: 'var(--font-dm-serif)', fontSize: '1.5rem', marginBottom: '.3rem' }}
                >
                  Book Your Bohol Tour
                </h1>
                <p style={{ color: 'var(--text3)', fontSize: '.85rem', marginBottom: '0' }}>
                  Fill in the details below to reserve this tour.
                </p>
              </header>

              {goldDivider}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                {error && (
                  <div
                    style={{
                      padding: '.8rem 1rem',
                      background: 'rgba(220,38,38,0.1)',
                      border: '1px solid rgba(220,38,38,0.3)',
                      borderRadius: '6px',
                      color: '#DC2626',
                      fontSize: '.9rem',
                    }}
                  >
                    {error}
                  </div>
                )}

                {success && (
                  <div
                    style={{
                      padding: '.8rem 1rem',
                      background: 'rgba(34,197,94,0.1)',
                      border: '1px solid rgba(34,197,94,0.3)',
                      borderRadius: '6px',
                      color: '#4ade80',
                      fontSize: '.9rem',
                    }}
                  >
                    {success}
                  </div>
                )}

                {[
                  { label: 'Full Name', name: 'fullName', type: 'text', placeholder: 'Juan Dela Cruz' },
                  { label: 'Email', name: 'email', type: 'email', placeholder: 'juan@example.com' },
                  { label: 'Phone', name: 'contactNumber', type: 'tel', placeholder: '+63 912 345 6789' },
                ].map(({ label, name, type, placeholder }) => (
                  <div key={name}>
                    <label htmlFor={name} style={labelStyle}>
                      {label} <span style={{ color: '#a9d8cf' }}>*</span>
                    </label>
                    <input
                      id={name}
                      type={type}
                      name={name}
                      value={formData[name as keyof typeof formData]}
                      onChange={handleChange}
                      required={name !== 'email'}
                      placeholder={placeholder}
                      style={inputStyle}
                    />
                  </div>
                ))}

                <div className="tour-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label id="tour-travel-date-label" style={labelStyle}>
                      Travel Date <span style={{ color: '#a9d8cf' }}>*</span>
                    </label>
                    <div
                      style={{
                        border: '1px solid rgba(235,244,239,0.2)',
                        borderRadius: '8px',
                        background: 'rgba(255,255,255,0.03)',
                        padding: 'clamp(0.65rem, 2vw, 1rem)',
                      }}
                    >
                      <DayPicker
                        mode="single"
                        selected={selectedTravelDate}
                        onSelect={handleTravelDateSelect}
                        disabled={disabledCalendarMatchers}
                        modifiers={{ booked: bookedCalendarMatchers }}
                        modifiersClassNames={{ booked: 'cf-calendar-booked' }}
                        numberOfMonths={1}
                        showOutsideDays
                        aria-labelledby="tour-travel-date-label"
                        classNames={{
                          ...defaultCalendarClassNames,
                          root: 'cf-calendar',
                          months: 'cf-calendar-months',
                          month: 'cf-calendar-month',
                          month_grid: 'cf-calendar-month-grid',
                          caption_label: 'cf-calendar-caption',
                          nav: 'cf-calendar-nav',
                          button_previous: 'cf-calendar-nav-button',
                          button_next: 'cf-calendar-nav-button',
                          weekday: 'cf-calendar-weekday',
                          day: 'cf-calendar-day',
                          day_button: 'cf-calendar-day-button',
                          selected: 'cf-calendar-selected',
                          disabled: 'cf-calendar-disabled',
                          outside: 'cf-calendar-outside',
                          today: 'cf-calendar-today',
                        }}
                      />
                      <div style={{ marginTop: '.85rem' }}>
                        <span style={labelStyle}>Selected Date</span>
                        <div style={inputStyle}>
                          {formData.travelDate || 'Select a date'}
                        </div>
                      </div>
                      {availabilityLoading && (
                        <p
                          style={{
                            color: '#a9d8cf',
                            fontSize: '.78rem',
                            lineHeight: 1.5,
                            marginTop: '.75rem',
                          }}
                        >
                          Checking availability...
                        </p>
                      )}
                      {!availabilityLoading && selectedTravelDateUnavailable && (
                        <p
                          style={{
                            color: '#f87171',
                            fontSize: '.78rem',
                            lineHeight: 1.5,
                            marginTop: '.75rem',
                          }}
                        >
                          Selected date is fully booked for this vehicle preference.
                        </p>
                      )}
                      {availabilityError && (
                        <p
                          style={{
                            color: '#f87171',
                            fontSize: '.78rem',
                            lineHeight: 1.5,
                            marginTop: '.75rem',
                          }}
                        >
                          {availabilityError}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="numPassengers" style={labelStyle}>
                      Number of Passengers <span style={{ color: '#a9d8cf' }}>*</span>
                    </label>
                    <input
                      id="numPassengers"
                      type="number"
                      name="numPassengers"
                      value={formData.numPassengers}
                      onChange={handleChange}
                      required
                      min={1}
                      placeholder="1"
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="packageName" style={labelStyle}>
                    Package <span style={{ color: '#a9d8cf' }}>*</span>
                  </label>
                  <select
                    id="packageName"
                    name="packageName"
                    value={formData.packageName}
                    disabled
                    style={inputStyle}
                  >
                    <option value={tour.name}>{tour.name}</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="pickupLocation" style={labelStyle}>
                    Pickup Location <span style={{ color: '#a9d8cf' }}>*</span>
                  </label>
                  <input
                    id="pickupLocation"
                    type="text"
                    name="pickupLocation"
                    value={formData.pickupLocation}
                    onChange={handleChange}
                    required
                    placeholder="Hotel, resort, airport, pier, or address"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label id="vehiclePreferenceLabel" style={labelStyle}>
                    Vehicle Preference
                  </label>
                  <div
                    className="vehicle-preference-grid"
                    role="radiogroup"
                    aria-labelledby="vehiclePreferenceLabel"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                      gap: '.55rem',
                    }}
                  >
                    {vehiclePreferenceOptions.map(({ value, label, Icon }) => {
                      const selected = formData.vehiclePreference === value

                      return (
                        <button
                          key={value}
                          type="button"
                          className="vehicle-preference-button"
                          role="radio"
                          aria-checked={selected}
                          title={value}
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              vehiclePreference: value,
                            }))
                          }
                          style={{
                            minHeight: '44px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '.42rem',
                            padding: '.62rem .55rem',
                            borderRadius: '6px',
                            border: selected
                              ? '1px solid rgba(207,233,227,0.72)'
                              : '1px solid rgba(235,244,239,0.2)',
                            background: selected
                              ? 'linear-gradient(135deg, rgba(207,233,227,0.18) 0%, rgba(235,244,239,0.11) 100%)'
                              : 'rgba(255,255,255,0.03)',
                            color: selected ? '#cfe9e3' : 'var(--text3)',
                            fontSize: '.76rem',
                            fontWeight: 700,
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase',
                            cursor: 'pointer',
                            transition:
                              'border-color .2s, color .2s, background .2s, box-shadow .2s',
                            boxShadow: selected
                              ? 'inset 0 0 0 1px rgba(207,233,227,0.1), 0 0 18px rgba(235,244,239,0.12)'
                              : 'none',
                          }}
                        >
                          <Icon aria-hidden="true" size={16} strokeWidth={1.8} />
                          <span style={{ whiteSpace: 'nowrap' }}>{label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <label htmlFor="specialRequests" style={labelStyle}>
                    Special Requests
                  </label>
                  <textarea
                    id="specialRequests"
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleChange}
                    placeholder="Any special requests? (optional)"
                    style={{ ...inputStyle, flex: 1, minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' }}
                  />
                </div>

                <div
                  style={{
                    background: 'rgba(235,244,239,0.07)',
                    padding: '1rem 1.2rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(235,244,239,0.2)',
                  }}
                >
                  <h3
                    style={{
                      fontSize: '.85rem',
                      color: 'var(--text3)',
                      marginBottom: '.8rem',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Price Summary
                  </h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.85rem', color: 'var(--text3)', marginBottom: '.4rem' }}>
                    <span>Tour Rate</span>
                    <span style={{ color: 'var(--text)' }}>{tour.priceSummary}</span>
                  </div>
                  <div style={{ fontSize: '.72rem', color: 'rgba(235,244,239,0.55)', marginBottom: '.4rem', letterSpacing: '0.03em' }}>
                    Final price may vary based on group size and vehicle
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      paddingTop: '.8rem',
                      borderTop: '1px solid rgba(235,244,239,0.2)',
                      fontWeight: 700,
                      fontSize: '1.05rem',
                    }}
                  >
                    <span>Total</span>
                    <span style={{ color: '#a9d8cf' }}>{tour.priceSummary}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitDisabled}
                  style={{
                    padding: '1rem',
                    background: submitDisabled
                      ? 'rgba(235,244,239,0.3)'
                      : 'linear-gradient(135deg, #cfe9e3 0%, #a9d8cf 100%)',
                    color: '#071414',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '.95rem',
                    fontWeight: 700,
                    letterSpacing: '0.07em',
                    textTransform: 'uppercase',
                    cursor: submitDisabled ? 'not-allowed' : 'pointer',
                    transition: 'all .2s',
                    opacity: submitDisabled ? 0.6 : 1,
                    boxShadow: submitDisabled ? 'none' : '0 4px 20px rgba(235,244,239,0.3)',
                  }}
                >
                  {isLoading
                    ? 'Processing...'
                    : availabilityLoading
                      ? 'Checking Availability...'
                      : availabilityError
                        ? 'Availability unavailable'
                      : selectedTravelDateUnavailable
                        ? 'Date unavailable'
                        : `${tour.actionLabel ?? 'Confirm Booking'} →`}
                </button>
              </form>
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}
