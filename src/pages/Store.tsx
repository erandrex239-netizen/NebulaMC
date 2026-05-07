import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ExternalLink, ShoppingBag } from "lucide-react";
import { useEffect } from "react";

const STORE_URL = "https://celestyalmc.tebex.io/category/vip-survival";

const Store = () => {
  useEffect(() => {
    const t = setTimeout(() => { window.location.href = STORE_URL; }, 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <Layout>
      <section className="container py-24 max-w-2xl text-center">
        <ShoppingBag className="w-14 h-14 mx-auto text-primary-glow animate-pulse-glow" />
        <h1 className="mt-4 font-display text-5xl font-black text-gradient">Store NebulaMC</h1>
        <p className="mt-4 text-muted-foreground">Ti stiamo trasportando allo store ufficiale...</p>
        <div className="mt-8">
          <Button variant="hero" size="lg" asChild>
            <a href={STORE_URL} target="_blank" rel="noreferrer">
              Vai allo Store <ExternalLink />
            </a>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default Store;
