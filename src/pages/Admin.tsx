import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Trash2, Plus, Pencil, X, Newspaper, Users, Shield, BookOpen, Package, UserPlus, MessageSquare, Lock } from "lucide-react";
import { Link } from "react-router-dom";

const slugify = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

type TabKey = "tickets" | "news" | "staff" | "users" | "rules" | "store";

const ownerOnly = (isOwner: boolean) => {
  if (!isOwner) toast.error("Solo l'Owner può modificare questa sezione");
  return isOwner;
};

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const { isStaff, isOwner, loading: roleLoading } = useUserRole();
  const [tab, setTab] = useState<TabKey>("tickets");

  if (authLoading || roleLoading) return <Layout><div className="container py-24 text-center text-muted-foreground">Caricamento…</div></Layout>;
  if (!user) return <Layout><div className="container py-24 text-center"><h1 className="font-display text-3xl">Accesso richiesto</h1><Button asChild className="mt-4"><Link to="/auth">Accedi</Link></Button></div></Layout>;
  if (!isStaff) return <Layout><div className="container py-24 text-center"><h1 className="font-display text-3xl">Accesso negato</h1><p className="mt-3 text-muted-foreground">Questa area è riservata allo staff.</p></div></Layout>;

  const tabs: { key: TabKey; label: string; Icon: any }[] = [
    { key: "tickets", label: "Ticket", Icon: MessageSquare },
    { key: "news", label: "News", Icon: Newspaper },
    { key: "staff", label: "Staff", Icon: Shield },
    { key: "users", label: "Account staff", Icon: UserPlus },
    { key: "rules", label: "Regole", Icon: BookOpen },
    { key: "store", label: "Store", Icon: Package },
  ];

  return (
    <Layout>
      <section className="container py-12">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-mono uppercase tracking-[0.3em] text-accent">Staff Panel</p>
            <h1 className="mt-2 font-display text-4xl font-black text-gradient">Pannello di controllo</h1>
            <p className="mt-2 text-muted-foreground">
              {isOwner
                ? "Sei loggato come Owner: hai pieno controllo."
                : "Modalità staff (sola lettura). Solo l'Owner può modificare contenuti del sito."}
            </p>
          </div>
          <div className={`px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider border ${isOwner ? "bg-accent/15 border-accent/50 text-accent" : "bg-muted/30 border-border text-muted-foreground"}`}>
            {isOwner ? "Owner" : "Staff (read-only)"}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-2 p-1 rounded-xl bg-background/40 border border-border/40">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-mono uppercase tracking-wider transition ${tab === t.key ? "bg-primary/20 text-primary-glow" : "text-muted-foreground hover:text-foreground"}`}>
              <t.Icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        <div className="mt-8">
          {tab === "tickets" && <TicketsPanel />}
          {tab === "news" && <NewsPanel userId={user.id} isOwner={isOwner} />}
          {tab === "staff" && <StaffPanel isOwner={isOwner} />}
          {tab === "users" && <UsersPanel isOwner={isOwner} />}
          {tab === "rules" && <RulesPanel isOwner={isOwner} />}
          {tab === "store" && <StorePanel isOwner={isOwner} />}
        </div>
      </section>
    </Layout>
  );
};

const ReadOnlyBanner = () => (
  <div className="glass rounded-xl p-3 mb-4 flex items-center gap-2 text-xs text-muted-foreground border-accent/30">
    <Lock className="w-4 h-4 text-accent" /> Sezione in sola lettura. Solo l'Owner può modificare.
  </div>
);

