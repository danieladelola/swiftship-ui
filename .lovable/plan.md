## Goal
Add a complete Settings system to the existing VURALOGISTICS admin dashboard, make the site fully dynamic from database settings, and redesign the PDF/print output to look professional. Brand the site as **VURALOGISTICS** everywhere.

## Scope (no rebuild — additive only)
Keep all current routes, layouts, components, and design tokens. Only add the settings layer + rename + PDF/print redesign.

---

## 1. Database (single migration)

**New table `site_settings`** (single-row table, key `id = 'singleton'`):
- branding: `website_name`, `website_tagline`, `footer_text`
- logos: `main_logo_url`, `dark_logo_url`, `light_logo_url`, `favicon_url`, `pdf_logo_url`
- colors: `primary_color`, `secondary_color`, `accent_color`, `button_color`, `text_color`
- contact: `email`, `phone`, `whatsapp`, `address`, `social_facebook`, `social_twitter`, `social_instagram`, `social_linkedin`, `google_map_embed`
- shipment defaults: `tracking_prefix` (default `VURA`), `default_status`, `default_payment_status`, `default_delivery_note`
- PDF: `pdf_title`, `pdf_footer_note`, `pdf_terms`, `pdf_show_sender`, `pdf_show_receiver_email`, `pdf_show_payment_status`, `pdf_show_company_address`

Seed one row with defaults (`VURALOGISTICS`, `VURA`, etc.).

**New table `staff_permissions`** (one row per staff user):
- `user_id`, `can_view_shipments`, `can_create_shipments`, `can_edit_shipments`, `can_delete_shipments`, `can_update_location`, `can_view_settings`

**RLS policies**
- `site_settings`: public SELECT (only public-safe via a view? — keeping all columns public-readable since all are intended to surface on public pages); UPDATE only super_admin.
- `staff_permissions`: SELECT own row OR super_admin; ALL for super_admin.

**Storage bucket `branding`** (public): for logos/favicon. Insert/update/delete restricted to admins via storage policies.

**Update `generate_tracking_number()`** to read prefix from `site_settings`.

---

## 2. Settings provider (frontend)

- `src/lib/settings.tsx` — `SettingsProvider` fetches `site_settings` once on mount, exposes `useSettings()`. Applies brand colors as CSS variables on `:root` (overrides token defaults), updates `<title>` and favicon dynamically. Wrapped in `__root.tsx`.
- Fallback object with `VURALOGISTICS` defaults if fetch fails.

## 3. Admin Settings UI

New routes:
- `src/routes/admin.settings.tsx` — layout with horizontal tabs: General / Logo / Brand / Contact / Shipment / PDF & Print / Admin Profile / Staff Access
- One file per tab section (kept inside one route file for simplicity, using internal tab state). Gated to super_admin only — staff sees "Forbidden".

Each tab: form with current values, save button → updates `site_settings` row. Logo tab uses Supabase Storage upload (`branding` bucket) with preview, accepts png/jpg/jpeg/svg/webp.

Admin Profile tab: update name (in `profiles`), avatar (storage), and password (`supabase.auth.updateUser` after re-auth with current password via `signInWithPassword`).

Staff Access tab: list users with `staff` role, toggle permission switches in `staff_permissions`, create new staff (invite via admin email/password creation through an edge function `admin-create-staff`).

Add "Settings" link to admin sidebar in `src/routes/admin.tsx` (only show if super_admin).

## 4. Make existing UI dynamic

Replace hardcoded "Vura" / "Vura Logistics" with `settings.website_name`:
- `src/components/site-header.tsx`, `site-footer.tsx`, `contact-cta.tsx`
- `src/routes/admin.tsx` sidebar header
- `src/routes/admin.login.tsx`
- `src/routes/index.tsx` hero/SEO, `about.tsx`, `services.tsx`, `contact.tsx`, `track.tsx`
- Page `<title>` defaults in `__root.tsx`

Logo: header/footer/login/admin/tracking show `<img src={settings.main_logo_url}>` with text fallback.

Contact info on contact page + footer pulls from settings.

## 5. PDF redesign (`src/routes/track.tsx`)

Rewrite `handleDownloadPdf` using `jsPDF`:
- Header band in `primary_color` with logo (loaded as image), company name, doc title, generated date
- Right column: company email/phone/address
- Status summary card (rounded rect) — tracking #, status badge (color by status), current location, ETA
- Two-column sender/receiver section (respecting `pdf_show_sender` and `pdf_show_receiver_email`)
- Package details grid
- Timeline table with header row, alternating row backgrounds, columns: Date / Location / Status / Note
- Footer: footer note, terms (small), copyright line
- A4 size, proper margins, pagination if timeline overflows

Print: dedicated `<div id="print-report">` rendered hidden, shown only via `@media print`. Hides navbar/footer/buttons (already partially done — extend CSS). Same clean layout as PDF.

## 6. Files

**New**
- `supabase/migrations/<ts>_site_settings.sql`
- `src/lib/settings.tsx`
- `src/routes/admin.settings.tsx`
- `supabase/functions/admin-create-staff/index.ts`

**Edited**
- `src/routes/__root.tsx` (wrap SettingsProvider, dynamic title/favicon)
- `src/routes/admin.tsx` (sidebar + Settings link, dynamic name/logo)
- `src/routes/admin.login.tsx`, `admin.index.tsx`
- `src/routes/track.tsx` (PDF + print redesign, dynamic name)
- `src/routes/index.tsx`, `about.tsx`, `services.tsx`, `contact.tsx`
- `src/components/site-header.tsx`, `site-footer.tsx`, `contact-cta.tsx`

## 7. Testing checklist
Run through the 15-step flow from the request after each layer ships.

---

This is a large change (≈ 12 files + migration + edge function + storage bucket). Approving the plan kicks off the migration first, then the rest in one batch.
