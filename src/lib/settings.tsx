import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SiteSettings {
  id: string;
  website_name: string;
  website_tagline: string;
  footer_text: string;
  main_logo_url: string | null;
  dark_logo_url: string | null;
  light_logo_url: string | null;
  favicon_url: string | null;
  pdf_logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  button_color: string;
  text_color: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  social_facebook: string;
  social_twitter: string;
  social_instagram: string;
  social_linkedin: string;
  google_map_embed: string;
  tracking_prefix: string;
  default_status: string;
  default_payment_status: string;
  default_delivery_note: string;
  pdf_title: string;
  pdf_footer_note: string;
  pdf_terms: string;
  pdf_show_sender: boolean;
  pdf_show_receiver_email: boolean;
  pdf_show_payment_status: boolean;
  pdf_show_company_address: boolean;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  id: "singleton",
  website_name: "VURALOGISTICS",
  website_tagline: "Fast, reliable, global logistics — delivered.",
  footer_text: "© VURALOGISTICS. All rights reserved.",
  main_logo_url: null,
  dark_logo_url: null,
  light_logo_url: null,
  favicon_url: null,
  pdf_logo_url: null,
  primary_color: "#0F1B3D",
  secondary_color: "#F1F5F9",
  accent_color: "#F59E0B",
  button_color: "#F59E0B",
  text_color: "#0F172A",
  email: "hello@vuralogistics.com",
  phone: "+234 800 000 0000",
  whatsapp: "+234 800 000 0000",
  address: "1 Vura Plaza, Lagos, Nigeria",
  social_facebook: "",
  social_twitter: "",
  social_instagram: "",
  social_linkedin: "",
  google_map_embed: "",
  tracking_prefix: "VURA",
  default_status: "Pending",
  default_payment_status: "unpaid",
  default_delivery_note: "Estimated 3-7 business days",
  pdf_title: "Shipment Tracking Report",
  pdf_footer_note: "Thank you for choosing VURALOGISTICS.",
  pdf_terms:
    "This document is computer generated and serves as proof of shipment tracking. All shipments are handled per VURALOGISTICS terms and conditions.",
  pdf_show_sender: true,
  pdf_show_receiver_email: true,
  pdf_show_payment_status: true,
  pdf_show_company_address: true,
};

interface Ctx {
  settings: SiteSettings;
  loading: boolean;
  refresh: () => Promise<void>;
}

const SettingsCtx = createContext<Ctx>({
  settings: DEFAULT_SETTINGS,
  loading: true,
  refresh: async () => {},
});

function hexToOklch(hex: string): string {
  // Pass-through; CSS supports hex. We just set the var directly.
  return hex;
}

function applyTheme(s: SiteSettings) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.style.setProperty("--primary", hexToOklch(s.primary_color));
  root.style.setProperty("--secondary", hexToOklch(s.secondary_color));
  root.style.setProperty("--accent", hexToOklch(s.accent_color));
  root.style.setProperty("--ring", hexToOklch(s.accent_color));
  root.style.setProperty("--navy", hexToOklch(s.primary_color));
  root.style.setProperty("--navy-deep", hexToOklch(s.primary_color));
  root.style.setProperty("--orange", hexToOklch(s.accent_color));
  root.style.setProperty("--orange-bright", hexToOklch(s.button_color));

  // favicon
  if (s.favicon_url) {
    let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = s.favicon_url;
  }
  // title baseline
  if (typeof document !== "undefined" && s.website_name) {
    const cur = document.title;
    if (!cur || /Veloxa|Vura/i.test(cur)) {
      document.title = `${s.website_name} — ${s.website_tagline}`;
    }
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const { data } = await supabase.from("site_settings").select("*").eq("id", "singleton").maybeSingle();
    if (data) {
      const merged = { ...DEFAULT_SETTINGS, ...data } as SiteSettings;
      setSettings(merged);
      applyTheme(merged);
    } else {
      applyTheme(DEFAULT_SETTINGS);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return <SettingsCtx.Provider value={{ settings, loading, refresh }}>{children}</SettingsCtx.Provider>;
}

export function useSettings() {
  return useContext(SettingsCtx);
}

export function BrandLogo({
  className = "h-9 w-auto",
  variant = "main",
  fallbackTextClass = "text-navy",
}: {
  className?: string;
  variant?: "main" | "dark" | "light";
  fallbackTextClass?: string;
}) {
  const { settings } = useSettings();
  const src =
    variant === "dark"
      ? settings.dark_logo_url || settings.main_logo_url
      : variant === "light"
      ? settings.light_logo_url || settings.main_logo_url
      : settings.main_logo_url;
  if (src) return <img src={src} alt={settings.website_name} className={className} />;
  return <span className={`font-display font-bold ${fallbackTextClass}`}>{settings.website_name}</span>;
}
