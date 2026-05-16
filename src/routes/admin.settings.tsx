import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useSettings, SiteSettings, DEFAULT_SETTINGS } from "@/lib/settings";
import { toast } from "sonner";
import { Loader2, Save, Upload, ShieldAlert, Image as ImageIcon, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "Settings | VURALOGISTICS Admin" }] }),
  component: SettingsPage,
});

const TABS = [
  "General", "Logo", "Brand", "Contact", "Shipment", "PDF & Print", "Admin Profile", "Staff Access",
] as const;
type Tab = (typeof TABS)[number];

function SettingsPage() {
  const { isSuperAdmin, loading } = useAuth();
  const { settings, refresh } = useSettings();
  const [tab, setTab] = useState<Tab>("General");
  const [form, setForm] = useState<SiteSettings>(settings);
  const [saving, setSaving] = useState(false);

  useEffect(() => setForm(settings), [settings]);

  if (loading) return <Loader2 className="mx-auto mt-20 h-6 w-6 animate-spin text-navy" />;
  if (!isSuperAdmin) {
    return (
      <div className="rounded-2xl border border-border bg-card p-10 text-center shadow-card">
        <ShieldAlert className="mx-auto h-10 w-10 text-destructive" />
        <h2 className="mt-4 font-display text-xl font-bold text-navy">Super Admin only</h2>
        <p className="mt-2 text-sm text-muted-foreground">Only Super Admins can access settings.</p>
      </div>
    );
  }

  const update = <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function save(fields?: Partial<SiteSettings>) {
    setSaving(true);
    const payload = fields ? { ...fields } : form;
    const { error } = await supabase.from("site_settings").update(payload).eq("id", "singleton");
    setSaving(false);
    if (error) toast.error(error.message);
    else { toast.success("Settings saved"); await refresh(); }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-navy">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage branding, contact info, and PDF preferences.</p>
      </div>

      <div className="flex flex-wrap gap-2 rounded-2xl border border-border bg-card p-2 shadow-card">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              tab === t ? "bg-navy text-white" : "text-muted-foreground hover:bg-secondary"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
        {tab === "General" && <GeneralTab form={form} update={update} />}
        {tab === "Logo" && <LogoTab form={form} update={update} onUploaded={save} />}
        {tab === "Brand" && <BrandTab form={form} update={update} />}
        {tab === "Contact" && <ContactTab form={form} update={update} />}
        {tab === "Shipment" && <ShipmentTab form={form} update={update} />}
        {tab === "PDF & Print" && <PdfTab form={form} update={update} />}
        {tab === "Admin Profile" && <ProfileTab />}
        {tab === "Staff Access" && <StaffTab />}

        {!["Admin Profile", "Staff Access", "Logo"].includes(tab) && (
          <div className="mt-8 flex justify-end">
            <button
              onClick={() => save()}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full gradient-accent px-6 py-2.5 text-sm font-semibold text-primary disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ----------------------------- Reusable inputs ----------------------------- */
function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="text-sm font-medium text-navy">{label}</label>
      <div className="mt-1.5">{children}</div>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:border-orange focus:outline-none ${props.className ?? ""}`} />;
}
function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:border-orange focus:outline-none ${props.className ?? ""}`} />;
}
function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-border bg-secondary/40 px-4 py-3">
      <span className="text-sm font-medium text-navy">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition-colors ${checked ? "bg-orange" : "bg-muted"}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
      </button>
    </label>
  );
}

/* --------------------------------- Tabs ----------------------------------- */
function GeneralTab({ form, update }: { form: SiteSettings; update: <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) => void }) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <Field label="Website name"><Input value={form.website_name} onChange={(e) => update("website_name", e.target.value)} /></Field>
      <Field label="Website tagline"><Input value={form.website_tagline} onChange={(e) => update("website_tagline", e.target.value)} /></Field>
      <Field label="Website email"><Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} /></Field>
      <Field label="Website phone"><Input value={form.phone} onChange={(e) => update("phone", e.target.value)} /></Field>
      <Field label="WhatsApp number"><Input value={form.whatsapp} onChange={(e) => update("whatsapp", e.target.value)} /></Field>
      <Field label="Office address"><Input value={form.address} onChange={(e) => update("address", e.target.value)} /></Field>
      <div className="md:col-span-2">
        <Field label="Footer copyright text" hint="Use {year} as a placeholder for the current year.">
          <Input value={form.footer_text} onChange={(e) => update("footer_text", e.target.value)} />
        </Field>
      </div>
    </div>
  );
}

