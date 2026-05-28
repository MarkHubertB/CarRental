import Link from 'next/link'
import Navbar from '@/components/Navbar'

interface ConfirmationPageProps {
  params: Promise<{ id: string }>
}

export default async function BookingConfirmationPage(props: ConfirmationPageProps) {
  const params = await props.params
  const bookingId = params.id

  return (
    <main>
      <Navbar />

      <div style={{
        minHeight: 'calc(100vh - 60px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}>
        <div style={{
          textAlign: 'center',
          maxWidth: '600px',
        }}>
          <div style={{
            fontSize: '4rem',
            marginBottom: '1.5rem',
            animation: 'pulse 2s infinite',
          }}>
            ✓
          </div>

          <h1 style={{
            fontFamily: 'var(--font-dm-serif)',
            fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
            marginBottom: '1rem',
            color: 'var(--text)',
          }}>
            Booking Confirmed!
          </h1>

          <p style={{
            fontSize: '1rem',
            color: 'var(--text3)',
            marginBottom: '2rem',
            lineHeight: 1.8,
          }}>
            Thank you for your reservation. Your booking has been submitted and is pending confirmation.
            We will contact you shortly to confirm your booking details.
          </p>

          <div style={{
            background: 'linear-gradient(135deg, rgba(255,215,80,.1) 0%, rgba(212,168,67,.05) 100%)',
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid var(--border-dim)',
            marginBottom: '2rem',
            textAlign: 'left',
          }}>
            <p style={{ color: 'var(--text3)', fontSize: '.9rem', marginBottom: '.5rem' }}>
              Booking ID
            </p>
            <p style={{
              fontFamily: 'monospace',
              fontSize: '1.1rem',
              color: 'var(--text)',
              fontWeight: 600,
              wordBreak: 'break-all',
            }}>
              {bookingId}
            </p>
          </div>

          <p style={{
            fontSize: '.9rem',
            color: 'var(--text3)',
            marginBottom: '2rem',
            lineHeight: 1.8,
          }}>
            A confirmation email has been sent to the email address you provided.
            Keep your booking ID for future reference.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/cars" style={{
              padding: '.8rem 2rem',
              background: 'linear-gradient(135deg, #F0C96A, #D4A843)',
              color: '#110900',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '.95rem',
              transition: 'all .2s',
            }}>
              Browse More Cars
            </Link>
            <Link href="/" style={{
              padding: '.8rem 2rem',
              background: 'rgba(212, 168, 67, 0.15)',
              color: 'var(--text)',
              border: '1px solid rgba(212, 168, 67, 0.3)',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '.95rem',
              transition: 'all .2s',
            }}>
              Back Home
            </Link>
          </div>

          <style>{`
            @keyframes pulse {
              0%, 100% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.1); opacity: 0.9; }
            }
          `}</style>
        </div>
      </div>
    </main>
  )
}
