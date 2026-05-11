import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Package, Clock, Truck, CheckCircle2, XCircle, MapPin, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

interface Stats {
  total: number; pending: number; transit: number; delivered: number; cancelled: number;
}

function Dashboard() {
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, transit: 0, delivered: 0, cancelled: 0 });
  const [recent, setRecent] = useState<any[]>([]);
  const [updates, setUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);
  async function load() {
    setLoading(true);
    const [{ data: ships }, { data: ups }] = await Promise.all([
      supabase.from("shipments").select("*").order("created_at", { ascending: false }),
      supabase.from("shipment_updates").select("*, shipments(tracking_number)").order("created_at", { ascending: false }).limit(8),
    ]);
    const all = ships ?? [];
    setStats({
      total: all.length,
      pending: all.filter((s) => ["Pending", "Order Created"].includes(s.status)).length,
      transit: all.filter((s) => ["In Transit", "Picked Up", "At Sorting Center", "Out for Delivery"].includes(s.status)).length,
      delivered: all.filter((s) => s.status === "Delivered").length,
      cancelled: all.filter((s) => s.status === "Cancelled").length,
    });
    setRecent(all.slice(0, 6));
    setUpdates(ups ?? []);
    setLoading(false);
  }

  const cards = [
    { label: "Total Shipments", value: stats.total, icon: Package, color: "bg-navy text-white" },
    { label: "Pending", value: stats.pending, icon: Clock, color: "bg-amber-100 text-amber-900" },
    { label: "In Transit", value: stats.transit, icon: Truck, color: "bg-blue-100 text-blue-900" },
    { label: "Delivered", value: stats.delivered, icon: CheckCircle2, color: "bg-green-100 text-green-900" },
    { label: "Cancelled", value: stats.cancelled, icon: XCircle, color: "bg-red-100 text-red-900" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-navy">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of all shipments and recent activity.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">{c.label}</span>
              <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${c.color}`}>
                <c.icon className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3 font-display text-3xl font-bold text-navy">{loading ? "—" : c.value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-navy">Recent Shipments</h2>
            <Link to="/admin/shipments" className="text-xs font-medium text-orange">View all →</Link>
          </div>
          <div className="mt-4 divide-y divide-border">
            {recent.length === 0 && <p className="py-6 text-sm text-muted-foreground">No shipments yet.</p>}
            {recent.map((s) => (
              <Link key={s.id} to="/admin/shipments/$id" params={{ id: s.id }} className="flex items-center justify-between gap-3 py-3 hover:bg-secondary/50 -mx-2 px-2 rounded-lg">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-navy">{s.tracking_number}</div>
                  <div className="truncate text-xs text-muted-foreground">{s.sender_name} → {s.receiver_name}</div>
                </div>
                <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-navy">{s.status}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="font-display text-lg font-bold text-navy">Recent Tracking Updates</h2>
          <div className="mt-4 space-y-3">
            {updates.length === 0 && <p className="py-6 text-sm text-muted-foreground">No updates yet.</p>}
            {updates.map((u) => (
              <div key={u.id} className="flex items-start gap-3 rounded-lg border border-border p-3">
                <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg gradient-accent text-primary">
                  <MapPin className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-navy">{u.shipments?.tracking_number}</div>
                  <div className="text-xs text-muted-foreground">
                    {u.status} {u.location ? `· ${u.location}` : ""}
                  </div>
                  <div className="text-[11px] text-muted-foreground">{new Date(u.created_at).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <Link to="/admin/shipments/new" className="inline-flex items-center gap-2 rounded-full gradient-accent px-5 py-3 text-sm font-semibold text-primary">
          Create new shipment <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
