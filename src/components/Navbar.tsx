"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const path = usePathname();

  return (
    <nav className="nav">
      <Link href="/" className="nav-logo">
        <div className="nav-badge">CF</div>
        <div className="nav-logo-text">
          <strong>CF Udtohan-Bagotchay</strong>
          <span>Travel &amp; Tours Services · Bohol</span>
        </div>
      </Link>

      <ul className="nav-links">
        {[
          { href: "/cars", label: "Fleet" },
          { href: "/#tours", label: "Tours" },
          { href: "/contact", label: "Contact" },
        ].map((l) => (
          <li key={l.href}>
            <Link
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
          </li>
        ))}
      </ul>

      <Link
        href="/cars"
        className="gold-btn"
        style={{ padding: ".5rem 1.25rem", fontSize: ".72rem" }}
      >
        Book Now
      </Link>
    </nav>
  );
}
