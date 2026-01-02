import { cn } from "@/lib/utils";
import { Wifi, WifiOff } from "lucide-react";

interface NetworkBadgeProps {
  network: "base" | "baseSepolia";
  connected?: boolean;
  className?: string;
}

export function NetworkBadge({ network, connected = true, className }: NetworkBadgeProps) {
  const networkConfig = {
    base: { name: "Base", color: "bg-primary/10 text-primary border-primary/20" },
    baseSepolia: { name: "Base Sepolia", color: "bg-chart-1/10 text-chart-1 border-chart-1/20" },
  };

  const config = networkConfig[network];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium",
        config.color,
        className
      )}
    >
      {connected ? (
        <Wifi className="h-3.5 w-3.5" />
      ) : (
        <WifiOff className="h-3.5 w-3.5 text-destructive" />
      )}
      <span>{config.name}</span>
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          connected ? "animate-pulse bg-emerald-500" : "bg-destructive"
        )}
      />
    </div>
  );
}
