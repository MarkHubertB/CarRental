# Booking Availability System - Database Schema & Implementation Guide

## Overview
This document describes the database schema required for the booking availability system and includes SQL migration scripts.

---

## Current Schema (Already Existing)

### `bookings` table
```sql
CREATE TABLE bookings (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  car_id TEXT NOT NULL REFERENCES cars(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  pickup_date DATE NOT NULL,
  return_date DATE NOT NULL,
  pickup_location TEXT,
  total_price DECIMAL(10, 2),
  status TEXT DEFAULT 'pending', -- pending | confirmed | cancelled | completed
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT valid_dates CHECK (return_date >= pickup_date)
);

CREATE INDEX bookings_car_id_status_idx ON bookings(car_id, status);
CREATE INDEX bookings_dates_idx ON bookings(pickup_date, return_date);
```

### `tour_bookings` table
```sql
CREATE TABLE tour_bookings (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  full_name TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  email TEXT,
  travel_date DATE NOT NULL,
  package_name TEXT NOT NULL,
  num_passengers INT NOT NULL,
  pickup_location TEXT,
  vehicle_type TEXT,
  special_requests TEXT,
  status TEXT DEFAULT 'pending', -- pending | confirmed | cancelled | completed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX tour_bookings_status_idx ON tour_bookings(status);
CREATE INDEX tour_bookings_travel_date_idx ON tour_bookings(travel_date);
```

### `cars` table
```sql
CREATE TABLE cars (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  year INT,
  type TEXT, -- van | suv | mpv | hatchback
  color TEXT,
  transmission TEXT,
  seats INT,
  price_per_day DECIMAL(10, 2),
  status TEXT DEFAULT 'available', -- available | rented | maintenance
  image_urls TEXT[], -- array of image URLs
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

---

## Optional Schema Enhancements

### For Future: Enhanced Tour Bookings with Vehicle Assignment
If you want tour bookings to track which specific vehicle is assigned, add this migration:

```sql
-- Add vehicle_id and time fields to tour_bookings
ALTER TABLE tour_bookings
ADD COLUMN vehicle_id TEXT,
ADD COLUMN start_time TIME,
ADD COLUMN end_time TIME,
ADD CONSTRAINT tour_bookings_vehicle_fk FOREIGN KEY (vehicle_id) REFERENCES cars(id);

-- Add index for availability checks
CREATE INDEX tour_bookings_vehicle_dates_idx ON tour_bookings(vehicle_id, travel_date, status);
```

### For Future: Availability Calendar Table (Optimization)
For high-traffic applications, consider a denormalized availability calendar:

```sql
CREATE TABLE vehicle_availability_cache (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  vehicle_id TEXT NOT NULL REFERENCES cars(id),
  date DATE NOT NULL,
  is_available BOOLEAN DEFAULT true,
  conflict_source TEXT, -- 'booking' | 'tour' | null
  conflict_id TEXT,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(vehicle_id, date)
);

CREATE INDEX vehicle_availability_cache_vehicle_date_idx 
  ON vehicle_availability_cache(vehicle_id, date);
```

---

## Row Level Security (RLS) Policies

### Bookings Table
```sql
-- Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Public can INSERT bookings (for new bookings)
CREATE POLICY "Public can insert bookings" ON bookings
  FOR INSERT WITH CHECK (true);

-- Only admin can view all bookings (via service role)
-- Customers can only view their own (if needed)

-- Only admin can UPDATE/DELETE
CREATE POLICY "Only admin can update bookings" ON bookings
  FOR UPDATE USING (false); -- Restrict via app logic
```

### Tour Bookings Table
```sql
-- Enable RLS
ALTER TABLE tour_bookings ENABLE ROW LEVEL SECURITY;

-- Public can INSERT tour bookings
CREATE POLICY "Public can insert tour bookings" ON tour_bookings
  FOR INSERT WITH CHECK (true);

-- Only admin can view all tour bookings
```

---

## Availability Check Logic

The availability system checks for overlaps using this SQL condition:

```sql
-- Overlap detection for date ranges
-- A conflict exists if: existing.start_date <= requested.end_date 
--                   AND existing.end_date >= requested.start_date

SELECT * FROM bookings
WHERE car_id = ? 
  AND status IN ('confirmed', 'pending')
  AND pickup_date <= ?  -- requested end date
  AND return_date >= ?; -- requested start date
```

---

## Implementation Details

### Files Modified

1. **[src/lib/checkVehicleAvailability.ts](../lib/checkVehicleAvailability.ts)** ✓
   - Availability check utility
   - Queries both `bookings` and `tour_bookings` tables
   - Returns conflict details

2. **[src/app/api/bookings/check-availability/route.ts](../app/api/bookings/check-availability/route.ts)** ✓
   - POST endpoint for availability checks
   - Input: `{ vehicleId, startDate, endDate }`
   - Output: `{ available: boolean, reason: string, conflictSource: 'booking' | 'tour' }`

3. **[src/app/api/bookings/route.ts](../app/api/bookings/route.ts)** ✓
   - Updated to call availability check before booking
   - Returns 409 Conflict if unavailable

4. **[src/components/CarBookingPageClient.tsx](../components/CarBookingPageClient.tsx)** ✓
   - Added real-time availability checking on date selection
   - Disables submit button if unavailable
   - Shows availability status message

---

## API Endpoints

### Check Availability (NEW)
```
POST /api/bookings/check-availability

