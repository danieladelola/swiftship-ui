import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ContactCTA } from "@/components/contact-cta";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { Truck, MapPin, Plane, Warehouse, ShoppingBag, Boxes, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Local, International & E-commerce Logistics | Veloxa" },
      { name: "description", content: "Local delivery, interstate, international shipping, warehousing, e-commerce logistics, and cargo handling — all from one trusted partner." },
    ],
  }),
  component: ServicesPage,
});

const services = [
  {
    icon: Truck,
    title: "Local Delivery",
    desc: "Same-day and next-day delivery within your city. Perfect for restaurants, retailers, and urgent shipments.",
    img: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=900&q=80",
  },
  {
    icon: MapPin,
    title: "Interstate Delivery",
    desc: "Reliable cross-state shipping with consistent transit times and real-time tracking on every route.",
    img: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=900&q=80",
  },
  {
    icon: Plane,
    title: "International Shipping",
    desc: "Door-to-door air and sea freight to 120+ countries, with full customs handling included.",
    img: "https://images.unsplash.com/photo-1569073872325-08b7e4f10122?auto=format&fit=crop&w=900&q=80",
  },
  {
    icon: Warehouse,
    title: "Warehousing",
    desc: "Modern, climate-controlled warehouses with smart inventory dashboards and pick-and-pack services.",
    img: "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=900&q=80",
  },
  {
    icon: ShoppingBag,
    title: "E-commerce Logistics",
    desc: "Plug-and-play integrations with Shopify, WooCommerce, and more — from cart to customer in record time.",
    img: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=900&q=80",
  },
  {
    icon: Boxes,
    title: "Cargo Handling",
    desc: "Specialized handling for heavy, oversized, and high-value cargo with white-glove care and insurance.",
    img: "https://images.unsplash.com/photo-1494412519320-aa613df615a4?auto=format&fit=crop&w=900&q=80",
  },
];

function ServicesPage() {
  useScrollReveal();
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="bg-secondary px-6 py-20 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="reveal max-w-3xl">
            <span className="text-sm font-semibold uppercase tracking-wider text-orange">Our Services</span>
            <h1 className="mt-3 font-display text-5xl font-bold leading-tight text-navy md:text-6xl">
              Everything you need to move, store, and deliver.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              One platform, six core services, and a global network engineered to keep your business moving — across the street or across the planet.
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 py-24 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-7 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <article
              key={s.title}
              className="reveal group overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all hover:-translate-y-1 hover:shadow-elevated"
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              <div className="aspect-[16/10] overflow-hidden">
                <img
                  src={s.img}
                  alt={s.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div className="p-7">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl gradient-accent text-primary">
                  <s.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 font-display text-xl font-bold text-navy">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
                <Link to="/contact" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-navy hover:text-orange">
                  Get a quote
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <ContactCTA />
      <SiteFooter />
    </div>
  );
}