/* ---------------- TICKETS (visibile a tutto lo staff) ---------------- */
const TicketsPanel = () => {
  const [items, setItems] = useState<any[]>([]);
  const [cats, setCats] = useState<Record<string, string>>({});
  const fetchAll = async () => {
    const [{ data: t }, { data: c }] = await Promise.all([
      supabase.from("tickets").select("*").order("created_at", { ascending: false }),
      supabase.from("ticket_categories").select("id, name"),
    ]);
    setItems(t ?? []);
    const m: Record<string, string> = {};
    (c ?? []).forEach((x: any) => { m[x.id] = x.name; });
    setCats(m);
  };
  useEffect(() => { fetchAll(); }, []);

  const statusColor = (s: string) => ({
    open: "bg-accent/20 text-accent border-accent/40",
    in_progress: "bg-primary/20 text-primary-glow border-primary/40",
    closed: "bg-muted/30 text-muted-foreground border-border",
  } as Record<string, string>)[s] ?? "bg-muted/30";

  return (
    <div className="space-y-3">
      {items.length === 0 && <p className="text-center text-muted-foreground py-12">Nessun ticket.</p>}
      {items.map((t) => (
        <Link key={t.id} to={`/forum/${t.id}`} className="block glass rounded-xl p-4 hover:border-primary/60 transition">
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded border ${statusColor(t.status)}`}>{t.status}</span>
            <span className="text-xs font-mono text-muted-foreground">{cats[t.category_id] ?? "—"}</span>
            <span className="text-xs text-muted-foreground">priorità: {t.priority}</span>
            <span className="ml-auto text-xs text-muted-foreground">{new Date(t.created_at).toLocaleString("it-IT")}</span>
          </div>
          <div className="mt-2 font-display font-semibold">{t.title}</div>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{t.description}</p>
        </Link>
      ))}
    </div>
  );
};

/* ---------------- NEWS ---------------- */
const emptyNews = { id: "", title: "", slug: "", category: "Update", image_url: "", excerpt: "", content: "", published: true };
const NewsPanel = ({ userId, isOwner }: { userId: string; isOwner: boolean }) => {
  const [items, setItems] = useState<any[]>([]);
  const [editing, setEditing] = useState<typeof emptyNews | null>(null);
  const fetchItems = () => supabase.from("news").select("*").order("published_at", { ascending: false }).then(({ data }) => setItems(data ?? []));
  useEffect(() => { fetchItems(); }, []);

  const save = async () => {
    if (!editing || !ownerOnly(isOwner)) return;
    const payload = { ...editing, slug: editing.slug || slugify(editing.title), author_id: userId };
    const { id, ...data } = payload;
    const res = id ? await supabase.from("news").update(data).eq("id", id) : await supabase.from("news").insert(data);
    if (res.error) return toast.error(res.error.message);
    toast.success("Salvato"); setEditing(null); fetchItems();
  };
  const remove = async (id: string) => {
    if (!ownerOnly(isOwner)) return;
    if (!confirm("Eliminare?")) return;
    const { error } = await supabase.from("news").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Eliminata"); fetchItems();
  };

  return (
    <div>
      {!isOwner && <ReadOnlyBanner />}
      {isOwner && <div className="flex justify-end mb-4"><Button variant="hero" onClick={() => setEditing({ ...emptyNews })}><Plus /> Nuova news</Button></div>}
      {editing && isOwner && (
        <div className="glass rounded-2xl p-6 space-y-4 relative mb-6">
          <button onClick={() => setEditing(null)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"><X /></button>
          <h2 className="font-display text-2xl font-bold">{editing.id ? "Modifica" : "Nuova"} news</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div><Label>Titolo</Label><Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value, slug: editing.id ? editing.slug : slugify(e.target.value) })} /></div>
            <div><Label>Slug</Label><Input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} /></div>
            <div><Label>Categoria</Label><Input value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} /></div>
            <div><Label>URL immagine</Label><Input value={editing.image_url} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} /></div>
          </div>
          <div><Label>Estratto</Label><Textarea value={editing.excerpt} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} rows={2} /></div>
          <div><Label>Contenuto</Label><Textarea value={editing.content} onChange={(e) => setEditing({ ...editing, content: e.target.value })} rows={8} /></div>
          <div className="flex items-center gap-2"><input id="pub" type="checkbox" checked={editing.published} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} className="accent-primary" /><Label htmlFor="pub">Pubblicata</Label></div>
          <Button variant="hero" onClick={save}>Salva</Button>
        </div>
      )}
      <div className="space-y-3">
        {items.map((n) => (
          <div key={n.id} className="glass rounded-xl p-4 flex items-center gap-4">
            {n.image_url && <img src={n.image_url} alt="" className="w-20 h-14 object-cover rounded-md" />}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2"><span className="text-xs font-mono uppercase text-primary-glow">{n.category}</span>{!n.published && <span className="text-xs text-muted-foreground">(bozza)</span>}</div>
              <div className="font-semibold truncate">{n.title}</div>
              <div className="text-xs text-muted-foreground">{new Date(n.published_at).toLocaleDateString("it-IT")}</div>
            </div>
            {isOwner && <>
              <Button variant="ghost" size="sm" onClick={() => setEditing({ ...emptyNews, ...n })}><Pencil /></Button>
              <Button variant="ghost" size="sm" onClick={() => remove(n.id)}><Trash2 /></Button>
            </>}
          </div>
        ))}
        {items.length === 0 && <p className="text-center text-muted-foreground py-12">Nessuna news.</p>}
      </div>
    </div>
  );
};

/* ---------------- STAFF MEMBERS ---------------- */
const emptyStaff = { id: "", minecraft_username: "", role: "Helper", bio: "", display_order: 0 };
const StaffPanel = ({ isOwner }: { isOwner: boolean }) => {
  const [items, setItems] = useState<any[]>([]);
  const [editing, setEditing] = useState<typeof emptyStaff | null>(null);
  const fetchItems = () => supabase.from("staff_members").select("*").order("display_order").then(({ data }) => setItems(data ?? []));
  useEffect(() => { fetchItems(); }, []);

  const save = async () => {
    if (!editing || !ownerOnly(isOwner)) return;
    const { id, ...data } = editing;
    const res = id ? await supabase.from("staff_members").update(data).eq("id", id) : await supabase.from("staff_members").insert(data);
    if (res.error) return toast.error(res.error.message);
    toast.success("Salvato"); setEditing(null); fetchItems();
  };
  const remove = async (id: string) => {
    if (!ownerOnly(isOwner)) return;
    if (!confirm("Rimuovere dal sito?")) return;
    const { error } = await supabase.from("staff_members").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Rimosso"); fetchItems();
  };

  return (
    <div>
      {!isOwner && <ReadOnlyBanner />}
      {isOwner && <div className="flex justify-end mb-4"><Button variant="hero" onClick={() => setEditing({ ...emptyStaff })}><Plus /> Aggiungi staffer</Button></div>}
      {editing && isOwner && (
        <div className="glass rounded-2xl p-6 space-y-4 relative mb-6">
          <button onClick={() => setEditing(null)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"><X /></button>
          <h2 className="font-display text-2xl font-bold">{editing.id ? "Modifica" : "Nuovo"} staffer</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div><Label>Username Minecraft</Label><Input value={editing.minecraft_username} onChange={(e) => setEditing({ ...editing, minecraft_username: e.target.value })} className="font-mono" maxLength={16} /></div>
            <div><Label>Ruolo</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-input/40 px-3 py-2 text-sm" value={editing.role} onChange={(e) => setEditing({ ...editing, role: e.target.value })}>
                {["Owner", "Admin", "Moderator", "Builder", "Developer", "Helper", "Support"].map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div><Label>Ordine visualizzazione</Label><Input type="number" value={editing.display_order} onChange={(e) => setEditing({ ...editing, display_order: parseInt(e.target.value) || 0 })} /></div>
          </div>
          <div><Label>Bio</Label><Textarea value={editing.bio ?? ""} onChange={(e) => setEditing({ ...editing, bio: e.target.value })} rows={3} /></div>
          <Button variant="hero" onClick={save}>Salva</Button>
        </div>
      )}
      <div className="grid sm:grid-cols-2 gap-3">
        {items.map((m) => (
          <div key={m.id} className="glass rounded-xl p-4 flex items-center gap-3">
            <img src={`https://mc-heads.net/avatar/${encodeURIComponent(m.minecraft_username)}/64`} alt="" className="w-14 h-14 rounded-lg ring-1 ring-primary/40" />
            <div className="flex-1 min-w-0">
              <div className="font-bold truncate">{m.minecraft_username}</div>
              <div className="text-xs text-primary-glow font-mono uppercase">{m.role}</div>
            </div>
            {isOwner && <>
              <Button variant="ghost" size="sm" onClick={() => setEditing({ ...emptyStaff, ...m, bio: m.bio ?? "" })}><Pencil /></Button>
              <Button variant="ghost" size="sm" onClick={() => remove(m.id)}><Trash2 /></Button>
            </>}
          </div>
        ))}
        {items.length === 0 && <p className="col-span-full text-center text-muted-foreground py-12">Nessuno staffer.</p>}
      </div>
    </div>
  );
};

