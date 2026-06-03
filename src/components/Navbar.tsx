"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function Navbar() {
  const path = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [path]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setIsMenuOpen(false);
    if (isMenuOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [isMenuOpen]);

  const navLinks = [
    { href: "/cars", label: "Fleet" },
    { href: "/#tours", label: "Tours" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <>
      <nav className="nav">
        {/* Logo */}
        <Link href="/" className="nav-logo">
          <div className="nav-badge">CF</div>
          <div className="nav-logo-text">
            <strong>My website</strong>
            <span>Travel &amp; Tours Services · Bohol</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <ul className="nav-links">
          {navLinks.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                style={{
                  color:
                    path === l.href ||
                    (l.href === "/#tours" && path === "/tours")
                      ? "var(--gold-light)"
                      : undefined,
                }}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile Menu Button + Book Now */}
        <div className="nav-mobile-menu">
          <button
            className="nav-menu-btn"
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            <span />
          </button>
          <Link
            href="/cars"
            className="gold-btn"
            style={{
              padding:
                "clamp(0.6rem, 2vw, 0.75rem) clamp(0.8rem, 2vw, 1.25rem)",
              fontSize: "clamp(0.65rem, 1vw, 0.72rem)",
            }}
          >
            Book Now
          </Link>
        </div>
      </nav>

      {/* Mobile Menu Panel */}
      <div
        className={`nav-mobile-menu-panel ${isMenuOpen ? "is-open" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        {navLinks.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            style={{
              color:
                path === l.href || (l.href === "/#tours" && path === "/tours")
                  ? "var(--gold-light)"
                  : undefined,
            }}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </>
  );
}
