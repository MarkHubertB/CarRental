import { Resend } from "resend";
import { TOUR_PACKAGES } from "@/lib/tours";

const OWNER_EMAIL = "boctulanm@gmail.com";
const FROM_EMAIL = "CF Udtohan Bagotchay <onboarding@resend.dev>";
const SITE_NAME = "CF Udtohan-Bagotchay Travel & Tours";
const BUSINESS_PHONE = "09274549343";
const BUSINESS_ADDRESS = "Purok 7, Tabalong, Dauis, Bohol";

// Get the site URL for email links — falls back to env var or provides warning
function getSiteUrl() {
  const url = process.env.NEXT_PUBLIC_SITE_URL;
  if (!url) {
    console.warn(
      "[email] NEXT_PUBLIC_SITE_URL is not set — admin panel links will be broken.",
    );
    return "https://your-domain.com"; // Fallback, won't work but prevents undefined
  }
  return url;
}

// Lazy getter — only creates Resend client when an email is actually sent.
// If RESEND_API_KEY is missing, emails fail silently without crashing the module.
function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("[email] RESEND_API_KEY is not set — emails will be skipped.");
    return null;
  }
  return new Resend(key);
}

export type CustomerBookingEmailDetails = {
  id: string | number;
  customerName?: string | null;
  customerEmail?: string | null;
  bookingType: "car" | "tour";
  itemName: string;
  startLabel: string;
  startDate?: string | null;
  endLabel?: string;
  endDate?: string | null;
  pickupLocation?: string | null;
  price?: number | null;
  priceLabel?: string | null;
  passengerCount?: number | null;
  vehiclePreference?: string | null;
  notes?: string | null;
};

type CarBookingEmailRow = {
  id: string | number;
  customer_name?: string | null;
  customer_email?: string | null;
  customer_phone?: string | null;
  car_id?: string | null;
  pickup_date?: string | null;
  return_date?: string | null;
  pickup_location?: string | null;
  total_price?: number | null;
  notes?: string | null;
  cars?: {
    name?: string | null;
    brand?: string | null;
    model?: string | null;
  } | null;
};

type TourBookingEmailRow = {
  id: string | number;
  full_name?: string | null;
  contact_number?: string | null;
  email?: string | null;
  customer_email?: string | null;
  travel_date?: string | null;
  package_name?: string | null;
  num_passengers?: number | null;
  pickup_location?: string | null;
  vehicle_type?: string | null;
  special_requests?: string | null;
  price_label?: string | null;
};

function escapeHtml(value: string | number | null | undefined) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatBookingId(id: string | number) {
  return String(id).slice(0, 8).toUpperCase();
}

function getFirstName(name?: string | null) {
  return name?.trim().split(/\s+/)[0] || "there";
}

function getCarDisplayName(booking: CarBookingEmailRow) {
  const car = booking.cars;
  const name =
    car?.name ||
    [car?.brand, car?.model].filter(Boolean).join(" ").trim() ||
    booking.car_id;

  return name || "Selected vehicle";
}

function getTourPriceLabel(packageName?: string | null) {
  if (!packageName) {
    return null;
  }

  const tour = TOUR_PACKAGES.find((item) => item.name === packageName);
  return tour?.pricing ?? tour?.priceSummary ?? null;
}

export function carBookingToCustomerEmailDetails(
  booking: CarBookingEmailRow,
): CustomerBookingEmailDetails {
  return {
    id: booking.id,
    customerName: booking.customer_name,
    customerEmail: booking.customer_email,
    bookingType: "car",
    itemName: getCarDisplayName(booking),
    startLabel: "Pickup Date",
    startDate: booking.pickup_date,
    endLabel: "Return Date",
    endDate: booking.return_date,
    pickupLocation: booking.pickup_location,
    price: booking.total_price,
    notes: booking.notes,
  };
}