/* ---------------- STAFF USERS / ROLES ---------------- */
const UsersPanel = ({ isOwner }: { isOwner: boolean }) => {
  const [items, setItems] = useState<any[]>([]);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ minecraft_username: "", password: "", role: "moderator" });

  const fetchItems = async () => {
    if (!isOwner) { setItems([]); return; }
    const { data: creds } = await supabase.from("mc_credentials").select("*").order("created_at", { ascending: false });
    const { data: roles } = await supabase.from("user_roles").select("*");
    const merged = (creds ?? []).map((c: any) => ({
      ...c,
      role: roles?.find((r: any) => r.user_id === c.user_id)?.role ?? "user",
    }));
    setItems(merged);
  };
  useEffect(() => { fetchItems(); }, [isOwner]);

  const create = async () => {
    if (!ownerOnly(isOwner)) return;
    if (!/^[a-zA-Z0-9_]{3,16}$/.test(form.minecraft_username)) return toast.error("Username MC non valido");
    if (form.password.length < 6) return toast.error("Password troppo corta (min 6)");
    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-staff-account", {
        body: { minecraft_username: form.minecraft_username, password: form.password, role: form.role },
      });
      if (error || data?.error) return toast.error(data?.error ?? "Errore creazione");
      toast.success(`Account ${form.minecraft_username} creato`);
      setForm({ minecraft_username: "", password: "", role: "moderator" });
      fetchItems();
    } finally { setCreating(false); }
  };

  const removeStaff = async (item: any) => {
    if (!ownerOnly(isOwner)) return;
    if (!confirm(`Rimuovere completamente ${item.minecraft_username}?`)) return;
    const { data, error } = await supabase.functions.invoke("delete-staff-account", { body: { user_id: item.user_id } });
    if (error || data?.error) return toast.error(data?.error ?? "Errore");
    toast.success("Rimosso");
    fetchItems();
  };

  const changeRole = async (userId: string, newRole: string) => {
    if (!ownerOnly(isOwner)) return;
    await supabase.from("user_roles").delete().eq("user_id", userId);
    if (newRole !== "user") {
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: newRole as any });
      if (error) return toast.error(error.message);
    }
    toast.success("Ruolo aggiornato");
    fetchItems();
  };

  if (!isOwner) return <ReadOnlyBanner />;

  return (
    <div>
      <div className="glass rounded-2xl p-6 mb-6">
        <h2 className="font-display text-xl font-bold mb-4">Crea account staff</h2>
        <div className="grid md:grid-cols-4 gap-3">
          <div><Label>Username MC</Label><Input className="font-mono" value={form.minecraft_username} onChange={(e) => setForm({ ...form, minecraft_username: e.target.value })} maxLength={16} /></div>
          <div><Label>Password</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
          <div><Label>Ruolo</Label>
            <select className="flex h-10 w-full rounded-md border border-input bg-input/40 px-3 py-2 text-sm" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="owner">owner (tutti i permessi)</option>
              <option value="admin">admin</option>
              <option value="moderator">moderator</option>
              <option value="user">user</option>
            </select>
          </div>
          <div className="flex items-end"><Button variant="hero" onClick={create} disabled={creating} className="w-full">{creating ? "..." : "Crea"}</Button></div>
        </div>
      </div>

      <div className="space-y-2">
        {items.map((it) => (
          <div key={it.id} className="glass rounded-xl p-4 flex items-center gap-3">
            <img src={`https://mc-heads.net/avatar/${encodeURIComponent(it.minecraft_username)}/48`} alt="" className="w-12 h-12 rounded-md ring-1 ring-primary/30" />
            <div className="flex-1 min-w-0">
              <div className="font-mono font-bold">{it.minecraft_username}</div>
              <div className="text-xs text-muted-foreground truncate">{it.email}</div>
            </div>
            <select className="h-9 rounded-md border border-input bg-input/40 px-2 text-xs" value={it.role} onChange={(e) => changeRole(it.user_id, e.target.value)}>
              <option value="owner">owner</option>
              <option value="admin">admin</option>
              <option value="moderator">moderator</option>
              <option value="user">user</option>
            </select>
            <Button variant="ghost" size="sm" onClick={() => removeStaff(it)}><Trash2 /></Button>
          </div>
        ))}
        {items.length === 0 && <p className="text-center text-muted-foreground py-12">Nessun account staff.</p>}
      </div>
    </div>
  );
};

