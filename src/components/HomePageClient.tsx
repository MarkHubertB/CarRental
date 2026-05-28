"use client";

import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const CAR_IMAGES: Record<string, string> = {
  "Toyota Hi-Ace Van": "/cars/toyota_hi-ace.jpg",
  "Toyota Rush": "/cars/toyota rush.jpg",
  "Toyota Avanza": "/cars/toyota-avanza.jpg",
  "Suzuki Celerio": "/cars/Maruti_Suzuki_Celerio.avif",
};

const FLEET = [
  {
    id: "c93cf1b7-51ce-4d91-891d-821b1c1b4d8c",
    name: "Toyota Hi-Ace Van",
    type: "Van",
    seats: 12,
    color: "White",
    colorHex: "#e8e8e8",
    price: 3500,
  },
  {
    id: "4edefa42-bcae-4999-9c2d-094b95cc49a8",
    name: "Toyota Rush",
    type: "SUV",
    seats: 7,
    color: "Metallic Brown",
    colorHex: "#7B5E3A",
    price: 2500,
  },
  {
    id: "d94ea4e9-cc1e-446b-aa63-70705b8fa7df",
    name: "Toyota Avanza",
    type: "MPV",
    seats: 7,
    color: "Silver",
    colorHex: "#A8A8A8",
    price: 2000,
  },
  {
    id: "66e1d48a-4ffa-4dfc-a2fb-106e63eb85ab",
    name: "Suzuki Celerio",
    type: "Hatchback",
    seats: 5,
    color: "Blue",
    colorHex: "#2B5BA8",
    price: 1500,
  },
];

const WHY_US = [
  {
    icon: "📍",
    title: "Local Knowledge",
    desc: "Based in Dauis, Bohol - we know every route, road, and hidden gem tourists miss.",
  },
  {
    icon: "✅",
    title: "Well-Maintained Fleet",
    desc: "Every vehicle is regularly serviced and ready for Bohol's terrain - beaches to highlands.",
  },
  {
    icon: "📱",
    title: "Easy Booking",
    desc: "Book online or call us directly. Simple, fast confirmation - no hidden fees.",
  },
  {
    icon: "🤝",
    title: "Trusted Service",
    desc: "Family-owned and locally operated. We take pride in every booking, big or small.",
  },
];

