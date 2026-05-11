import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { ArrowLeft, Loader2, MapPin, Trash2, Save, History } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/shipments/$id")({
  component: ShipmentDetail,
});

const STATUSES = ["Pending","Order Created","Picked Up","In Transit","At Sorting Center","Out for Delivery","Delivered","Delayed","Cancelled"];

function ShipmentDetail() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const { isSuperAdmin } = useAuth();
  const [s, setS] = useState<any | null>(null);
  const [updates, setUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [upd, setUpd] = useState({ status: "", location: "", note: "" });

  useEffect(() => { load(); }, [id]);
  async function load() {
    setLoading(true);
    const [{ data: ship }, { data: ups }] = await Promise.all([
      supabase.from("shipments").select("*").eq("id", id).single(),
      supabase.from("shipment_updates").select("*").eq("shipment_id", id).order("created_at", { ascending: false }),
    ]);
    setS(ship);
    setUpdates(ups ?? []);
    setUpd({ status: ship?.status ?? "", location: ship?.current_location ?? "", note: "" });
    setLoading(false);
  }

  async function saveAll() {
    setSaving(true);
    const { error } = await supabase.from("shipments").update({
      sender_name: s.sender_name, sender_phone: s.sender_phone, sender_email: s.sender_email, sender_address: s.sender_address,
      receiver_name: s.receiver_name, receiver_phone: s.receiver_phone, receiver_email: s.receiver_email, receiver_address: s.receiver_address,
      package_name: s.package_name, package_type: s.package_type, package_weight: s.package_weight, package_quantity: s.package_quantity,
      pickup_location: s.pickup_location, delivery_location: s.delivery_location,
      estimated_delivery_date: s.estimated_delivery_date, delivery_fee: s.delivery_fee, payment_status: s.payment_status, note: s.note,
    }).eq("id", id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Shipment updated");
    load();
  }

  async function postUpdate() {
    if (!upd.status && !upd.location && !upd.note) return toast.error("Add status, location, or note");
    setSaving(true);
    // update shipment status/location which triggers history log automatically;
    // also insert an explicit note row if note provided.
    const patch: any = {};
    if (upd.status && upd.status !== s.status) patch.status = upd.status;
    if (upd.location && upd.location !== s.current_location) patch.current_location = upd.location;
    if (Object.keys(patch).length) {
      const { error } = await supabase.from("shipments").update(patch).eq("id", id);
      if (error) { setSaving(false); return toast.error(error.message); }
    }
    if (upd.note) {
      await supabase.from("shipment_updates").insert({
        shipment_id: id, status: upd.status || s.status, location: upd.location || s.current_location, note: upd.note,
      });
    }
    setSaving(false);
    toast.success("Update posted");
    setUpd({ ...upd, note: "" });
    load();
  }

  async function remove() {
    if (!confirm("Delete this shipment? This cannot be undone.")) return;
    const { error } = await supabase.from("shipments").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    nav({ to: "/admin/shipments" });
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-navy" /></div>;
  if (!s) return <div>Shipment not found.</div>;

  return (
    <div className="space-y-6">
      <Link to="/admin/shipments" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-navy">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Tracking</div>
          <h1 className="font-mono font-display text-2xl font-bold text-navy">{s.tracking_number}</h1>
          <span className="mt-2 inline-flex rounded-full bg-orange/10 px-3 py-1 text-xs font-semibold text-orange">{s.status}</span>
        </div>
        <div className="flex gap-2">
          {isSuperAdmin && (
            <button onClick={remove} className="inline-flex items-center gap-2 rounded-full border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm font-semibold text-destructive">
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h2 className="font-display text-base font-bold text-navy">Quick update</h2>
            <p className="text-xs text-muted-foreground">Change status, location, or add an admin note.</p>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div>
                <label className="text-xs font-medium text-navy">Status</label>
                <select value={upd.status} onChange={(e) => setUpd({ ...upd, status: e.target.value })} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                  {STATUSES.map((x) => <option key={x}>{x}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-navy">Current location</label>
                <input value={upd.location} onChange={(e) => setUpd({ ...upd, location: e.target.value })} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
              </div>
              <div className="md:col-span-3">
                <label className="text-xs font-medium text-navy">Admin note</label>
                <textarea rows={2} value={upd.note} onChange={(e) => setUpd({ ...upd, note: e.target.value })} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
              </div>
            </div>
            <button onClick={postUpdate} disabled={saving} className="mt-4 inline-flex items-center gap-2 rounded-full gradient-accent px-5 py-2.5 text-sm font-semibold text-primary disabled:opacity-60">
              <MapPin className="h-4 w-4" /> Post update
            </button>
          </div>

          <Editor s={s} setS={setS} />

          <div className="flex justify-end">
            <button onClick={saveAll} disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save changes
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="flex items-center gap-2 font-display text-base font-bold text-navy"><History className="h-4 w-4" /> History</h2>
          <ol className="mt-4 space-y-3">
            {updates.length === 0 && <li className="text-sm text-muted-foreground">No updates yet.</li>}
            {updates.map((u) => (
              <li key={u.id} className="rounded-lg border border-border p-3 text-sm">
                <div className="font-semibold text-navy">{u.status || "Update"}</div>
                {u.location && <div className="text-xs text-muted-foreground">{u.location}</div>}
                {u.note && <div className="mt-1 text-xs text-muted-foreground italic">"{u.note}"</div>}
                <div className="mt-1 text-[11px] text-muted-foreground">{new Date(u.created_at).toLocaleString()}</div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

function Editor({ s, setS }: { s: any; setS: (v: any) => void }) {
  const set = (k: string, v: any) => setS({ ...s, [k]: v });
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <h2 className="font-display text-base font-bold text-navy">Shipment details</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Field label="Sender name" value={s.sender_name} onChange={(v) => set("sender_name", v)} />
        <Field label="Sender phone" value={s.sender_phone} onChange={(v) => set("sender_phone", v)} />
        <Field label="Sender email" value={s.sender_email} onChange={(v) => set("sender_email", v)} />
        <Field label="Sender address" value={s.sender_address} onChange={(v) => set("sender_address", v)} />
        <Field label="Receiver name" value={s.receiver_name} onChange={(v) => set("receiver_name", v)} />
        <Field label="Receiver phone" value={s.receiver_phone} onChange={(v) => set("receiver_phone", v)} />
        <Field label="Receiver email" value={s.receiver_email} onChange={(v) => set("receiver_email", v)} />
        <Field label="Receiver address" value={s.receiver_address} onChange={(v) => set("receiver_address", v)} />
        <Field label="Package name" value={s.package_name} onChange={(v) => set("package_name", v)} />
        <Field label="Package type" value={s.package_type} onChange={(v) => set("package_type", v)} />
        <Field label="Weight" type="number" value={s.package_weight ?? ""} onChange={(v) => set("package_weight", v ? Number(v) : null)} />
        <Field label="Quantity" type="number" value={s.package_quantity ?? ""} onChange={(v) => set("package_quantity", v ? Number(v) : null)} />
        <Field label="Pickup location" value={s.pickup_location} onChange={(v) => set("pickup_location", v)} />
        <Field label="Delivery location" value={s.delivery_location} onChange={(v) => set("delivery_location", v)} />
        <Field label="Estimated delivery" type="date" value={s.estimated_delivery_date ?? ""} onChange={(v) => set("estimated_delivery_date", v || null)} />
        <Field label="Delivery fee" type="number" value={s.delivery_fee ?? ""} onChange={(v) => set("delivery_fee", v ? Number(v) : 0)} />
        <Field label="Payment status" value={s.payment_status} onChange={(v) => set("payment_status", v)} />
        <div className="md:col-span-2">
          <label className="text-sm font-medium text-navy">Note</label>
          <textarea rows={3} value={s.note ?? ""} onChange={(e) => set("note", e.target.value)} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
        </div>
      </div>
    </div>
  );
}
function Field({ label, value, onChange, type = "text" }: any) {
  return (
    <div>
      <label className="text-sm font-medium text-navy">{label}</label>
      <input type={type} value={value ?? ""} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-orange focus:outline-none" />
    </div>
  );
}
