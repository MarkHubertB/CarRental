'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Car = {
  id: string
  name: string
  brand: string
  model: string
  year: number
  type: string
}

type Booking = {
  id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  car_id: string
  cars: Car | null          // joined from Supabase select('*, cars(...)')
  pickup_date: string
  return_date: string
  pickup_location: string
  total_price: number
  status: string
  notes?: string
  created_at: string
}

/* ── Derive display name from joined car row ── */
const getCarName = (b: Booking): string =>
  b.cars?.name ?? b.car_id ?? '—'

/* ── Status colour tokens — matched to site's palette ── */
const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  pending:   { bg: 'rgba(212,168,67,0.12)',  text: '#D4A843', border: 'rgba(212,168,67,0.35)' },
  confirmed: { bg: 'rgba(34,197,94,0.10)',   text: '#4ade80', border: 'rgba(34,197,94,0.30)'  },
  cancelled: { bg: 'rgba(239,68,68,0.10)',   text: '#f87171', border: 'rgba(239,68,68,0.30)'  },
  completed: { bg: 'rgba(240,201,106,0.10)', text: '#F0C96A', border: 'rgba(240,201,106,0.30)'},
}

/* ── Shared input/select style ── */
const selectStyle: React.CSSProperties = {
  background:    'rgba(255,200,60,0.04)',
  border:        '1px solid rgba(212,168,67,0.22)',
  borderRadius:  '6px',
  padding:       '0.45rem 0.8rem',
  color:         '#C9A870',
  fontSize:      '0.78rem',
  cursor:        'pointer',
  outline:       'none',
  letterSpacing: '0.04em',
  fontFamily:    'var(--font-dm-sans), sans-serif',
  colorScheme:   'dark',
  transition:    'border-color 0.2s',
}

