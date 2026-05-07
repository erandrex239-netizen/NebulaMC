import { useEffect, useState } from "react";

export type ServerStatus = {
  online: boolean;
  players: { online: number; max: number } | null;
  loading: boolean;
};

export const useServerStatus = (host = "mc.nebulanetwork.it", intervalMs = 30000): ServerStatus => {
  const [state, setState] = useState<ServerStatus>({ online: false, players: null, loading: true });

  useEffect(() => {
    let cancelled = false;
    const fetchStatus = async () => {
      try {
        const res = await fetch(`https://api.mcsrvstat.us/3/${host}`);
        const data = await res.json();
        if (cancelled) return;
        setState({
          online: !!data.online,
          players: data.players ? { online: data.players.online ?? 0, max: data.players.max ?? 0 } : null,
          loading: false,
        });
      } catch {
        if (!cancelled) setState({ online: false, players: null, loading: false });
      }
    };
    fetchStatus();
    const id = setInterval(fetchStatus, intervalMs);
    return () => { cancelled = true; clearInterval(id); };
  }, [host, intervalMs]);

  return state;
};
