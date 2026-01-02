import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Coins } from "lucide-react";

interface BalanceCardProps {
  symbol: string;
  name: string;
  balance: string;
  usdValue?: string;
  change24h?: number;
  className?: string;
}

export function BalanceCard({
  symbol,
  name,
  balance,
  usdValue,
  change24h,
  className,
}: BalanceCardProps) {
  const isPositive = change24h && change24h >= 0;

  // Format balance to reasonable precision
  const formatBalance = (val: string): string => {
    const num = parseFloat(val);
    if (isNaN(num)) return val;
    if (num === 0) return "0";
    if (num < 0.0001) return "<0.0001";
    if (num < 1) return num.toFixed(6);
    if (num < 1000) return num.toFixed(4);
    return num.toLocaleString("en-US", { maximumFractionDigits: 2 });
  };

  return (
    <Card className={cn("overflow-hidden transition-all hover:shadow-md", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex shrink-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Coins className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">{symbol}</h4>
              <p className="text-xs text-muted-foreground">{name}</p>
            </div>
          </div>
          <div className="min-w-0 text-right">
            <p className="truncate font-semibold text-foreground" title={balance}>
              {formatBalance(balance)}
            </p>
            {usdValue && <p className="truncate text-sm text-muted-foreground">${usdValue}</p>}
            {change24h !== undefined && (
              <div
                className={cn(
                  "flex items-center justify-end gap-1 text-xs",
                  isPositive ? "text-emerald-500" : "text-destructive"
                )}
              >
                {isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {Math.abs(change24h).toFixed(2)}%
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