/* ---------------- RULES ---------------- */
const emptyRule = { id: "", title: "", description: "", category: "Generale", display_order: 0 };
const RulesPanel = ({ isOwner }: { isOwner: boolean }) => {
  const [items, setItems] = useState<any[]>([]);
  const [editing, setEditing] = useState<typeof emptyRule | null>(null);
  const fetchItems = () => supabase.from("server_rules").select("*").order("display_order").then(({ data }) => setItems(data ?? []));
  useEffect(() => { fetchItems(); }, []);

  const save = async () => {
    if (!editing || !ownerOnly(isOwner)) return;
    const data = {
      title: editing.title,
      description: editing.description,
      category: editing.category,
      display_order: editing.display_order,
    };
    const res = editing.id
      ? await supabase.from("server_rules").update(data).eq("id", editing.id)
      : await supabase.from("server_rules").insert(data);
    if (res.error) return toast.error(res.error.message);
    toast.success("Salvato"); setEditing(null); fetchItems();
  };
  const remove = async (id: string) => {
    if (!ownerOnly(isOwner)) return;
    if (!confirm("Eliminare?")) return;
    await supabase.from("server_rules").delete().eq("id", id);
    fetchItems();
  };

  return (
    <div>
      {!isOwner && <ReadOnlyBanner />}
      {isOwner && <div className="flex justify-end mb-4"><Button variant="hero" onClick={() => setEditing({ ...emptyRule })}><Plus /> Nuova regola</Button></div>}
      {editing && isOwner && (
        <div className="glass rounded-2xl p-6 space-y-4 mb-6 relative">
          <button onClick={() => setEditing(null)} className="absolute top-4 right-4"><X /></button>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2"><Label>Titolo</Label><Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
            <div><Label>Categoria</Label><Input value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} /></div>
          </div>
          <div><Label>Descrizione</Label><Textarea rows={4} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
          <div><Label>Ordine</Label><Input type="number" value={editing.display_order} onChange={(e) => setEditing({ ...editing, display_order: parseInt(e.target.value) || 0 })} /></div>
          <Button variant="hero" onClick={save}>Salva</Button>
        </div>
      )}
      <div className="space-y-2">
        {items.map((r) => (
          <div key={r.id} className="glass rounded-xl p-4 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-xs font-mono uppercase text-accent">{r.category}</div>
              <div className="font-bold">{r.title}</div>
              <div className="text-sm text-muted-foreground line-clamp-1">{r.description}</div>
            </div>
            {isOwner && <>
              <Button variant="ghost" size="sm" onClick={() => setEditing({ ...emptyRule, ...r })}><Pencil /></Button>
              <Button variant="ghost" size="sm" onClick={() => remove(r.id)}><Trash2 /></Button>
            </>}
          </div>
        ))}
        {items.length === 0 && <p className="text-center text-muted-foreground py-12">Nessuna regola.</p>}
      </div>
    </div>
  );
};

