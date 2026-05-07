import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type AppRole = "owner" | "admin" | "moderator" | "user";

export const useUserRole = () => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setRoles([]); setLoading(false); return; }
    let active = true;
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (!active) return;
        setRoles(((data ?? []).map((r) => r.role as AppRole)));
        setLoading(false);
      });
    return () => { active = false; };
  }, [user]);

  const isOwner = roles.includes("owner");
  const isAdmin = isOwner || roles.includes("admin");
  const isModerator = isAdmin || roles.includes("moderator");
  const isStaff = isModerator;

  return { roles, isOwner, isAdmin, isModerator, isStaff, loading };
};
