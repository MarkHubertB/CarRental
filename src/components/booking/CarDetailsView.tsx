import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, ImageIcon } from 'lucide-react';
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
  const [currentImgIdx, setCurrentImgIdx] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const images = car.image_urls && car.image_urls.length > 0 
    ? car.image_urls 
    : ["/cars/placeholder.jpg"];

  const nextImg = () => setCurrentImgIdx((prev) => (prev + 1) % images.length);
  const prevImg = () => setCurrentImgIdx((prev) => (prev - 1 + images.length) % images.length);

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
      {/* Immersive Gallery */}
      <div className="relative w-full h-[500px] rounded-3xl overflow-hidden group bg-black shadow-2xl">
        <img 
          src={images[currentImgIdx]} 
          alt={car.name}
          className={`w-full h-full object-cover transition-transform duration-700 ${isZoomed ? 'scale-150' : 'scale-100'}`}
        />
        
        {/* Gallery Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        
        {/* Navigation */}
        <div className="absolute inset-y-0 left-0 flex items-center px-4">
          <button 
            onClick={prevImg}
            className="p-3 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white hover:bg-gold hover:text-black transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>
        <div className="absolute inset-y-0 right-0 flex items-center px-4">
          <button 
            onClick={nextImg}
            className="p-3 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white hover:bg-gold hover:text-black transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Zoom & Info */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button 
            onClick={() => setIsZoomed(!isZoomed)}
            className="p-2 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 text-white hover:bg-white/20 transition-all"
            title="Zoom Image"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Image Counter */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest">
          {currentImgIdx + 1} / {images.length}
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
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: ".5rem",
                  }}
                >
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
                  <span
                    style={{
                      fontSize: ".9rem",
                      textTransform: "capitalize",
                    }}
                  >
                    {value}
                  </span>
                </div>
              ) : (
                <p
                  style={{
                    fontSize: ".9rem",
                    textTransform: "capitalize",
                  }}
                >
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
