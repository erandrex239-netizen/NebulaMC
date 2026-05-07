import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    const userClient = createClient(SUPABASE_URL, ANON_KEY, { global: { headers: { Authorization: authHeader } } });
    const { data: claims, error: claimErr } = await userClient.auth.getClaims(authHeader.replace("Bearer ", ""));
    if (claimErr || !claims?.claims) return json({ error: "Unauthorized" }, 401);

    const callerId = claims.claims.sub;
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    const { data: roleRow } = await admin.from("user_roles").select("role").eq("user_id", callerId).eq("role", "admin").maybeSingle();
    if (!roleRow) return json({ error: "Forbidden: admin only" }, 403);

    const { user_id } = await req.json();
    if (typeof user_id !== "string") return json({ error: "user_id richiesto" }, 400);
    if (user_id === callerId) return json({ error: "Non puoi eliminare te stesso" }, 400);

    // Cleanup linked rows (RLS-safe via service role)
    await admin.from("mc_credentials").delete().eq("user_id", user_id);
    await admin.from("user_roles").delete().eq("user_id", user_id);
    await admin.from("staff_members").delete().eq("user_id", user_id);
    await admin.from("profiles").delete().eq("id", user_id);

    const { error } = await admin.auth.admin.deleteUser(user_id);
    if (error) return json({ error: error.message }, 500);

    return json({ ok: true });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
