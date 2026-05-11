import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/shipments/new")({
  component: NewShipment,
});

const STATUSES = ["Pending","Order Created","Picked Up","In Transit","At Sorting Center","Out for Delivery","Delivered","Delayed","Cancelled"];
const PAY = ["unpaid","paid","refunded"];

function NewShipment() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({
    tracking_number: "",
    sender_name: "", sender_phone: "", sender_email: "", sender_address: "",
    receiver_name: "", receiver_phone: "", receiver_email: "", receiver_address: "",
    package_name: "", package_type: "", package_weight: "", package_quantity: "1",
    pickup_location: "", delivery_location: "", current_location: "",
    status: "Pending", estimated_delivery_date: "", delivery_fee: "", payment_status: "unpaid",
    note: "",
  });
  const set = (k: string, v: string) => setF((x) => ({ ...x, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const payload: any = { ...f, created_by: user?.id };
    payload.package_weight = f.package_weight ? Number(f.package_weight) : null;
    payload.package_quantity = f.package_quantity ? Number(f.package_quantity) : 1;
    payload.delivery_fee = f.delivery_fee ? Number(f.delivery_fee) : 0;
    payload.estimated_delivery_date = f.estimated_delivery_date || null;
    if (!payload.tracking_number) delete payload.tracking_number;

    const { data, error } = await supabase.from("shipments").insert(payload).select().single();
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(`Shipment created: ${data.tracking_number}`);
    nav({ to: "/admin/shipments/$id", params: { id: data.id } });
  }

  return (
    <div className="space-y-6">
      <Link to="/admin/shipments" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-navy">
        <ArrowLeft className="h-4 w-4" /> Back to shipments
      </Link>
      <div>
        <h1 className="font-display text-3xl font-bold text-navy">Create shipment</h1>
        <p className="text-sm text-muted-foreground">Tracking number is auto-generated if left blank.</p>
      </div>

      <form onSubmit={submit} className="space-y-6">
        <Section title="Tracking">
          <Input label="Tracking number (optional)" value={f.tracking_number} onChange={(v) => set("tracking_number", v)} placeholder="auto-generated" />
        </Section>

        <Section title="Sender">
          <Input label="Name *" required value={f.sender_name} onChange={(v) => set("sender_name", v)} />
          <Input label="Phone" value={f.sender_phone} onChange={(v) => set("sender_phone", v)} />
          <Input label="Email" value={f.sender_email} onChange={(v) => set("sender_email", v)} type="email" />
          <Input label="Address" value={f.sender_address} onChange={(v) => set("sender_address", v)} className="md:col-span-2" />
        </Section>

        <Section title="Receiver">
          <Input label="Name *" required value={f.receiver_name} onChange={(v) => set("receiver_name", v)} />
          <Input label="Phone" value={f.receiver_phone} onChange={(v) => set("receiver_phone", v)} />
          <Input label="Email" value={f.receiver_email} onChange={(v) => set("receiver_email", v)} type="email" />
          <Input label="Address" value={f.receiver_address} onChange={(v) => set("receiver_address", v)} className="md:col-span-2" />
        </Section>

        <Section title="Package">
          <Input label="Package name" value={f.package_name} onChange={(v) => set("package_name", v)} />
          <Input label="Package type" value={f.package_type} onChange={(v) => set("package_type", v)} placeholder="Box, Envelope, Pallet…" />
          <Input label="Weight (kg)" type="number" value={f.package_weight} onChange={(v) => set("package_weight", v)} />
          <Input label="Quantity" type="number" value={f.package_quantity} onChange={(v) => set("package_quantity", v)} />
          <Input label="Pickup location" value={f.pickup_location} onChange={(v) => set("pickup_location", v)} />
          <Input label="Delivery location" value={f.delivery_location} onChange={(v) => set("delivery_location", v)} />
          <Input label="Current location" value={f.current_location} onChange={(v) => set("current_location", v)} className="md:col-span-2" />
        </Section>

        <Section title="Status & payment">
          <Select label="Status" value={f.status} onChange={(v) => set("status", v)} options={STATUSES} />
          <Input label="Estimated delivery date" type="date" value={f.estimated_delivery_date} onChange={(v) => set("estimated_delivery_date", v)} />
          <Input label="Delivery fee" type="number" value={f.delivery_fee} onChange={(v) => set("delivery_fee", v)} />
          <Select label="Payment status" value={f.payment_status} onChange={(v) => set("payment_status", v)} options={PAY} />
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-navy">Note</label>
            <textarea value={f.note} onChange={(e) => set("note", e.target.value)} rows={3} className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:border-orange focus:outline-none" />
          </div>
        </Section>

        <div className="flex justify-end gap-3">
          <Link to="/admin/shipments" className="rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold">Cancel</Link>
          <button disabled={busy} className="inline-flex items-center gap-2 rounded-full gradient-accent px-6 py-2.5 text-sm font-semibold text-primary disabled:opacity-60">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Create shipment
          </button>
        </div>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <h2 className="font-display text-base font-bold text-navy">{title}</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">{children}</div>
    </div>
  );
}
function Input({ label, value, onChange, type = "text", placeholder, required, className = "" }: any) {
  return (
    <div className={className}>
      <label className="text-sm font-medium text-navy">{label}</label>
      <input type={type} value={value} required={required} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:border-orange focus:outline-none" />
    </div>
  );
}
function Select({ label, value, onChange, options }: any) {
  return (
    <div>
      <label className="text-sm font-medium text-navy">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:border-orange focus:outline-none">
        {options.map((o: string) => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}
