// Seeds the super admin user and sample shipments. Idempotent.
// deno-lint-ignore-file
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  const ADMIN_EMAIL = "admin@vura.ng";
  const ADMIN_PASSWORD = "12345678";

  // Find or create admin user
  let userId: string | undefined;
  const { data: list } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
  const existing = list?.users.find((u) => u.email?.toLowerCase() === ADMIN_EMAIL);
  if (existing) {
    userId = existing.id;
  } else {
    const { data: created, error } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { name: "Vura Admin" },
    });
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...cors, "content-type": "application/json" } });
    userId = created.user!.id;
  }

  // Ensure role
  await supabase.from("user_roles").upsert(
    { user_id: userId, role: "super_admin" },
    { onConflict: "user_id,role", ignoreDuplicates: true },
  );

  // Seed sample shipments if none exist
  const { count } = await supabase.from("shipments").select("*", { count: "exact", head: true });
  if ((count ?? 0) === 0) {
    const samples = [
      {
        tracking_number: "VURA-2026-100001",
        sender_name: "Acme Co.", sender_phone: "+234 800 111 2222", sender_email: "ops@acme.com", sender_address: "12 Marina Rd, Lagos",
        receiver_name: "Jane Okafor", receiver_phone: "+234 900 333 4444", receiver_email: "jane@example.com", receiver_address: "45 Wuse II, Abuja",
        package_name: "Electronics", package_type: "Box", package_weight: 4.5, package_quantity: 1,
        pickup_location: "Lagos, NG", delivery_location: "Abuja, NG", current_location: "Ibadan Sorting Hub",
        status: "In Transit", estimated_delivery_date: "2026-05-15", delivery_fee: 7500, payment_status: "paid",
        note: "Handle with care", created_by: userId,
      },
      {
        tracking_number: "VURA-2026-100002",
        sender_name: "GreenLeaf Foods", sender_phone: "+234 802 555 6677", sender_email: "ship@greenleaf.ng", sender_address: "7 Allen Ave, Ikeja",
        receiver_name: "Tunde Bello", receiver_phone: "+234 905 222 3344", receiver_email: "tunde@example.com", receiver_address: "Plot 9 GRA, Port Harcourt",
        package_name: "Frozen goods", package_type: "Cooler", package_weight: 12.0, package_quantity: 2,
        pickup_location: "Lagos, NG", delivery_location: "Port Harcourt, NG", current_location: "Lagos Warehouse",
        status: "Pending", estimated_delivery_date: "2026-05-18", delivery_fee: 15200, payment_status: "unpaid",
        note: null, created_by: userId,
      },
      {
        tracking_number: "VURA-2026-100003",
        sender_name: "Veloxa HQ", sender_phone: "+234 803 999 0011", sender_email: "hq@vura.ng", sender_address: "1 Vura Plaza, Lagos",
        receiver_name: "Amaka Eze", receiver_phone: "+234 906 121 3434", receiver_email: "amaka@example.com", receiver_address: "12 Ridge Rd, Enugu",
        package_name: "Documents", package_type: "Envelope", package_weight: 0.4, package_quantity: 1,
        pickup_location: "Lagos, NG", delivery_location: "Enugu, NG", current_location: "Delivered to recipient",
        status: "Delivered", estimated_delivery_date: "2026-05-09", delivery_fee: 3500, payment_status: "paid",
        note: "Signed by A. Eze", created_by: userId,
      },
    ];
    await supabase.from("shipments").insert(samples);
  }

  return new Response(
    JSON.stringify({ ok: true, user_id: userId, email: ADMIN_EMAIL }),
    { headers: { ...cors, "content-type": "application/json" } },
  );
});