/* ---------------- STORE ---------------- */
const emptyPkg = { id: "", name: "", price: 0, description: "", features: [] as string[], color: "primary", display_order: 0, active: true };
const StorePanel = ({ isOwner }: { isOwner: boolean }) => {
  const [items, setItems] = useState<any[]>([]);
  const [editing, setEditing] = useState<typeof emptyPkg | null>(null);
  const [featuresText, setFeaturesText] = useState("");
  const fetchItems = () => supabase.from("store_packages").select("*").order("display_order").then(({ data }) => setItems(data ?? []));
  useEffect(() => { fetchItems(); }, []);

  const startEdit = (it: any) => { setEditing({ ...emptyPkg, ...it }); setFeaturesText((it.features ?? []).join("\n")); };
  const startNew = () => { setEditing({ ...emptyPkg }); setFeaturesText(""); };

  const save = async () => {
    if (!editing || !ownerOnly(isOwner)) return;
    const features = featuresText.split("\n").map(s => s.trim()).filter(Boolean);
    const { id, ...data } = { ...editing, features };
    const res = id ? await supabase.from("store_packages").update(data).eq("id", id) : await supabase.from("store_packages").insert(data);
    if (res.error) return toast.error(res.error.message);
    toast.success("Salvato"); setEditing(null); fetchItems();
  };
  const remove = async (id: string) => {
    if (!ownerOnly(isOwner)) return;
    if (!confirm("Eliminare?")) return;
    await supabase.from("store_packages").delete().eq("id", id);
    fetchItems();
  };

  return (
    <div>
      {!isOwner && <ReadOnlyBanner />}
      {isOwner && <div className="flex justify-end mb-4"><Button variant="hero" onClick={startNew}><Plus /> Nuovo pacchetto</Button></div>}
      {editing && isOwner && (
        <div className="glass rounded-2xl p-6 space-y-4 mb-6 relative">
          <button onClick={() => setEditing(null)} className="absolute top-4 right-4"><X /></button>
          <div className="grid md:grid-cols-3 gap-4">
            <div><Label>Nome</Label><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
            <div><Label>Prezzo (€)</Label><Input type="number" step="0.01" value={editing.price} onChange={(e) => setEditing({ ...editing, price: parseFloat(e.target.value) || 0 })} /></div>
            <div><Label>Colore tema</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-input/40 px-3 py-2 text-sm" value={editing.color} onChange={(e) => setEditing({ ...editing, color: e.target.value })}>
                {["primary", "accent", "secondary", "nebula-pink", "nebula-cyan"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div><Label>Descrizione</Label><Textarea rows={2} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
          <div><Label>Features (una per riga)</Label><Textarea rows={5} value={featuresText} onChange={(e) => setFeaturesText(e.target.value)} /></div>
          <div className="flex items-center gap-4">
            <div><Label>Ordine</Label><Input type="number" value={editing.display_order} onChange={(e) => setEditing({ ...editing, display_order: parseInt(e.target.value) || 0 })} /></div>
            <div className="flex items-center gap-2 mt-6"><input id="active" type="checkbox" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} className="accent-primary" /><Label htmlFor="active">Attivo</Label></div>
          </div>
          <Button variant="hero" onClick={save}>Salva</Button>
        </div>
      )}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((p) => (
          <div key={p.id} className="glass rounded-xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-display font-bold text-lg">{p.name}</div>
                <div className="text-2xl font-black text-gradient">€{Number(p.price).toFixed(2)}</div>
              </div>
              {isOwner && <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => startEdit(p)}><Pencil /></Button>
                <Button variant="ghost" size="sm" onClick={() => remove(p.id)}><Trash2 /></Button>
              </div>}
            </div>
            <p className="text-xs text-muted-foreground mt-2">{p.description}</p>
            {!p.active && <span className="inline-block mt-2 text-xs text-muted-foreground">(disattivato)</span>}
          </div>
        ))}
        {items.length === 0 && <p className="col-span-full text-center text-muted-foreground py-12">Nessun pacchetto.</p>}
      </div>
    </div>
  );
};

export default Admin;
