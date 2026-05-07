import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ExternalLink, Star, Gift } from "lucide-react";
import { useEffect } from "react";

const VOTE_URL = "https://minecraft-italia.net/lista/account/gestione-server/2413";

const Vote = () => {
  useEffect(() => {
    const t = setTimeout(() => { window.location.href = VOTE_URL; }, 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <Layout>
      <section className="container py-16 max-w-3xl">
        <div className="text-center">
          <Star className="w-12 h-12 mx-auto text-primary-glow animate-pulse-glow" />
          <h1 className="mt-4 font-display text-5xl font-black text-gradient">Vota NebulaMC</h1>
          <p className="mt-3 text-muted-foreground">Ti stiamo portando alla pagina di voto su Minecraft-Italia...</p>
        </div>

        <div className="mt-10 glass rounded-2xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-gradient-aurora flex items-center justify-center"><Gift className="w-6 h-6 text-primary-foreground" /></div>
          <div>
            <h3 className="font-display font-bold">Ricompense per voto</h3>
            <p className="text-sm text-muted-foreground">100 NebulaCoins · 1 chiave Nebula Crate · 30 min boost XP</p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Button variant="hero" size="lg" asChild>
            <a href={VOTE_URL} target="_blank" rel="noreferrer">
              Vota su Minecraft-Italia <ExternalLink />
            </a>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default Vote;
