// One-time client-side trigger to ensure admin + sample data exist.
import { supabase } from "@/integrations/supabase/client";

let triggered = false;
export async function ensureSeed() {
  if (triggered || typeof window === "undefined") return;
  triggered = true;
  if (sessionStorage.getItem("vura-seeded") === "1") return;
  try {
    await supabase.functions.invoke("seed-admin", { body: {} });
    sessionStorage.setItem("vura-seeded", "1");
  } catch {
    /* ignore */
  }
}
