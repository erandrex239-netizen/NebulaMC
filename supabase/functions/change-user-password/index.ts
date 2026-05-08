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

    // Only owners can change passwords
    const { data: roleRows } = await admin.from("user_roles").select("role").eq("user_id", callerId);
    const callerRoles = (roleRows ?? []).map((r: any) => r.role);
    if (!callerRoles.includes("owner")) return json({ error: "Forbidden: solo Owner" }, 403);

    const { user_id, password } = await req.json();
    if (typeof user_id !== "string" || user_id.length < 8) return json({ error: "user_id non valido" }, 400);
    if (typeof password !== "string" || password.length < 6) return json({ error: "Password troppo corta (min 6)" }, 400);

    const { error: updErr } = await admin.auth.admin.updateUserById(user_id, { password });
    if (updErr) return json({ error: updErr.message }, 500);

    return json({ ok: true });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