export default function AdminDashboard() {
  const [bookings,        setBookings]        = useState<Booking[]>([])
  const [filtered,        setFiltered]        = useState<Booking[]>([])
  const [loading,         setLoading]         = useState(true)
  const [error,           setError]           = useState('')
  const [filterStatus,    setFilterStatus]    = useState('all')
  const [filterCar,       setFilterCar]       = useState('all')
  const [filterDate,      setFilterDate]      = useState('')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [updatingId,      setUpdatingId]      = useState<string | null>(null)
  const [deletingId,      setDeletingId]      = useState<string | null>(null)
  const [confirmDelete,   setConfirmDelete]   = useState<string | null>(null)
  const [toast,           setToast]           = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const router = useRouter()

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/bookings')
      if (res.status === 401) { router.push('/admin'); return }
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch bookings')
      setBookings(data)
      setFiltered(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => { fetchBookings() }, [fetchBookings])

  useEffect(() => {
    let result = [...bookings]
    if (filterStatus !== 'all') result = result.filter(b => b.status === filterStatus)
    if (filterCar    !== 'all') result = result.filter(b => b.car_id  === filterCar)
    if (filterDate)              result = result.filter(b =>
      b.pickup_date?.startsWith(filterDate) || b.return_date?.startsWith(filterDate)
    )
    setFiltered(result)
  }, [filterStatus, filterCar, filterDate, bookings])

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    setUpdatingId(id)
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error('Update failed')
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b))
      if (selectedBooking?.id === id)
        setSelectedBooking(prev => prev ? { ...prev, status: newStatus } : prev)
      showToast(`Status updated to "${newStatus}"`)
    } catch {
      showToast('Failed to update status', 'error')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      setBookings(prev => prev.filter(b => b.id !== id))
      if (selectedBooking?.id === id) setSelectedBooking(null)
      setConfirmDelete(null)
      showToast('Booking deleted')
    } catch {
      showToast('Failed to delete booking', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin')
  }

  const formatDate = (d: string) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })
  }
  const formatPrice = (p: number) => `₱${Number(p || 0).toLocaleString('en-PH')}`

  const stats = {
    total:     bookings.length,
    pending:   bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    revenue:   bookings
      .filter(b => b.status !== 'cancelled')
      .reduce((s, b) => s + (b.total_price || 0), 0),
  }

  return (
    <div style={{
      minHeight:  '100vh',
      background: `
        radial-gradient(ellipse 75% 55% at 65% 10%, rgba(180,130,30,0.20) 0%, transparent 55%),
        radial-gradient(ellipse 55% 50% at 10% 80%, rgba(140,90,10,0.14) 0%, transparent 52%),
        radial-gradient(ellipse 40% 35% at 85% 75%, rgba(100,65,5,0.10) 0%, transparent 50%),
        linear-gradient(170deg, #1C1408 0%, #100B02 35%, #090601 65%, #0E0900 100%)
      `,
      fontFamily: 'var(--font-dm-sans), sans-serif',
      color:      '#F5EDDA',
    }}>

      {/* ── Grid overlay — identical to hero ── */}
      <div style={{
        position:        'fixed',
        inset:           0,
        pointerEvents:   'none',
        backgroundImage: `
          linear-gradient(rgba(212,168,67,0.045) 1px, transparent 1px),
          linear-gradient(90deg, rgba(212,168,67,0.045) 1px, transparent 1px)
        `,
        backgroundSize: '58px 58px',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)',
        maskImage:       'linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)',
        zIndex:          0,
      }} />

      {/* ── Gloss sweep — identical to hero-gloss ── */}
      <div style={{
        position:      'fixed',
        inset:         0,
        background:    'linear-gradient(125deg, rgba(255,225,100,0.07) 0%, rgba(255,200,80,0.03) 22%, transparent 48%, rgba(0,0,0,0.10) 100%)',
        pointerEvents: 'none',
        zIndex:        0,
      }} />

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position:       'fixed',
          top:            '1.5rem',
          right:          '1.5rem',
          zIndex:         9999,
          background:     toast.type === 'success'
            ? 'rgba(212,168,67,0.12)'
            : 'rgba(239,68,68,0.12)',
          border:         `1px solid ${toast.type === 'success'
            ? 'rgba(212,168,67,0.40)'
            : 'rgba(239,68,68,0.40)'}`,
          borderRadius:   '6px',
          padding:        '0.75rem 1.25rem',
          color:          toast.type === 'success' ? '#F0C96A' : '#f87171',
          fontSize:       '0.82rem',
          letterSpacing:  '0.06em',
          backdropFilter: 'blur(12px)',
          boxShadow:      toast.type === 'success'
            ? '0 0 20px rgba(212,168,67,0.15)'
            : '0 0 20px rgba(239,68,68,0.15)',
        }}>
          {toast.msg}
        </div>
      )}

      {/* ══════════════════════════════════════
          HEADER — matches site .nav exactly
      ══════════════════════════════════════ */}
      <header style={{
        position:       'sticky',
        top:            0,
        zIndex:         100,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        padding:        '0 3.5rem',
        height:         '64px',
        background:     'rgba(14,9,0,0.92)',
        borderBottom:   '1px solid rgba(212,168,67,0.09)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}>
        {/* Logo — mirrors .nav-logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width:      '36px',
            height:     '36px',
            borderRadius: '7px',
            background: 'linear-gradient(135deg, #F0C96A 0%, #B8882A 100%)',
            color:      '#110900',
            fontFamily: 'var(--font-bebas)',
            fontSize:   '1rem',
            letterSpacing: '0.04em',
            display:    'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow:  '0 0 14px rgba(212,168,67,0.4), inset 0 1px 0 rgba(255,245,180,0.5)',
            flexShrink: 0,
          }}>
            ◈
          </div>
          <div>
            <strong style={{
              display:       'block',
              fontFamily:    'var(--font-bebas)',
              fontSize:      '0.95rem',
              letterSpacing: '0.08em',
              color:         '#F0C96A',
              lineHeight:    1.15,
            }}>
              Admin Dashboard
            </strong>
            <span style={{
              display:       'block',
              fontSize:      '0.58rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color:         '#7A6030',
            }}>
              Car Rental Management
            </span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {/* Refresh — ghost-btn style */}
          <button
            onClick={fetchBookings}
            style={{
              display:        'inline-flex',
              alignItems:     'center',
              gap:            '0.4rem',
              padding:        '0.55rem 1.25rem',
              borderRadius:   '6px',
              fontSize:       '0.72rem',
              fontWeight:     500,
              letterSpacing:  '0.12em',
              textTransform:  'uppercase',
              background:     'transparent',
              color:          '#F0C96A',
              border:         '1px solid rgba(212,168,67,0.35)',
              cursor:         'pointer',
              fontFamily:     'var(--font-dm-sans), sans-serif',
              transition:     'all 0.2s ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background     = 'rgba(212,168,67,0.08)'
              ;(e.currentTarget as HTMLElement).style.borderColor   = 'rgba(212,168,67,0.6)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background     = 'transparent'
              ;(e.currentTarget as HTMLElement).style.borderColor   = 'rgba(212,168,67,0.35)'
            }}
          >
            ↻ Refresh
          </button>

          {/* Sign Out — danger variant */}
          <button
            onClick={handleLogout}
            style={{
              display:        'inline-flex',
              alignItems:     'center',
              gap:            '0.4rem',
              padding:        '0.55rem 1.25rem',
              borderRadius:   '6px',
              fontSize:       '0.72rem',
              fontWeight:     700,
              letterSpacing:  '0.12em',
              textTransform:  'uppercase',
              background:     'rgba(239,68,68,0.10)',
              color:          '#f87171',
              border:         '1px solid rgba(239,68,68,0.30)',
              cursor:         'pointer',
              fontFamily:     'var(--font-dm-sans), sans-serif',
              transition:     'all 0.2s ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background   = 'rgba(239,68,68,0.18)'
              ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,68,68,0.55)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background   = 'rgba(239,68,68,0.10)'
              ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,68,68,0.30)'
            }}
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* ══════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════ */}
      <main style={{
        position:  'relative',
        zIndex:    1,
        padding:   '2.5rem 3.5rem 4rem',
        maxWidth:  '1500px',
        margin:    '0 auto',
      }}>

        {/* ── STAT CARDS ── */}
        <div style={{
          display:               'grid',
          gridTemplateColumns:   'repeat(auto-fit, minmax(200px, 1fr))',
          gap:                   '1.25rem',
          marginBottom:          '2.25rem',
        }}>
          {[
            { label: 'Total Bookings', value: stats.total,              accent: '#F0C96A',  num: true  },
            { label: 'Pending',        value: stats.pending,            accent: '#D4A843',  num: true  },
            { label: 'Confirmed',      value: stats.confirmed,          accent: '#4ade80',  num: true  },
            { label: 'Total Revenue',  value: formatPrice(stats.revenue), accent: '#F0C96A', num: false },
          ].map(s => (
            <div
              key={s.label}
              style={{
                borderRadius: '10px',
                overflow:     'hidden',
                position:     'relative',
                background:   'linear-gradient(155deg, rgba(255,210,80,0.07) 0%, rgba(26,18,5,0.92) 45%, rgba(10,7,1,0.98) 100%)',
                border:       '1px solid rgba(212,168,67,0.18)',
                padding:      '1.4rem 1.6rem 1.3rem',
                transition:   'transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.transform   = 'translateY(-4px)'
                el.style.borderColor = 'rgba(212,168,67,0.45)'
                el.style.boxShadow   = '0 16px 40px rgba(0,0,0,0.5), 0 0 20px rgba(212,168,67,0.09)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.transform   = 'translateY(0)'
                el.style.borderColor = 'rgba(212,168,67,0.18)'
                el.style.boxShadow   = 'none'
              }}
            >
              {/* Top shimmer line */}
              <div style={{
                position:   'absolute',
                top: 0, left: 0, right: 0,
                height:     '1px',
                background: 'linear-gradient(90deg, transparent, rgba(255,220,100,0.28), transparent)',
              }} />
              {/* Corner glow */}
              <div style={{
                position:      'absolute',
                top: 0, left: 0,
                width:         '80px',
                height:        '80px',
                background:    'radial-gradient(circle at top left, rgba(212,168,67,0.09), transparent 70%)',
                pointerEvents: 'none',
              }} />

              <div style={{
                fontSize:      '0.60rem',
                letterSpacing: '0.20em',
                textTransform: 'uppercase',
                color:         '#7A6030',
                marginBottom:  '0.65rem',
                fontWeight:    600,
              }}>
                {s.label}
              </div>
              <div style={{
                fontFamily: s.num ? 'var(--font-bebas)' : 'var(--font-dm-serif)',
                fontSize:   s.num ? '3rem' : '2rem',
                fontWeight: s.num ? 400 : 400,
                letterSpacing: s.num ? '0.04em' : '0',
                lineHeight: 1,
                background: `linear-gradient(135deg, ${s.accent} 0%, ${s.accent}aa 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor:  'transparent',
                backgroundClip:       'text',
                filter:               `drop-shadow(0 0 14px ${s.accent}55)`,
              }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* ── FILTER BAR ── */}
        <div style={{
          display:      'flex',
          flexWrap:     'wrap',
          gap:          '0.75rem',
          marginBottom: '1.5rem',
          alignItems:   'center',
          background:   'linear-gradient(160deg, rgba(255,215,80,0.05) 0%, rgba(35,25,7,0.85) 55%, rgba(18,12,3,0.90) 100%)',
          border:       '1px solid rgba(212,168,67,0.20)',
          borderRadius: '10px',
          padding:      '1rem 1.5rem',
          boxShadow:    'inset 0 1px 0 rgba(255,220,100,0.07)',
        }}>
          <span style={{
            fontSize:      '0.60rem',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color:         '#D4A843',
            fontWeight:    600,
          }}>
            Filter:
          </span>

          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={selectStyle}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>

          <select value={filterCar} onChange={e => setFilterCar(e.target.value)} style={selectStyle}>
            <option value="all">All Cars</option>
            {/* Build unique car options from live joined data */}
            {Array.from(
              new Map(bookings.filter(b => b.cars).map(b => [b.car_id, b.cars!.name])).entries()
            ).map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>

          <input
            type="date"
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
            style={{ ...selectStyle, colorScheme: 'dark' }}
          />

          {(filterStatus !== 'all' || filterCar !== 'all' || filterDate) && (
            <button
              onClick={() => { setFilterStatus('all'); setFilterCar('all'); setFilterDate('') }}
              style={{
                background:    'transparent',
                border:        '1px solid rgba(212,168,67,0.20)',
                borderRadius:  '6px',
                padding:       '0.45rem 0.9rem',
                color:         '#7A6030',
                fontSize:      '0.72rem',
                cursor:        'pointer',
                letterSpacing: '0.08em',
                fontFamily:    'var(--font-dm-sans), sans-serif',
                transition:    'all 0.2s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.color       = '#D4A843'
                ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,168,67,0.4)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.color       = '#7A6030'
                ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,168,67,0.20)'
              }}
            >
              ✕ Clear
            </button>
          )}

          <span style={{ marginLeft: 'auto', color: '#7A6030', fontSize: '0.72rem', letterSpacing: '0.06em' }}>
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* ── ERROR ── */}
        {error && (
          <div style={{
            background:   'rgba(239,68,68,0.08)',
            border:       '1px solid rgba(239,68,68,0.25)',
            borderRadius: '8px',
            padding:      '1rem 1.25rem',
            color:        '#f87171',
            fontSize:     '0.85rem',
            marginBottom: '1.5rem',
          }}>
            {error}
          </div>
        )}

        {/* ── TABLE + DETAIL PANEL ── */}
        <div style={{
          display:               'grid',
          gridTemplateColumns:   selectedBooking ? '1fr 390px' : '1fr',
          gap:                   '1.5rem',
          alignItems:            'start',
        }}>

          {/* TABLE */}
          <div style={{
            borderRadius: '10px',
            overflow:     'hidden',
            position:     'relative',
            background:   'linear-gradient(155deg, rgba(255,210,80,0.05) 0%, rgba(22,14,4,0.90) 50%, rgba(10,7,1,0.98) 100%)',
            border:       '1px solid rgba(212,168,67,0.18)',
            boxShadow:    '0 8px 40px rgba(0,0,0,0.45)',
          }}>
            {/* Top shimmer */}
            <div style={{
              position:   'absolute',
              top: 0, left: 0, right: 0,
              height:     '1px',
              background: 'linear-gradient(90deg, transparent, rgba(255,220,100,0.25), transparent)',
            }} />

            {loading ? (
              <div style={{
                padding:       '5rem',
                textAlign:     'center',
                color:         'rgba(212,168,67,0.35)',
                letterSpacing: '0.25em',
                fontSize:      '0.75rem',
                fontFamily:    'var(--font-bebas)',
              }}>
                Loading Bookings…
              </div>
            ) : filtered.length === 0 ? (
              <div style={{
                padding:       '5rem',
                textAlign:     'center',
                color:         'rgba(212,168,67,0.30)',
                letterSpacing: '0.20em',
                fontSize:      '0.75rem',
                fontFamily:    'var(--font-bebas)',
              }}>
                No Bookings Found
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{
                      borderBottom: '1px solid rgba(212,168,67,0.15)',
                      background:   'linear-gradient(180deg, rgba(26,18,5,0.98) 0%, rgba(18,12,3,0.95) 100%)',
                    }}>
                      {['Customer', 'Car', 'Pickup', 'Return', 'Price', 'Status', 'Actions'].map(h => (
                        <th key={h} style={{
                          padding:       '1rem 1.1rem',
                          textAlign:     'left',
                          color:         '#7A6030',
                          fontSize:      '0.60rem',
                          letterSpacing: '0.20em',
                          textTransform: 'uppercase',
                          fontWeight:    600,
                          whiteSpace:    'nowrap',
                        }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((b, i) => {
                      const sc         = STATUS_COLORS[b.status] || STATUS_COLORS.pending
                      const isSelected = selectedBooking?.id === b.id
                      return (
                        <tr
                          key={b.id}
                          onClick={() => setSelectedBooking(isSelected ? null : b)}
                          style={{
                            borderBottom: '1px solid rgba(212,168,67,0.06)',
                            background:   isSelected
                              ? 'rgba(212,168,67,0.07)'
                              : i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.008)',
                            cursor:       'pointer',
                            transition:   'background 0.15s, box-shadow 0.15s',
                            position:     'relative',
                          }}
                          onMouseEnter={e => {
                            if (!isSelected)
                              (e.currentTarget as HTMLElement).style.background = 'rgba(212,168,67,0.04)'
                          }}
                          onMouseLeave={e => {
                            if (!isSelected)
                              (e.currentTarget as HTMLElement).style.background =
                                i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.008)'
                          }}
                        >
                          {/* Customer */}
                          <td style={{ padding: '1rem 1.1rem', whiteSpace: 'nowrap' }}>
                            <div style={{ color: '#F5EDDA', fontWeight: 500 }}>
                              {b.customer_name || '—'}
                            </div>
                            <div style={{ color: '#7A6030', fontSize: '0.70rem', marginTop: '0.15rem', letterSpacing: '0.03em' }}>
                              {b.customer_phone || ''}
                            </div>
                          </td>

                          {/* Car */}
                          <td style={{ padding: '1rem 1.1rem', whiteSpace: 'nowrap' }}>
                            <div style={{ color: '#C9A870' }}>{getCarName(b)}</div>
                            {b.cars && (
                              <div style={{ color: '#7A6030', fontSize: '0.68rem', marginTop: '0.1rem' }}>
                                {b.cars.brand} · {b.cars.year} · {b.cars.type?.toUpperCase()}
                              </div>
                            )}
                          </td>

                          {/* Pickup */}
                          <td style={{ padding: '1rem 1.1rem', color: '#C9A870', whiteSpace: 'nowrap', fontSize: '0.80rem' }}>
                            {formatDate(b.pickup_date)}
                          </td>

                          {/* Return */}
                          <td style={{ padding: '1rem 1.1rem', color: '#C9A870', whiteSpace: 'nowrap', fontSize: '0.80rem' }}>
                            {formatDate(b.return_date)}
                          </td>

                          {/* Price */}
                          <td style={{ padding: '1rem 1.1rem', whiteSpace: 'nowrap' }}>
                            <span style={{
                              fontFamily:           'var(--font-dm-serif)',
                              fontSize:             '1rem',
                              background:           'linear-gradient(135deg, #F0C96A 0%, #D4A843 55%, #B8882A 100%)',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor:  'transparent',
                              backgroundClip:       'text',
                              filter:               'drop-shadow(0 0 6px rgba(212,168,67,0.30))',
                            }}>
                              {formatPrice(b.total_price)}
                            </span>
                          </td>

                          {/* Status badge */}
                          <td style={{ padding: '1rem 1.1rem' }}>
                            <span style={{
                              display:       'inline-block',
                              padding:       '0.25rem 0.7rem',
                              background:    sc.bg,
                              border:        `1px solid ${sc.border}`,
                              borderRadius:  '4px',
                              color:         sc.text,
                              fontSize:      '0.60rem',
                              letterSpacing: '0.12em',
                              textTransform: 'uppercase',
                              fontWeight:    700,
                              boxShadow:     `0 0 10px ${sc.border}`,
                            }}>
                              {b.status || 'pending'}
                            </span>
                          </td>

                          {/* Actions */}
                          <td style={{ padding: '1rem 1.1rem' }} onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                              <select
                                value={b.status || 'pending'}
                                onChange={e => handleStatusUpdate(b.id, e.target.value)}
                                disabled={updatingId === b.id}
                                style={{ ...selectStyle, fontSize: '0.70rem', padding: '0.28rem 0.55rem' }}
                              >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="completed">Completed</option>
                              </select>
                              <button
                                onClick={() => setConfirmDelete(b.id)}
                                disabled={deletingId === b.id}
                                style={{
                                  background:   'rgba(239,68,68,0.08)',
                                  border:       '1px solid rgba(239,68,68,0.25)',
                                  borderRadius: '5px',
                                  padding:      '0.28rem 0.6rem',
                                  color:        '#f87171',
                                  fontSize:     '0.70rem',
                                  cursor:       'pointer',
                                  transition:   'all 0.2s',
                                }}
                                onMouseEnter={e => {
                                  (e.currentTarget as HTMLElement).style.background   = 'rgba(239,68,68,0.18)'
                                  ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,68,68,0.5)'
                                  ;(e.currentTarget as HTMLElement).style.boxShadow   = '0 0 12px rgba(239,68,68,0.2)'
                                }}
                                onMouseLeave={e => {
                                  (e.currentTarget as HTMLElement).style.background   = 'rgba(239,68,68,0.08)'
                                  ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,68,68,0.25)'
                                  ;(e.currentTarget as HTMLElement).style.boxShadow   = 'none'
                                }}
                                title="Delete booking"
                              >
                                ✕
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ── DETAIL PANEL ── */}
          {selectedBooking && (
            <div style={{
              borderRadius:  '10px',
              position:      'relative',
              background:    'linear-gradient(155deg, rgba(255,210,80,0.07) 0%, rgba(26,18,5,0.94) 50%, rgba(10,7,1,0.99) 100%)',
              border:        '1px solid rgba(212,168,67,0.22)',
              padding:       '1.5rem',
              height:        'fit-content',
              top:           '80px',
              boxShadow:     '0 8px 40px rgba(0,0,0,0.5), 0 0 30px rgba(212,168,67,0.06)',
            }}>
              {/* Shimmer top */}
              <div style={{
                position:   'absolute',
                top: 0, left: 0, right: 0,
                height:     '1px',
                background: 'linear-gradient(90deg, transparent, rgba(255,220,100,0.30), transparent)',
              }} />

              <div style={{
                display:        'flex',
                justifyContent: 'space-between',
                alignItems:     'center',
                marginBottom:   '1.5rem',
              }}>
                <span style={{
                  fontFamily:    'var(--font-bebas)',
                  color:         '#D4A843',
                  fontSize:      '1rem',
                  letterSpacing: '0.20em',
                  textTransform: 'uppercase',
                  filter:        'drop-shadow(0 0 8px rgba(212,168,67,0.30))',
                }}>
                  Booking Detail
                </span>
                <button
                  onClick={() => setSelectedBooking(null)}
                  style={{
                    background:   'transparent',
                    border:       '1px solid rgba(212,168,67,0.18)',
                    borderRadius: '5px',
                    color:        '#7A6030',
                    cursor:       'pointer',
                    fontSize:     '1rem',
                    width:        '28px',
                    height:       '28px',
                    display:      'flex',
                    alignItems:   'center',
                    justifyContent: 'center',
                    transition:   'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.color       = '#D4A843'
                    ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,168,67,0.4)'
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.color       = '#7A6030'
                    ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,168,67,0.18)'
                  }}
                >
                  ×
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {[
                  { label: 'Booking ID',  value: selectedBooking.id.slice(0, 8).toUpperCase() },
                  { label: 'Customer',    value: selectedBooking.customer_name },
                  { label: 'Email',       value: selectedBooking.customer_email },
                  { label: 'Phone',       value: selectedBooking.customer_phone },
                  { label: 'Car',         value: getCarName(selectedBooking) },
                  { label: 'Pickup Date', value: formatDate(selectedBooking.pickup_date) },
                  { label: 'Return Date', value: formatDate(selectedBooking.return_date) },
                  { label: 'Pickup Loc.', value: selectedBooking.pickup_location },
                  { label: 'Total Price', value: formatPrice(selectedBooking.total_price) },
                  { label: 'Booked On',   value: formatDate(selectedBooking.created_at) },
                ].map(row => (
                  <div key={row.label} style={{
                    borderBottom: '1px solid rgba(212,168,67,0.07)',
                    paddingBottom: '0.75rem',
                  }}>
                    <div style={{
                      color:         '#7A6030',
                      fontSize:      '0.58rem',
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      fontWeight:    600,
                      marginBottom:  '0.2rem',
                    }}>
                      {row.label}
                    </div>
                    <div style={{
                      color:        '#F5EDDA',
                      fontSize:     '0.83rem',
                      wordBreak:    'break-all',
                      lineHeight:   1.45,
                    }}>
                      {row.value || '—'}
                    </div>
                  </div>
                ))}

                {selectedBooking.notes && (
                  <div style={{ borderBottom: '1px solid rgba(212,168,67,0.07)', paddingBottom: '0.75rem' }}>
                    <div style={{ color: '#7A6030', fontSize: '0.58rem', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.2rem' }}>
                      Notes
                    </div>
                    <div style={{ color: '#F5EDDA', fontSize: '0.83rem', lineHeight: 1.6 }}>
                      {selectedBooking.notes}
                    </div>
                  </div>
                )}

                {/* Status buttons */}
                <div>
                  <div style={{ color: '#7A6030', fontSize: '0.58rem', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.55rem' }}>
                    Update Status
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {['pending', 'confirmed', 'cancelled', 'completed'].map(s => {
                      const sc       = STATUS_COLORS[s]
                      const isActive = selectedBooking.status === s
                      return (
                        <button
                          key={s}
                          onClick={() => handleStatusUpdate(selectedBooking.id, s)}
                          disabled={updatingId === selectedBooking.id}
                          style={{
                            padding:       '0.35rem 0.8rem',
                            background:    isActive ? sc.bg : 'transparent',
                            border:        `1px solid ${isActive ? sc.border : 'rgba(212,168,67,0.15)'}`,
                            borderRadius:  '5px',
                            color:         isActive ? sc.text : '#7A6030',
                            fontSize:      '0.60rem',
                            letterSpacing: '0.10em',
                            textTransform: 'uppercase',
                            fontWeight:    700,
                            cursor:        'pointer',
                            transition:    'all 0.15s',
                            boxShadow:     isActive ? `0 0 10px ${sc.border}` : 'none',
                            fontFamily:    'var(--font-dm-sans), sans-serif',
                          }}
                        >
                          {s}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <button
                  onClick={() => setConfirmDelete(selectedBooking.id)}
                  style={{
                    marginTop:     '0.25rem',
                    background:    'rgba(239,68,68,0.08)',
                    border:        '1px solid rgba(239,68,68,0.25)',
                    borderRadius:  '6px',
                    padding:       '0.65rem',
                    color:         '#f87171',
                    fontSize:      '0.68rem',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    cursor:        'pointer',
                    width:         '100%',
                    fontFamily:    'var(--font-dm-sans), sans-serif',
                    fontWeight:    700,
                    transition:    'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background   = 'rgba(239,68,68,0.16)'
                    ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,68,68,0.5)'
                    ;(e.currentTarget as HTMLElement).style.boxShadow   = '0 0 16px rgba(239,68,68,0.15)'
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background   = 'rgba(239,68,68,0.08)'
                    ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,68,68,0.25)'
                    ;(e.currentTarget as HTMLElement).style.boxShadow   = 'none'
                  }}
                >
                  Delete Booking
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ══════════════════════════════════════
          DELETE CONFIRM MODAL
      ══════════════════════════════════════ */}
      {confirmDelete && (
        <div style={{
          position:       'fixed',
          inset:          0,
          background:     'rgba(0,0,0,0.80)',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          zIndex:         9000,
          backdropFilter: 'blur(6px)',
        }}>
          <div style={{
            position:     'relative',
            background:   'linear-gradient(155deg, rgba(30,20,5,0.99) 0%, rgba(10,7,1,0.99) 100%)',
            border:       '1px solid rgba(239,68,68,0.30)',
            borderRadius: '10px',
            padding:      '2.5rem 2rem',
            maxWidth:     '380px',
            width:        '90%',
            textAlign:    'center',
            boxShadow:    '0 0 50px rgba(239,68,68,0.12), 0 24px 60px rgba(0,0,0,0.7)',
          }}>
            {/* Top shimmer */}
            <div style={{
              position:   'absolute',
              top: 0, left: 0, right: 0,
              height:     '1px',
              background: 'linear-gradient(90deg, transparent, rgba(239,68,68,0.4), transparent)',
              borderRadius: '10px 10px 0 0',
            }} />

            <div style={{
              fontFamily:    'var(--font-bebas)',
              color:         '#f87171',
              fontSize:      '1.2rem',
              letterSpacing: '0.20em',
              textTransform: 'uppercase',
              marginBottom:  '0.75rem',
              filter:        'drop-shadow(0 0 8px rgba(239,68,68,0.3))',
            }}>
              Confirm Delete
            </div>
            <p style={{
              color:        '#C9A870',
              fontSize:     '0.88rem',
              marginBottom: '2rem',
              lineHeight:   1.6,
            }}>
              This booking will be permanently removed. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                onClick={() => setConfirmDelete(null)}
                style={{
                  background:    'transparent',
                  border:        '1px solid rgba(212,168,67,0.30)',
                  borderRadius:  '6px',
                  padding:       '0.65rem 1.5rem',
                  color:         '#C9A870',
                  fontSize:      '0.75rem',
                  letterSpacing: '0.10em',
                  textTransform: 'uppercase',
                  cursor:        'pointer',
                  fontFamily:    'var(--font-dm-sans), sans-serif',
                  fontWeight:    500,
                  transition:    'all 0.2s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background   = 'rgba(212,168,67,0.08)'
                  ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,168,67,0.55)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background   = 'transparent'
                  ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,168,67,0.30)'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={!!deletingId}
                style={{
                  background:    'rgba(239,68,68,0.14)',
                  border:        '1px solid rgba(239,68,68,0.40)',
                  borderRadius:  '6px',
                  padding:       '0.65rem 1.5rem',
                  color:         '#f87171',
                  fontSize:      '0.75rem',
                  letterSpacing: '0.10em',
                  textTransform: 'uppercase',
                  cursor:        'pointer',
                  fontFamily:    'var(--font-dm-sans), sans-serif',
                  fontWeight:    700,
                  transition:    'all 0.2s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background   = 'rgba(239,68,68,0.24)'
                  ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,68,68,0.65)'
                  ;(e.currentTarget as HTMLElement).style.boxShadow   = '0 0 20px rgba(239,68,68,0.20)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background   = 'rgba(239,68,68,0.14)'
                  ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,68,68,0.40)'
                  ;(e.currentTarget as HTMLElement).style.boxShadow   = 'none'
                }}
              >
                {deletingId ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}