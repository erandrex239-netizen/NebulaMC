import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Auth from "./pages/Auth.tsx";
import Profile from "./pages/Profile.tsx";
import Modes from "./pages/Modes.tsx";
import Nexus from "./pages/Nexus.tsx";

import Store from "./pages/Store.tsx";
import Staff from "./pages/Staff.tsx";
import Rules from "./pages/Rules.tsx";
import Vote from "./pages/Vote.tsx";
import News from "./pages/News.tsx";
import NewsDetail from "./pages/NewsDetail.tsx";
import Admin from "./pages/Admin.tsx";
import Forum from "./pages/Forum.tsx";
import TicketDetail from "./pages/TicketDetail.tsx";
import { McUsernameGate } from "./components/McUsernameGate.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <McUsernameGate />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/modes" element={<Modes />} />
          <Route path="/nexus" element={<Nexus />} />
          
          <Route path="/store" element={<Store />} />
          <Route path="/staff" element={<Staff />} />
          <Route path="/rules" element={<Rules />} />
          <Route path="/vote" element={<Vote />} />
          <Route path="/news" element={<News />} />
          <Route path="/news/:slug" element={<NewsDetail />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/forum" element={<Forum />} />
          <Route path="/forum/:id" element={<TicketDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
