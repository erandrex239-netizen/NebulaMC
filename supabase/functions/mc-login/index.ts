import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { username, password } = await req.json();
    if (typeof username !== "string" || typeof password !== "string" || username.length < 3 || username.length > 16) {
      return json({ error: "Username o password non validi" }, 400);
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Lookup email by username (case-insensitive)
    const { data: cred } = await admin
      .from("mc_credentials")
      .select("email")
      .ilike("minecraft_username", username)
      .maybeSingle();

    if (!cred) return json({ error: "Account non trovato" }, 404);

    // Use anon client to sign in and return a real session
    const anon = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );
    const { data, error } = await anon.auth.signInWithPassword({ email: cred.email, password });
    if (error || !data.session) return json({ error: "Credenziali errate" }, 401);

    return json({ session: data.session });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
