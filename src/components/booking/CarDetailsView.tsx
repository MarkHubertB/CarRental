import React from 'react';
import { Car } from '@/types';

const COLOR_DOT: Record<string, string> = {
  White: "#F0EDE5",
  "Metallic Brown": "#8B6540",
  Silver: "#B8BEC8",
  Blue: "#4A7FC1",
};

const TYPE_LABEL: Record<string, string> = {
  van: "Group / Tour",
  suv: "Family SUV",
  mpv: "MPV",
  hatchback: "City / Solo",
};

interface CarDetailsViewProps {
  car: Car;
}

export default function CarDetailsView({ car }: CarDetailsViewProps) {
  const getCarImage = () => {
    if (car.image_urls && car.image_urls.length > 0) return car.image_urls[0];
    const modelLower = car.model?.toLowerCase() || "";
    if (modelLower.includes("hi-ace") || modelLower.includes("hiace"))
      return "/cars/toyota_hi-ace.jpg";
    if (modelLower.includes("rush")) return "/cars/toyota rush.jpg";
    if (modelLower.includes("avanza")) return "/cars/toyota-avanza.jpg";
    if (modelLower.includes("celerio"))
      return "/cars/Maruti_Suzuki_Celerio.avif";
    return "/cars/placeholder.jpg";
  };

  const goldDivider = (
    <div
      style={{
        height: "1px",
        background: "linear-gradient(to right, rgba(212,168,67,0.45), transparent)",
        margin: "clamp(0.8rem, 2vw, 1.2rem) 0",
      }}
    />
  );

  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "clamp(1rem, 2vw, 1.5rem)",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          paddingBottom: "58%",
          borderRadius: "12px",
          overflow: "hidden",
          background: "radial-gradient(ellipse at center, #2a1f0a 0%, #110900 70%)",
          border: "1px solid rgba(212,168,67,0.35)",
          boxShadow: "0 0 0 1px rgba(212,168,67,0.08), 0 8px 40px rgba(0,0,0,0.6)",
          flexShrink: 0,
        }}
      >
        <img
          src={getCarImage()}
          alt={`${car.name} for rent in Bohol Philippines`}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "88%",
            height: "88%",
            objectFit: "contain",
            filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.5))",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "30%",
            background: "linear-gradient(to top, rgba(17,9,0,0.65) 0%, transparent 100%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "1rem",
            left: "1rem",
            background: "rgba(212,168,67,0.15)",
            border: "1px solid rgba(212,168,67,0.4)",
            borderRadius: "4px",
            padding: "3px 10px",
            fontSize: ".72rem",
            fontWeight: 600,
            letterSpacing: "0.1em",
            color: "#D4A843",
            textTransform: "uppercase",
          }}
        >
          {car.type}
        </div>
      </div>

      <article
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, rgba(255,215,80,.06) 0%, rgba(17,9,0,0.85) 100%)",
          padding: "1.8rem",
          borderRadius: "10px",
          border: "1px solid rgba(212,168,67,0.2)",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-dm-serif)",
            fontSize: "1.8rem",
            marginBottom: "0",
            letterSpacing: "-0.01em",
          }}
        >
          {car.name}
        </h2>

        {goldDivider}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1.2rem",
            marginBottom: "1.2rem",
          }}
        >
          {[
            { label: "Type", value: TYPE_LABEL[car.type] ?? car.type },
            { label: "Seats", value: `${car.seats} Seats` },
            { label: "Transmission", value: car.transmission },
            { label: "Color", value: car.color, isColor: true },
          ].map(({ label, value, isColor }) => (
            <div key={label}>
              <p
                style={{
                  color: "var(--text3)",
                  fontSize: ".72rem",
                  marginBottom: ".3rem",
                  letterSpacing: "0.09em",
                  textTransform: "uppercase",
                }}
              >
                {label}
              </p>
              {isColor ? (
                <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
                  <span
                    style={{
                      width: "13px",
                      height: "13px",
                      borderRadius: "50%",
                      background: COLOR_DOT[value] ?? "#888",
                      border: "1px solid rgba(255,255,255,0.2)",
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: ".9rem", textTransform: "capitalize" }}>
                    {value}
                  </span>
                </div>
              ) : (
                <p style={{ fontSize: ".9rem", textTransform: "capitalize" }}>
                  {value}
                </p>
              )}
            </div>
          ))}
        </div>

        {goldDivider}

        <p
          style={{
            color: "var(--text3)",
            fontSize: ".9rem",
            lineHeight: 1.75,
            flex: 1,
          }}
        >
          {car.description}
        </p>

        <div
          style={{
            marginTop: "1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "rgba(212,168,67,0.08)",
            border: "1px solid rgba(212,168,67,0.22)",
            borderRadius: "8px",
            padding: ".8rem 1.2rem",
          }}
        >
          <span
            style={{
              fontSize: ".8rem",
              color: "var(--text3)",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            Rate per day
          </span>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: ".3rem",
            }}
          >
            <span
              style={{
                fontSize: "1.6rem",
                fontWeight: 700,
                color: "#D4A843",
              }}
            >
              {"\u20B1"}
              {car.price_per_day.toLocaleString()}
            </span>
            <span style={{ fontSize: ".8rem", color: "var(--text3)" }}>/day</span>
          </div>
        </div>
      </article>
    </section>
  );
}
