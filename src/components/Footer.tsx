import { Link } from "react-router-dom";
import { Github, Youtube, MessageCircle } from "lucide-react";
import logo from "@/assets/nebula-logo.png";

export const Footer = () => (
  <footer className="relative mt-32 border-t border-border/40">
    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5" />
    <div className="container relative py-12 grid gap-8 md:grid-cols-4">
      <div className="md:col-span-2">
        <div className="flex items-center gap-3">
          <img src={logo} alt="NebulaMC" className="h-12 w-12 rounded-full object-cover ring-1 ring-primary/30" />
          <div>
            <div className="font-display font-bold text-xl text-nebula">NebulaMC</div>
            <div className="text-xs text-muted-foreground tracking-widest uppercase">Beyond the Stars</div>
          </div>
        </div>
        <p className="mt-4 text-sm text-muted-foreground max-w-md">
          Esplora il cosmo Minecraft. Allenati nelle arene di combattimento o vivi avventure epiche su NexusRoleplay.
        </p>
        <div className="mt-4 flex items-center gap-2">
          <code className="px-3 py-2 rounded-md bg-muted/40 border border-border/40 text-sm text-primary-glow font-mono">mc.nebulanetwork.it</code>
        </div>
      </div>

      <div>
        <h4 className="font-display font-semibold text-sm uppercase tracking-wider text-foreground mb-3">Server</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li><Link to="/modes" className="hover:text-primary-glow transition">Modalità</Link></li>
          <li><Link to="/nexus" className="hover:text-primary-glow transition">NexusRoleplay</Link></li>
          <li><Link to="/forum" className="hover:text-primary-glow transition">Forum</Link></li>
          <li><Link to="/store" className="hover:text-primary-glow transition">Store</Link></li>
        </ul>
      </div>

      <div>
        <h4 className="font-display font-semibold text-sm uppercase tracking-wider text-foreground mb-3">Community</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li><Link to="/staff" className="hover:text-primary-glow transition">Staff Team</Link></li>
          <li><Link to="/rules" className="hover:text-primary-glow transition">Regolamento</Link></li>
          <li><Link to="/vote" className="hover:text-primary-glow transition">Vota</Link></li>
        </ul>
        <div className="mt-4 flex gap-3 text-muted-foreground">
          <a href="#" aria-label="Discord" className="hover:text-primary-glow transition"><MessageCircle size={20} /></a>
          <a href="#" aria-label="YouTube" className="hover:text-primary-glow transition"><Youtube size={20} /></a>
          <a href="#" aria-label="GitHub" className="hover:text-primary-glow transition"><Github size={20} /></a>
        </div>
      </div>
    </div>
    <div className="border-t border-border/40">
      <div className="container py-4 text-xs text-muted-foreground flex flex-col sm:flex-row justify-between gap-2">
        <p>© {new Date().getFullYear()} NebulaMC. Not affiliated with Mojang AB.</p>
        <p className="font-mono">v1.0.0 · cosmic edition</p>
      </div>
    </div>
  </footer>
);
