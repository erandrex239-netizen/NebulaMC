import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Loader2, LogIn } from "lucide-react";
import logo from "@/assets/nebula-logo.png";

const Auth = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
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

  return (
    <Layout>
      <section className="container py-20 min-h-[70vh] flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-aurora opacity-30 blur-3xl rounded-full" aria-hidden />
            <div className="relative glass rounded-2xl p-8 animate-scale-in">
              <img src={logo} alt="NebulaMC" className="w-20 h-20 mx-auto rounded-full ring-1 ring-primary/40 shadow-glow-primary object-cover" />
              <h1 className="mt-5 font-display font-bold text-3xl text-gradient text-center">Accesso</h1>
              <p className="mt-2 text-sm text-muted-foreground text-center">Entra con il tuo nickname Minecraft</p>

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

              <p className="mt-6 text-xs text-muted-foreground text-center">Continuando accetti il nostro <a className="text-primary-glow hover:underline" href="/rules">Regolamento</a>.</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Auth;
