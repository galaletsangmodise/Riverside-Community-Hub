
create type user_role as enum ('member', 'staff', 'admin');
create type membership_tier as enum ('free', 'standard', 'family');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  contact_info text,
  role user_role not null default 'member',
  membership_tier membership_tier not null default 'free',
  joined_at timestamptz not null default now()
);


create type resource_type as enum ('room', 'equipment');

create table resources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type resource_type not null,
  capacity int,
  description text
);


create type booking_status as enum ('pending', 'approved', 'rejected', 'cancelled');

create table bookings (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid not null references resources(id) on delete cascade,
  member_id uuid not null references profiles(id) on delete cascade,
  start_time timestamptz not null,
  end_time timestamptz not null,
  status booking_status not null default 'pending',
  created_at timestamptz not null default now(),
  constraint valid_range check (end_time > start_time)
);


create extension if not exists btree_gist;
alter table bookings add constraint no_overlapping_bookings
  exclude using gist (
    resource_id with =,
    tstzrange(start_time, end_time) with &&
  ) where (status in ('pending', 'approved'));


create table campaigns (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  goal_amount numeric(10,2) not null,
  current_amount numeric(10,2) not null default 0,
  active boolean not null default true
);


create table donations (
  id uuid primary key default gen_random_uuid(),
  donor_id uuid references profiles(id) on delete set null,
  campaign_id uuid not null references campaigns(id),
  amount numeric(10,2) not null check (amount > 0),
  is_recurring_pledge boolean not null default false,
  created_at timestamptz not null default now()
);


create or replace function update_campaign_total()
returns trigger as $$
begin
  update campaigns
  set current_amount = current_amount + new.amount
  where id = new.campaign_id;
  return new;
end;
$$ language plpgsql;

create trigger on_donation_insert
  after insert on donations
  for each row execute function update_campaign_total();