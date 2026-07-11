import type { Metadata } from "next";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Contact Us | My website",
  description:
    "Contact My website for car rental inquiries in Dauis, Bohol, Philippines.",
};

export default function ContactPage() {
  return (
    <main>
      <style>{`
        @media (max-width: 767px) {
          .contact-content {
            grid-template-columns: 1fr !important;
          }
        }
        @media (min-width: 768px) {
          .contact-content {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
      <Navbar />

      <header
        style={{
          padding:
            "clamp(2.5rem, 5vw, 4rem) var(--padding-mobile) clamp(1.5rem, 3vw, 2.5rem)",
          borderBottom: "1px solid var(--border-dim)",
          background:
            "linear-gradient(160deg, rgba(235,244,239,.06) 0%, var(--dark) 60%)",
        }}
      >
        <div className="section-eyebrow">Find Us</div>
        <h1
          style={{
            fontFamily: "var(--font-dm-serif)",
            fontSize: "clamp(2rem, 4vw, 3rem)",
            color: "var(--text)",
          }}
        >
          Get In Touch
        </h1>
      </header>

      <section
        className="contact-section"
        style={{ borderTop: "none" }}
        aria-labelledby="contact-details-title"
      >
        <div
          className="contact-inner contact-content"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "clamp(2rem, 5vw, 4rem)",
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          <address className="contact-info" style={{ fontStyle: "normal" }}>
            <h2
              id="contact-details-title"
              style={{
                fontFamily: "var(--font-dm-serif)",
                fontSize: "clamp(1.3rem, 2vw, 1.5rem)",
                color: "var(--text)",
                margin: 0,
                marginBottom: "clamp(0.5rem, 1vw, 1rem)",
              }}
            >
              Contact Details
            </h2>
            <p
              className="contact-sub"
              style={{
                fontSize: "clamp(0.9rem, 1.5vw, 1rem)",
                color: "var(--text3)",
                fontStyle: "italic",
                marginBottom: "clamp(1rem, 2vw, 1.5rem)",
              }}
            >
              We&apos;re just a call or message away.
            </p>

            {[
              {
                icon: "📍",
                label: "Location",
                value: "Purok 7, Tabalong, Dauis, Bohol",
              },
              { icon: "📞", label: "Contact Number", value: "09274 549 343" },
              {
                icon: "🕐",
                label: "Availability",
                value: "Call or message anytime",
              },
            ].map((c) => (
              <div
                key={c.label}
                className="contact-item"
                style={{
                  display: "flex",
                  gap: "clamp(1rem, 2vw, 1.5rem)",
                  marginBottom: "clamp(1.2rem, 2vw, 1.5rem)",
                }}
              >
                <div
                  className="contact-icon"
                  style={{
                    fontSize: "clamp(1.5rem, 3vw, 2rem)",
                    flexShrink: 0,
                    minWidth: "44px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {c.icon}
                </div>
                <div>
                  <strong
                    style={{
                      fontSize: "clamp(0.9rem, 1.5vw, 1rem)",
                      color: "var(--text)",
                      display: "block",
                    }}
                  >
                    {c.label}
                  </strong>
                  <p
                    style={{
                      fontSize: "clamp(0.85rem, 1.5vw, 0.95rem)",
                      color: "var(--text3)",
                      margin: "0.25rem 0 0",
                    }}
                  >
                    {c.value}
                  </p>
                </div>
              </div>
            ))}

            <a
              href="tel:09274549343"
              className="gold-btn"
              style={{
                marginTop: "clamp(1rem, 2vw, 1.5rem)",
                width: "fit-content",
              }}
            >
              📞 Call Now
            </a>
          </address>

          <div
            className="contact-map"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "clamp(200px, 40vw, 350px)",
              borderRadius: "clamp(8px, 2vw, 10px)",
              background:
                "linear-gradient(135deg, rgba(235,244,239,0.08) 0%, rgba(7,20,20,0.95) 100%)",
              border: "1px solid rgba(235,244,239,0.18)",
              padding: "clamp(1.5rem, 3vw, 2rem)",
              textAlign: "center",
              gap: "1rem",
            }}
          >
            <span style={{ fontSize: "clamp(2rem, 5vw, 3rem)" }}>🗺️</span>
            <span
              className="map-label"
              style={{
                fontSize: "clamp(1rem, 2vw, 1.2rem)",
                fontWeight: 600,
                color: "var(--text)",
              }}
            >
              Tabalong, Dauis, Bohol
            </span>
            <span
              className="map-sub"
              style={{
                fontSize: "clamp(0.8rem, 1.5vw, 0.9rem)",
                color: "var(--text3)",
              }}
            >
              Google Map will be embedded here
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
