import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ContactCTA } from "@/components/contact-cta";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { Target, Eye, ShieldCheck, Users, Globe2, Award } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Veloxa — Our Story, Mission & Vision" },
      { name: "description", content: "Learn about Veloxa's mission to make global logistics fast, transparent, and accessible to every business." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  useScrollReveal();
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Page hero */}
      <section className="bg-secondary px-6 py-20 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="reveal max-w-3xl">
            <span className="text-sm font-semibold uppercase tracking-wider text-orange">About Veloxa</span>
            <h1 className="mt-3 font-display text-5xl font-bold leading-tight text-navy md:text-6xl">
              Moving the world forward, one shipment at a time.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Founded in 2010, Veloxa has grown from a small local courier into a global logistics partner trusted by over 12,000 businesses across 120+ countries.
            </p>
          </div>
        </div>
      </section>

      {/* Story + image */}
      <section className="px-6 py-24 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-2 lg:items-center">
          <div className="reveal">
            <img
              src="https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=1200&q=80"
              alt="Logistics warehouse with workers"
              loading="lazy"
              className="rounded-3xl shadow-elevated"
            />
          </div>
          <div className="reveal">
            <span className="text-sm font-semibold uppercase tracking-wider text-orange">Our story</span>
            <h2 className="mt-3 font-display text-4xl font-bold text-navy">From a single van to a global network</h2>
            <p className="mt-4 text-muted-foreground">
              What started as a two-person operation with a single delivery van has become a 2,000-strong team across four continents. Through every stage, our mission has stayed the same: make shipping simple, dependable, and human.
            </p>
            <p className="mt-4 text-muted-foreground">
              Today we power deliveries for fast-growing e-commerce brands, manufacturers, and Fortune 500 companies — all from one connected platform.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-secondary px-6 py-24 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2">
          {[
            { icon: Target, title: "Our Mission", desc: "To remove the friction from global commerce by giving every business — from solo shop to enterprise — instant access to fast, reliable, and transparent logistics." },
            { icon: Eye, title: "Our Vision", desc: "A world where distance is never a barrier to opportunity. Where any product, anywhere, can reach any customer in days — not weeks." },
          ].map((b) => (
            <div key={b.title} className="reveal rounded-2xl bg-card p-10 shadow-card">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl gradient-accent text-primary">
                <b.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 font-display text-2xl font-bold text-navy">{b.title}</h3>
              <p className="mt-3 text-muted-foreground">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why trust us */}
      <section className="px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="reveal mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-orange">Why customers trust us</span>
            <h2 className="mt-3 font-display text-4xl font-bold text-navy md:text-5xl">A partner you can rely on</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: ShieldCheck, title: "Secure & insured", desc: "Every shipment fully insured and trackable." },
              { icon: Users, title: "Real human support", desc: "Talk to a real expert 24/7 in any timezone." },
              { icon: Globe2, title: "Global expertise", desc: "Local teams in 40+ regional hubs." },
              { icon: Award, title: "Award-winning", desc: "Recognized by Logistics Today 5 years running." },
            ].map((f) => (
              <div key={f.title} className="reveal rounded-2xl border border-border bg-card p-7 shadow-card transition-transform hover:-translate-y-1">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-navy">
                  <f.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-navy">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section
        className="relative overflow-hidden px-6 py-24 text-white lg:px-10"
      >
        <img
          src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=2000&q=80"
          alt="Cargo ship at port"
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 gradient-hero" />
        <div className="relative mx-auto grid max-w-7xl gap-8 text-center md:grid-cols-4">
          {[
            { v: "12k+", l: "Business clients" },
            { v: "120+", l: "Countries served" },
            { v: "5M+", l: "Shipments per year" },
            { v: "98%", l: "On-time rate" },
          ].map((s) => (
            <div key={s.l} className="reveal">
              <div className="font-display text-5xl font-bold text-orange md:text-6xl">{s.v}</div>
              <div className="mt-2 text-sm uppercase tracking-wider text-white/70">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      <ContactCTA />
      <SiteFooter />
    </div>
  );
}
