import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import {
  Search,
  PackageSearch,
  Package,
  Truck,
  PackageCheck,
  MapPin,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/track")({
  head: () => ({
    meta: [
      { title: "Track Your Shipment — Real-Time Updates | Veloxa" },
      { name: "description", content: "Track your Veloxa shipment in real-time. Get live status, location, and estimated arrival in one click." },
    ],
  }),
  component: TrackPage,
});

const SAMPLE = {
  id: "VLX-8821-3471",
  status: "In Transit",
  origin: "San Francisco, CA",
  destination: "New York, NY",
  eta: "May 13, 2026",
  service: "Express Air",
  weight: "4.2 kg",
  recipient: "A. Carter",
  currentLocation: "Chicago Sorting Facility, IL",
  timeline: [
    { icon: Package, label: "Order received", time: "May 9, 09:14", done: true },
    { icon: PackageCheck, label: "Picked up from sender", time: "May 9, 14:32", done: true },
    { icon: Truck, label: "In transit — Chicago hub", time: "May 11, 06:21", done: true, current: true },
    { icon: Truck, label: "Out for delivery", time: "Pending", done: false },
    { icon: PackageCheck, label: "Delivered", time: "Estimated May 13", done: false },
  ],
};

function TrackPage() {
  useScrollReveal();
  const [input, setInput] = useState("");
  const [result, setResult] = useState<typeof SAMPLE | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setResult({ ...SAMPLE, id: input.toUpperCase() });
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="bg-secondary px-6 py-20 lg:px-10">
        <div className="mx-auto max-w-4xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-orange">Track Shipment</span>
          <h1 className="mt-3 font-display text-5xl font-bold leading-tight text-navy md:text-6xl">
            Where's my package?
          </h1>
          <p className="mt-4 text-muted-foreground">
            Enter your tracking number to see real-time status, current location, and estimated arrival.
          </p>

          <form
            onSubmit={handleSearch}
            className="mx-auto mt-10 flex w-full max-w-2xl flex-col items-stretch gap-2 rounded-2xl border border-border bg-card p-2 shadow-card sm:flex-row sm:items-center sm:rounded-full"
          >
            <div className="flex flex-1 items-center gap-3 px-4">
              <Search className="h-5 w-5 text-muted-foreground" />
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g. VLX-8821-3471"
                className="w-full bg-transparent py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-full gradient-accent px-6 py-3 text-sm font-semibold text-primary transition-transform hover:scale-105"
            >
              <Search className="h-4 w-4" />
              Track
            </button>
          </form>

          <p className="mt-4 text-xs text-muted-foreground">Try entering anything to see a sample result.</p>
        </div>
      </section>

      <section className="px-6 py-20 lg:px-10">
        <div className="mx-auto max-w-5xl">
          {!result ? (
            <div className="reveal mx-auto max-w-md rounded-3xl border border-dashed border-border bg-card p-12 text-center shadow-card animate-fade-in">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary text-navy">
                <PackageSearch className="h-8 w-8" />
              </div>
              <h3 className="mt-5 font-display text-xl font-bold text-navy">No shipment yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Enter a tracking number above to see the latest status of your shipment.
              </p>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-up">
              {/* Result card */}
              <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-card">
                <div className="gradient-navy p-8 text-white">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="text-xs uppercase tracking-wider text-white/60">Tracking ID</div>
                      <div className="mt-1 font-display text-2xl font-bold">{result.id}</div>
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-full bg-orange/95 px-4 py-1.5 text-sm font-semibold text-primary">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                      {result.status}
                    </span>
                  </div>

                  <div className="mt-8 grid gap-6 sm:grid-cols-3">
                    <div>
                      <div className="text-xs uppercase tracking-wider text-white/60">From</div>
                      <div className="mt-1 font-semibold">{result.origin}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider text-white/60">To</div>
                      <div className="mt-1 font-semibold">{result.destination}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider text-white/60">Estimated arrival</div>
                      <div className="mt-1 font-semibold text-orange">{result.eta}</div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 border-t border-border p-6 sm:grid-cols-4">
                  {[
                    { icon: Truck, label: "Service", value: result.service },
                    { icon: Package, label: "Weight", value: result.weight },
                    { icon: User, label: "Recipient", value: result.recipient },
                    { icon: Calendar, label: "ETA", value: result.eta },
                  ].map((m) => (
                    <div key={m.label} className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-navy">
                        <m.icon className="h-4 w-4" />
                      </span>
                      <div>
                        <div className="text-xs text-muted-foreground">{m.label}</div>
                        <div className="text-sm font-semibold text-navy">{m.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Current location */}
              <div className="flex items-start gap-4 rounded-3xl border border-border bg-card p-6 shadow-card">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl gradient-accent text-primary">
                  <MapPin className="h-5 w-5" />
                </span>
                <div className="flex-1">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Current Location</div>
                  <div className="mt-1 font-display text-lg font-bold text-navy">{result.currentLocation}</div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Last scan today at 06:21 — package is on schedule.
                  </p>
                </div>
                <span className="hidden items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-navy sm:inline-flex">
                  <Clock className="h-3.5 w-3.5" />
                  Updated 2h ago
                </span>
              </div>

              {/* Timeline */}
              <div className="rounded-3xl border border-border bg-card p-8 shadow-card">
                <h3 className="font-display text-xl font-bold text-navy">Shipment Timeline</h3>
                <ol className="mt-6 space-y-2">
                  {result.timeline.map((step, i) => {
                    const Icon = step.done ? (step.current ? step.icon : CheckCircle2) : Circle;
                    return (
                      <li key={i} className="relative flex gap-4 pb-6 last:pb-0">
                        {i !== result.timeline.length - 1 && (
                          <span
                            className={cn(
                              "absolute left-[19px] top-10 h-full w-0.5",
                              step.done ? "bg-orange" : "bg-border"
                            )}
                          />
                        )}
                        <span
                          className={cn(
                            "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                            step.current
                              ? "gradient-accent text-primary ring-4 ring-orange/20"
                              : step.done
                              ? "bg-orange text-primary"
                              : "bg-secondary text-muted-foreground"
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </span>
                        <div className="pt-1.5">
                          <div className={cn("text-sm font-semibold", step.current ? "text-orange" : "text-navy")}>
                            {step.label}
                          </div>
                          <div className="text-xs text-muted-foreground">{step.time}</div>
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

      <SiteFooter />
    </div>
  );
}
