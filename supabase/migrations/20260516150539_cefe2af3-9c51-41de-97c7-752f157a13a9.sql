
-- ============ site_settings ============
create table if not exists public.site_settings (
  id text primary key default 'singleton',
  website_name text not null default 'VURALOGISTICS',
  website_tagline text not null default 'Fast, reliable, global logistics — delivered.',
  footer_text text not null default '© VURALOGISTICS. All rights reserved.',

  main_logo_url text,
  dark_logo_url text,
  light_logo_url text,
  favicon_url text,
  pdf_logo_url text,

  primary_color text not null default '#0F1B3D',
  secondary_color text not null default '#F1F5F9',
  accent_color text not null default '#F59E0B',
  button_color text not null default '#F59E0B',
  text_color text not null default '#0F172A',

  email text not null default 'hello@vuralogistics.com',
  phone text not null default '+234 800 000 0000',
  whatsapp text not null default '+234 800 000 0000',
  address text not null default '1 Vura Plaza, Lagos, Nigeria',
  social_facebook text default '',
  social_twitter text default '',
  social_instagram text default '',
  social_linkedin text default '',
  google_map_embed text default '',

  tracking_prefix text not null default 'VURA',
  default_status text not null default 'Pending',
  default_payment_status text not null default 'unpaid',
  default_delivery_note text not null default 'Estimated 3-7 business days',

  pdf_title text not null default 'Shipment Tracking Report',
  pdf_footer_note text not null default 'Thank you for choosing VURALOGISTICS.',
  pdf_terms text not null default 'This document is computer generated and serves as proof of shipment tracking. All shipments are handled per VURALOGISTICS terms and conditions. For questions contact support.',
  pdf_show_sender boolean not null default true,
  pdf_show_receiver_email boolean not null default true,
  pdf_show_payment_status boolean not null default true,
  pdf_show_company_address boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint singleton_row check (id = 'singleton')
);

alter table public.site_settings enable row level security;

drop policy if exists "public_read_settings" on public.site_settings;
create policy "public_read_settings" on public.site_settings for select using (true);

drop policy if exists "super_admin_update_settings" on public.site_settings;
create policy "super_admin_update_settings" on public.site_settings for update
  using (has_role(auth.uid(), 'super_admin'))
  with check (has_role(auth.uid(), 'super_admin'));

drop policy if exists "super_admin_insert_settings" on public.site_settings;
create policy "super_admin_insert_settings" on public.site_settings for insert
  with check (has_role(auth.uid(), 'super_admin'));

create trigger trg_site_settings_touch
  before update on public.site_settings
  for each row execute function public.touch_updated_at();

-- Seed singleton row
insert into public.site_settings (id) values ('singleton') on conflict do nothing;

-- ============ staff_permissions ============
create table if not exists public.staff_permissions (
  user_id uuid primary key,
  can_view_shipments boolean not null default true,
  can_create_shipments boolean not null default false,
  can_edit_shipments boolean not null default false,
  can_delete_shipments boolean not null default false,
  can_update_location boolean not null default false,
  can_view_settings boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.staff_permissions enable row level security;

drop policy if exists "view_own_or_super" on public.staff_permissions;
create policy "view_own_or_super" on public.staff_permissions for select
  using (auth.uid() = user_id or has_role(auth.uid(), 'super_admin'));

drop policy if exists "super_admin_manage_perms" on public.staff_permissions;
create policy "super_admin_manage_perms" on public.staff_permissions for all
  using (has_role(auth.uid(), 'super_admin'))
  with check (has_role(auth.uid(), 'super_admin'));

create trigger trg_staff_perms_touch
  before update on public.staff_permissions
  for each row execute function public.touch_updated_at();

-- ============ generate_tracking_number uses settings prefix ============
create or replace function public.generate_tracking_number()
returns text language plpgsql as $$
declare
  candidate text;
  pfx text;
begin
  select coalesce(tracking_prefix, 'VURA') into pfx from public.site_settings where id = 'singleton';
  if pfx is null or length(trim(pfx)) = 0 then pfx := 'VURA'; end if;
  loop
    candidate := pfx || '-' || extract(year from now())::text || '-' || lpad(floor(random()*900000+100000)::text, 6, '0');
    exit when not exists (select 1 from public.shipments where tracking_number = candidate);
  end loop;
  return candidate;
end $$;

-- ============ branding storage bucket ============
insert into storage.buckets (id, name, public)
values ('branding', 'branding', true)
on conflict (id) do nothing;

drop policy if exists "branding_public_read" on storage.objects;
create policy "branding_public_read" on storage.objects for select
  using (bucket_id = 'branding');

drop policy if exists "branding_admin_insert" on storage.objects;
create policy "branding_admin_insert" on storage.objects for insert
  with check (bucket_id = 'branding' and is_admin(auth.uid()));

drop policy if exists "branding_admin_update" on storage.objects;
create policy "branding_admin_update" on storage.objects for update
  using (bucket_id = 'branding' and is_admin(auth.uid()));

drop policy if exists "branding_admin_delete" on storage.objects;
create policy "branding_admin_delete" on storage.objects for delete
  using (bucket_id = 'branding' and is_admin(auth.uid()));
