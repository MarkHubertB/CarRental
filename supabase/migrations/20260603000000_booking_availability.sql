-- Booking availability schema.
-- This project uses public.cars as the vehicle table, so vehicle_id references cars(id).

alter table public.bookings
  add column if not exists vehicle_id text,
  add column if not exists start_datetime timestamptz,
  add column if not exists end_datetime timestamptz;

update public.bookings
set
  vehicle_id = coalesce(vehicle_id, car_id),
  start_datetime = coalesce(start_datetime, pickup_date::timestamptz),
  end_datetime = coalesce(
    end_datetime,
    (return_date::timestamp + interval '1 day')::timestamptz
  )
where
  vehicle_id is null
  or start_datetime is null
  or end_datetime is null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'bookings_vehicle_id_fkey'
  ) then
    alter table public.bookings
      add constraint bookings_vehicle_id_fkey
      foreign key (vehicle_id) references public.cars(id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'bookings_datetime_range_check'
  ) then
    alter table public.bookings
      add constraint bookings_datetime_range_check
      check (start_datetime < end_datetime);
  end if;
end $$;

create index if not exists bookings_vehicle_datetime_status_idx
  on public.bookings (vehicle_id, start_datetime, end_datetime, status);

create table if not exists public.tours (
  id uuid primary key default gen_random_uuid(),
  vehicle_id text not null references public.cars(id),
  tour_date date not null,
  start_time time not null,
  end_time time not null,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz not null default now(),
  check (start_time < end_time)
);

create index if not exists tours_vehicle_date_status_idx
  on public.tours (vehicle_id, tour_date, status);
