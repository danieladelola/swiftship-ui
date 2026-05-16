import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/lib/settings";
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
  const { settings } = useSettings();
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

  async function loadLogoDataUrl(url: string | null): Promise<string | null> {
    if (!url) return null;
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      return await new Promise((resolve) => {
        const r = new FileReader();
        r.onloadend = () => resolve(r.result as string);
        r.onerror = () => resolve(null);
        r.readAsDataURL(blob);
      });
    } catch { return null; }
  }

  function hex(c: string): [number, number, number] {
    const m = c.replace("#", "");
    const f = m.length === 3 ? m.split("").map((x) => x + x).join("") : m;
    return [parseInt(f.slice(0, 2), 16) || 15, parseInt(f.slice(2, 4), 16) || 27, parseInt(f.slice(4, 6), 16) || 61];
  }

  async function handleDownloadPdf() {
    if (!shipment) return;
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const M = 40;
    const [pr, pg, pb] = hex(settings.primary_color);
    const [ar, ag, ab] = hex(settings.accent_color);

    // Header band
    doc.setFillColor(pr, pg, pb);
    doc.rect(0, 0, W, 110, "F");

    const logoUrl = settings.pdf_logo_url || settings.main_logo_url;
    const logo = await loadLogoDataUrl(logoUrl);
    if (logo) {
      try { doc.addImage(logo, "PNG", M, 28, 54, 54); } catch { /* ignore */ }
    }
    const titleX = logo ? M + 70 : M;
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold"); doc.setFontSize(20);
    doc.text(settings.website_name, titleX, 52);
    doc.setFont("helvetica", "normal"); doc.setFontSize(10);
    doc.text(settings.pdf_title, titleX, 70);
    doc.setFontSize(8); doc.setTextColor(255, 255, 255, 0.85);
    doc.text(`Generated ${new Date().toLocaleString()}`, titleX, 84);

    // Company info right
    doc.setFontSize(9); doc.setTextColor(230, 235, 245);
    const right: string[] = [settings.email, settings.phone];
    if (settings.pdf_show_company_address) right.push(settings.address);
    right.forEach((t, i) => doc.text(t, W - M, 40 + i * 13, { align: "right" }));

    let y = 140;

    // Status summary card
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(229, 231, 235);
    doc.roundedRect(M, y, W - M * 2, 90, 8, 8, "FD");
    doc.setTextColor(100, 116, 139); doc.setFont("helvetica", "normal"); doc.setFontSize(8);
    doc.text("TRACKING NUMBER", M + 16, y + 20);
    doc.setTextColor(pr, pg, pb); doc.setFont("helvetica", "bold"); doc.setFontSize(16);
    doc.text(shipment.tracking_number, M + 16, y + 40);

    // status badge
    const badgeW = 130, badgeH = 26, bx = W - M - 16 - badgeW, by = y + 16;
    doc.setFillColor(ar, ag, ab);
    doc.roundedRect(bx, by, badgeW, badgeH, 13, 13, "F");
    doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold"); doc.setFontSize(10);
    doc.text(shipment.status.toUpperCase(), bx + badgeW / 2, by + 17, { align: "center" });

    // current location + eta
    doc.setTextColor(100, 116, 139); doc.setFont("helvetica", "normal"); doc.setFontSize(8);
    doc.text("CURRENT LOCATION", M + 16, y + 60);
    doc.text("ESTIMATED DELIVERY", W / 2, y + 60);
    doc.setTextColor(30, 41, 59); doc.setFont("helvetica", "bold"); doc.setFontSize(11);
    doc.text(String(shipment.current_location || "—"), M + 16, y + 76);
    doc.text(String(shipment.estimated_delivery_date || "—"), W / 2, y + 76);
    y += 110;

    // Two-column sender/receiver
    const colW = (W - M * 2 - 16) / 2;
    const renderParty = (title: string, x: number, data: Array<[string, string | null | undefined]>) => {
      doc.setFillColor(255, 255, 255); doc.setDrawColor(229, 231, 235);
      doc.roundedRect(x, y, colW, 130, 6, 6, "FD");
      doc.setTextColor(pr, pg, pb); doc.setFont("helvetica", "bold"); doc.setFontSize(11);
      doc.text(title, x + 14, y + 22);
      doc.setDrawColor(ar, ag, ab); doc.setLineWidth(1.5);
      doc.line(x + 14, y + 27, x + 60, y + 27);
      doc.setLineWidth(0.5);
      let ry = y + 46;
      data.forEach(([k, v]) => {
        doc.setTextColor(100, 116, 139); doc.setFont("helvetica", "normal"); doc.setFontSize(8);
        doc.text(k.toUpperCase(), x + 14, ry);
        doc.setTextColor(30, 41, 59); doc.setFont("helvetica", "bold"); doc.setFontSize(9);
        const lines = doc.splitTextToSize(String(v ?? "—"), colW - 28);
        doc.text(lines.slice(0, 1), x + 14, ry + 12);
        ry += 26;
      });
    };
    if (settings.pdf_show_sender) {
      renderParty("SENDER", M, [
        ["Name", shipment.sender_name],
        ["Phone", shipment.sender_phone],
        ["Address", shipment.sender_address],
      ]);
    }
    renderParty("RECEIVER", settings.pdf_show_sender ? M + colW + 16 : M, [
      ["Name", shipment.receiver_name],
      ["Phone", shipment.receiver_phone],
      ...(settings.pdf_show_receiver_email ? [["Email", shipment.receiver_email] as [string, string]] : []),
      ["Address", shipment.receiver_address],
    ]);
    y += 145;

    // Package grid
    doc.setFillColor(255, 255, 255); doc.setDrawColor(229, 231, 235);
    doc.roundedRect(M, y, W - M * 2, 100, 6, 6, "FD");
    doc.setTextColor(pr, pg, pb); doc.setFont("helvetica", "bold"); doc.setFontSize(11);
    doc.text("PACKAGE & ROUTE", M + 14, y + 22);
    const items: Array<[string, string]> = [
      ["Package", shipment.package_name || "—"],
      ["Type", shipment.package_type || "—"],
      ["Weight", shipment.package_weight ? `${shipment.package_weight} kg` : "—"],
      ["Quantity", String(shipment.package_quantity ?? "—")],
      ["Pickup", shipment.pickup_location || "—"],
      ["Delivery", shipment.delivery_location || "—"],
    ];
    if (settings.pdf_show_payment_status) items.push(["Payment", shipment.payment_status || "—"]);
    items.forEach((it, i) => {
      const col = i % 4, row = Math.floor(i / 4);
      const cx = M + 14 + col * ((W - M * 2 - 28) / 4);
      const cy = y + 46 + row * 26;
      doc.setTextColor(100, 116, 139); doc.setFont("helvetica", "normal"); doc.setFontSize(8);
      doc.text(it[0].toUpperCase(), cx, cy);
      doc.setTextColor(30, 41, 59); doc.setFont("helvetica", "bold"); doc.setFontSize(9);
      doc.text(it[1], cx, cy + 12);
    });
    y += 120;

    // Timeline table
    doc.setTextColor(pr, pg, pb); doc.setFont("helvetica", "bold"); doc.setFontSize(11);
    doc.text("SHIPMENT TIMELINE", M, y); y += 10;
    // header row
    doc.setFillColor(pr, pg, pb);
    doc.rect(M, y, W - M * 2, 22, "F");
    doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold"); doc.setFontSize(8);
    const cols = [
      { x: M + 10, w: 110, label: "DATE" },
      { x: M + 130, w: 140, label: "LOCATION" },
      { x: M + 280, w: 100, label: "STATUS" },
      { x: M + 390, w: W - M - 400, label: "NOTE" },
    ];
    cols.forEach((c) => doc.text(c.label, c.x, y + 15));
    y += 22;
    doc.setTextColor(30, 41, 59); doc.setFont("helvetica", "normal"); doc.setFontSize(8);
    const rows = history.length ? history : [{ created_at: shipment.created_at, location: "—", status: shipment.status, note: "Shipment created" }];
    rows.forEach((u: any, idx: number) => {
      if (y > H - 80) { doc.addPage(); y = 50; }
      if (idx % 2 === 0) { doc.setFillColor(248, 250, 252); doc.rect(M, y, W - M * 2, 24, "F"); }
      doc.text(new Date(u.created_at).toLocaleDateString(), cols[0].x, y + 15);
      doc.text(String(u.location || "—").substring(0, 24), cols[1].x, y + 15);
      doc.text(String(u.status || "—").substring(0, 18), cols[2].x, y + 15);
      const noteLines = doc.splitTextToSize(String(u.note || "—"), cols[3].w);
      doc.text(noteLines.slice(0, 1), cols[3].x, y + 15);
      y += 24;
    });

    // Footer
    const footerY = H - 60;
    doc.setDrawColor(229, 231, 235); doc.line(M, footerY, W - M, footerY);
    doc.setTextColor(pr, pg, pb); doc.setFont("helvetica", "bold"); doc.setFontSize(9);
    doc.text(settings.pdf_footer_note, M, footerY + 16);
    doc.setTextColor(120, 130, 150); doc.setFont("helvetica", "normal"); doc.setFontSize(7);
    const terms = doc.splitTextToSize(settings.pdf_terms, W - M * 2);
    doc.text(terms.slice(0, 2), M, footerY + 30);
    doc.text(settings.footer_text.replace(/\{year\}/g, String(new Date().getFullYear())), W - M, H - 20, { align: "right" });

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
