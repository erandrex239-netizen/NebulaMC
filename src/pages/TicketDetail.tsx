import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { ArrowLeft, Send, Shield, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

type Ticket = {
  id: string; title: string; description: string; status: string; priority: string;
  category_id: string | null; user_id: string; created_at: string;
};
type Reply = { id: string; content: string; user_id: string; is_staff: boolean; created_at: string };
type Profile = { id: string; display_name: string | null; minecraft_username: string | null; avatar_url: string | null };

const replySchema = z.string().trim().min(2, "Min 2 caratteri").max(2000, "Max 2000 caratteri");

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isStaff } = useUserRole();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    const { data: t } = await supabase.from("tickets").select("*").eq("id", id).maybeSingle();
    if (!t) { setLoading(false); return; }
    setTicket(t as Ticket);
    const { data: r } = await supabase.from("ticket_replies").select("*").eq("ticket_id", id).order("created_at");
    setReplies((r ?? []) as Reply[]);
    const userIds = Array.from(new Set([t.user_id, ...(r ?? []).map((x: any) => x.user_id)]));
    const { data: profs } = await supabase.from("profiles").select("id, display_name, minecraft_username, avatar_url").in("id", userIds);
    const map: Record<string, Profile> = {};
    (profs ?? []).forEach((p: any) => { map[p.id] = p; });
    setProfiles(map);
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const sendReply = async () => {
    if (!user || !ticket) return;
    const parsed = replySchema.safeParse(content);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setSending(true);
    const { error } = await supabase.from("ticket_replies").insert({
      ticket_id: ticket.id,
      user_id: user.id,
      content: parsed.data,
      is_staff: isStaff,
    });
    setSending(false);
    if (error) { toast.error(error.message); return; }
    setContent("");
    if (isStaff && ticket.status === "open") {
      await supabase.from("tickets").update({ status: "in_progress" }).eq("id", ticket.id);
    }
    load();
  };

  const updateStatus = async (status: string) => {
    if (!ticket) return;
    const { error } = await supabase.from("tickets").update({ status }).eq("id", ticket.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Stato aggiornato");
    load();
  };

  if (loading) return <Layout><div className="container py-16 text-muted-foreground">Caricamento...</div></Layout>;
  if (!ticket) return (
    <Layout>
      <div className="container py-16 text-center">
        <p className="text-muted-foreground">Ticket non trovato o accesso negato.</p>
        <Button className="mt-4" variant="glass" asChild><Link to="/forum"><ArrowLeft /> Torna al forum</Link></Button>
      </div>
    </Layout>
  );

  const author = profiles[ticket.user_id];
  const canReply = !!user && (isStaff || user.id === ticket.user_id) && ticket.status !== "closed";

  return (
    <Layout>
      <section className="container py-10 max-w-4xl">
        <Button variant="ghost" size="sm" onClick={() => navigate("/forum")}><ArrowLeft /> Forum</Button>

        <div className="mt-4 glass rounded-2xl p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 rounded border border-primary/40 bg-primary/10 text-primary-glow">{ticket.status}</span>
                <span className="text-muted-foreground font-mono">priorità: {ticket.priority}</span>
              </div>
              <h1 className="mt-2 font-display text-3xl font-black text-gradient">{ticket.title}</h1>
              <div className="mt-2 text-xs text-muted-foreground">
                Aperto da <span className="text-foreground">{author?.minecraft_username ?? author?.display_name ?? "Utente"}</span> · {new Date(ticket.created_at).toLocaleString("it-IT")}
              </div>
            </div>
            {isStaff && (
              <div className="flex items-center gap-2">
                <Select value={ticket.status} onValueChange={updateStatus}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Aperto</SelectItem>
                    <SelectItem value="in_progress">In corso</SelectItem>
                    <SelectItem value="closed">Chiuso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <p className="mt-4 text-muted-foreground whitespace-pre-wrap">{ticket.description}</p>
        </div>

        <div className="mt-6 space-y-3">
          {replies.map((r) => {
            const p = profiles[r.user_id];
            return (
              <div key={r.id} className={`glass rounded-xl p-4 ${r.is_staff ? "border-accent/50" : ""}`}>
                <div className="flex items-center gap-2 text-xs">
                  {r.is_staff ? <Shield className="w-4 h-4 text-accent" /> : <UserIcon className="w-4 h-4 text-muted-foreground" />}
                  <span className={r.is_staff ? "text-accent font-semibold" : "text-foreground"}>
                    {p?.minecraft_username ?? p?.display_name ?? "Utente"}
                  </span>
                  {r.is_staff && <span className="text-[10px] uppercase tracking-wider text-accent">Staff</span>}
                  <span className="ml-auto text-muted-foreground">{new Date(r.created_at).toLocaleString("it-IT")}</span>
                </div>
                <p className="mt-2 text-sm whitespace-pre-wrap">{r.content}</p>
              </div>
            );
          })}
        </div>

        {canReply ? (
          <div className="mt-6 glass rounded-xl p-4">
            <Textarea placeholder={isStaff ? "Risposta dello staff..." : "Aggiungi un dettaglio..."} rows={4} value={content} onChange={(e) => setContent(e.target.value)} maxLength={2000} />
            <div className="mt-3 flex justify-end">
              <Button variant="hero" onClick={sendReply} disabled={sending}><Send /> {sending ? "Invio..." : "Invia"}</Button>
            </div>
          </div>
        ) : ticket.status === "closed" ? (
          <div className="mt-6 glass rounded-xl p-4 text-center text-muted-foreground text-sm">Questo ticket è chiuso.</div>
        ) : !user ? (
          <div className="mt-6 glass rounded-xl p-4 text-center text-sm">
            <Link to="/auth" className="text-primary-glow underline">Accedi</Link> per partecipare.
          </div>
        ) : null}
      </section>
    </Layout>
  );
};

export default TicketDetail;