export default function HomePageClient() {
  const heroBgRef = useRef<HTMLDivElement>(null);
  const [activeCard, setActiveCard] = useState<string | null>(null);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach(
          (e) => e.isIntersecting && e.target.classList.add("visible"),
        ),
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );
    document
      .querySelectorAll(".scroll-animate")
      .forEach((el) => io.observe(el));

    const onScroll = () => {
      if (!heroBgRef.current) return;
      const hero = heroBgRef.current.closest(".hero-fullscreen") as HTMLElement;
      if (!hero) return;
      const scrollY = window.scrollY;
      if (scrollY < hero.offsetTop + window.innerHeight) {
        heroBgRef.current.style.transform = `translateY(${(scrollY - hero.offsetTop) * 0.45}px)`;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);

  return (
    <>
      <style>{`
        .hero-fullscreen {
          position: relative;
          min-height: 100svh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 4.5rem 2rem 0;
        }
        .hero-bg {
          position: absolute;
          inset: -20%;
          background:
            radial-gradient(ellipse 80% 60% at 50% 40%, rgba(212,168,67,.18) 0%, transparent 65%),
            radial-gradient(ellipse 50% 40% at 15% 70%, rgba(212,168,67,.10) 0%, transparent 60%),
            var(--dark);
          will-change: transform;
        }
        .hero-noise {
          position: absolute;
          inset: 0;
          opacity: .04;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 200px 200px;
          pointer-events: none;
        }
        .hero-lines {
          position: absolute;
          inset: 0;
          background-image:
            repeating-linear-gradient(0deg, transparent, transparent 79px, rgba(212,168,67,.04) 80px),
            repeating-linear-gradient(90deg, transparent, transparent 79px, rgba(212,168,67,.04) 80px);
          pointer-events: none;
        }
        .hero-ghost-text {
          position: absolute;
          bottom: -2rem;
          left: 50%;
          transform: translateX(-50%);
          font-family: var(--font-bebas);
          font-size: clamp(8rem, 22vw, 18rem);
          letter-spacing: .06em;
          color: transparent;
          -webkit-text-stroke: 1px rgba(212,168,67,.08);
          white-space: nowrap;
          pointer-events: none;
          user-select: none;
        }
        .hero-content {
          position: relative;
          z-index: 2;
          text-align: center;
          max-width: 820px;
          width: 100%;
          margin-bottom: -1rem;
        }
        .hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: .6rem;
          font-size: .72rem;
          font-weight: 700;
          letter-spacing: .2em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 1.6rem;
          padding: .4rem 1.1rem;
          border: 1px solid rgba(212,168,67,.25);
          border-radius: 99px;
          background: rgba(212,168,67,.07);
        }
        .hero-eyebrow::before {
          content: '';
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--gold);
          box-shadow: 0 0 8px var(--gold);
          flex-shrink: 0;
        }
        .hero-title {
          font-family: var(--font-bebas);
          font-size: clamp(3.2rem, 8.6vw, 6.6rem);
          line-height: .95;
          letter-spacing: .02em;
          color: var(--text);
          margin: 0 0 1.2rem;
        }
        .hero-title .line-accent {
          display: block;
          background: linear-gradient(135deg, #F0C96A, #D4A843, #B8882A);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-sub {
          font-size: clamp(.92rem, 1.6vw, 1.1rem);
          color: var(--text3);
          line-height: 1.75;
          max-width: 480px;
          margin: 0 auto 2.1rem;
        }
        .hero-ctas {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 2.6rem;
        }
        .hero-stats-row {
          display: flex;
          justify-content: center;
          gap: 0;
          border: 1px solid rgba(212,168,67,.15);
          border-radius: 14px;
          background: rgba(0,0,0,.25);
          backdrop-filter: blur(12px);
          display: inline-flex;
          overflow: hidden;
        }
        .stat-pill {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1rem 2.2rem;
          position: relative;
        }
        .stat-pill + .stat-pill::before {
          content: '';
          position: absolute;
          left: 0;
          top: 20%;
          bottom: 20%;
          width: 1px;
          background: rgba(212,168,67,.2);
        }
        .stat-pill strong {
          font-family: var(--font-bebas);
          font-size: 2rem;
          letter-spacing: .06em;
          background: linear-gradient(135deg, #F0C96A, #D4A843);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
        }
        .stat-pill span {
          font-size: .68rem;
          letter-spacing: .15em;
          text-transform: uppercase;
          color: var(--text3);
          margin-top: .25rem;
        }
        .scroll-cue {
          position: absolute;
          bottom: 2.2rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: .5rem;
          z-index: 3;
        }
        .scroll-cue-label {
          font-size: .62rem;
          letter-spacing: .2em;
          text-transform: uppercase;
          color: rgba(212,168,67,.4);
        }
        .scroll-cue-line {
          width: 1px;
          height: 40px;
          background: linear-gradient(to bottom, rgba(212,168,67,.5), transparent);
          animation: scrollLine 1.8s ease-in-out infinite;
          transform-origin: top center;
        }
        @keyframes scrollLine {
          0% { transform: scaleY(0); opacity: 0; }
          40% { transform: scaleY(1); opacity: 1; }
          100% { transform: scaleY(1) translateY(100%); opacity: 0; }
        }
        .search-section {
          position: relative;
          z-index: 10;
          width: 100%;
          padding: 2rem 2rem 2.5rem;
        }
        .search-bar {
          max-width: 820px;
          margin: 0 auto;
          background: rgba(10,8,3,.92);
          border: 1px solid rgba(212,168,67,.55);
          border-radius: 14px;
          padding: 1.1rem 1.4rem;
          display: flex;
          gap: .8rem;
          align-items: flex-end;
          flex-wrap: wrap;
          backdrop-filter: blur(24px);
          box-shadow:
            0 0 0 1px rgba(212,168,67,.28),
            0 0 14px rgba(212,168,67,.18),
            0 0 34px rgba(212,168,67,.12),
            0 12px 48px rgba(0,0,0,.5),
            inset 0 1px 0 rgba(255,236,184,.28),
            inset 0 0 20px rgba(212,168,67,.08);
        }
        .search-field {
          flex: 1;
          min-width: 130px;
          display: flex;
          flex-direction: column;
          gap: .3rem;
        }
        .search-field label {
          font-size: .62rem;
          font-weight: 700;
          letter-spacing: .14em;
          text-transform: uppercase;
          color: var(--gold);
        }
        .search-field input,
        .search-field select {
          background: rgba(212,168,67,.06);
          border: 1px solid rgba(212,168,67,.18);
          border-radius: 8px;
          padding: .55rem .85rem;
          color: var(--text);
          font-size: .84rem;
          font-family: var(--font-dm-sans);
          width: 100%;
          outline: none;
          transition: border-color .2s;
          -webkit-appearance: none;
          appearance: none;
        }
        .search-field input:focus,
        .search-field select:focus {
          border-color: rgba(212,168,67,.55);
        }
        .search-field select option { background: #12100a; }
        .page-section {
          padding: 6rem 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        .section-label {
          display: inline-flex;
          align-items: center;
          gap: .5rem;
          font-size: .68rem;
          font-weight: 700;
          letter-spacing: .2em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: .9rem;
        }
        .section-label::after {
          content: '';
          width: 32px;
          height: 1px;
          background: linear-gradient(to right, var(--gold), transparent);
        }
        .section-title {
          font-family: var(--font-dm-serif);
          font-size: clamp(1.9rem, 3.5vw, 2.8rem);
          color: var(--text);
          line-height: 1.15;
          margin: 0;
        }
        .fleet-section {
          position: relative;
          overflow: hidden;
          padding: 5rem 2rem;
        }
        .fleet-section::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 70% 55% at 50% 30%, rgba(212,168,67,.13) 0%, transparent 65%),
            radial-gradient(ellipse 40% 40% at 10% 80%, rgba(212,168,67,.07) 0%, transparent 55%),
            radial-gradient(ellipse 35% 35% at 90% 10%, rgba(212,168,67,.06) 0%, transparent 50%);
          pointer-events: none;
        }
        .fleet-section-inner {
          position: relative;
          z-index: 1;
          max-width: 1400px;
          margin: 0 auto;
        }
        .fleet-head {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .fleet-grid-shell {
          position: relative;
          overflow: hidden;
          padding-right: 7rem;
        }
        .fleet-grid-shell::after {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          width: 8.5rem;
          background: linear-gradient(
            90deg,
            rgba(10,8,3,0) 0%,
            rgba(10,8,3,.72) 38%,
            rgba(10,8,3,.94) 100%
          );
          pointer-events: none;
          z-index: 2;
        }
        .fleet-grid {
          display: flex;
          gap: 1.1rem;
          align-items: stretch;
          width: 100%;
        }
        .car-card-v2 {
          flex: 0 0 calc((100% - 2.2rem) / 2.5);
          min-width: 0;
          background: rgba(18,13,5,.8);
          border: 1px solid rgba(212,168,67,.14);
          border-radius: 16px;
          overflow: hidden;
          transition: transform .3s ease, border-color .3s ease, box-shadow .3s ease;
          position: relative;
        }
        .car-card-v2:hover,
        .car-card-v2.active {
          transform: translateY(-5px);
          border-color: rgba(212,168,67,.45);
          box-shadow: 0 18px 45px rgba(0,0,0,.55), 0 0 20px rgba(212,168,67,.1);
        }
        .car-card-v2-img {
          width: 100%;
          height: 160px;
          overflow: hidden;
          background: rgba(212,168,67,.04);
          position: relative;
        }
        .car-card-v2-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform .45s ease;
          display: block;
        }
        .car-card-v2:hover .car-card-v2-img img {
          transform: scale(1.06);
        }
        .type-badge {
          position: absolute;
          top: .9rem;
          left: .9rem;
          font-size: .62rem;
          font-weight: 700;
          letter-spacing: .14em;
          text-transform: uppercase;
          padding: .3rem .75rem;
          border-radius: 99px;
          background: rgba(0,0,0,.65);
          border: 1px solid rgba(212,168,67,.3);
          color: var(--gold);
          backdrop-filter: blur(8px);
          z-index: 1;
        }
        .color-swatch {
          position: absolute;
          bottom: .9rem;
          right: .9rem;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 2px solid rgba(255,255,255,.3);
          box-shadow: 0 2px 8px rgba(0,0,0,.5);
          z-index: 1;
        }
        .car-img-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(212,168,67,.08), rgba(212,168,67,.03));
        }
        .car-img-placeholder span {
          font-family: var(--font-bebas);
          font-size: 3rem;
          letter-spacing: .1em;
          color: rgba(212,168,67,.25);
        }
        .car-card-v2-body {
          padding: 1.3rem 1.4rem 1.5rem;
        }
        .car-card-v2-name {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text);
          margin: 0 0 .45rem;
        }
        .car-card-v2-meta {
          display: flex;
          gap: .8rem;
          font-size: .73rem;
          color: var(--text3);
          margin-bottom: 1.2rem;
        }
        .card-divider {
          height: 1px;
          background: linear-gradient(to right, rgba(212,168,67,.2), transparent);
          margin-bottom: 1.2rem;
        }
        .car-card-v2-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .car-price-v2 strong {
          font-family: var(--font-bebas);
          font-size: 1.75rem;
          letter-spacing: .04em;
          background: linear-gradient(135deg, #F0C96A, #D4A843);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
          display: block;
        }
        .car-price-v2 small {
          font-size: .67rem;
          color: var(--text3);
          letter-spacing: .08em;
          text-transform: uppercase;
        }
        .book-btn-v2 {
          font-size: .78rem;
          font-weight: 700;
          letter-spacing: .08em;
          text-transform: uppercase;
          padding: .6rem 1.3rem;
          border-radius: 8px;
          background: linear-gradient(135deg, #D4A843, #B8882A);
          color: #0a0700;
          text-decoration: none;
          transition: opacity .2s, transform .2s;
          display: inline-block;
        }
        .book-btn-v2:hover { opacity: .88; transform: scale(1.04); }
        .fleet-teaser-cue {
          position: absolute;
          top: 50%;
          right: 0;
          transform: translateY(-50%);
          z-index: 3;
          display: inline-flex;
          align-items: center;
          gap: .55rem;
          padding: .8rem 1rem .8rem 2.4rem;
          border-radius: 999px 0 0 999px;
          background: linear-gradient(90deg, rgba(10,8,3,0), rgba(10,8,3,.92) 28%, rgba(10,8,3,.98));
          border: 1px solid rgba(212,168,67,.28);
          border-right: 0;
          color: var(--gold);
          font-size: .75rem;
          font-weight: 700;
          letter-spacing: .12em;
          text-transform: uppercase;
          box-shadow:
            -12px 0 28px rgba(0,0,0,.3),
            0 0 16px rgba(212,168,67,.12),
            inset 0 0 18px rgba(212,168,67,.08);
          backdrop-filter: blur(10px);
          pointer-events: none;
        }
        .fleet-teaser-cue::before {
          content: '';
          width: 10px;
          height: 10px;
          border-top: 2px solid currentColor;
          border-right: 2px solid currentColor;
          transform: rotate(45deg);
          flex-shrink: 0;
        }
        .why-section-wrap {
          background: rgba(212,168,67,.025);
          border-top: 1px solid rgba(212,168,67,.1);
          border-bottom: 1px solid rgba(212,168,67,.1);
        }
        .why-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
          gap: 1.2rem;
          margin-top: 2.8rem;
        }
        .why-card-v2 {
          background: rgba(20,15,7,.5);
          border: 1px solid rgba(212,168,67,.1);
          border-radius: 16px;
          padding: 2rem 1.6rem;
          transition: border-color .3s, transform .3s;
        }
        .why-card-v2:hover {
          border-color: rgba(212,168,67,.3);
          transform: translateY(-4px);
        }
        .why-icon { font-size: 2.2rem; margin-bottom: 1.1rem; display: block; }
        .why-title-v2 {
          font-size: .95rem;
          font-weight: 700;
          color: var(--text);
          margin: 0 0 .6rem;
        }
        .why-desc { font-size: .82rem; color: var(--text3); line-height: 1.7; margin: 0; }
        .cta-strip {
          padding: 5rem 2rem;
          text-align: center;
          background: linear-gradient(160deg, rgba(212,168,67,.08) 0%, transparent 60%);
          border-top: 1px solid rgba(212,168,67,.12);
        }
        .cta-strip h2 {
          font-family: var(--font-dm-serif);
          font-size: clamp(1.8rem, 3vw, 2.4rem);
          color: var(--text);
          margin: 0 0 .7rem;
        }
        .cta-strip p {
          color: var(--text3);
          margin: 0 auto 2rem;
          max-width: 400px;
          font-size: .9rem;
          line-height: 1.65;
        }
        .contact-section {
          padding: 6rem 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
          margin-top: 2.8rem;
        }
        .contact-detail-row {
          display: flex;
          gap: 1.1rem;
          padding: 1.2rem 0;
          border-bottom: 1px solid rgba(212,168,67,.1);
          align-items: flex-start;
        }
        .contact-detail-row:first-of-type { border-top: 1px solid rgba(212,168,67,.1); }
        .contact-icon-box {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          background: rgba(212,168,67,.1);
          border: 1px solid rgba(212,168,67,.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.15rem;
          flex-shrink: 0;
        }
        .contact-detail-label {
          font-size: .67rem;
          font-weight: 700;
          letter-spacing: .14em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: .3rem;
        }
        .contact-detail-val { font-size: .9rem; color: var(--text); }
        .map-placeholder {
          background: rgba(20,15,7,.7);
          border: 1px solid rgba(212,168,67,.14);
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: .7rem;
          min-height: 280px;
          padding: 2rem;
          text-align: center;
        }
        .map-placeholder .map-emoji { font-size: 3rem; }
        .map-placeholder strong { color: var(--text); font-size: 1rem; }
        .map-placeholder small { font-size: .8rem; color: var(--text3); }
        .footer-v2 {
          padding: 2.5rem 2rem;
          border-top: 1px solid rgba(212,168,67,.1);
          background: rgba(0,0,0,.35);
          text-align: center;
        }
        .footer-brand {
          font-family: var(--font-bebas);
          font-size: 1.4rem;
          letter-spacing: .12em;
          background: linear-gradient(135deg, #F0C96A, #D4A843);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: .35rem;
        }
        .footer-sub { font-size: .78rem; color: var(--text3); margin-bottom: 1.2rem; }
        .footer-copy { font-size: .71rem; color: rgba(255,255,255,.18); }
        .scroll-animate {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity .65s ease, transform .65s ease;
        }
        .scroll-animate.visible { opacity: 1; transform: translateY(0); }
        @media (max-width: 900px) {
          .fleet-grid-shell { padding-right: 5.5rem; }
          .fleet-grid-shell::after { width: 6.5rem; }
          .car-card-v2 { flex-basis: calc((100% - 1.1rem) / 2.15); }
        }
        @media (max-width: 700px) {
          .hero-fullscreen { padding-top: 4rem; }
          .hero-title { font-size: clamp(2.7rem, 12vw, 4.6rem); }
          .contact-grid { grid-template-columns: 1fr; }
          .fleet-head { flex-direction: column; align-items: flex-start; }
          .fleet-grid-shell { padding-right: 3rem; }
          .fleet-grid-shell::after { width: 4.75rem; }
          .fleet-grid { gap: .9rem; }
          .car-card-v2 { flex-basis: calc((100% - .9rem) / 1.15); }
          .search-bar { flex-direction: column; }
          .search-field { min-width: 100%; }
          .stat-pill { padding: .8rem 1.2rem; }
          .hero-stats-row { flex-wrap: wrap; gap: .5rem; justify-content: center; }
          .hero-ctas { flex-direction: column; align-items: center; }
        }
      `}</style>

      <main>
        <Navbar />

        <section className="hero-fullscreen">
          <div className="hero-bg" ref={heroBgRef} />
          <div className="hero-noise" />
          <div className="hero-lines" />
          <div className="hero-ghost-text">BOHOL</div>

          <header className="hero-content">
            <div className="hero-eyebrow">
              Bohol&apos;s Trusted Ride Partner
            </div>

            <h1 className="hero-title">
              CAR RENTAL IN BOHOL
              <br />
              <span className="line-accent">DRIVE YOUR WAY</span>
            </h1>

            <p className="hero-sub">
              Premium car rental in Dauis, Bohol - island roads, beach drives,
              and highland adventures made easy with a local touch.
            </p>

            <div className="hero-ctas">
              <Link href="/cars" className="gold-btn">
                Browse Fleet →
              </Link>
              <Link href="/contact" className="ghost-btn">
                Contact Us
              </Link>
            </div>

            <div className="hero-stats-row">
              {[
                { value: "4", label: "Vehicles" },
                { value: "Dauis", label: "Bohol" },
                { value: "24/7", label: "Support" },
              ].map((s) => (
                <div key={s.label} className="stat-pill">
                  <strong>{s.value}</strong>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
          </header>

          <div className="scroll-cue">
            <span className="scroll-cue-label">Scroll</span>
            <div className="scroll-cue-line" />
          </div>

          <section className="search-section">
            <div className="search-bar">
              <div className="search-field">
                <label>Pick-up Date</label>
                <input type="date" />
              </div>
              <div className="search-field">
                <label>Return Date</label>
                <input type="date" />
              </div>
              <div className="search-field">
                <label>Vehicle Type</label>
                <select>
                  <option>All Vehicles</option>
                  <option>Van</option>
                  <option>SUV</option>
                  <option>MPV</option>
                  <option>Hatchback</option>
                </select>
              </div>
              <Link
                href="/cars"
                className="gold-btn"
                style={{ whiteSpace: "nowrap", alignSelf: "flex-end" }}
              >
                Check Availability
              </Link>
            </div>
          </section>
        </section>

        <section className="fleet-section scroll-animate">
          <div className="fleet-section-inner">
            <header className="fleet-head">
              <div>
                <div className="section-label">Our Fleet</div>
                <h2 className="section-title">Choose Your Ride</h2>
              </div>
              <Link
                href="/cars"
                className="ghost-btn"
                style={{ padding: ".6rem 1.3rem", fontSize: ".82rem" }}
              >
                View All →
              </Link>
            </header>

            <div className="fleet-grid-shell">
              <div className="fleet-grid">
                {FLEET.map((car) => (
                  <article
                    key={car.id}
                    className={`car-card-v2${activeCard === car.id ? " active" : ""}`}
                    onMouseEnter={() => setActiveCard(car.id)}
                    onMouseLeave={() => setActiveCard(null)}
                  >
                    <div className="car-card-v2-img">
                      {CAR_IMAGES[car.name] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={CAR_IMAGES[car.name]}
                          alt={`${car.name} for car rental in Bohol`}
                        />
                      ) : (
                        <div className="car-img-placeholder">
                          <span>{car.name.slice(0, 3).toUpperCase()}</span>
                        </div>
                      )}
                      <span className="type-badge">{car.type}</span>
                      <span
                        className="color-swatch"
                        style={{ background: car.colorHex }}
                        title={car.color}
                      />
                    </div>

                    <section className="car-card-v2-body">
                      <p className="car-card-v2-name">{car.name}</p>
                      <div className="car-card-v2-meta">
                        <span>🪑 {car.seats} Seats</span>
                        <span>🎨 {car.color}</span>
                      </div>
                      <div className="card-divider" />
                      <div className="car-card-v2-footer">
                        <div className="car-price-v2">
                          <strong>₱{car.price.toLocaleString()}</strong>
                          <small>per day</small>
                        </div>
                        <Link href={`/cars/${car.id}`} className="book-btn-v2">
                          Book Now
                        </Link>
                      </div>
                    </section>
                  </article>
                ))}
              </div>
              <div className="fleet-teaser-cue">View All →</div>
            </div>
          </div>
        </section>

        <section className="why-section-wrap scroll-animate">
          <div
            className="page-section"
            style={{ paddingTop: "5rem", paddingBottom: "5rem" }}
          >
            <div className="section-label">Why Choose Us</div>
            <h2 className="section-title">Island-Ready. People-First.</h2>
            <p
              style={{
                color: "var(--text3)",
                marginTop: ".6rem",
                fontSize: ".9rem",
                maxWidth: 420,
                lineHeight: 1.65,
              }}
            >
              We&apos;re not just a rental - we&apos;re your local travel
              partner in Bohol.
            </p>

            <div className="why-grid">
              {WHY_US.map((item, i) => (
                <article key={i} className="why-card-v2">
                  <span className="why-icon">{item.icon}</span>
                  <p className="why-title-v2">{item.title}</p>
                  <p className="why-desc">{item.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="cta-strip scroll-animate">
          <h2>Ready to Hit the Road?</h2>
          <p>
            Browse our fleet and book your vehicle in minutes - no hassle, no
            hidden fees.
          </p>
          <Link href="/cars" className="gold-btn">
            View All Vehicles →
          </Link>
        </section>

        <section className="contact-section scroll-animate">
          <div className="section-label">Find Us</div>
          <h2 className="section-title">Get In Touch</h2>

          <div className="contact-grid">
            <div>
              <p
                style={{
                  color: "var(--text3)",
                  fontSize: ".88rem",
                  fontStyle: "italic",
                  marginBottom: "1.5rem",
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
                <div key={c.label} className="contact-detail-row">
                  <div className="contact-icon-box">{c.icon}</div>
                  <div>
                    <p className="contact-detail-label">{c.label}</p>
                    <p className="contact-detail-val">{c.value}</p>
                  </div>
                </div>
              ))}

              <a
                href="tel:09274549343"
                className="gold-btn"
                style={{ display: "inline-flex", marginTop: "2rem" }}
              >
                📞 Call Now
              </a>
            </div>

            <div className="map-placeholder">
              <span className="map-emoji">🗺️</span>
              <strong>Tabalong, Dauis, Bohol</strong>
              <small>Google Map will be embedded here</small>
            </div>
          </div>
        </section>

        <footer className="footer-v2">
          <div className="footer-brand">CF Udtohan-Bagotchay</div>
          <div className="footer-sub">
            Travel &amp; Tours Services · Purok 7, Tabalong, Dauis, Bohol ·
            09274 549 343
          </div>
          <div className="footer-copy">
            © 2025 CF Udtohan-Bagotchay Travel and Tours Services. All rights
            reserved.
          </div>
        </footer>
      </main>
    </>
  );
}
