import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, ChevronRight } from "lucide-react";

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  image_url: string | null;
  excerpt: string | null;
  published_at: string;
}

const News = () => {
  const [items, setItems] = useState<NewsItem[]>([]);

  useEffect(() => {
    supabase
      .from("news")
      .select("id,title,slug,category,image_url,excerpt,published_at")
      .eq("published", true)
      .order("published_at", { ascending: false })
      .then(({ data }) => setItems(data ?? []));
  }, []);

  return (
    <Layout>
      <section className="container py-16">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs font-mono uppercase tracking-[0.3em] text-accent">News & Updates</p>
          <h1 className="mt-3 font-display text-5xl font-black text-gradient">Le ultime novità</h1>
          <p className="mt-4 text-muted-foreground">Eventi, aggiornamenti e annunci dalla galassia NebulaMC.</p>
        </div>

        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((n) => (
            <Link to={`/news/${n.slug}`} key={n.id} className="group glass rounded-2xl overflow-hidden hover:border-primary/60 hover:shadow-glow-primary transition-all hover:-translate-y-1">
              <div className="relative aspect-video overflow-hidden">
                {n.image_url ? (
                  <img src={n.image_url} alt={n.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                ) : (
                  <div className="w-full h-full bg-gradient-nebula" />
                )}
                <span className="absolute top-3 left-3 px-2 py-1 rounded-md bg-background/80 backdrop-blur text-xs font-mono uppercase tracking-wider text-primary-glow">
                  {n.category}
                </span>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  {new Date(n.published_at).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" })}
                </div>
                <h3 className="mt-2 font-display font-bold text-xl group-hover:text-primary-glow transition">{n.title}</h3>
                {n.excerpt && <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{n.excerpt}</p>}
                <span className="mt-3 inline-flex items-center gap-1 text-xs text-primary-glow font-semibold">
                  Leggi <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition" />
                </span>
              </div>
            </Link>
          ))}
          {items.length === 0 && (
            <p className="col-span-full text-center text-muted-foreground py-12">Nessuna news pubblicata.</p>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default News;
