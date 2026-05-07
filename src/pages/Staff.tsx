import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Crown, Shield, Wrench, Headset, Star } from "lucide-react";

const roleIcon = (role: string) => {
  const r = role.toLowerCase();
  if (r.includes("owner")) return { Icon: Crown, color: "text-yellow-300" };
  if (r.includes("admin")) return { Icon: Shield, color: "text-primary-glow" };
  if (r.includes("mod")) return { Icon: Shield, color: "text-accent" };
  if (r.includes("build")) return { Icon: Wrench, color: "text-nebula-pink" };
  if (r.includes("dev")) return { Icon: Wrench, color: "text-secondary" };
  if (r.includes("help") || r.includes("support")) return { Icon: Headset, color: "text-nebula-cyan" };
  return { Icon: Star, color: "text-primary" };
};

const Staff = () => {
  const [team, setTeam] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("staff_members").select("*").order("display_order").then(({ data }) => setTeam(data ?? []));
  }, []);

  return (
    <Layout>
      <section className="container py-16">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs font-mono uppercase tracking-[0.3em] text-accent">The Crew</p>
          <h1 className="mt-3 font-display text-5xl font-black text-gradient">Lo Staff</h1>
          <p className="mt-3 text-muted-foreground">Gli astronauti che mantengono la galassia in orbita.</p>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {team.map((m) => {
            const { Icon, color } = roleIcon(m.role);
            return (
              <div key={m.id} className="glass rounded-2xl p-6 flex items-center gap-4 hover:border-primary/60 transition">
                <img src={`https://mc-heads.net/avatar/${encodeURIComponent(m.minecraft_username)}/80`} alt={m.minecraft_username} className="w-16 h-16 rounded-xl ring-2 ring-primary/40" />
                <div className="flex-1 min-w-0">
                  <div className="font-display font-bold text-lg truncate">{m.minecraft_username}</div>
                  <div className="flex items-center gap-1 text-sm">
                    <Icon className={`w-4 h-4 ${color}`} />
                    <span className="text-muted-foreground">{m.role}</span>
                  </div>
                  {m.bio && <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{m.bio}</p>}
                </div>
              </div>
            );
          })}
          {team.length === 0 && <p className="col-span-full text-center text-muted-foreground py-12">Nessun membro staff configurato.</p>}
        </div>
      </section>
    </Layout>
  );
};

export default Staff;
