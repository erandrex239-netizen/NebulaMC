import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, ArrowLeft } from "lucide-react";

const NewsDetail = () => {
  const { slug } = useParams();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("news").select("*").eq("slug", slug!).maybeSingle().then(({ data }) => {
      setItem(data); setLoading(false);
    });
  }, [slug]);

  if (loading) return <Layout><div className="container py-24 text-center text-muted-foreground">Caricamento…</div></Layout>;
  if (!item) return <Layout><div className="container py-24 text-center"><h1 className="font-display text-3xl">News non trovata</h1><Link to="/news" className="text-primary-glow mt-4 inline-block">← Torna alle news</Link></div></Layout>;

  return (
    <Layout>
      <article className="container py-12 max-w-4xl">
        <Link to="/news" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary-glow"><ArrowLeft className="w-4 h-4" /> Tutte le news</Link>
        <div className="mt-6">
          <span className="px-3 py-1 rounded-full bg-primary/15 text-primary-glow text-xs font-mono uppercase tracking-wider">{item.category}</span>
          <h1 className="mt-4 font-display text-4xl md:text-5xl font-black text-gradient">{item.title}</h1>
          <div className="mt-3 flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            {new Date(item.published_at).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" })}
          </div>
        </div>
        {item.image_url && (
          <img src={item.image_url} alt={item.title} className="mt-8 w-full aspect-video object-cover rounded-2xl ring-1 ring-border/40" />
        )}
        {item.excerpt && <p className="mt-8 text-lg text-muted-foreground italic">{item.excerpt}</p>}
        <div className="mt-6 prose prose-invert max-w-none whitespace-pre-wrap text-foreground/90">{item.content}</div>
      </article>
    </Layout>
  );
};

export default NewsDetail;
