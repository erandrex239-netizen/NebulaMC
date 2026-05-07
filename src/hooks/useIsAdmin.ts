import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useIsAdmin = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setIsAdmin(false); setLoading(false); return; }
    let active = true;
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["admin", "owner", "moderator"])
      .then(({ data }) => {
        if (active) { setIsAdmin(!!(data && data.length > 0)); setLoading(false); }
      });
    return () => { active = false; };
  }, [user]);

  return { isAdmin, loading };
};
