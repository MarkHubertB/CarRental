export const BLOCKING_BOOKING_STATUSES = ["pending", "confirmed"] as const;

const PENDING_HOLD_MS = 24 * 60 * 60 * 1000;

const VEHICLE_TYPE_ALIASES: Record<string, string[]> = {
  sedan: ["sedan", "hatchback"],
  suv: ["suv", "mpv"],
  van: ["van"],
};

export function getPendingExpiresAt(now = new Date()) {
  return new Date(now.getTime() + PENDING_HOLD_MS).toISOString();
}

export function isActiveBlockingBooking(
  status: string | null | undefined,
  expiresAt: string | null | undefined,
  now = new Date(),
) {
  if (status === "confirmed") {
    return true;
  }

  if (status !== "pending") {
    return false;
  }

  if (!expiresAt) {
    return true;
  }

  const expiry = new Date(expiresAt);

  if (Number.isNaN(expiry.getTime())) {
    return true;
  }

  return expiry > now;
}

export function parseDateOnly(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function formatDateOnly(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function eachDateInRange(startDate: string, endDate: string) {
  const dates: string[] = [];
  const cursor = parseDateOnly(startDate);
  const end = parseDateOnly(endDate);

  if (Number.isNaN(cursor.getTime()) || Number.isNaN(end.getTime())) {
    return dates;
  }

  while (cursor <= end) {
    dates.push(formatDateOnly(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
}

export function normalizeVehiclePreference(value: string | null | undefined) {
  const normalized = value?.trim().toLowerCase();

  if (!normalized || normalized === "no preference") {
    return null;
  }

  return normalized;
}

export function vehicleTypeMatchesPreference(
  vehicleType: string | null | undefined,
  vehiclePreference: string | null,
) {
  if (!vehiclePreference) {
    return true;
  }

  const normalizedType = vehicleType?.trim().toLowerCase();

  if (!normalizedType) {
    return false;
  }

  const acceptedTypes = VEHICLE_TYPE_ALIASES[vehiclePreference] ?? [
    vehiclePreference,
  ];

  return acceptedTypes.includes(normalizedType);
}
