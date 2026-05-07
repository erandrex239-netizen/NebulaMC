import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Loader2, LogIn, Shield, Gamepad2 } from "lucide-react";
import logo from "@/assets/nebula-logo.png";

type Mode = "player" | "staff";

const Auth = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("player");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user) navigate("/profile", { replace: true }); }, [user, navigate]);

  const signInMC = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("mc-login", {
        body: { username: username.trim(), password },
      });
      if (error || !data?.session) {
        toast.error(data?.error ?? "Credenziali errate");
        return;
      }
      const { error: setErr } = await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });
      if (setErr) { toast.error("Errore sessione"); return; }
      toast.success(`Benvenuto, ${username} 🚀`);
      navigate("/profile");
    } finally {
      setLoading(false);
    }
  };

  const signInStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) { toast.error("Credenziali staff errate"); return; }
    toast.success("Benvenuto staff 🛡️");
    navigate("/profile");
  };

  return (
    <Layout>
      <section className="container py-20 min-h-[70vh] flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-aurora opacity-30 blur-3xl rounded-full" aria-hidden />
            <div className="relative glass rounded-2xl p-8 animate-scale-in">
              <img src={logo} alt="NebulaMC" className="w-20 h-20 mx-auto rounded-full ring-1 ring-primary/40 shadow-glow-primary object-cover" />
              <h1 className="mt-5 font-display font-bold text-3xl text-gradient text-center">Accesso</h1>

              <div className="mt-5 grid grid-cols-2 gap-1 p-1 rounded-xl bg-background/40 border border-border/40">
                <button type="button" onClick={() => setMode("player")} className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition ${mode === "player" ? "bg-primary/20 text-primary-glow" : "text-muted-foreground"}`}>
                  <Gamepad2 className="w-3.5 h-3.5" /> Player
                </button>
                <button type="button" onClick={() => setMode("staff")} className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition ${mode === "staff" ? "bg-accent/20 text-accent" : "text-muted-foreground"}`}>
                  <Shield className="w-3.5 h-3.5" /> Staff
                </button>
              </div>

              {mode === "player" ? (
                <form onSubmit={signInMC} className="mt-6 space-y-4">
                  <div>
                    <Label>Username Minecraft</Label>
                    <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Es. Ryzeee_1" maxLength={16} className="font-mono" autoComplete="username" autoFocus />
                  </div>
                  <div>
                    <Label>Password</Label>
                    <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
                  </div>
                  <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : <LogIn />} Accedi
                  </Button>
                </form>
              ) : (
                <form onSubmit={signInStaff} className="mt-6 space-y-4">
                  <div>
                    <Label>Email staff</Label>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="staff@nebulamc.it" autoComplete="email" autoFocus />
                  </div>
                  <div>
                    <Label>Password</Label>
                    <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
                  </div>
                  <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : <Shield />} Accedi come staff
                  </Button>
                </form>
              )}

              <p className="mt-6 text-xs text-muted-foreground text-center">Continuando accetti il nostro <a className="text-primary-glow hover:underline" href="/rules">Regolamento</a>.</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Auth;
