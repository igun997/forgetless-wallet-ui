import { IS_TESTNET, CURRENT_NETWORK } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function NetworkOverlay() {
  return (
    <div className="fixed right-4 top-20 z-50">
      <div
        className={cn(
          "rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider shadow-lg",
          "border backdrop-blur-sm",
          IS_TESTNET
            ? "border-amber-500/50 bg-amber-500/90 text-amber-950"
            : "border-emerald-500/50 bg-emerald-500/90 text-emerald-950"
        )}
      >
        {IS_TESTNET ? "TESTNET" : "MAINNET"}
      </div>
      <div className="mt-1 text-right text-[10px] text-muted-foreground">
        {CURRENT_NETWORK.name}
      </div>
    </div>
  );
}
