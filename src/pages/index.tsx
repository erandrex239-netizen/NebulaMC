import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { ServerIp } from "@/components/ServerIp";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/nebula-logo.png";
import { Sword, Users, Sparkles, Shield, Zap, Trophy, ChevronRight, ChevronDown, Rocket, Calendar, Crown } from "lucide-react";
import { useServerStatus } from "@/hooks/useServerStatus";

const features = [
  { icon: Sword, title: "PvP Cinetico", desc: "Arene di allenamento curate da pro: kit, combo, knockback su misura." },
  { icon: Users, title: "Roleplay Profondo", desc: "NexusRoleplay: città, fazioni, lavori, economia viva e GDR seria." },
  { icon: Shield, title: "Anti-cheat di nuova gen.", desc: "Protezione attiva 24/7 per match puliti e una community sicura." },
  { icon: Zap, title: "Latenza Bassa", desc: "Server europei con hardware dedicato. Prestazioni stellari." },
  { icon: Trophy, title: "Stagioni & Premi", desc: "Classifiche ranked, ricompense esclusive, eventi mensili." },
  { icon: Sparkles, title: "Aggiornamenti Costanti", desc: "Nuove mappe, nuovi contenuti e bilanciamenti ogni settimana." },
];

const staffCrew = ["AstroCmd", "NovaAdmin", "PulsarMod", "BuildMaster", "DevOrbit", "HelperGalaxy", "CometDev", "OrbitMod", "StarHelper", "LunaBuild"];

