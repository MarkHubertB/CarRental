import { Resend } from "resend";

const OWNER_EMAIL = "boctulanm@gmail.com";
const FROM_EMAIL = "CF Udtohan Bagotchay <onboarding@resend.dev>";
const SITE_NAME = "CF Udtohan-Bagotchay Travel & Tours";

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
