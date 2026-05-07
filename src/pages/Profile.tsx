import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Save, User as UserIcon } from "lucide-react";

const profileSchema = z.object({
  display_name: z.string().trim().min(1).max(50),
  minecraft_username: z.string().trim().regex(/^[a-zA-Z0-9_]{3,16}$/, "Username Minecraft non valido (3-16 caratteri, A-Z 0-9 _)").or(z.literal("")),
  favorite_mode: z.string().max(40).optional(),
  bio: z.string().max(300).optional(),
});

const Profile = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ display_name: "", minecraft_username: "", favorite_mode: "Allenamenti", bio: "" });
  const [avatar, setAvatar] = useState<string | null>(null);

  useEffect(() => { if (!loading && !user) navigate("/auth"); }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data) {
        setForm({
          display_name: data.display_name ?? "",
          minecraft_username: data.minecraft_username ?? "",
          favorite_mode: data.favorite_mode ?? "Allenamenti",
          bio: data.bio ?? "",
        });
        setAvatar(data.avatar_url);
      }
    });
  }, [user]);

  const save = async () => {
    if (!user) return;
    const parsed = profileSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Dati non validi");
      return;
    }
    setSaving(true);
    const mc = parsed.data.minecraft_username?.trim() ?? "";
    if (mc) {
      const { data: taken } = await supabase.rpc("is_mc_username_taken", {
        _username: mc, _exclude_user: user.id,
      });
      if (taken) {
        setSaving(false);
        toast.error("Username Minecraft già in uso da un altro utente");
        return;
      }
      try {
        const res = await fetch(`https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(mc)}`);
        if (res.status === 404) {
          setSaving(false);
          toast.error("Questo username non esiste su Minecraft");
          return;
        }
      } catch { /* ignore network errors */ }
    }
    const { error } = await supabase.from("profiles").update(parsed.data).eq("id", user.id);
    setSaving(false);
    if (error) {
      if ((error as { code?: string }).code === "23505") toast.error("Username Minecraft già in uso");
      else toast.error("Errore salvataggio");
    } else toast.success("Profilo aggiornato 🚀");
  };

  const mcAvatar = form.minecraft_username
    ? `https://mc-heads.net/avatar/${encodeURIComponent(form.minecraft_username)}/120`
    : avatar;

  return (
    <Layout>
      <section className="container py-16 max-w-3xl">
        <div className="glass rounded-2xl p-8 animate-fade-in">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-aurora blur-xl opacity-50 rounded-xl" aria-hidden />
              {mcAvatar ? (
                <img src={mcAvatar} alt="avatar" className="relative w-24 h-24 rounded-xl ring-2 ring-primary/50" />
              ) : (
                <div className="relative w-24 h-24 rounded-xl bg-muted flex items-center justify-center ring-2 ring-primary/50">
                  <UserIcon className="w-10 h-10 text-muted-foreground" />
                </div>
              )}
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-gradient">{form.display_name || "Esploratore"}</h1>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              {form.minecraft_username && (
                <p className="text-xs font-mono text-primary-glow mt-1">MC: {form.minecraft_username}</p>
              )}
            </div>
          </div>

          <div className="mt-8 grid gap-5">
            <div>
              <Label>Nome visualizzato</Label>
              <Input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} maxLength={50} />
            </div>
            <div>
              <Label>Username Minecraft</Label>
              <Input
                value={form.minecraft_username}
                onChange={(e) => setForm({ ...form, minecraft_username: e.target.value })}
                placeholder="Es. Notch"
                maxLength={16}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground mt-1">Mostriamo la tua skin e ti colleghiamo alle classifiche.</p>
            </div>
            <div>
              <Label>Modalità preferita</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-input/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={form.favorite_mode}
                onChange={(e) => setForm({ ...form, favorite_mode: e.target.value })}
              >
                <option>Allenamenti</option>
                <option>NexusRoleplay</option>
              </select>
            </div>
            <div>
              <Label>Bio</Label>
              <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} maxLength={300} rows={4} />
            </div>

            <Button variant="hero" size="lg" onClick={save} disabled={saving}>
              <Save /> {saving ? "Salvataggio..." : "Salva profilo"}
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Profile;
