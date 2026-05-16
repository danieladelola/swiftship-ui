import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  Search,
  Truck,
  Plane,
  Globe2,
  Warehouse,
  ShoppingBag,
  Package,
  ShieldCheck,
  Clock,
  HeartHandshake,
  PackageCheck,
  MapPin,
  Star,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ContactCTA } from "@/components/contact-cta";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VURALOGISTICS — Fast & Reliable Logistics, Delivered Worldwide" },
      { name: "description", content: "Ship local, interstate, or international with VURALOGISTICS. Real-time tracking, warehousing, and e-commerce logistics built for modern businesses." },
    ],
  }),
  component: HomePage,
});

const HERO_VIDEO = "https://cdn.coverr.co/videos/coverr-trucks-on-highway-7234/1080p.mp4";
const HERO_POSTER = "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=2000&q=80";

function HomePage() {
  useScrollReveal();
  const navigate = useNavigate();
  const [tracking, setTracking] = useState("");

  return (
    <div className="min-h-screen bg-background">
      {/* HERO */}
      <section className="relative min-h-[100vh] overflow-hidden text-white">
        <video
          src={HERO_VIDEO}
          poster={HERO_POSTER}
          autoPlay muted loop playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 gradient-hero" />
        <div className="relative z-10">
          <SiteHeader variant="transparent" />
          <div className="mx-auto max-w-7xl px-6 pb-24 pt-28 lg:px-10 lg:pt-40">
            <div className="max-w-3xl animate-fade-up">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-white/90 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-orange" />
                Trusted by 12,000+ businesses
              </span>
              <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] md:text-6xl lg:text-7xl">
                Fast, reliable delivery <span className="text-orange">— anywhere</span> in the world.
              </h1>
              <p className="mt-6 max-w-xl text-lg text-white/80">
                From your door to the other side of the globe, VURALOGISTICS moves your shipments with speed, transparency, and care you can count on.
              </p>

              {/* Track box */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const t = tracking.trim();
                  if (!t) return;
                  navigate({ to: "/track", search: { tracking: t } });
                }}
                className="mt-10 flex w-full max-w-xl items-center gap-2 rounded-full border border-white/20 bg-white/10 p-2 backdrop-blur-md"
              >
                <div className="flex flex-1 items-center gap-3 px-4">
                  <Search className="h-5 w-5 text-white/70" />
                  <input
                    value={tracking}
                    onChange={(e) => setTracking(e.target.value)}
                    placeholder="Enter your tracking number"
                    className="w-full bg-transparent py-3 text-sm text-white placeholder:text-white/60 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-full gradient-accent px-5 py-3 text-sm font-semibold text-primary transition-transform hover:scale-105"
                >
                  Track Now
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  to="/services"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-navy transition-transform hover:scale-105"
                >
                  Explore Services
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Get a Quote
                </Link>
              </div>

              <div className="mt-14 grid max-w-xl grid-cols-3 gap-6 border-t border-white/10 pt-6">
                {[
                  { v: "98%", l: "On-time delivery" },
                  { v: "120+", l: "Countries served" },
                  { v: "24/7", l: "Live support" },
                ].map((s) => (
                  <div key={s.l}>
                    <div className="font-display text-2xl font-bold text-orange">{s.v}</div>
                    <div className="text-xs text-white/70">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES PREVIEW */}
      <section className="px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="reveal flex flex-col items-end justify-between gap-6 md:flex-row">
            <div className="max-w-2xl">
              <span className="text-sm font-semibold uppercase tracking-wider text-orange">What we do</span>
              <h2 className="mt-3 font-display text-4xl font-bold text-navy md:text-5xl">
                Logistics solutions built around your business
              </h2>
            </div>
            <Link to="/services" className="group inline-flex items-center gap-2 text-sm font-semibold text-navy hover:text-orange">
              View all services
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Truck, title: "Local Delivery", desc: "Same-day and next-day delivery within your city.", img: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=900&q=80" },
              { icon: Plane, title: "International Shipping", desc: "Door-to-door shipping in 120+ countries.", img: "https://images.unsplash.com/photo-1494412519320-aa613df615a4?auto=format&fit=crop&w=900&q=80" },
              { icon: Warehouse, title: "Warehousing", desc: "Modern, secure storage with smart inventory.", img: "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=900&q=80" },
            ].map((s, i) => (
              <article
                key={s.title}
                className="reveal group overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all hover:-translate-y-1 hover:shadow-elevated"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={s.img}
                    alt={s.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <div className="p-6">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl gradient-accent text-primary">
                    <s.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-xl font-semibold text-navy">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="bg-secondary px-6 py-24 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-2 lg:items-center">
          <div className="reveal relative">
            <img
              src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1200&q=80"
              alt="Logistics worker checking shipment"
              loading="lazy"
              className="rounded-3xl shadow-elevated"
            />
            <div className="absolute -bottom-6 -right-6 hidden rounded-2xl gradient-navy p-6 text-white shadow-elevated md:block">
              <div className="font-display text-3xl font-bold text-orange">15+</div>
              <div className="text-sm text-white/70">Years of experience</div>
            </div>
          </div>

          <div className="reveal">
            <span className="text-sm font-semibold uppercase tracking-wider text-orange">Why choose us</span>
            <h2 className="mt-3 font-display text-4xl font-bold text-navy md:text-5xl">
              Built on trust, speed, and total transparency.
            </h2>
            <p className="mt-4 text-muted-foreground">
              We combine smart technology with a global network to deliver the best shipping experience for businesses of every size.
            </p>

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {[
                { icon: Clock, title: "On-time, every time", desc: "98% on-time delivery rate across all routes." },
                { icon: ShieldCheck, title: "Safe & insured", desc: "Full insurance and tamper-proof packaging." },
                { icon: HeartHandshake, title: "24/7 support", desc: "Real humans available any day, any time." },
                { icon: Globe2, title: "Global reach", desc: "Network across 120+ countries worldwide." },
              ].map((f) => (
                <div key={f.title} className="flex gap-4 rounded-xl bg-card p-5 shadow-card">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-navy">
                    <f.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-semibold text-navy">{f.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="reveal mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-orange">How it works</span>
            <h2 className="mt-3 font-display text-4xl font-bold text-navy md:text-5xl">A simple delivery process</h2>
            <p className="mt-4 text-muted-foreground">From booking to doorstep, we keep things simple, fast, and traceable.</p>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Package, title: "Book a shipment", desc: "Schedule a pickup online in under 2 minutes." },
              { icon: Truck, title: "We pick it up", desc: "A driver arrives at your door at your chosen time." },
              { icon: MapPin, title: "Track in real-time", desc: "Follow every step with live updates and ETAs." },
              { icon: PackageCheck, title: "Delivered safely", desc: "Receive proof of delivery the moment it arrives." },
            ].map((step, i) => (
              <div
                key={step.title}
                className="reveal relative rounded-2xl border border-border bg-card p-8 text-center shadow-card transition-transform hover:-translate-y-1"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full gradient-accent px-3 py-1 text-xs font-bold text-primary">
                  Step {i + 1}
                </div>
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-navy">
                  <step.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-navy">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-secondary px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="reveal mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-orange">Trusted by teams worldwide</span>
            <h2 className="mt-3 font-display text-4xl font-bold text-navy md:text-5xl">What our customers say</h2>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              { name: "Amelia Carter", role: "Founder, Carter Goods", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80", quote: "VURALOGISTICS scaled with us from 50 to 5,000 orders a month. Their tracking is the smoothest we've used." },
              { name: "Marcus Lee", role: "Ops Manager, NovaTech", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80", quote: "International shipping used to be a nightmare. Now it's just a tab in our dashboard. Incredible team." },
              { name: "Sara Okafor", role: "E-com Director, Loomly", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80", quote: "The warehousing service paid for itself in the first month. Inventory accuracy hit 99.8%." },
            ].map((t) => (
              <figure key={t.name} className="reveal rounded-2xl bg-card p-7 shadow-card">
                <div className="flex gap-1 text-orange">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <blockquote className="mt-4 text-base leading-relaxed text-foreground">"{t.quote}"</blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <img src={t.img} alt={t.name} loading="lazy" className="h-11 w-11 rounded-full object-cover" />
                  <div>
                    <div className="text-sm font-semibold text-navy">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="reveal mt-16 flex flex-wrap items-center justify-center gap-x-12 gap-y-4 opacity-60">
            {["FedEx Partner", "DHL Network", "Amazon SPN", "ISO 9001", "GDPR"].map((b) => (
              <div key={b} className="font-display text-lg font-bold text-navy/70">{b}</div>
            ))}
          </div>
        </div>
      </section>

      <ContactCTA />
      <SiteFooter />

      {/* hidden import to prevent unused warning for ShoppingBag */}
      <ShoppingBag className="hidden" />
    </div>
  );
}
