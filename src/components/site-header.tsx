import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useSettings, BrandLogo } from "@/lib/settings";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
  { to: "/track", label: "Track Shipment" },
  { to: "/contact", label: "Contact" },
] as const;

interface SiteHeaderProps {
  variant?: "transparent" | "solid";
}

export function SiteHeader({ variant = "solid" }: SiteHeaderProps) {
  const [open, setOpen] = useState(false);
  const { settings } = useSettings();
  const isTransparent = variant === "transparent";

  return (
    <header
      className={cn(
        "absolute left-0 right-0 top-0 z-50",
        isTransparent ? "text-white" : "text-foreground bg-background border-b border-border relative"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold">
          <BrandLogo
            variant={isTransparent ? "light" : "main"}
            className="h-9 w-auto"
            fallbackTextClass={isTransparent ? "text-white text-xl" : "text-navy text-xl"}
          />
          {!settings.main_logo_url && false}
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                isTransparent
                  ? "text-white/85 hover:bg-white/10 hover:text-white"
                  : "text-foreground/80 hover:bg-secondary hover:text-foreground"
              )}
              activeProps={{
                className: cn(
                  "rounded-full px-4 py-2 text-sm font-semibold",
                  isTransparent ? "bg-white/15 text-white" : "bg-secondary text-navy"
                ),
              }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <Link
          to="/track"
          className="hidden rounded-full gradient-accent px-5 py-2.5 text-sm font-semibold text-primary shadow-card transition-transform hover:scale-105 lg:inline-flex"
        >
          Get a Quote
        </Link>

        <button
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "inline-flex h-10 w-10 items-center justify-center rounded-lg lg:hidden",
            isTransparent ? "bg-white/10 text-white" : "bg-secondary text-foreground"
          )}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden">
          <div className="mx-4 mb-4 rounded-2xl border border-border bg-background p-4 shadow-elevated animate-fade-in">
            <nav className="flex flex-col gap-1">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary"
                  activeProps={{ className: "rounded-lg px-4 py-3 text-sm font-semibold bg-secondary text-navy" }}
                  activeOptions={{ exact: l.to === "/" }}
                >
                  {l.label}
                </Link>
              ))}
              <Link
                to="/track"
                onClick={() => setOpen(false)}
                className="mt-2 rounded-full gradient-accent px-5 py-3 text-center text-sm font-semibold text-primary"
              >
                Get a Quote
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
