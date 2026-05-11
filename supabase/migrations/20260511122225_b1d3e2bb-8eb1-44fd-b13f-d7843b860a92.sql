
-- 1. Roles
create type public.app_role as enum ('super_admin', 'staff');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id=_user_id and role=_role)
$$;

create or replace function public.is_admin(_user_id uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id=_user_id and role in ('super_admin','staff'))
$$;

-- profiles policies
create policy "users_view_own_profile" on public.profiles for select using (auth.uid() = id or public.is_admin(auth.uid()));
create policy "users_update_own_profile" on public.profiles for update using (auth.uid() = id);
create policy "users_insert_own_profile" on public.profiles for insert with check (auth.uid() = id);

-- user_roles policies
create policy "view_own_roles" on public.user_roles for select using (auth.uid() = user_id or public.has_role(auth.uid(),'super_admin'));
create policy "super_admin_manage_roles" on public.user_roles for all using (public.has_role(auth.uid(),'super_admin')) with check (public.has_role(auth.uid(),'super_admin'));

-- 2. Shipments
create table public.shipments (
  id uuid primary key default gen_random_uuid(),
  tracking_number text not null unique,
  sender_name text not null,
  sender_phone text,
  sender_email text,
  sender_address text,
  receiver_name text not null,
  receiver_phone text,
  receiver_email text,
  receiver_address text,
  package_name text,
  package_type text,
  package_weight numeric,
  package_quantity integer default 1,
  pickup_location text,
  delivery_location text,
  current_location text,
  status text not null default 'Pending',
  estimated_delivery_date date,
  delivery_fee numeric default 0,
  payment_status text default 'unpaid',
  note text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.shipments enable row level security;

create table public.shipment_updates (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments(id) on delete cascade,
  location text,
  status text,
  note text,
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
alter table public.shipment_updates enable row level security;

-- public can track shipments by tracking number
create policy "public_read_shipments" on public.shipments for select using (true);
create policy "public_read_shipment_updates" on public.shipment_updates for select using (true);

-- staff/admin write
create policy "admin_insert_shipments" on public.shipments for insert with check (public.is_admin(auth.uid()));
create policy "admin_update_shipments" on public.shipments for update using (public.is_admin(auth.uid()));
create policy "super_admin_delete_shipments" on public.shipments for delete using (public.has_role(auth.uid(),'super_admin'));

create policy "admin_insert_updates" on public.shipment_updates for insert with check (public.is_admin(auth.uid()));
create policy "admin_modify_updates" on public.shipment_updates for update using (public.is_admin(auth.uid()));
create policy "super_admin_delete_updates" on public.shipment_updates for delete using (public.has_role(auth.uid(),'super_admin'));

-- 3. Auto tracking number
create or replace function public.generate_tracking_number()
returns text language plpgsql as $$
declare
  candidate text;
begin
  loop
    candidate := 'VURA-' || extract(year from now())::text || '-' || lpad(floor(random()*900000+100000)::text, 6, '0');
    exit when not exists (select 1 from public.shipments where tracking_number = candidate);
  end loop;
  return candidate;
end $$;

create or replace function public.set_tracking_number()
returns trigger language plpgsql as $$
begin
  if new.tracking_number is null or length(trim(new.tracking_number)) = 0 then
    new.tracking_number := public.generate_tracking_number();
  end if;
  return new;
end $$;

create trigger trg_set_tracking_number before insert on public.shipments
for each row execute function public.set_tracking_number();

-- 4. updated_at trigger
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger trg_shipments_updated before update on public.shipments
for each row execute function public.touch_updated_at();
create trigger trg_profiles_updated before update on public.profiles
for each row execute function public.touch_updated_at();

-- 5. Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)))
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- 6. Auto-log shipment changes
create or replace function public.log_shipment_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (tg_op = 'INSERT') then
    insert into public.shipment_updates (shipment_id, status, location, note, updated_by)
    values (new.id, new.status, new.current_location, 'Shipment created', new.created_by);
  elsif (tg_op = 'UPDATE') then
    if new.status is distinct from old.status or new.current_location is distinct from old.current_location then
      insert into public.shipment_updates (shipment_id, status, location, note, updated_by)
      values (new.id, new.status, new.current_location, null, auth.uid());
    end if;
  end if;
  return new;
end $$;

create trigger trg_log_shipment_change after insert or update on public.shipments
for each row execute function public.log_shipment_change();
