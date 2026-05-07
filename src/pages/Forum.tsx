import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { MessageSquare, Plus, Lock, Bug, Flag, HelpCircle, Gavel, Lightbulb, Shield } from "lucide-react";
import { z } from "zod";

type Category = { id: string; name: string; description: string; color: string; display_order: number };
type Ticket = {
  id: string; title: string; description: string; status: string; priority: string;
  category_id: string | null; user_id: string; created_at: string; updated_at: string;
};

const iconFor = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("bug")) return Bug;
  if (n.includes("segnal")) return Flag;
  if (n.includes("ban") || n.includes("appello")) return Gavel;
  if (n.includes("suggeri")) return Lightbulb;
  return HelpCircle;
};

const ticketSchema = z.object({
  title: z.string().trim().min(5, "Min 5 caratteri").max(120, "Max 120 caratteri"),
  description: z.string().trim().min(10, "Min 10 caratteri").max(2000, "Max 2000 caratteri"),
  category_id: z.string().uuid("Seleziona una categoria"),
  priority: z.enum(["low", "normal", "high", "urgent"]),
});

const Forum = () => {
  const { user } = useAuth();
  const { isStaff } = useUserRole();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [activeCat, setActiveCat] = useState<string | "all">("all");

  const [form, setForm] = useState({ title: "", description: "", category_id: "", priority: "normal" });
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    const [{ data: cats }, { data: tks }] = await Promise.all([
      supabase.from("ticket_categories").select("*").order("display_order"),
      supabase.from("tickets").select("*").order("created_at", { ascending: false }),
    ]);
    setCategories((cats ?? []) as Category[]);
    setTickets((tks ?? []) as Ticket[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const submit = async () => {
    if (!user) { toast.error("Devi accedere per aprire un ticket"); navigate("/auth"); return; }
    const parsed = ticketSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("tickets").insert({
      user_id: user.id,
      title: parsed.data.title,
      description: parsed.data.description,
      category_id: parsed.data.category_id,
      priority: parsed.data.priority,
    });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Ticket inviato!");
    setOpen(false);
    setForm({ title: "", description: "", category_id: "", priority: "normal" });
    load();
  };

  const filtered = activeCat === "all" ? tickets : tickets.filter((t) => t.category_id === activeCat);
  const catName = (id: string | null) => categories.find((c) => c.id === id)?.name ?? "—";

  const statusColor = (s: string) => ({
    open: "bg-accent/20 text-accent border-accent/40",
    in_progress: "bg-primary/20 text-primary-glow border-primary/40",
    closed: "bg-muted/30 text-muted-foreground border-border",
  } as Record<string, string>)[s] ?? "bg-muted/30 text-muted-foreground border-border";

  return (
    <Layout>
      <section className="container py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-mono uppercase tracking-[0.3em] text-accent">Supporto</p>
            <h1 className="mt-2 font-display text-5xl font-black text-gradient">Forum & Ticket</h1>
            <p className="mt-2 text-muted-foreground max-w-xl">Apri una richiesta nelle sezioni sotto. Solo lo staff può rispondere.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="hero" size="lg"><Plus /> Apri ticket</Button>
            </DialogTrigger>
            <DialogContent className="bg-card/95 backdrop-blur-xl border-border/60">
              <DialogHeader><DialogTitle className="font-display text-2xl">Nuovo ticket</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input placeholder="Titolo (min 5 caratteri)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} maxLength={120} />
                <Textarea placeholder="Descrivi il problema..." rows={6} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={2000} />
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Bassa</SelectItem>
                    <SelectItem value="normal">Normale</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>Annulla</Button>
                <Button variant="hero" onClick={submit} disabled={submitting}>{submitting ? "Invio..." : "Invia ticket"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Categories grid */}
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => setActiveCat("all")}
            className={`glass rounded-xl p-5 text-left hover:border-primary/60 transition ${activeCat === "all" ? "border-primary/60 shadow-glow-primary" : ""}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-aurora flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <div className="font-display font-bold">Tutti i ticket</div>
                <div className="text-xs text-muted-foreground">{tickets.length} totali</div>
              </div>
            </div>
          </button>
          {categories.map((c) => {
            const Icon = iconFor(c.name);
            const count = tickets.filter((t) => t.category_id === c.id).length;
            return (
              <button
                key={c.id}
                onClick={() => setActiveCat(c.id)}
                className={`glass rounded-xl p-5 text-left hover:border-primary/60 transition ${activeCat === c.id ? "border-primary/60 shadow-glow-primary" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 ring-1 ring-primary/40 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary-glow" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-display font-bold truncate">{c.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{c.description}</div>
                  </div>
                  <div className="ml-auto text-xs font-mono text-muted-foreground">{count}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Tickets list */}
        <div className="mt-8">
          <h2 className="font-display text-2xl font-bold flex items-center gap-2">
            {isStaff && <Shield className="w-5 h-5 text-accent" />}
            {activeCat === "all" ? "Ticket recenti" : `Sezione: ${catName(activeCat as string)}`}
          </h2>
          {loading ? (
            <div className="mt-4 text-muted-foreground">Caricamento...</div>
          ) : filtered.length === 0 ? (
            <div className="mt-4 glass rounded-xl p-8 text-center text-muted-foreground">
              Nessun ticket {user ? "" : "— accedi per crearne uno"}.
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {filtered.map((t) => (
                <Link key={t.id} to={`/forum/${t.id}`} className="block glass rounded-xl p-5 hover:border-primary/60 transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded border ${statusColor(t.status)}`}>{t.status}</span>
                        <span className="text-xs text-muted-foreground font-mono">{catName(t.category_id)}</span>
                      </div>
                      <h3 className="mt-2 font-display font-semibold truncate">{t.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{t.description}</p>
                    </div>
                    <div className="text-xs text-muted-foreground shrink-0">{new Date(t.created_at).toLocaleDateString("it-IT")}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {!user && (
          <div className="mt-8 glass rounded-xl p-5 flex items-center gap-3">
            <Lock className="w-5 h-5 text-accent" />
            <div className="flex-1 text-sm text-muted-foreground">Devi essere loggato per aprire ticket.</div>
            <Button variant="cyber" size="sm" asChild><Link to="/auth">Accedi</Link></Button>
          </div>
        )}
      </section>
    </Layout>
  );
};

export default Forum;
