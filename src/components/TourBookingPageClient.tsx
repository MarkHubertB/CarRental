'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase'
import { TOUR_PACKAGES } from '@/lib/tours'

interface TourBookingPageClientProps {
  slug: string
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
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

      const supabase = createClient()
      const { error: insertError } = await supabase.from('tour_bookings').insert({
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
        status: 'pending',
      })

      if (insertError) {
        throw new Error(insertError.message || 'Failed to create tour booking')
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
    border: '1px solid rgba(212,168,67,0.2)',
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
        background: 'linear-gradient(to right, rgba(212,168,67,0.45), transparent)',
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
                background: 'radial-gradient(ellipse at center, #2a1f0a 0%, #110900 70%)',
                border: '1px solid rgba(212,168,67,0.35)',
                boxShadow: '0 0 0 1px rgba(212,168,67,0.08), 0 8px 40px rgba(0,0,0,0.6)',
                flexShrink: 0,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={tour.image}
                alt={`${tour.name} tour in Bohol`}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
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
                  background: 'rgba(212,168,67,0.15)',
                  border: '1px solid rgba(212,168,67,0.4)',
                  borderRadius: '4px',
                  padding: '3px 10px',
                  fontSize: '.72rem',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  color: '#D4A843',
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
                background: 'linear-gradient(135deg, rgba(255,215,80,.06) 0%, rgba(17,9,0,0.85) 100%)',
                padding: '1.8rem',
                borderRadius: '10px',
                border: '1px solid rgba(212,168,67,0.2)',
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
                    borderLeft: '1px solid rgba(212,168,67,0.18)',
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
                  background: 'rgba(212,168,67,0.08)',
                  border: '1px solid rgba(212,168,67,0.22)',
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
                  <span style={{ fontSize: '1.6rem', fontWeight: 700, color: '#D4A843' }}>
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
                background: 'linear-gradient(160deg, rgba(255,215,80,.07) 0%, rgba(17,9,0,0.92) 100%)',
                padding: '2rem',
                borderRadius: '10px',
                border: '1px solid rgba(212,168,67,0.2)',
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
                      {label} <span style={{ color: '#D4A843' }}>*</span>
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
                  <div>
                    <label htmlFor="travelDate" style={labelStyle}>
                      Travel Date <span style={{ color: '#D4A843' }}>*</span>
                    </label>
                    <input
                      id="travelDate"
                      type="date"
                      name="travelDate"
                      value={formData.travelDate}
                      onChange={handleChange}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label htmlFor="numPassengers" style={labelStyle}>
                      Number of Passengers <span style={{ color: '#D4A843' }}>*</span>
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
                    Package <span style={{ color: '#D4A843' }}>*</span>
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
                    Pickup Location <span style={{ color: '#D4A843' }}>*</span>
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
                  <label htmlFor="vehiclePreference" style={labelStyle}>
                    Vehicle Preference
                  </label>
                  <select
                    id="vehiclePreference"
                    name="vehiclePreference"
                    value={formData.vehiclePreference}
                    onChange={handleChange}
                    style={inputStyle}
                  >
                    <option value="No preference">No preference</option>
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Van">Van</option>
                  </select>
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
                    background: 'rgba(212,168,67,0.07)',
                    padding: '1rem 1.2rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(212,168,67,0.2)',
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
                  <div style={{ fontSize: '.72rem', color: 'rgba(212,168,67,0.55)', marginBottom: '.4rem', letterSpacing: '0.03em' }}>
                    Final price may vary based on group size and vehicle
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      paddingTop: '.8rem',
                      borderTop: '1px solid rgba(212,168,67,0.2)',
                      fontWeight: 700,
                      fontSize: '1.05rem',
                    }}
                  >
                    <span>Total</span>
                    <span style={{ color: '#D4A843' }}>{tour.priceSummary}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    padding: '1rem',
                    background: isLoading
                      ? 'rgba(212,168,67,0.3)'
                      : 'linear-gradient(135deg, #F0C96A 0%, #D4A843 100%)',
                    color: '#110900',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '.95rem',
                    fontWeight: 700,
                    letterSpacing: '0.07em',
                    textTransform: 'uppercase',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    transition: 'all .2s',
                    opacity: isLoading ? 0.6 : 1,
                    boxShadow: isLoading ? 'none' : '0 4px 20px rgba(212,168,67,0.3)',
                  }}
                >
                  {isLoading
                    ? 'Processing...'
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
