import { Card, CardContent } from "@/components/ui/card";
import { TokenIcon } from "./TokenIcon";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

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

  return (
    <Card className={cn("overflow-hidden transition-all hover:shadow-md", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TokenIcon symbol={symbol} size="lg" />
            <div>
              <h4 className="font-semibold text-foreground">{symbol}</h4>
              <p className="text-xs text-muted-foreground">{name}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold text-foreground">{balance}</p>
            {usdValue && <p className="text-sm text-muted-foreground">${usdValue}</p>}
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