export function tourBookingToCustomerEmailDetails(
  booking: TourBookingEmailRow,
): CustomerBookingEmailDetails {
  return {
    id: booking.id,
    customerName: booking.full_name,
    customerEmail: booking.customer_email ?? booking.email,
    bookingType: "tour",
    itemName: booking.package_name || "Bohol tour",
    startLabel: "Travel Date",
    startDate: booking.travel_date,
    pickupLocation: booking.pickup_location,
    priceLabel: booking.price_label ?? getTourPriceLabel(booking.package_name),
    passengerCount: booking.num_passengers,
    vehiclePreference: booking.vehicle_type,
    notes: booking.special_requests,
  };
}

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-PH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatPrice(price: number) {
  return `₱${Number(price || 0).toLocaleString("en-PH")}`;
}

// ─── EMAIL 1: Notify owner when a new booking is submitted ───────────────────
export async function sendOwnerBookingNotification(booking: {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  car_id: string;
  pickup_date: string;
  return_date: string;
  pickup_location: string;
  total_price: number;
  notes?: string;
}) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Booking</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Georgia',serif;color:#e8dcc8;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">

    <!-- Header -->
    <div style="text-align:center;padding-bottom:32px;border-bottom:1px solid rgba(212,175,55,0.2);">
      <div style="display:inline-block;width:48px;height:48px;border:1px solid rgba(212,175,55,0.4);border-radius:50%;line-height:48px;text-align:center;background:rgba(212,175,55,0.06);margin-bottom:16px;">
        <span style="color:#D4AF37;font-size:20px;">✦</span>
      </div>
      <div style="color:#D4AF37;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;">
        ${SITE_NAME}
      </div>
    </div>

    <!-- Title -->
    <div style="padding:32px 0 24px;text-align:center;">
      <div style="display:inline-block;background:rgba(234,179,8,0.1);border:1px solid rgba(234,179,8,0.3);border-radius:3px;padding:6px 16px;color:#fde047;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:16px;">
        New Booking Received
      </div>
      <h1 style="margin:0;color:#f0e6c0;font-size:24px;font-weight:400;letter-spacing:0.05em;">
        ${booking.customer_name} just booked a car
      </h1>
      <p style="color:rgba(212,175,55,0.5);font-size:12px;letter-spacing:0.1em;margin:8px 0 0;">
        Booking ID: ${booking.id.slice(0, 8).toUpperCase()}
      </p>
    </div>

    <!-- Booking Details Card -->
    <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(212,175,55,0.15);border-radius:4px;overflow:hidden;margin-bottom:24px;">
      <div style="background:rgba(212,175,55,0.05);padding:12px 20px;border-bottom:1px solid rgba(212,175,55,0.1);">
        <span style="color:#D4AF37;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;">Booking Details</span>
      </div>
      <div style="padding:20px;">
        ${[
          ["Car", booking.car_id.toUpperCase()],
          ["Pickup Date", formatDate(booking.pickup_date)],
          ["Return Date", formatDate(booking.return_date)],
          ["Pickup Location", booking.pickup_location],
          ["Total Price", formatPrice(booking.total_price)],
          ["Notes", booking.notes || "None"],
        ]
          .map(
            ([label, value]) => `
          <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid rgba(212,175,55,0.06);">
            <span style="color:rgba(212,175,55,0.5);font-size:11px;letter-spacing:0.15em;text-transform:uppercase;">${label}</span>
            <span style="color:#f0e6c0;font-size:13px;text-align:right;max-width:60%;">${value}</span>
          </div>
        `,
          )
          .join("")}
      </div>
    </div>

    <!-- Customer Details Card -->
    <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(212,175,55,0.15);border-radius:4px;overflow:hidden;margin-bottom:32px;">
      <div style="background:rgba(212,175,55,0.05);padding:12px 20px;border-bottom:1px solid rgba(212,175,55,0.1);">
        <span style="color:#D4AF37;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;">Customer Info</span>
      </div>
      <div style="padding:20px;">
        ${[
          ["Name", booking.customer_name],
          ["Email", booking.customer_email],
          ["Phone", booking.customer_phone],
        ]
          .map(
            ([label, value]) => `
          <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid rgba(212,175,55,0.06);">
            <span style="color:rgba(212,175,55,0.5);font-size:11px;letter-spacing:0.15em;text-transform:uppercase;">${label}</span>
            <span style="color:#f0e6c0;font-size:13px;">${value}</span>
          </div>
        `,
          )
          .join("")}
      </div>
    </div>

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:40px;">
      <p style="color:rgba(212,175,55,0.5);font-size:12px;margin-bottom:16px;">
        Log in to your admin panel to confirm or manage this booking.
      </p>
      <a href="${getSiteUrl()}/admin/dashboard"
         style="display:inline-block;background:linear-gradient(135deg,#D4AF37,#B8860B);color:#0a0a0a;text-decoration:none;padding:12px 32px;border-radius:3px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;font-weight:600;">
        View in Admin Panel
      </a>
    </div>

    <!-- Footer -->
    <div style="text-align:center;border-top:1px solid rgba(212,175,55,0.1);padding-top:24px;">
      <p style="color:rgba(212,175,55,0.25);font-size:10px;letter-spacing:0.1em;margin:0;">
        ${SITE_NAME} · Dauis, Bohol · Auto-generated notification
      </p>
    </div>

  </div>
