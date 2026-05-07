import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ServerIp = ({ ip = "mc.nebulanetwork.it" }: { ip?: string }) => {
  const [copied, setCopied] = useState(false);
  useEffect(() => { if (copied) { const t = setTimeout(() => setCopied(false), 1500); return () => clearTimeout(t); } }, [copied]);
  return (
    <Button
      variant="cyber"
      size="lg"
      onClick={() => { navigator.clipboard.writeText(ip); setCopied(true); toast.success("IP copiato!"); }}
      className="font-mono"
    >
      {copied ? <Check /> : <Copy />} {ip}
    </Button>
  );
};
