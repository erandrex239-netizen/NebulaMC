import { Layout } from "@/components/Layout";
import { ServerIp } from "@/components/ServerIp";
import { Briefcase, Building2, Gavel, HeartPulse, Shield, Banknote, Car, Pickaxe } from "lucide-react";

const jobs = [
  { icon: Shield, name: "Polizia", desc: "Mantieni l'ordine nella metropoli." },
  { icon: HeartPulse, name: "Medico", desc: "Salva vite negli ospedali della città." },
  { icon: Pickaxe, name: "Minatore", desc: "Estrai risorse rare nelle profondità." },
  { icon: Car, name: "Tassista", desc: "Trasporta cittadini per le strade di Nexus." },
  { icon: Banknote, name: "Mercante", desc: "Compra, vendi, costruisci un impero." },
  { icon: Gavel, name: "Politico", desc: "Candidati e cambia le leggi." },
];

const Nexus = () => (
  <Layout>
    {/* Hero */}
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-primary/10 to-nebula-pink/20 blur-3xl" />
      <div className="container relative py-24 text-center">
        <p className="text-xs font-mono uppercase tracking-[0.4em] text-accent">Premium Game Mode</p>
        <h1 className="mt-3 font-display font-black text-5xl md:text-7xl">
          <span className="text-nebula">NexusRoleplay</span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
          Una città intera ti aspetta. Scegli un mestiere, costruisci una reputazione, scrivi la tua leggenda in un mondo persistente.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ServerIp />
        </div>
      </div>
    </section>

    {/* Jobs */}
    <section className="container py-16">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="font-display text-4xl font-bold text-gradient">Lavori disponibili</h2>
        <p className="mt-3 text-muted-foreground">Più di 20 mestieri unici. Ognuno con progressione, abilità e ricompense.</p>
      </div>
      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {jobs.map((j) => (
          <div key={j.name} className="glass rounded-xl p-6 hover:border-accent/60 hover:shadow-glow-accent transition group">
            <div className="w-12 h-12 rounded-lg bg-gradient-aurora flex items-center justify-center group-hover:scale-110 transition">
              <j.icon className="w-6 h-6 text-primary-foreground" />
            </div>
            <h3 className="mt-4 font-display text-xl font-bold">{j.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{j.desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* Lore */}
    <section className="container py-16">
      <div className="glass rounded-3xl p-10 md:p-14 grid md:grid-cols-3 gap-10">
        <div className="md:col-span-2">
          <h2 className="font-display text-4xl font-bold text-gradient">Il mondo di Nexus</h2>
          <p className="mt-4 text-muted-foreground">
            Ambientata su un pianeta colonizzato ai margini della galassia, Nexus City è un crocevia di culture, fazioni e ambizioni. Megacorporazioni, sindacati, gang spaziali e governi si contendono ogni quartiere. Tu chi sarai?
          </p>
          <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
            <li>• Mappa custom da 8.000 blocchi quadrati</li>
            <li>• 50+ NPC con dialoghi e quest</li>
            <li>• Sistema di proprietà immobiliari acquistabili</li>
            <li>• Eventi narrativi cinematografici mensili</li>
          </ul>
        </div>
        <div className="space-y-4">
          {[Building2, Briefcase, Gavel].map((Icon, i) => (
            <div key={i} className="glass rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-nebula flex items-center justify-center"><Icon className="w-5 h-5 text-primary-foreground" /></div>
              <div className="text-sm">
                <div className="font-semibold">{["Città viventi","Carriere","Politica reale"][i]}</div>
                <div className="text-xs text-muted-foreground">{["Quartieri unici","Progressione","Vota le leggi"][i]}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  </Layout>
);

export default Nexus;