</body>
</html>
  `;

  const resend = getResend();
  if (!resend) return { success: false, error: "No API key" };

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: OWNER_EMAIL,
      subject: `🚗 New Booking — ${booking.customer_name} · ${formatPrice(booking.total_price)}`,
      html,
    });
    if (error) console.error("Owner email error:", error);
    return { success: !error, data, error };
  } catch (err) {
    console.error("Owner email failed:", err);
    return { success: false, error: err };
  }
}

// ─── EMAIL 2: Notify customer when booking is confirmed ──────────────────────
export async function sendCustomerConfirmationEmail(booking: {
  id: string;
  customer_name: string;
  customer_email: string;
  car_id: string;
  pickup_date: string;
  return_date: string;
  pickup_location: string;
  total_price: number;
  notes?: string;
}) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Booking Confirmed</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Georgia',serif;color:#e8dcc8;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">

    <!-- Header -->
    <div style="text-align:center;padding-bottom:32px;border-bottom:1px solid rgba(212,175,55,0.2);">
      <div style="display:inline-block;width:48px;height:48px;border:1px solid rgba(212,175,55,0.4);border-radius:50%;line-height:48px;text-align:center;background:rgba(212,175,55,0.06);margin-bottom:16px;">
        <span style="color:#D4AF37;font-size:20px;">✦</span>
      </div>
      <div style="color:#D4AF37;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;">
        ${SITE_NAME}
      </div>
    </div>

    <!-- Confirmation Banner -->
    <div style="text-align:center;padding:40px 0 32px;">
      <div style="width:64px;height:64px;border:2px solid rgba(34,197,94,0.5);border-radius:50%;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;background:rgba(34,197,94,0.08);">
        <span style="color:#86efac;font-size:28px;line-height:64px;display:block;">✓</span>
      </div>
      <div style="display:inline-block;background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.3);border-radius:3px;padding:6px 16px;color:#86efac;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:16px;">
        Booking Confirmed
      </div>
      <h1 style="margin:0 0 12px;color:#f0e6c0;font-size:26px;font-weight:400;">
        Your ride is locked in, ${booking.customer_name.split(" ")[0]}!
      </h1>
      <p style="color:rgba(212,175,55,0.5);font-size:13px;line-height:1.6;margin:0;">
        We've confirmed your booking. See the details below and we'll<br/>
        see you on <strong style="color:#D4AF37;">${formatDate(booking.pickup_date)}</strong>.
      </p>
    </div>

    <!-- Booking Summary -->
    <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(212,175,55,0.15);border-radius:4px;overflow:hidden;margin-bottom:24px;position:relative;">
      <div style="position:absolute;top:0;left:20%;right:20%;height:1px;background:linear-gradient(90deg,transparent,rgba(212,175,55,0.5),transparent);"></div>
      <div style="background:rgba(212,175,55,0.05);padding:12px 20px;border-bottom:1px solid rgba(212,175,55,0.1);">
        <span style="color:#D4AF37;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;">Your Booking Summary</span>
      </div>
      <div style="padding:20px;">
        ${[
          ["Booking ID", booking.id.slice(0, 8).toUpperCase()],
          ["Car", booking.car_id.toUpperCase()],
          ["Pickup Date", formatDate(booking.pickup_date)],
          ["Return Date", formatDate(booking.return_date)],
          ["Pickup Location", booking.pickup_location],
          ["Total Amount", formatPrice(booking.total_price)],
        ]
          .map(
            ([label, value]) => `
          <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid rgba(212,175,55,0.06);">
            <span style="color:rgba(212,175,55,0.5);font-size:11px;letter-spacing:0.15em;text-transform:uppercase;">${label}</span>
            <span style="color:#f0e6c0;font-size:13px;text-align:right;max-width:60%;">${value}</span>
          </div>
        `,
          )
          .join("")}
      </div>
    </div>

    <!-- Info Box -->
    <div style="background:rgba(212,175,55,0.04);border:1px solid rgba(212,175,55,0.12);border-radius:4px;padding:20px;margin-bottom:32px;">
      <p style="margin:0 0 8px;color:#D4AF37;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;">What's next?</p>
      <ul style="margin:0;padding-left:16px;color:rgba(212,175,55,0.6);font-size:13px;line-height:1.8;">
        <li>We will contact you to coordinate the exact pickup details.</li>
        <li>Please have a valid ID ready on the day of pickup.</li>
        <li>Keep your Booking ID <strong style="color:#D4AF37;">${booking.id.slice(0, 8).toUpperCase()}</strong> for reference.</li>
        <li>For questions, reach us at <a href="mailto:${OWNER_EMAIL}" style="color:#D4AF37;">${OWNER_EMAIL}</a></li>
      </ul>
    </div>

    <!-- Footer -->
    <div style="text-align:center;border-top:1px solid rgba(212,175,55,0.1);padding-top:24px;">
      <p style="color:rgba(212,175,55,0.4);font-size:12px;margin:0 0 8px;">
        Thank you for choosing ${SITE_NAME}
      </p>
      <p style="color:rgba(212,175,55,0.2);font-size:10px;letter-spacing:0.1em;margin:0;">
        Dauis, Bohol, Philippines
      </p>
    </div>

  </div>
</body>
</html>
  `;

  const resend = getResend();
  if (!resend) return { success: false, error: "No API key" };

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: booking.customer_email,
      subject: `✅ Booking Confirmed — ${SITE_NAME}`,
      html,
    });
    if (error) console.error("Customer email error:", error);
    return { success: !error, data, error };
  } catch (err) {
    console.error("Customer email failed:", err);
    return { success: false, error: err };
  }
}

