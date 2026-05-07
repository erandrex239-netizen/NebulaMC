import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Loader2, LogIn } from "lucide-react";
import logo from "@/assets/nebula-logo.png";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <path fill="#fff" d="M21.35 11.1H12v2.9h5.35c-.23 1.5-1.7 4.4-5.35 4.4-3.22 0-5.85-2.66-5.85-5.95s2.63-5.95 5.85-5.95c1.83 0 3.06.78 3.76 1.45l2.56-2.47C16.65 3.95 14.55 3 12 3 6.98 3 3 6.97 3 12s3.98 9 9 9c5.2 0 8.65-3.65 8.65-8.8 0-.6-.07-1.05-.15-1.5z"/>
  </svg>
);

const Auth = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"google" | "mc">("google");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user) navigate("/profile", { replace: true }); }, [user, navigate]);

  const signInGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/profile" });
    if (result.error) { toast.error("Login fallito. Riprova."); return; }
    if (result.redirected) return;
    navigate("/profile");
  };

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

  return (
    <Layout>
      <section className="container py-20 min-h-[70vh] flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-aurora opacity-30 blur-3xl rounded-full" aria-hidden />
            <div className="relative glass rounded-2xl p-8 animate-scale-in">
              <img src={logo} alt="NebulaMC" className="w-20 h-20 mx-auto rounded-xl ring-1 ring-primary/40 shadow-glow-primary" />
              <h1 className="mt-5 font-display font-bold text-3xl text-gradient text-center">Accesso</h1>
              <p className="mt-2 text-sm text-muted-foreground text-center">Entra nel cosmo di NebulaMC</p>

              <div className="mt-6 grid grid-cols-2 gap-2 p-1 rounded-lg bg-background/40 border border-border/40">
                <button onClick={() => setTab("google")} className={`px-3 py-2 rounded-md text-sm font-mono uppercase tracking-wider transition ${tab === "google" ? "bg-primary/20 text-primary-glow" : "text-muted-foreground"}`}>Player</button>
                <button onClick={() => setTab("mc")} className={`px-3 py-2 rounded-md text-sm font-mono uppercase tracking-wider transition ${tab === "mc" ? "bg-primary/20 text-primary-glow" : "text-muted-foreground"}`}>Staff</button>
              </div>

              {tab === "google" ? (
                <Button variant="nebula" size="xl" className="mt-6 w-full" onClick={signInGoogle}>
                  <GoogleIcon /> Continua con Google
                </Button>
              ) : (
                <form onSubmit={signInMC} className="mt-6 space-y-4">
                  <div>
                    <Label>Username Minecraft</Label>
                    <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Es. Ryzeee_1" maxLength={16} className="font-mono" autoComplete="username" />
                  </div>
                  <div>
                    <Label>Password</Label>
                    <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
                  </div>
                  <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : <LogIn />} Accedi come Staff
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
