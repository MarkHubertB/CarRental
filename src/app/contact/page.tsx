import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'Contact Us | CF Udtohan Travel & Tours',
  description:
    'Contact CF Udtohan-Bagotchay Travel & Tours for car rental inquiries in Dauis, Bohol, Philippines.',
}

export default function ContactPage() {
  return (
    <main>
      <Navbar />

      <header style={{
        padding: '4rem 3.5rem 2.5rem',
        borderBottom: '1px solid var(--border-dim)',
        background: 'linear-gradient(160deg, rgba(255,215,80,.06) 0%, var(--dark) 60%)',
      }}>
        <div className="section-eyebrow">Find Us</div>
        <h1 style={{
          fontFamily: 'var(--font-dm-serif)',
          fontSize: 'clamp(2rem, 4vw, 3rem)',
          color: 'var(--text)',
        }}>
          Get In Touch
        </h1>
      </header>

      <section className="contact-section" style={{ borderTop: 'none' }} aria-labelledby="contact-details-title">
        <div className="contact-inner">
          <address className="contact-info" style={{ fontStyle: 'normal' }}>
            <h2 id="contact-details-title" style={{ fontFamily: 'var(--font-dm-serif)', fontSize: '1.5rem', color: 'var(--text)', margin: 0 }}>
              Contact Details
            </h2>
            <p className="contact-sub">We&apos;re just a call or message away.</p>

            {[
              { icon: '📍', label: 'Location',       value: 'Purok 7, Tabalong, Dauis, Bohol' },
              { icon: '📞', label: 'Contact Number', value: '09274 549 343' },
              { icon: '🕐', label: 'Availability',   value: 'Call or message anytime' },
            ].map(c => (
              <div key={c.label} className="contact-item">
                <div className="contact-icon">{c.icon}</div>
                <div>
                  <strong>{c.label}</strong>
                  <p>{c.value}</p>
                </div>
              </div>
            ))}

            <a href="tel:09274549343" className="gold-btn" style={{ marginTop: '1.5rem', width: 'fit-content' }}>
              📞 Call Now
            </a>
          </address>

          <div className="contact-map">
            <span>🗺️</span>
            <span className="map-label">Tabalong, Dauis, Bohol</span>
            <span className="map-sub">Google Map will be embedded here</span>
          </div>
        </div>
      </section>
    </main>
  )
}