type CustomerEmailContent = {
  title: string;
  eyebrow: string;
  intro: string;
  accentColor: string;
  boxTitle: string;
  boxText: string;
  ctaLabel?: string;
  ctaHref?: string;
};

function getPriceDisplay(details: CustomerBookingEmailDetails) {
  if (details.priceLabel) {
    return details.priceLabel;
  }

  if (typeof details.price === "number") {
    return formatPrice(details.price);
  }

  if (details.bookingType === "tour") {
    return "To be confirmed";
  }

  return null;
}

function renderCustomerBookingRows(details: CustomerBookingEmailDetails) {
  const rows: Array<[string, string | number | null | undefined]> = [
    ["Booking ID", formatBookingId(details.id)],
    [details.bookingType === "tour" ? "Tour" : "Vehicle", details.itemName],
    [
      details.startLabel,
      details.startDate ? formatDate(details.startDate) : null,
    ],
    [
      details.endLabel ?? "",
      details.endDate ? formatDate(details.endDate) : null,
    ],
    ["Pickup Location", details.pickupLocation],
    ["Passengers", details.passengerCount],
    ["Vehicle Preference", details.vehiclePreference],
    ["Price", getPriceDisplay(details)],
    ["Notes", details.notes],
  ];

  return rows
    .filter(([label, value]) => label && value !== null && value !== undefined && value !== "")
    .map(
      ([label, value]) => `
        <div style="display:flex;justify-content:space-between;gap:16px;padding:10px 0;border-bottom:1px solid rgba(212,175,55,0.08);">
          <span style="color:rgba(212,175,55,0.58);font-size:11px;letter-spacing:0.13em;text-transform:uppercase;">${escapeHtml(label)}</span>
          <span style="color:#f0e6c0;font-size:13px;text-align:right;max-width:62%;line-height:1.45;">${escapeHtml(value)}</span>
        </div>
      `,
    )
    .join("");
}

