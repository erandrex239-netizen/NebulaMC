import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Rocket, Check, X } from "lucide-react";
import logo from "@/assets/nebula-logo.png";

const USERNAME_RE = /^[a-zA-Z0-9_]{3,16}$/;

type Status = "idle" | "checking" | "available" | "taken" | "invalid" | "not_found";

export const McUsernameGate = () => {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const [needs, setNeeds] = useState(false);
  const [checked, setChecked] = useState(false);
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [saving, setSaving] = useState(false);

  // Check whether the current user has a MC username yet
  useEffect(() => {
    if (authLoading) return;
    if (!user) { setNeeds(false); setChecked(true); return; }
    if (location.pathname === "/auth") { setChecked(true); return; }

    let active = true;
    supabase
      .from("profiles")
      .select("minecraft_username")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!active) return;
        const has = !!(data?.minecraft_username && data.minecraft_username.trim() !== "");
        setNeeds(!has);
        setChecked(true);
      });
    return () => { active = false; };
  }, [user, authLoading, location.pathname]);

  // Live validation (format + uniqueness + Mojang existence)
  useEffect(() => {
    if (!needs) return;
    const value = username.trim();
    if (value === "") { setStatus("idle"); return; }
    if (!USERNAME_RE.test(value)) { setStatus("invalid"); return; }
    setStatus("checking");
    const t = setTimeout(async () => {
      try {
        const { data: taken } = await supabase.rpc("is_mc_username_taken", {
          _username: value,
          _exclude_user: user?.id ?? null,
        });
        if (taken) { setStatus("taken"); return; }
        const res = await fetch(`https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(value)}`);
        if (res.status === 404) { setStatus("not_found"); return; }
        setStatus("available");
      } catch {
        setStatus("available"); // fallback if Mojang unreachable
      }
    }, 400);
    return () => clearTimeout(t);
  }, [username, needs, user?.id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const value = username.trim();
    if (status !== "available") {
      toast.error("Scegli un username valido e disponibile");
      return;
    }
    setSaving(true);
    // Re-check uniqueness right before insert (race protection)
    const { data: takenNow } = await supabase.rpc("is_mc_username_taken", {
      _username: value, _exclude_user: user.id,
    });
    if (takenNow) { setSaving(false); setStatus("taken"); return; }

    const { error } = await supabase
      .from("profiles")
      .update({ minecraft_username: value, display_name: value })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      if ((error as { code?: string }).code === "23505") setStatus("taken");
      else toast.error("Errore salvataggio");
      return;
    }
    toast.success(`Benvenuto, ${value} 🚀`);
    setNeeds(false);
  };

  if (!checked || !user || !needs) return null;

  const StatusHint = () => {
    switch (status) {
      case "checking":
        return <span className="text-xs text-muted-foreground flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Verifica in corso…</span>;
      case "available":
        return <span className="text-xs text-emerald-400 flex items-center gap-1"><Check className="w-3 h-3" /> Disponibile</span>;
      case "taken":
        return <span className="text-xs text-destructive flex items-center gap-1"><X className="w-3 h-3" /> Già in uso da un altro utente</span>;
      case "not_found":
        return <span className="text-xs text-destructive flex items-center gap-1"><X className="w-3 h-3" /> Questo username non esiste su Minecraft</span>;
      case "invalid":
        return <span className="text-xs text-destructive flex items-center gap-1"><X className="w-3 h-3" /> 3-16 caratteri: A-Z, 0-9, _</span>;
      default:
        return <span className="text-xs text-muted-foreground">Useremo la tua skin Minecraft come avatar.</span>;
    }
  };

  return (
    <Dialog open onOpenChange={() => { /* not dismissible */ }}>
      <DialogContent
        className="sm:max-w-md glass border-primary/30"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="mx-auto mb-2 relative">
            <div className="absolute inset-0 bg-gradient-aurora opacity-40 blur-2xl rounded-full" aria-hidden />
            <img src={logo} alt="NebulaMC" className="relative w-16 h-16 rounded-xl ring-1 ring-primary/40 shadow-glow-primary" />
          </div>
          <DialogTitle className="text-center font-display text-2xl text-gradient">Imposta il tuo username Minecraft</DialogTitle>
          <DialogDescription className="text-center">
            Per continuare devi collegare il tuo account al tuo nick Minecraft. Sarà unico in tutto il server.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4 mt-2">
          <div>
            <Label>Username Minecraft</Label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Es. Notch"
              maxLength={16}
              autoFocus
              autoComplete="off"
              className="font-mono"
            />
            <div className="mt-1.5"><StatusHint /></div>
          </div>
          <Button
            type="submit"
            variant="hero"
            size="lg"
            className="w-full"
            disabled={saving || status !== "available"}
          >
            {saving ? <Loader2 className="animate-spin" /> : <Rocket />} Conferma e continua
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
