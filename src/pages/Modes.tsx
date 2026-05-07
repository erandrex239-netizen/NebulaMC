import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ServerIp } from "@/components/ServerIp";
import { Sword, Users, Target, Map, Crown, Coins } from "lucide-react";

const Modes = () => (
  <Layout>
    <section className="container py-16">
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-xs font-mono uppercase tracking-[0.3em] text-accent">Game Modes</p>
        <h1 className="mt-3 font-display text-5xl font-black text-gradient">Le nostre modalità</h1>
        <p className="mt-4 text-muted-foreground">Due esperienze, una galassia. Scegli il tuo destino.</p>
      </div>

      <div className="mt-16 space-y-12">
        {/* Allenamenti */}
        <div className="glass rounded-3xl p-8 md:p-12 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 text-primary-glow text-xs font-mono uppercase tracking-wider">
              /play train · 1.21+
            </div>
            <h2 className="mt-4 font-display text-4xl font-bold">Allenamenti Roleplay</h2>
            <p className="mt-3 text-muted-foreground">
              L'arena di addestramento per chi prende sul serio il combattimento. Pratica build, kit personalizzati, scenari realistici e simulazioni di battaglia.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              <li className="flex gap-2"><Target className="w-5 h-5 text-primary-glow shrink-0" /> Aim & PvP trainer con bot intelligenti</li>
              <li className="flex gap-2"><Sword className="w-5 h-5 text-primary-glow shrink-0" /> 1v1, 2v2, FFA con kit competitivi</li>
              <li className="flex gap-2"><Crown className="w-5 h-5 text-primary-glow shrink-0" /> Classifica ELO ranked stagionale</li>
              <li className="flex gap-2"><Map className="w-5 h-5 text-primary-glow shrink-0" /> 30+ mappe curate dalla community</li>
            </ul>
            <div className="mt-8 flex gap-3"><ServerIp /></div>
          </div>
          <div className="relative aspect-square">
            <div className="absolute inset-0 bg-gradient-aurora rounded-full blur-3xl opacity-30" aria-hidden />
            <div className="relative h-full glass rounded-2xl flex items-center justify-center">
              <Sword className="w-40 h-40 text-primary-glow animate-pulse-glow" strokeWidth={1} />
            </div>
          </div>
        </div>

        {/* Nexus */}
        <div className="glass rounded-3xl p-8 md:p-12 grid md:grid-cols-2 gap-10 items-center">
          <div className="relative aspect-square md:order-1 order-2">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/40 to-nebula-pink/40 rounded-full blur-3xl opacity-30" aria-hidden />
            <div className="relative h-full glass rounded-2xl flex items-center justify-center">
              <Users className="w-40 h-40 text-accent animate-pulse-glow" strokeWidth={1} />
            </div>
          </div>
          <div className="md:order-2 order-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 text-accent text-xs font-mono uppercase tracking-wider">
              /play nexus · roleplay seria
            </div>
            <h2 className="mt-4 font-display text-4xl font-bold">NexusRoleplay</h2>
            <p className="mt-3 text-muted-foreground">
              Un universo vivente. Diventa medico, poliziotto, criminale, sindaco o avventuriero. Scrivi la tua storia in una città che ricorda le tue azioni.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              <li className="flex gap-2"><Coins className="w-5 h-5 text-accent shrink-0" /> Economia realistica, lavori, banche, mercati</li>
              <li className="flex gap-2"><Users className="w-5 h-5 text-accent shrink-0" /> Fazioni, gang, governi e politica</li>
              <li className="flex gap-2"><Map className="w-5 h-5 text-accent shrink-0" /> Mappa custom 8K x 8K con città dettagliate</li>
              <li className="flex gap-2"><Crown className="w-5 h-5 text-accent shrink-0" /> Eventi narrativi mensili e quest line</li>
            </ul>
            <div className="mt-8 flex gap-3">
              <Button variant="nebula" size="lg" asChild><Link to="/nexus">Scopri di più</Link></Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </Layout>
);

export default Modes;