function buildCustomerBookingEmailHtml(
  details: CustomerBookingEmailDetails,
  content: CustomerEmailContent,
) {
  const siteUrl = getSiteUrl();
  const ctaHref = content.ctaHref ?? siteUrl;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(content.title)}</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Georgia,serif;color:#e8dcc8;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;padding-bottom:28px;border-bottom:1px solid rgba(212,175,55,0.2);">
      <div style="color:#D4AF37;font-size:11px;letter-spacing:0.24em;text-transform:uppercase;">${SITE_NAME}</div>
      <p style="margin:10px 0 0;color:rgba(212,175,55,0.48);font-size:12px;">Bohol car rental and private tours</p>
    </div>

    <div style="padding:34px 0 28px;text-align:center;">
      <div style="display:inline-block;background:rgba(212,175,55,0.08);border:1px solid rgba(212,175,55,0.25);border-radius:3px;padding:6px 14px;color:${content.accentColor};font-size:11px;letter-spacing:0.18em;text-transform:uppercase;margin-bottom:16px;">
        ${escapeHtml(content.eyebrow)}
      </div>
      <h1 style="margin:0 0 12px;color:#f0e6c0;font-size:26px;font-weight:400;line-height:1.25;">
        ${escapeHtml(content.title)}
      </h1>
      <p style="color:rgba(232,220,200,0.72);font-size:14px;line-height:1.65;margin:0;">
        Hi ${escapeHtml(getFirstName(details.customerName))}, ${escapeHtml(content.intro)}
      </p>
    </div>

    <div style="background:rgba(255,255,255,0.025);border:1px solid rgba(212,175,55,0.16);border-radius:4px;overflow:hidden;margin-bottom:22px;">
      <div style="background:rgba(212,175,55,0.055);padding:12px 20px;border-bottom:1px solid rgba(212,175,55,0.1);">
        <span style="color:#D4AF37;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;">Booking Details</span>
      </div>
      <div style="padding:20px;">
        ${renderCustomerBookingRows(details)}
      </div>
    </div>

    <div style="background:rgba(212,175,55,0.045);border:1px solid rgba(212,175,55,0.14);border-radius:4px;padding:20px;margin-bottom:28px;">
      <p style="margin:0 0 8px;color:#D4AF37;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;">${escapeHtml(content.boxTitle)}</p>
      <p style="margin:0;color:rgba(232,220,200,0.76);font-size:13px;line-height:1.7;">${escapeHtml(content.boxText)}</p>
    </div>

    <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(212,175,55,0.12);border-radius:4px;padding:18px;margin-bottom:30px;">
      <p style="margin:0 0 10px;color:#D4AF37;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;">Business Contact</p>
      <p style="margin:0 0 6px;color:rgba(232,220,200,0.78);font-size:13px;">Phone: <a href="tel:${BUSINESS_PHONE}" style="color:#D4AF37;">${BUSINESS_PHONE}</a></p>
      <p style="margin:0 0 6px;color:rgba(232,220,200,0.78);font-size:13px;">Email: <a href="mailto:${OWNER_EMAIL}" style="color:#D4AF37;">${OWNER_EMAIL}</a></p>
      <p style="margin:0;color:rgba(232,220,200,0.78);font-size:13px;">Address: ${BUSINESS_ADDRESS}</p>
    </div>

    ${
      content.ctaLabel
        ? `<div style="text-align:center;margin-bottom:34px;">
            <a href="${escapeHtml(ctaHref)}" style="display:inline-block;background:linear-gradient(135deg,#D4AF37,#B8860B);color:#0a0a0a;text-decoration:none;padding:12px 28px;border-radius:3px;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;font-weight:700;">
              ${escapeHtml(content.ctaLabel)}
            </a>
          </div>`
        : ""
    }

    <div style="text-align:center;border-top:1px solid rgba(212,175,55,0.1);padding-top:22px;">
      <p style="color:rgba(212,175,55,0.42);font-size:12px;margin:0 0 8px;">Thank you for choosing ${SITE_NAME}</p>
      <p style="color:rgba(212,175,55,0.24);font-size:10px;letter-spacing:0.1em;margin:0;">Dauis, Bohol, Philippines</p>
    </div>
  </div>
