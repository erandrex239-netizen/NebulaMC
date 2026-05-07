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

    // Verify caller is owner or admin
    const { data: roleRows } = await admin.from("user_roles").select("role").eq("user_id", callerId);
    const callerRoles = (roleRows ?? []).map((r: any) => r.role);
    if (!callerRoles.includes("owner") && !callerRoles.includes("admin")) {
      return json({ error: "Forbidden: owner/admin only" }, 403);
    }

    const { minecraft_username, password, role } = await req.json();
    if (typeof minecraft_username !== "string" || !/^[a-zA-Z0-9_]{3,16}$/.test(minecraft_username)) return json({ error: "Username MC non valido" }, 400);
    if (typeof password !== "string" || password.length < 6) return json({ error: "Password troppo corta" }, 400);
    if (!["owner", "admin", "moderator", "user"].includes(role)) return json({ error: "Ruolo non valido" }, 400);

    const email = `${minecraft_username.toLowerCase()}@nebulamc.local`;

    // Check uniqueness (case-insensitive). NB: avoid ILIKE because '_' is a LIKE wildcard.
    const lower = minecraft_username.toLowerCase();
    const [{ data: existCred }, { data: existProfile }, { data: existStaff }] = await Promise.all([
      admin.from("mc_credentials").select("id, minecraft_username"),
      admin.from("profiles").select("id, minecraft_username").not("minecraft_username", "is", null),
      admin.from("staff_members").select("id, minecraft_username"),
    ]);
    const taken =
      (existCred ?? []).some((r: any) => r.minecraft_username?.toLowerCase() === lower) ||
      (existProfile ?? []).some((r: any) => r.minecraft_username?.toLowerCase() === lower) ||
      (existStaff ?? []).some((r: any) => r.minecraft_username?.toLowerCase() === lower);
    if (taken) return json({ error: "Username già registrato" }, 409);

    // Verify the username actually exists on Minecraft (Mojang API)
    try {
      const mojang = await fetch(`https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(minecraft_username)}`);
      if (mojang.status === 404) return json({ error: "Username Minecraft inesistente" }, 400);
    } catch (_) { /* if Mojang is down, allow */ }

    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email, password, email_confirm: true,
      user_metadata: { full_name: minecraft_username },
    });
    if (createErr || !created.user) return json({ error: createErr?.message ?? "Errore creazione utente" }, 500);
    const newUserId = created.user.id;

    await admin.from("mc_credentials").insert({ minecraft_username, email, user_id: newUserId });
    await admin.from("profiles").update({ minecraft_username, display_name: minecraft_username }).eq("id", newUserId);
    if (role !== "user") {
      await admin.from("user_roles").insert({ user_id: newUserId, role });
    }

    return json({ ok: true, user_id: newUserId });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
