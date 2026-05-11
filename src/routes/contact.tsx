import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { Phone, Mail, MapPin, Send, Facebook, Twitter, Linkedin, Instagram, MapPinned } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Veloxa — Get a Quote or Talk to Logistics Experts" },
      { name: "description", content: "Get in touch with Veloxa. Phone, email, office address, and a 24/7 contact form for shipping quotes and support." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  useScrollReveal();
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    setSubmitting(false);
    (e.target as HTMLFormElement).reset();
    toast.success("Message sent! We'll get back to you within 24 hours.");
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="bg-secondary px-6 py-20 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="reveal max-w-3xl">
            <span className="text-sm font-semibold uppercase tracking-wider text-orange">Contact Us</span>
            <h1 className="mt-3 font-display text-5xl font-bold leading-tight text-navy md:text-6xl">
              Let's get your shipment moving.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Send us a message, give us a call, or stop by our office. Our team responds within 24 hours — usually much faster.
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-5">
          {/* Form */}
          <div className="reveal lg:col-span-3">
            <form onSubmit={onSubmit} className="rounded-3xl border border-border bg-card p-8 shadow-card md:p-10">
              <h2 className="font-display text-2xl font-bold text-navy">Send a message</h2>
              <p className="mt-1 text-sm text-muted-foreground">Fill out the form and we'll be in touch shortly.</p>

              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                <Field label="Full name" name="name" placeholder="Jane Doe" required />
                <Field label="Email" name="email" type="email" placeholder="jane@company.com" required />
                <Field label="Phone" name="phone" placeholder="+1 (555) 000-0000" />
                <Field label="Company" name="company" placeholder="Company name" />
              </div>

              <div className="mt-5">
                <label className="text-sm font-medium text-navy">Subject</label>
                <select
                  name="subject"
                  className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/20"
                >
                  <option>Get a quote</option>
                  <option>General inquiry</option>
                  <option>Support</option>
                  <option>Partnership</option>
                </select>
              </div>

              <div className="mt-5">
                <label className="text-sm font-medium text-navy">Message</label>
                <textarea
                  name="message"
                  rows={5}
                  placeholder="Tell us about your shipping needs…"
                  required
                  className="mt-2 w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/20"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-6 inline-flex items-center gap-2 rounded-full gradient-accent px-7 py-3.5 text-sm font-semibold text-primary shadow-card transition-transform hover:scale-105 disabled:opacity-60"
              >
                {submitting ? "Sending…" : "Send Message"}
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>

          {/* Contact info */}
          <div className="reveal space-y-4 lg:col-span-2">
            {[
              { icon: Phone, title: "Call us", lines: ["+1 (415) 555-0199", "Mon–Sun, 24/7 support"] },
              { icon: Mail, title: "Email us", lines: ["hello@veloxa.com", "support@veloxa.com"] },
              { icon: MapPin, title: "Visit us", lines: ["221 Harbor Avenue, Suite 500", "San Francisco, CA 94107"] },
            ].map((c) => (
              <div key={c.title} className="flex gap-4 rounded-2xl border border-border bg-card p-6 shadow-card">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl gradient-accent text-primary">
                  <c.icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-semibold text-navy">{c.title}</h3>
                  {c.lines.map((l) => (
                    <p key={l} className="text-sm text-muted-foreground">{l}</p>
                  ))}
                </div>
              </div>
            ))}

            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <h3 className="font-semibold text-navy">Follow us</h3>
              <div className="mt-3 flex gap-3">
                {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-navy transition-colors hover:gradient-accent hover:text-primary"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map placeholder */}
      <section className="px-6 pb-24 lg:px-10">
        <div className="reveal mx-auto max-w-7xl overflow-hidden rounded-3xl border border-border shadow-card">
          <div className="relative aspect-[21/9] w-full">
            <img
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=2000&q=80"
              alt="Map placeholder"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-navy-deep/40" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="rounded-2xl bg-card/95 px-6 py-5 text-center shadow-elevated backdrop-blur">
                <MapPinned className="mx-auto h-8 w-8 text-orange" />
                <div className="mt-2 font-display text-lg font-bold text-navy">Veloxa HQ</div>
                <div className="text-xs text-muted-foreground">221 Harbor Avenue, San Francisco</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-navy">{label}</label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        required={required}
        className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/20"
      />
    </div>
  );
}