function LogoTab({ form, update, onUploaded }: {
  form: SiteSettings;
  update: <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) => void;
  onUploaded: (fields?: Partial<SiteSettings>) => Promise<void>;
}) {
  const items: Array<{ key: keyof SiteSettings; label: string; hint?: string }> = [
    { key: "main_logo_url", label: "Main website logo" },
    { key: "dark_logo_url", label: "Dark logo", hint: "Used on light backgrounds." },
    { key: "light_logo_url", label: "Light logo", hint: "Used on dark backgrounds (hero, footer)." },
    { key: "favicon_url", label: "Favicon", hint: "Square PNG / ICO recommended." },
    { key: "pdf_logo_url", label: "PDF / Print logo", hint: "Falls back to main logo if empty." },
  ];

  async function uploadFile(key: keyof SiteSettings, file: File) {
    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    if (!["png", "jpg", "jpeg", "svg", "webp", "ico"].includes(ext)) {
      toast.error("Allowed: PNG, JPG, JPEG, SVG, WEBP");
      return;
    }
    const path = `${String(key)}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("branding").upload(path, file, { upsert: true });
    if (error) return toast.error(error.message);
    const { data } = supabase.storage.from("branding").getPublicUrl(path);
    update(key, data.publicUrl);
    await onUploaded({ [key]: data.publicUrl } as Partial<SiteSettings>);
  }

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {items.map((it) => {
        const url = form[it.key] as string | null;
        return (
          <div key={String(it.key)} className="rounded-xl border border-border bg-secondary/30 p-4">
            <div className="text-sm font-semibold text-navy">{it.label}</div>
            {it.hint && <p className="text-xs text-muted-foreground">{it.hint}</p>}
            <div className="mt-3 flex h-24 items-center justify-center rounded-lg border border-dashed border-border bg-card">
              {url ? (
                <img src={url} alt={it.label} className="max-h-full max-w-full object-contain p-2" />
              ) : (
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div className="mt-3 flex gap-2">
              <label className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-navy px-3 py-2 text-xs font-semibold text-white">
                <Upload className="h-3.5 w-3.5" /> Upload
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg,.svg,.webp,.ico,image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadFile(it.key, f);
                    e.target.value = "";
                  }}
                />
              </label>
              {url && (
                <button
                  onClick={async () => {
                    update(it.key, null as never);
                    await onUploaded({ [it.key]: null } as Partial<SiteSettings>);
                  }}
                  className="inline-flex items-center justify-center rounded-lg bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BrandTab({ form, update }: { form: SiteSettings; update: <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) => void }) {
  const colors: Array<{ key: keyof SiteSettings; label: string }> = [
    { key: "primary_color", label: "Primary brand color" },
    { key: "secondary_color", label: "Secondary color" },
    { key: "accent_color", label: "Accent color" },
    { key: "button_color", label: "Button color" },
    { key: "text_color", label: "Text color" },
  ];
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {colors.map((c) => (
        <Field key={String(c.key)} label={c.label}>
          <div className="flex gap-2">
            <input
              type="color"
              value={(form[c.key] as string) || "#000000"}
              onChange={(e) => update(c.key, e.target.value as never)}
              className="h-11 w-14 cursor-pointer rounded-lg border border-input bg-background"
            />
            <Input value={(form[c.key] as string) || ""} onChange={(e) => update(c.key, e.target.value as never)} />
          </div>
        </Field>
      ))}
      <div className="md:col-span-2 rounded-xl border border-dashed border-border p-4 text-xs text-muted-foreground">
        Colors apply across the public website, admin dashboard, tracking page, and PDF.
      </div>
    </div>
  );
}

function ContactTab({ form, update }: { form: SiteSettings; update: <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) => void }) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <Field label="Company email"><Input value={form.email} onChange={(e) => update("email", e.target.value)} /></Field>
      <Field label="Phone"><Input value={form.phone} onChange={(e) => update("phone", e.target.value)} /></Field>
      <Field label="WhatsApp"><Input value={form.whatsapp} onChange={(e) => update("whatsapp", e.target.value)} /></Field>
      <Field label="Office address"><Input value={form.address} onChange={(e) => update("address", e.target.value)} /></Field>
      <Field label="Facebook URL"><Input value={form.social_facebook} onChange={(e) => update("social_facebook", e.target.value)} /></Field>
      <Field label="Twitter / X URL"><Input value={form.social_twitter} onChange={(e) => update("social_twitter", e.target.value)} /></Field>
      <Field label="Instagram URL"><Input value={form.social_instagram} onChange={(e) => update("social_instagram", e.target.value)} /></Field>
      <Field label="LinkedIn URL"><Input value={form.social_linkedin} onChange={(e) => update("social_linkedin", e.target.value)} /></Field>
      <div className="md:col-span-2">
        <Field label="Google map embed URL"><Input value={form.google_map_embed} onChange={(e) => update("google_map_embed", e.target.value)} /></Field>
      </div>
    </div>
  );
}

function ShipmentTab({ form, update }: { form: SiteSettings; update: <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) => void }) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <Field label="Tracking number prefix" hint={`Format: ${form.tracking_prefix || "VURA"}-YYYY-RANDOMNUMBER`}>
        <Input value={form.tracking_prefix} onChange={(e) => update("tracking_prefix", e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))} />
      </Field>
      <Field label="Default shipment status"><Input value={form.default_status} onChange={(e) => update("default_status", e.target.value)} /></Field>
      <Field label="Default payment status"><Input value={form.default_payment_status} onChange={(e) => update("default_payment_status", e.target.value)} /></Field>
      <Field label="Default estimated delivery note"><Input value={form.default_delivery_note} onChange={(e) => update("default_delivery_note", e.target.value)} /></Field>
      <div className="md:col-span-2">
        <Field label="Company terms shown on PDF">
          <Textarea rows={4} value={form.pdf_terms} onChange={(e) => update("pdf_terms", e.target.value)} />
        </Field>
      </div>
    </div>
  );
}

function PdfTab({ form, update }: { form: SiteSettings; update: <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) => void }) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <Field label="PDF document title"><Input value={form.pdf_title} onChange={(e) => update("pdf_title", e.target.value)} /></Field>
      <Field label="PDF footer note"><Input value={form.pdf_footer_note} onChange={(e) => update("pdf_footer_note", e.target.value)} /></Field>
      <div className="md:col-span-2">
        <Field label="PDF terms & conditions"><Textarea rows={4} value={form.pdf_terms} onChange={(e) => update("pdf_terms", e.target.value)} /></Field>
      </div>
      <Switch label="Show sender details on PDF" checked={form.pdf_show_sender} onChange={(v) => update("pdf_show_sender", v)} />
      <Switch label="Show receiver email on PDF" checked={form.pdf_show_receiver_email} onChange={(v) => update("pdf_show_receiver_email", v)} />
      <Switch label="Show payment status on PDF" checked={form.pdf_show_payment_status} onChange={(v) => update("pdf_show_payment_status", v)} />
      <Switch label="Show company address on PDF" checked={form.pdf_show_company_address} onChange={(v) => update("pdf_show_company_address", v)} />
    </div>
  );
}

function ProfileTab() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [busy, setBusy] = useState(false);
  const [cur, setCur] = useState(""); const [np, setNp] = useState(""); const [conf, setConf] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("name,email").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data) { setName(data.name || ""); setEmail(data.email || user.email || ""); }
    });
  }, [user]);

  async function saveProfile() {
    if (!user) return;
    setBusy(true);
    const { error } = await supabase.from("profiles").update({ name, email }).eq("id", user.id);
    setBusy(false);
    if (error) toast.error(error.message); else toast.success("Profile saved");
  }
  async function changePassword() {
    if (!user) return;
    if (np.length < 8) return toast.error("New password must be at least 8 characters");
    if (np !== conf) return toast.error("Passwords don't match");
    setBusy(true);
    const { error: re } = await supabase.auth.signInWithPassword({ email: user.email!, password: cur });
    if (re) { setBusy(false); return toast.error("Current password is incorrect"); }
    const { error } = await supabase.auth.updateUser({ password: np });
    setBusy(false);
    if (error) toast.error(error.message); else { toast.success("Password updated"); setCur(""); setNp(""); setConf(""); }
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Admin name"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="Admin email"><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
        <div className="md:col-span-2">
          <button onClick={saveProfile} disabled={busy} className="inline-flex items-center gap-2 rounded-full gradient-accent px-5 py-2.5 text-sm font-semibold text-primary disabled:opacity-60">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save profile
          </button>
        </div>
      </div>
      <div className="border-t border-border pt-6">
        <h3 className="font-display text-lg font-bold text-navy">Change password</h3>
        <div className="mt-4 grid gap-5 md:grid-cols-3">
          <Field label="Current password"><Input type="password" value={cur} onChange={(e) => setCur(e.target.value)} /></Field>
          <Field label="New password"><Input type="password" value={np} onChange={(e) => setNp(e.target.value)} /></Field>
          <Field label="Confirm new password"><Input type="password" value={conf} onChange={(e) => setConf(e.target.value)} /></Field>
        </div>
        <button onClick={changePassword} disabled={busy} className="mt-5 inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Update password
        </button>
      </div>
    </div>
  );
}

interface StaffRow {
  user_id: string;
  email?: string | null;
  name?: string | null;
  perms: {
    can_view_shipments: boolean;
    can_create_shipments: boolean;
    can_edit_shipments: boolean;
    can_delete_shipments: boolean;
    can_update_location: boolean;
    can_view_settings: boolean;
  };
}

function StaffTab() {
  const [rows, setRows] = useState<StaffRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);
  async function load() {
    setLoading(true);
    const { data: roles } = await supabase.from("user_roles").select("user_id, role").eq("role", "staff");
    const ids = (roles ?? []).map((r) => r.user_id);
    if (!ids.length) { setRows([]); setLoading(false); return; }
    const [{ data: profiles }, { data: perms }] = await Promise.all([
      supabase.from("profiles").select("id,name,email").in("id", ids),
      supabase.from("staff_permissions").select("*").in("user_id", ids),
    ]);
    const r: StaffRow[] = ids.map((uid) => {
      const p = perms?.find((x) => x.user_id === uid);
      const pr = profiles?.find((x) => x.id === uid);
      return {
        user_id: uid,
        email: pr?.email, name: pr?.name,
        perms: {
          can_view_shipments: p?.can_view_shipments ?? true,
          can_create_shipments: p?.can_create_shipments ?? false,
          can_edit_shipments: p?.can_edit_shipments ?? false,
          can_delete_shipments: p?.can_delete_shipments ?? false,
          can_update_location: p?.can_update_location ?? false,
          can_view_settings: p?.can_view_settings ?? false,
        },
      };
    });
    setRows(r); setLoading(false);
  }

  async function togglePerm(uid: string, key: keyof StaffRow["perms"], v: boolean) {
    setRows((rs) => rs.map((r) => r.user_id === uid ? { ...r, perms: { ...r.perms, [key]: v } } : r));
    const { error } = await supabase.from("staff_permissions").upsert({ user_id: uid, [key]: v } as never);
    if (error) toast.error(error.message);
  }

  if (loading) return <Loader2 className="mx-auto h-6 w-6 animate-spin text-navy" />;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Staff users are listed below. To add a new staff member, create their account from your authentication provider and assign the <code>staff</code> role.
      </p>
      {rows.length === 0 && (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No staff users yet.
        </div>
      )}
      {rows.map((r) => (
        <div key={r.user_id} className="rounded-2xl border border-border bg-secondary/30 p-5">
          <div className="font-semibold text-navy">{r.name || r.email || r.user_id}</div>
          <div className="text-xs text-muted-foreground">{r.email}</div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {(Object.keys(r.perms) as Array<keyof StaffRow["perms"]>).map((k) => (
              <Switch key={k} label={k.replace(/_/g, " ").replace(/^can /, "")} checked={r.perms[k]} onChange={(v) => togglePerm(r.user_id, k, v)} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

void DEFAULT_SETTINGS;
