import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Menu, X, Rocket, LogOut, User as UserIcon, Shield } from "lucide-react";
import logo from "@/assets/nebula-logo.png";
import { toast } from "sonner";
import { useIsAdmin } from "@/hooks/useIsAdmin";

const links = [
  { to: "/", label: "Home" },
  { to: "/news", label: "Novità" },
  { to: "/modes", label: "Modalità" },
  { to: "/nexus", label: "Nexus" },
  
  { to: "/store", label: "Store" },
  { to: "/staff", label: "Staff" },
  { to: "/rules", label: "Regole" },
  { to: "/forum", label: "Forum" },
  { to: "/vote", label: "Vota" },
];

export const Navbar = () => {
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Disconnesso. A presto, astronauta.");
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="absolute inset-0 bg-background/60 backdrop-blur-xl border-b border-border/40" />
      <nav className="container relative flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 group">
          <img src={logo} alt="NebulaMC logo" className="h-10 w-10 rounded-lg object-cover ring-1 ring-primary/30 group-hover:ring-primary/70 transition" />
          <span className="font-display font-bold text-lg tracking-wider text-nebula hidden sm:block">NebulaMC</span>
        </Link>

        <div className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive ? "text-primary-glow bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-2">
          {user ? (
            <>
              {isAdmin && (
                <Button variant="glass" size="sm" asChild>
                  <Link to="/admin"><Shield /> Staff Panel</Link>
                </Button>
              )}
              <Button variant="glass" size="sm" asChild>
                <Link to="/profile"><UserIcon /> Profilo</Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={signOut}><LogOut /></Button>
            </>
          ) : (
            <Button variant="hero" size="sm" asChild>
              <Link to="/auth"><Rocket /> Accedi</Link>
            </Button>
          )}
        </div>

        <button className="lg:hidden text-foreground" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X /> : <Menu />}
        </button>
      </nav>

      {open && (
        <div className="lg:hidden relative bg-background/95 backdrop-blur-xl border-b border-border/40">
          <div className="container py-4 flex flex-col gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium ${isActive ? "text-primary-glow bg-primary/10" : "text-muted-foreground"}`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <div className="pt-3 border-t border-border/40 mt-2">
              {user ? (
                <div className="flex gap-2">
                  <Button variant="glass" size="sm" className="flex-1" asChild onClick={() => setOpen(false)}>
                    <Link to="/profile"><UserIcon /> Profilo</Link>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => { setOpen(false); signOut(); }}><LogOut /></Button>
                </div>
              ) : (
                <Button variant="hero" size="sm" className="w-full" asChild onClick={() => setOpen(false)}>
                  <Link to="/auth"><Rocket /> Accedi con Google</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