</body>
</html>
`;
}

async function sendCustomerBookingEmail(
  details: CustomerBookingEmailDetails,
  subject: string,
  content: CustomerEmailContent,
) {
  const to = details.customerEmail?.trim();

  if (!to) {
    return { success: false, error: "No customer email" };
  }

  const resend = getResend();
  if (!resend) return { success: false, error: "No API key" };

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html: buildCustomerBookingEmailHtml(details, content),
    });

    if (error) console.error("Customer booking email error:", error);
    return { success: !error, data, error };
  } catch (err) {
    console.error("Customer booking email failed:", err);
    return { success: false, error: err };
  }
}

export async function sendCustomerBookingRequestEmail(
  details: CustomerBookingEmailDetails,
) {
  return sendCustomerBookingEmail(
    details,
    `Booking request received - ${SITE_NAME}`,
    {
      title: "Booking Request Received",
      eyebrow: "Pending Review",
      intro:
        "we received your booking request. We will confirm your booking shortly.",
      accentColor: "#fde047",
      boxTitle: "What happens next",
      boxText:
        "Our team will review the schedule and contact you soon with confirmation details for your Bohol trip.",
      ctaLabel: "Visit Website",
    },
  );
}

export async function sendCustomerBookingConfirmedEmail(
  details: CustomerBookingEmailDetails,
) {
  return sendCustomerBookingEmail(
    details,
    `Your booking is confirmed - ${SITE_NAME}`,
    {
      title: "Your Booking Is Confirmed!",
      eyebrow: "Confirmed",
      intro:
        "your Bohol travel booking is confirmed. Please review the details below and contact us if anything needs to change.",
      accentColor: "#86efac",
      boxTitle: "Pickup and coordination",
      boxText:
        "We will coordinate pickup details with you before the scheduled date. Please keep your Booking ID handy for reference.",
    },
  );
}

export async function sendCustomerBookingCancelledEmail(
  details: CustomerBookingEmailDetails,
) {
  return sendCustomerBookingEmail(
    details,
    `Booking cancelled - ${SITE_NAME}`,
    {
      title: "Unfortunately Your Booking Has Been Cancelled",
      eyebrow: "Cancelled",
      intro:
        "we are sorry, but this booking has been cancelled. We apologize for the inconvenience.",
      accentColor: "#fca5a5",
      boxTitle: "You can rebook anytime",
      boxText:
        "We would still be happy to help with your Bohol travel plans. Please visit the website to submit a new booking request.",
      ctaLabel: "Rebook on Website",
      ctaHref: getSiteUrl(),
    },
  );
}

export async function sendCustomerBookingExpiredEmail(
  details: CustomerBookingEmailDetails,
) {
  return sendCustomerBookingEmail(
    details,
    `Booking request expired - ${SITE_NAME}`,
    {
      title: "Your Booking Request Has Expired",
      eyebrow: "Expired",
      intro:
        "your booking request has expired because pending bookings are held for 24 hours while awaiting confirmation.",
      accentColor: "#cbd5e1",
      boxTitle: "Send a new request",
      boxText:
        "If you still need a car rental or private tour in Bohol, please rebook through the website and we will review the new request.",
      ctaLabel: "Book Again",
      ctaHref: getSiteUrl(),
    },
  );
}
