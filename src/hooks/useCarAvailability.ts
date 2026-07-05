import { useState, useEffect, useMemo } from 'react';

export type AvailabilityStatus = 'unchecked' | 'checking' | 'available' | 'unavailable';

interface UseCarAvailabilityProps {
  carId: string;
  pickupDate: string;
  returnDate: string;
  bookedDateRanges: { from: string; to: string; source: string }[];
}

export function useCarAvailability({
  carId,
  pickupDate,
  returnDate,
  bookedDateRanges,
}: UseCarAvailabilityProps) {
  const [status, setStatus] = useState<AvailabilityStatus>('unchecked');
  const [message, setMessage] = useState<string>('');

  const parseDateOnly = (value: string) => {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const rangeOverlapsBookedRange = (
    selectedRange: { from: Date; to: Date },
    bookedRange: { from: Date; to: Date },
  ) => {
    return selectedRange.from <= bookedRange.to && bookedRange.from <= selectedRange.to;
  };

  const bookedCalendarRanges = useMemo(
    () =>
      bookedDateRanges.map((range) => ({
        from: parseDateOnly(range.from),
        to: parseDateOnly(range.to),
        source: range.source,
      })),
    [bookedDateRanges],
  );

  const selectedRangeOverlapsBooked = useMemo(() => {
    if (!pickupDate || !returnDate) return false;
    const from = parseDateOnly(pickupDate);
    const to = parseDateOnly(returnDate);
    return bookedCalendarRanges.some((bookedRange) =>
      rangeOverlapsBookedRange({ from, to }, bookedRange),
    );
  }, [bookedCalendarRanges, pickupDate, returnDate]);

  useEffect(() => {
    if (!pickupDate || !returnDate || !carId) return;
    if (new Date(returnDate) < new Date(pickupDate)) return;
    if (selectedRangeOverlapsBooked) return;

    const endDate = new Date(`${returnDate}T00:00:00`);
    endDate.setDate(endDate.getDate() + 1);

    const checkAvailability = async () => {
      setStatus('checking');
      try {
        const response = await fetch('/api/bookings/check-availability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vehicleId: carId,
            startDatetime: `${pickupDate}T00:00:00`,
            endDatetime: endDate.toISOString(),
          }),
        });

        const data = await response.json();

        if (data.available) {
          setStatus('available');
          setMessage('Vehicle is available for these dates');
        } else {
          setStatus('unavailable');
          setMessage(data.reason || 'Not available for selected dates');
        }
      } catch (err) {
        console.error('Availability check failed:', err);
        setStatus('unchecked');
        setMessage('Could not verify availability');
      }
    };

    const debounceTimer = setTimeout(checkAvailability, 500);
    return () => clearTimeout(debounceTimer);
  }, [pickupDate, returnDate, carId, selectedRangeOverlapsBooked]);

  return {
    status,
    message,
    setStatus,
    setMessage,
    selectedRangeOverlapsBooked,
  };
}
