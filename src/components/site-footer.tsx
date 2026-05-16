import { Link } from "@tanstack/react-router";
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";
import { useSettings, BrandLogo } from "@/lib/settings";

export function SiteFooter() {
  const { settings } = useSettings();
  const socials = [
    { Icon: Facebook, url: settings.social_facebook },
    { Icon: Twitter, url: settings.social_twitter },
    { Icon: Linkedin, url: settings.social_linkedin },
    { Icon: Instagram, url: settings.social_instagram },
  ];

  return (
    <footer className="bg-navy-deep text-white">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold">
              <BrandLogo variant="light" className="h-10 w-auto" fallbackTextClass="text-white text-xl" />
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-white/70">{settings.website_tagline}</p>
            <div className="mt-6 flex gap-3">
              {socials.map(({ Icon, url }, i) => (
                <a
                  key={i}
                  href={url || "#"}
                  target={url ? "_blank" : undefined}
                  rel={url ? "noopener noreferrer" : undefined}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/80 transition-colors hover:bg-orange hover:text-primary"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Quick Links</h4>
            <ul className="mt-5 space-y-3 text-sm text-white/70">
              <li><Link to="/" className="hover:text-orange transition-colors">Home</Link></li>
              <li><Link to="/about" className="hover:text-orange transition-colors">About Us</Link></li>
              <li><Link to="/services" className="hover:text-orange transition-colors">Services</Link></li>
              <li><Link to="/track" className="hover:text-orange transition-colors">Track Shipment</Link></li>
              <li><Link to="/contact" className="hover:text-orange transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Services</h4>
            <ul className="mt-5 space-y-3 text-sm text-white/70">
              <li>Local Delivery</li>
              <li>Interstate Delivery</li>
              <li>International Shipping</li>
              <li>Warehousing</li>
              <li>E-commerce Logistics</li>
              <li>Cargo Handling</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Get in Touch</h4>
            <ul className="mt-5 space-y-4 text-sm text-white/70">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 text-orange shrink-0" />
                <span>{settings.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-orange" />
                <span>{settings.phone}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-orange" />
                <span>{settings.email}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-sm text-white/50 md:flex-row">
          <p>{settings.footer_text.replace(/\{year\}/g, String(new Date().getFullYear()))}</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
