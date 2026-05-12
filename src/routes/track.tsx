import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";
import {
  Search, PackageSearch, Package, Truck, PackageCheck, MapPin,
  CheckCircle2, Clock, User, Loader2, AlertCircle, Printer, Download, CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";

type TrackSearch = { tracking?: string };

export const Route = createFileRoute("/track")({
  validateSearch: (s: Record<string, unknown>): TrackSearch => ({
    tracking: typeof s.tracking === "string" && s.tracking.trim()
      ? s.tracking.trim()
      : typeof s.id === "string" && s.id.trim()
      ? s.id.trim()
      : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Track Your Shipment | Vura Logistics" },
      { name: "description", content: "Track your shipment in real-time. Live status, location, and ETA." },
    ],
  }),
  component: TrackPage,
});

function statusIcon(status: string) {
  if (/delivered/i.test(status)) return PackageCheck;
  if (/transit|out for|picked|sorting/i.test(status)) return Truck;
  return Package;
}

function TrackPage() {
  useScrollReveal();
  const { tracking: urlTracking } = Route.useSearch();
  const navigate = useNavigate({ from: "/track" });

  const [input, setInput] = useState(urlTracking ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shipment, setShipment] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  const runSearch = useCallback(async (value: string) => {
    const tn = value.trim();
    if (!tn) return;
    setLoading(true); setError(null); setShipment(null); setHistory([]);
    const { data, error: err } = await supabase
      .from("shipments").select("*").ilike("tracking_number", tn).maybeSingle();
    if (err || !data) {
      setError(`Tracking number "${tn}" not found. Please check and try again.`);
      setLoading(false);
      return;
    }
    const { data: ups } = await supabase
      .from("shipment_updates").select("*").eq("shipment_id", data.id)
      .order("created_at", { ascending: true });
    setShipment(data);
    setHistory(ups ?? []);
    setLoading(false);
  }, []);

  // React to URL ?tracking= changes — auto-fill + auto-fetch
  useEffect(() => {
    if (urlTracking) {
      setInput(urlTracking);
      runSearch(urlTracking);
    } else {
      setShipment(null);
      setHistory([]);
      setError(null);
      setLoading(false);
    }
  }, [urlTracking, runSearch]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const tn = input.trim();
    if (!tn) { setError("Please enter a tracking number."); return; }
    if (tn === urlTracking) {
      // same query — just refetch
      runSearch(tn);
    } else {
      navigate({ search: { tracking: tn }, replace: false });
    }
  }


  function handlePrint() {
    window.print();
  }

  function handleDownloadPdf() {
    if (!shipment) return;
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    let y = 50;

    // Header
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageW, 80, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("VURA LOGISTICS", 40, 40);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Shipment Tracking Report", 40, 58);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageW - 40, 58, { align: "right" });
    y = 110;

    // Tracking + status
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(`Tracking #: ${shipment.tracking_number}`, 40, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(220, 120, 30);
    doc.text(`Status: ${shipment.status}`, 40, y + 18);
    doc.setTextColor(60, 60, 60);
    doc.text(`Current Location: ${shipment.current_location || "—"}`, 40, y + 34);
    y += 60;

    const section = (title: string) => {
      doc.setFont("helvetica", "bold"); doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text(title, 40, y);
      doc.setDrawColor(220);
      doc.line(40, y + 4, pageW - 40, y + 4);
      y += 18;
      doc.setFont("helvetica", "normal"); doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
    };
    const row = (k: string, v?: string | number | null) => {
      if (y > 760) { doc.addPage(); y = 50; }
      doc.setFont("helvetica", "bold"); doc.text(`${k}:`, 40, y);
      doc.setFont("helvetica", "normal");
      const text = String(v ?? "—");
      const lines = doc.splitTextToSize(text, pageW - 180);
      doc.text(lines, 150, y);
      y += 14 * lines.length;
    };

    section("Sender");
    row("Name", shipment.sender_name);
    row("Phone", shipment.sender_phone);
    row("Email", shipment.sender_email);
    row("Address", shipment.sender_address);
    y += 8;

    section("Receiver");
    row("Name", shipment.receiver_name);
    row("Phone", shipment.receiver_phone);
    row("Email", shipment.receiver_email);
    row("Address", shipment.receiver_address);
    y += 8;

    section("Package");
    row("Name", shipment.package_name);
    row("Type", shipment.package_type);
    row("Weight", shipment.package_weight ? `${shipment.package_weight} kg` : null);
    row("Quantity", shipment.package_quantity);
    y += 8;

    section("Route");
    row("Pickup", shipment.pickup_location);
    row("Delivery", shipment.delivery_location);
    row("Estimated Delivery", shipment.estimated_delivery_date);
    y += 8;

    section("Shipment History");
    if (!history.length) {
      row("—", "No updates yet");
    } else {
      history.forEach((u) => {
        if (y > 760) { doc.addPage(); y = 50; }
        doc.setFont("helvetica", "bold");
        doc.text(`• ${u.status || "Update"}${u.location ? ` — ${u.location}` : ""}`, 40, y);
        y += 13;
        doc.setFont("helvetica", "normal");
        doc.text(new Date(u.created_at).toLocaleString(), 52, y);
        y += 13;
        if (u.note) {
          const lines = doc.splitTextToSize(`Note: ${u.note}`, pageW - 100);
          doc.text(lines, 52, y);
          y += 13 * lines.length;
        }
        y += 4;
      });
    }

    doc.save(`${shipment.tracking_number}.pdf`);
  }

  const latestNote = [...history].reverse().find((u) => u.note)?.note || shipment?.note;

  return (
    <div className="min-h-screen bg-background">
      <div className="print:hidden"><SiteHeader /></div>

      <section className="bg-secondary px-6 py-20 lg:px-10 print:hidden">
        <div className="mx-auto max-w-4xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-orange">Track Shipment</span>
          <h1 className="mt-3 font-display text-5xl font-bold leading-tight text-navy md:text-6xl">
            Where's my package?
          </h1>
          <p className="mt-4 text-muted-foreground">
            Enter your tracking number to see real-time status, current location, and estimated arrival.
          </p>

          <form onSubmit={handleSubmit} className="mx-auto mt-10 flex w-full max-w-2xl flex-col items-stretch gap-2 rounded-2xl border border-border bg-card p-2 shadow-card sm:flex-row sm:items-center sm:rounded-full">
            <div className="flex flex-1 items-center gap-3 px-4">
              <Search className="h-5 w-5 text-muted-foreground" />
              <input
                value={input} onChange={(e) => setInput(e.target.value)}
                placeholder="e.g. VURA-2026-100001"
                className="w-full bg-transparent py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
            <button type="submit" disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-full gradient-accent px-6 py-3 text-sm font-semibold text-primary transition-transform hover:scale-105 disabled:opacity-60">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Track
            </button>
          </form>
          <p className="mt-4 text-xs text-muted-foreground">Try VURA-2026-100001, VURA-2026-100002 or VURA-2026-100003</p>
        </div>
      </section>

      <section className="px-6 py-16 lg:px-10 print:p-0 print:py-0">
        <div className="mx-auto max-w-5xl">
          {loading && (
            <div className="flex flex-col items-center gap-3 py-20">
              <Loader2 className="h-8 w-8 animate-spin text-navy" />
              <p className="text-sm text-muted-foreground">Fetching shipment details…</p>
            </div>
          )}

          {!loading && error && (
            <div className="reveal mx-auto max-w-md rounded-3xl border border-destructive/20 bg-destructive/5 p-10 text-center animate-fade-in print:hidden">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-navy">Tracking number not found</h3>
              <p className="mt-2 text-sm text-muted-foreground">{error}</p>
            </div>
          )}

          {!loading && !error && !shipment && (
            <div className="reveal mx-auto max-w-md rounded-3xl border border-dashed border-border bg-card p-12 text-center shadow-card animate-fade-in print:hidden">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary text-navy">
                <PackageSearch className="h-8 w-8" />
              </div>
              <h3 className="mt-5 font-display text-xl font-bold text-navy">No shipment yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">Enter a tracking number above to see the latest status.</p>
            </div>
          )}

          {!loading && shipment && (
            <div id="shipment-result" className="space-y-6 animate-fade-up print:space-y-4">
              {/* Action buttons (hidden on print) */}
              <div className="flex flex-wrap items-center justify-end gap-3 print:hidden">
                <button onClick={handlePrint} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-navy shadow-sm transition-colors hover:bg-secondary">
                  <Printer className="h-4 w-4" /> Print
                </button>
                <button onClick={handleDownloadPdf} className="inline-flex items-center gap-2 rounded-full gradient-accent px-5 py-2.5 text-sm font-semibold text-primary shadow-sm transition-transform hover:scale-105">
                  <Download className="h-4 w-4" /> Download PDF
                </button>
              </div>

              <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-card print:rounded-none print:border-0 print:shadow-none">
                <div className="gradient-navy p-8 text-white print:bg-navy print:!bg-navy">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="text-xs uppercase tracking-wider text-white/60">Tracking ID</div>
                      <div className="mt-1 font-display text-2xl font-bold">{shipment.tracking_number}</div>
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-full bg-orange/95 px-4 py-1.5 text-sm font-semibold text-primary">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-primary print:hidden" />
                      {shipment.status}
                    </span>
                  </div>

                  <div className="mt-8 grid gap-6 sm:grid-cols-3">
                    <div>
                      <div className="text-xs uppercase tracking-wider text-white/60">From</div>
                      <div className="mt-1 font-semibold">{shipment.pickup_location || shipment.sender_address}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider text-white/60">To</div>
                      <div className="mt-1 font-semibold">{shipment.delivery_location || shipment.receiver_address}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider text-white/60">Estimated arrival</div>
                      <div className="mt-1 font-semibold text-orange">{shipment.estimated_delivery_date || "—"}</div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 border-t border-border p-6 sm:grid-cols-2 lg:grid-cols-4">
                  <Meta icon={Truck} label="Package" value={shipment.package_name || shipment.package_type || "—"} />
                  <Meta icon={Package} label="Weight" value={shipment.package_weight ? `${shipment.package_weight} kg` : "—"} />
                  <Meta icon={User} label="Recipient" value={shipment.receiver_name} />
                  <Meta icon={CreditCard} label="Payment" value={shipment.payment_status || "—"} />
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-3xl border border-border bg-card p-6 shadow-card print:shadow-none">
                  <h3 className="font-display text-base font-bold text-navy">Sender</h3>
                  <dl className="mt-3 space-y-1 text-sm">
                    <Row k="Name" v={shipment.sender_name} />
                    <Row k="Phone" v={shipment.sender_phone} />
                    <Row k="Email" v={shipment.sender_email} />
                    <Row k="Address" v={shipment.sender_address} />
                  </dl>
                </div>
                <div className="rounded-3xl border border-border bg-card p-6 shadow-card print:shadow-none">
                  <h3 className="font-display text-base font-bold text-navy">Receiver</h3>
                  <dl className="mt-3 space-y-1 text-sm">
                    <Row k="Name" v={shipment.receiver_name} />
                    <Row k="Phone" v={shipment.receiver_phone} />
                    <Row k="Email" v={shipment.receiver_email} />
                    <Row k="Address" v={shipment.receiver_address} />
                  </dl>
                </div>
              </div>

              <div className="rounded-3xl border border-border bg-card p-6 shadow-card print:shadow-none">
                <h3 className="font-display text-base font-bold text-navy">Package & Route</h3>
                <dl className="mt-3 grid gap-1 text-sm sm:grid-cols-2">
                  <Row k="Package" v={shipment.package_name} />
                  <Row k="Type" v={shipment.package_type} />
                  <Row k="Weight" v={shipment.package_weight ? `${shipment.package_weight} kg` : null} />
                  <Row k="Quantity" v={shipment.package_quantity} />
                  <Row k="Pickup Location" v={shipment.pickup_location} />
                  <Row k="Delivery Location" v={shipment.delivery_location} />
                  <Row k="Estimated Delivery" v={shipment.estimated_delivery_date} />
                  <Row k="Payment Status" v={shipment.payment_status} />
                </dl>
              </div>

              <div className="flex items-start gap-4 rounded-3xl border border-border bg-card p-6 shadow-card print:shadow-none">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl gradient-accent text-primary">
                  <MapPin className="h-5 w-5" />
                </span>
                <div className="flex-1">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Current Location</div>
                  <div className="mt-1 font-display text-lg font-bold text-navy">{shipment.current_location || "Awaiting first scan"}</div>
                  {latestNote && <p className="mt-1 text-sm italic text-muted-foreground">"{latestNote}"</p>}
                </div>
                <span className="hidden items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-navy sm:inline-flex">
                  <Clock className="h-3.5 w-3.5" />
                  Updated {new Date(shipment.updated_at).toLocaleDateString()}
                </span>
              </div>

              <div className="rounded-3xl border border-border bg-card p-8 shadow-card print:shadow-none">
                <h3 className="font-display text-xl font-bold text-navy">Shipment Timeline</h3>
                <ol className="mt-6 space-y-2">
                  {history.length === 0 && <li className="text-sm text-muted-foreground">No updates yet.</li>}
                  {history.map((u, i) => {
                    const isLast = i === history.length - 1;
                    const Icon = isLast ? statusIcon(u.status || "") : CheckCircle2;
                    return (
                      <li key={u.id} className="relative flex gap-4 pb-6 last:pb-0">
                        {i !== history.length - 1 && (
                          <span className={cn("absolute left-[19px] top-10 h-full w-0.5", "bg-orange")} />
                        )}
                        <span className={cn(
                          "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                          isLast ? "gradient-accent text-primary ring-4 ring-orange/20" : "bg-orange text-primary"
                        )}>
                          <Icon className="h-5 w-5" />
                        </span>
                        <div className="pt-1.5">
                          <div className={cn("text-sm font-semibold", isLast ? "text-orange" : "text-navy")}>
                            {u.status || "Update"}
                            {u.location ? ` — ${u.location}` : ""}
                          </div>
                          <div className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleString()}</div>
                          {u.note && <div className="mt-1 text-xs italic text-muted-foreground">"{u.note}"</div>}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="print:hidden"><SiteFooter /></div>

      <style>{`
        @media print {
          @page { margin: 16mm; }
          body { background: white !important; }
        }
      `}</style>
    </div>
  );
}

function Meta({ icon: Icon, label, value }: any) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-navy">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm font-semibold text-navy">{value}</div>
      </div>
    </div>
  );
}
function Row({ k, v }: { k: string; v?: string | number | null }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/50 py-1 last:border-0">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="text-right font-medium text-navy">{v ?? "—"}</dd>
    </div>
  );
}
