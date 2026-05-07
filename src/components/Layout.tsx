import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { Starfield } from "./Starfield";

export const Layout = ({ children }: { children: ReactNode }) => (
  <div className="relative min-h-screen flex flex-col">
    <Starfield />
    <div className="fixed inset-0 -z-10 nebula-grid opacity-50" aria-hidden />
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);
