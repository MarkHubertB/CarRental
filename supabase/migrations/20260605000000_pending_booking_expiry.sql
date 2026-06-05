-- Add 24-hour expiry support for pending car and tour bookings.

alter table public.bookings
  add column if not exists expires_at timestamptz;

alter table public.tour_bookings
  add column if not exists expires_at timestamptz,
  add column if not exists vehicle_id text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'tour_bookings_vehicle_fk'
  ) then
    alter table public.tour_bookings
      add constraint tour_bookings_vehicle_fk
      foreign key (vehicle_id) references public.cars(id);
  end if;
end $$;

do $$
declare
  constraint_name text;
begin
  for constraint_name in
    select conname
    from pg_constraint
    where conrelid = 'public.bookings'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%status%'
  loop
    execute format('alter table public.bookings drop constraint %I', constraint_name);
  end loop;
end $$;

alter table public.bookings
  add constraint bookings_status_check
  check (status in ('pending', 'confirmed', 'cancelled', 'completed', 'expired'));

do $$
declare
  constraint_name text;
begin
  for constraint_name in
    select conname
    from pg_constraint
    where conrelid = 'public.tour_bookings'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%status%'
  loop
    execute format('alter table public.tour_bookings drop constraint %I', constraint_name);
  end loop;
end $$;

alter table public.tour_bookings
  add constraint tour_bookings_status_check
  check (status in ('pending', 'confirmed', 'cancelled', 'completed', 'expired'));

update public.bookings
set expires_at = created_at + interval '24 hours'
where status = 'pending'
  and expires_at is null;

update public.tour_bookings
set expires_at = created_at + interval '24 hours'
where status = 'pending'
  and expires_at is null;

create or replace function public.set_pending_booking_expiry()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'pending' and new.expires_at is null then
    new.expires_at := coalesce(new.created_at, now()) + interval '24 hours';
  end if;

  return new;
end;
$$;

drop trigger if exists set_bookings_pending_expiry on public.bookings;
create trigger set_bookings_pending_expiry
before insert or update of status on public.bookings
for each row
execute function public.set_pending_booking_expiry();

drop trigger if exists set_tour_bookings_pending_expiry on public.tour_bookings;
create trigger set_tour_bookings_pending_expiry
before insert or update of status on public.tour_bookings
for each row
execute function public.set_pending_booking_expiry();

create index if not exists bookings_status_expires_at_idx
  on public.bookings (status, expires_at);

create index if not exists tour_bookings_status_expires_at_idx
  on public.tour_bookings (status, expires_at);

create index if not exists tour_bookings_vehicle_date_status_idx
  on public.tour_bookings (vehicle_id, travel_date, status);
