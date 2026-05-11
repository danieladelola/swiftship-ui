import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export function ContactCTA() {
  return (
    <section className="bg-secondary px-6 py-20 lg:px-10">
      <div className="reveal mx-auto max-w-6xl overflow-hidden rounded-3xl gradient-navy p-10 shadow-elevated md:p-16">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-bold text-white md:text-4xl">
              Ready to move what matters?
            </h2>
            <p className="mt-3 text-white/75">
              Talk to our logistics experts and get a tailored shipping plan for your business in under 24 hours.
            </p>
          </div>
          <Link
            to="/contact"
            className="group inline-flex items-center gap-2 rounded-full gradient-accent px-7 py-4 text-base font-semibold text-primary shadow-card transition-transform hover:scale-105"
          >
            Contact Us
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
