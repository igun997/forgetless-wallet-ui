import { cn } from "@/lib/utils";

interface TokenIconProps {
  symbol: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const TOKEN_COLORS: Record<string, string> = {
  ETH: "from-secondary to-muted",
  USDC: "from-chart-1 to-primary",
  USDT: "from-emerald-500 to-emerald-600",
  DAI: "from-amber-400 to-amber-500",
  WETH: "from-purple-500 to-purple-600",
};

const sizeClasses = {
  sm: "h-6 w-6 text-xs",
  md: "h-8 w-8 text-sm",
  lg: "h-12 w-12 text-base",
};

export function TokenIcon({ symbol, size = "md", className }: TokenIconProps) {
  const colorClass = TOKEN_COLORS[symbol] || "from-muted to-muted-foreground";

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-gradient-to-br font-bold text-primary-foreground shadow-sm",
        colorClass,
        sizeClasses[size],
        className
      )}
    >
      {symbol.charAt(0)}
    </div>
  );
}