Request:
{
  "vehicleId": "car-123",
  "startDate": "2024-06-15",
  "endDate": "2024-06-17"
}

Response (Available):
{
  "available": true,
  "message": "Vehicle is available for the selected dates"
}

Response (Unavailable):
{
  "available": false,
  "reason": "This vehicle has an existing car rental booking during these dates...",
  "conflictSource": "booking" | "tour",
  "details": [...]
}
```

### Create Booking (UPDATED)
```
POST /api/bookings

Request:
{
  "car_id": "car-123",
  "pickup_date": "2024-06-15",
  "return_date": "2024-06-17",
  "pickup_location": "Dauis",
  "total_price": 3000,
  "customer_name": "Juan Dela Cruz",
  "customer_email": "juan@example.com",
  "customer_phone": "+63 912 345 6789",
  "notes": "Optional special requests"
}

Response (Conflict):
{
  "error": "This vehicle has an existing car rental booking...",
  "reason": "VEHICLE_UNAVAILABLE",
  "conflictSource": "booking" | "tour"
}

Response (Success):
{ id: "booking-123", ... }
```

---

## Frontend Implementation

### Availability Check Flow
1. User selects pickup and return dates
2. Component waits 500ms (debounce) then calls `/api/bookings/check-availability`
3. API returns availability status
4. UI updates:
   - ✓ Green message if available
   - ✗ Red message if unavailable
   - ⏳ "Checking..." while loading
5. Submit button is disabled/enabled based on status

### User Experience

**Available:**
```
[Form with dates selected]
✓ Vehicle is available for these dates
[Confirm Booking button - ENABLED]
```

**Unavailable:**
```
[Form with dates selected]
✗ This vehicle has an existing booking during these dates...
[Not Available for These Dates button - DISABLED]
```

---

## Deployment Checklist

- [ ] Run any required database migrations
- [ ] Ensure Supabase `bookings` table has indexes: `bookings_car_id_status_idx`, `bookings_dates_idx`
- [ ] Ensure Supabase `tour_bookings` table has index: `tour_bookings_travel_date_idx`
- [ ] Deploy updated API route: `src/app/api/bookings/check-availability/route.ts`
- [ ] Deploy updated booking API: `src/app/api/bookings/route.ts`
- [ ] Deploy updated component: `src/components/CarBookingPageClient.tsx`
- [ ] Deploy utility: `src/lib/checkVehicleAvailability.ts`
- [ ] Test availability check with overlapping dates
- [ ] Test booking creation (should fail if unavailable)
- [ ] Test tour booking overlap detection

---

## Testing

### Manual Test Cases

1. **Test Available Booking**
   - Book vehicle for dates with no conflicts
   - Should see green ✓ message
   - Confirm button should be enabled
   - Booking should succeed

2. **Test Unavailable (Booking Conflict)**
   - Create a booking for Jan 15-17
   - Try to book same vehicle for Jan 16-18
   - Should see red ✗ message about existing booking
   - Confirm button should be disabled
   - Booking should fail with 409 status

3. **Test Unavailable (Tour Conflict)**
   - Create a tour booking for Jan 15
   - Try to book vehicle for Jan 15-17
   - Should see red ✗ message about tour assignment
   - Booking should fail

4. **Test Availability Check API**
   ```bash
   curl -X POST http://localhost:3000/api/bookings/check-availability \
     -H "Content-Type: application/json" \
     -d '{
       "vehicleId": "car-123",
       "startDate": "2024-06-15",
       "endDate": "2024-06-17"
     }'
   ```

---

## Performance Notes

- Availability checks are debounced by 500ms on the frontend
- SQL queries use indexed columns for O(log n) performance
- For high-volume traffic, consider adding the availability cache table
- RLS policies are bypassed for booking creation (using admin client) - this is intentional for public bookings

---

## Future Enhancements

1. **Admin Dashboard Integration**
   - Show availability calendar for each vehicle
   - Block/unblock specific dates
   - Manual override for conflicts

2. **Email Notifications**
   - Notify admins when bookings conflict
   - Send confirmation with available alternatives

3. **Dynamic Pricing**
   - Adjust pricing based on availability
   - Premium rates for high-demand periods

4. **Tour Vehicle Assignment**
   - Auto-assign vehicles to tours
   - Track vehicle utilization
   - Prevent overbooking

---

## Support & Troubleshooting

### Common Issues

**Issue: Availability check always returns unavailable**
- Check that `tour_bookings` table exists
- Verify tour bookings have correct `travel_date` format (YYYY-MM-DD)
- Check browser console for API errors

**Issue: Bookings created despite conflicts**
- Ensure new booking API code was deployed
- Check that availability check is being called before insert

**Issue: False conflicts on tour dates**
- Tour conflicts currently only check date, not time
- If you need time-based conflicts, use the "Enhanced" schema above

---

Generated: 2024
