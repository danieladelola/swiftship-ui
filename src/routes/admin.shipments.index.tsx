import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Search, PlusCircle, Eye, Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/shipments/")({
  component: ShipmentsList,
});

const STATUSES = ["All","Pending","Order Created","Picked Up","In Transit","At Sorting Center","Out for Delivery","Delivered","Delayed","Cancelled"];

function ShipmentsList() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All");

  useEffect(() => { load(); }, [status]);
  async function load() {
    setLoading(true);
    let query = supabase.from("shipments").select("*").order("created_at", { ascending: false });
    if (status !== "All") query = query.eq("status", status);
    const { data } = await query;
    setItems(data ?? []);
    setLoading(false);
  }

  const filtered = items.filter((s) =>
    !q || s.tracking_number.toLowerCase().includes(q.toLowerCase())
    || s.sender_name?.toLowerCase().includes(q.toLowerCase())
    || s.receiver_name?.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-navy">Shipments</h1>
          <p className="text-sm text-muted-foreground">Manage all shipments in your system.</p>
        </div>
        <Link to="/admin/shipments/new" className="inline-flex items-center gap-2 rounded-full gradient-accent px-5 py-2.5 text-sm font-semibold text-primary">
          <PlusCircle className="h-4 w-4" /> New Shipment
        </Link>
      </div>

      <div className="flex flex-wrap gap-3 rounded-2xl border border-border bg-card p-4 shadow-card">
        <div className="flex flex-1 min-w-[240px] items-center gap-2 rounded-lg bg-secondary px-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search tracking #, sender, receiver…"
            className="w-full bg-transparent py-2.5 text-sm focus:outline-none"
          />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm">
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Tracking #</th>
                <th className="px-4 py-3">Sender → Receiver</th>
                <th className="px-4 py-3">Route</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading && (
                <tr><td colSpan={6} className="px-4 py-12 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" /></td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No shipments found.</td></tr>
              )}
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-secondary/40">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-navy">{s.tracking_number}</td>
                  <td className="px-4 py-3"><div className="font-medium">{s.sender_name}</div><div className="text-xs text-muted-foreground">→ {s.receiver_name}</div></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{s.pickup_location} → {s.delivery_location}</td>
                  <td className="px-4 py-3"><span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-navy">{s.status}</span></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <Link to="/admin/shipments/$id" params={{ id: s.id }} className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-semibold text-navy hover:bg-muted">
                      <Eye className="h-3.5 w-3.5" /> Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