const Index = () => {
  const [news, setNews] = useState<any[]>([]);
  const { online, players, loading: statusLoading } = useServerStatus();

  const playerCount = players ? players.online.toLocaleString("it-IT") : (statusLoading ? "…" : "0");
  const stats = [
    { label: "Giocatori online", value: playerCount },
    { label: "Modalità", value: "2" },
    { label: "Versione", value: "1.21.x" },
    { label: "Uptime", value: "99.9%" },
  ];

  useEffect(() => {
    supabase
      .from("news")
      .select("id,title,slug,category,image_url,excerpt,published_at")
      .eq("published", true)
      .order("published_at", { ascending: false })
      .limit(3)
      .then(({ data }) => setNews(data ?? []));
  }, []);

  return (
    <Layout>
      {/* HERO — fullscreen cinematic */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-aurora opacity-20 blur-3xl" aria-hidden />
        <div className="container relative grid lg:grid-cols-2 gap-12 items-center py-16">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-mono uppercase tracking-widest text-primary-glow">
              <span className={`h-2 w-2 rounded-full ${online ? "bg-accent" : "bg-muted-foreground"} animate-pulse`} /> {online ? `Server Online · ${playerCount} player` : statusLoading ? "Verifica stato…" : "Server Offline"}
            </div>
            <h1 className="mt-6 font-display font-black text-6xl md:text-8xl leading-[0.9] tracking-tight">
              <span className="text-gradient">NEBULA</span><br />
              <span className="text-nebula">MC</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl">
              Due universi, una sola galassia. Allenati nelle <span className="text-foreground font-semibold">arene PvP</span> più curate d'Italia o vivi una nuova vita su <span className="text-primary-glow">NexusRoleplay</span>.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="hero" size="xl" asChild>
                <Link to="/auth"><Rocket /> Inizia l'avventura</Link>
              </Button>
              <ServerIp />
            </div>
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {stats.map((s) => (
                <div key={s.label} className="glass rounded-lg p-3">
                  <div className="font-display font-bold text-2xl text-gradient">{s.value}</div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative animate-scale-in">
            <div className="absolute inset-0 bg-gradient-aurora rounded-full blur-3xl opacity-40 animate-pulse-glow" aria-hidden />
            <div className="relative animate-float">
              <img src={logo} alt="NebulaMC astronaut floating in nebula" className="w-full max-w-lg mx-auto rounded-full object-cover ring-2 ring-primary/30 drop-shadow-[0_0_60px_hsl(265,90%,65%,0.6)]" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[110%] h-[110%] rounded-full border border-primary/20 animate-orbit" style={{ borderStyle: "dashed" }} />
            </div>
          </div>
        </div>

        <a href="#news" className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground hover:text-primary-glow transition animate-bounce" aria-label="Scorri">
          <ChevronDown className="w-8 h-8" />
        </a>
      </section>

      {/* NEWS — like ZeroRoleplay */}
      <section id="news" className="container py-20">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs font-mono uppercase tracking-[0.3em] text-accent">News & Updates</p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold text-gradient">Le ultime novità</h2>
          <p className="mt-3 text-muted-foreground">Resta aggiornato su eventi, update e annunci dalla galassia.</p>
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {news.map((n) => (
            <Link key={n.id} to={`/news/${n.slug}`} className="group glass rounded-2xl overflow-hidden hover:border-primary/60 hover:shadow-glow-primary transition-all hover:-translate-y-1">
              <div className="relative aspect-video overflow-hidden">
                {n.image_url ? (
                  <img src={n.image_url} alt={n.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                ) : (
                  <div className="w-full h-full bg-gradient-nebula" />
                )}
                <span className="absolute top-3 left-3 px-2 py-1 rounded-md bg-background/80 backdrop-blur text-xs font-mono uppercase tracking-wider text-primary-glow">{n.category}</span>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  {new Date(n.published_at).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" })}
                </div>
                <h3 className="mt-2 font-display font-bold text-xl group-hover:text-primary-glow transition">{n.title}</h3>
                {n.excerpt && <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{n.excerpt}</p>}
              </div>
            </Link>
          ))}
          {news.length === 0 && <p className="col-span-full text-center text-muted-foreground py-8">Nessuna news ancora pubblicata.</p>}
        </div>

        <div className="mt-10 text-center">
          <Button variant="glass" asChild><Link to="/news">Visualizza altre novità <ChevronRight /></Link></Button>
        </div>
      </section>

      {/* MODES */}
      <section className="container py-20">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs font-mono uppercase tracking-[0.3em] text-accent">Game Modes</p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold text-gradient">Scegli la tua orbita</h2>
        </div>
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <Link to="/modes" className="group glass rounded-2xl p-8 hover:border-primary/60 transition-all hover:shadow-glow-primary hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <Sword className="w-12 h-12 text-primary-glow" />
              <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">/play train</span>
            </div>
            <h3 className="mt-6 font-display text-3xl font-bold">Allenamenti Roleplay</h3>
            <p className="mt-2 text-muted-foreground">Affina la tua build, prova kit, simula scenari di combattimento e padroneggia ogni meccanica del gioco.</p>
            <span className="mt-6 inline-flex items-center gap-1 text-primary-glow text-sm font-semibold">Esplora <ChevronRight className="group-hover:translate-x-1 transition" /></span>
          </Link>

          <Link to="/nexus" className="group glass rounded-2xl p-8 hover:border-accent/60 transition-all hover:shadow-glow-accent hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <Users className="w-12 h-12 text-accent" />
              <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">/play nexus</span>
            </div>
            <h3 className="mt-6 font-display text-3xl font-bold">NexusRoleplay</h3>
            <p className="mt-2 text-muted-foreground">Vivi una nuova vita: lavori, fazioni, città, politica, economia. Un universo persistente in continua evoluzione.</p>
            <span className="mt-6 inline-flex items-center gap-1 text-accent text-sm font-semibold">Entra nel mondo <ChevronRight className="group-hover:translate-x-1 transition" /></span>
          </Link>
        </div>
      </section>

      {/* STAFF SPOTLIGHT — like ZeroRoleplay "Vertici dello staff" */}
      <section className="container py-20">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs font-mono uppercase tracking-[0.3em] text-accent">The Crew</p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold text-gradient">Conosci i vertici dello staff</h2>
          <p className="mt-3 text-muted-foreground">Scopri chi rende NebulaMC una galassia in cui valga la pena perdersi.</p>
        </div>

        <div className="mt-12 glass rounded-3xl p-8 md:p-12 grid md:grid-cols-[auto_1fr] gap-8 items-start">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-aurora rounded-full blur-2xl opacity-50" aria-hidden />
            <img src="https://mc-heads.net/body/AstroCmd/200" alt="AstroCmd, fondatore di NebulaMC" className="relative w-40 mx-auto drop-shadow-[0_0_30px_hsl(265,90%,65%,0.5)]" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 text-primary-glow text-xs font-mono uppercase tracking-wider">
              <Crown className="w-3 h-3" /> Fondatore
            </div>
            <h3 className="mt-4 font-display text-3xl font-bold">AstroCmd</h3>
            <p className="mt-3 text-muted-foreground">
              Con oltre <span className="text-foreground font-semibold">6 anni di esperienza</span> nel mondo del Roleplay italiano su Minecraft, AstroCmd è la mente dietro <span className="text-foreground font-semibold">NebulaMC</span>. Ha progettato gran parte delle features di <span className="text-primary-glow">NexusRoleplay</span> e considera lo staff una vera famiglia con cui crescere e divertirsi tra le stelle.
            </p>
            <div className="mt-6">
              <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">La crew</p>
              <div className="flex flex-wrap gap-2">
                {staffCrew.map((n) => (
                  <img key={n} src={`https://mc-heads.net/avatar/${n}/40`} alt={n} title={n} className="w-10 h-10 rounded-md ring-1 ring-border/40 hover:ring-primary/60 transition" />
                ))}
              </div>
              <Button variant="glass" size="sm" className="mt-6" asChild><Link to="/staff">Vedi tutto lo staff <ChevronRight /></Link></Button>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="container py-20">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs font-mono uppercase tracking-[0.3em] text-accent">Why NebulaMC</p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold">Un'esperienza <span className="text-nebula">interstellare</span></h2>
        </div>
        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div key={f.title} className="glass rounded-xl p-6 hover:border-primary/40 transition group">
              <div className="w-12 h-12 rounded-lg bg-gradient-nebula flex items-center justify-center shadow-glow-primary group-hover:scale-110 transition">
                <f.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="mt-4 font-display font-semibold text-xl">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container py-20">
        <div className="relative overflow-hidden rounded-3xl glass p-10 md:p-16 text-center">
          <div className="absolute inset-0 bg-gradient-aurora opacity-20" aria-hidden />
          <div className="relative">
            <h2 className="font-display font-black text-4xl md:text-6xl text-gradient">Pronto al decollo?</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
              Unisciti a oltre 10.000 esploratori. La galassia ti aspetta.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button variant="hero" size="xl" asChild><Link to="/auth"><Rocket /> Crea account</Link></Button>
              <ServerIp />
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
