import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Rule = { id: string; title: string; description: string; category: string; display_order: number };

const Rules = () => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("server_rules").select("*").order("display_order").then(({ data }) => {
      setRules((data ?? []) as Rule[]);
      setLoading(false);
    });
  }, []);

  return (
    <Layout>
      <section className="container py-16 max-w-4xl">
        <div className="text-center">
          <p className="text-xs font-mono uppercase tracking-[0.3em] text-accent">Galactic Code</p>
          <h1 className="mt-3 font-display text-5xl font-black text-gradient">Regolamento</h1>
          <p className="mt-3 text-muted-foreground">Le regole che mantengono il nostro universo un posto piacevole.</p>
        </div>

        <div className="mt-12 space-y-4">
          {loading && <p className="text-center text-muted-foreground">Caricamento…</p>}
          {!loading && rules.length === 0 && (
            <p className="text-center text-muted-foreground py-12">Nessuna regola pubblicata. Lo staff può aggiungerne dal pannello.</p>
          )}
          {rules.map((r, i) => (
            <div key={r.id} className="glass rounded-2xl p-6 flex gap-4 items-start hover:border-primary/40 transition">
              <div className="w-12 h-12 rounded-lg bg-gradient-nebula flex items-center justify-center shrink-0">
                <ShieldAlert className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-accent">{r.category}</p>
                <h3 className="font-display text-xl font-bold">§{i + 1}. {r.title}</h3>
                <p className="mt-1 text-muted-foreground text-sm whitespace-pre-line">{r.description}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">Lo staff si riserva il diritto di sanzionare comportamenti non elencati ma ritenuti inappropriati.</p>
      </section>
    </Layout>
  );
};

export default Rules;
