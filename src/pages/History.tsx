import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageContainer } from "@/components/layout/PageContainer";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ExternalLink,
  Clock,
  History as HistoryIcon,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWalletSession } from "@/hooks/use-wallet-session";
import {
  useTransactionHistory,
  getExplorerUrl,
  type Transaction,
} from "@/hooks/use-transaction-history";

function TransactionRow({ tx }: { tx: Transaction }) {
  const isDeposit = tx.type === "deposit";
  const timeAgo = getTimeAgo(tx.timestamp);

  const truncateAddress = (addr: string) => {
    if (addr.length <= 13) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatAmount = (amount: string) => {
    const num = parseFloat(amount);
    if (num === 0) return "0";
    if (num < 0.0001) return "<0.0001";
    if (num < 1) return num.toFixed(4);
    if (num < 1000) return num.toFixed(2);
    return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg p-3 transition-colors hover:bg-muted/20 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-4">
      {/* Left: Icon + Details */}
      <div className="flex items-start gap-3 sm:items-center">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
            isDeposit ? "bg-emerald-500/10" : "bg-chart-1/10"
          )}
        >
          {isDeposit ? (
            <ArrowDownLeft className="h-5 w-5 text-emerald-500" />
          ) : (
            <ArrowUpRight className="text-chart-1 h-5 w-5" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1 sm:gap-2">
            <span className="font-medium text-foreground">{isDeposit ? "Received" : "Sent"}</span>
            <span className="truncate font-semibold text-foreground">
              {formatAmount(tx.amount)}
            </span>
            <span className="text-muted-foreground">{tx.asset}</span>
          </div>
          <p className="truncate text-sm text-muted-foreground">
            {isDeposit ? "From: " : "To: "}
            {truncateAddress(tx.address)}
          </p>
        </div>
      </div>

      {/* Right: Status + Time + Link */}
      <div className="pl-13 flex items-center justify-between gap-3 sm:justify-end sm:gap-4 sm:pl-0">
        <div className="flex items-center gap-2 sm:flex-col sm:items-end sm:gap-1">
          <Badge
            variant="default"
            className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
          >
            Confirmed
          </Badge>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {timeAgo}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => window.open(getExplorerUrl(tx.txHash), "_blank")}
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function History() {
  const navigate = useNavigate();
  const { session, isLoading: sessionLoading, isConnected } = useWalletSession();
  const { data: transactions, isLoading: txLoading } = useTransactionHistory(
    session?.credentialIdHex
  );
  const [filter, setFilter] = useState<"all" | "deposits" | "withdrawals">("all");

  // Redirect if not connected
  useEffect(() => {
    if (!sessionLoading && !isConnected) {
      navigate("/register");
    }
  }, [sessionLoading, isConnected, navigate]);

  const filteredTransactions =
    transactions?.filter((tx) => {
      if (filter === "all") return true;
      if (filter === "deposits") return tx.type === "deposit";
      return tx.type === "withdrawal";
    }) ?? [];

  const depositCount = transactions?.filter((tx) => tx.type === "deposit").length ?? 0;
  const withdrawalCount = transactions?.filter((tx) => tx.type === "withdrawal").length ?? 0;
  const totalCount = transactions?.length ?? 0;

  const isLoading = sessionLoading || txLoading;

  return (
    <PageContainer>
      <div className="space-y-6">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
            <HistoryIcon className="h-6 w-6 text-primary" />
            Transaction History
          </h1>
          <p className="mt-1 text-muted-foreground">View all your deposits and withdrawals</p>
        </div>

        <Card className="border-border/50">
          <CardHeader className="px-3 pb-0 sm:px-6">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger
                  value="all"
                  onClick={() => setFilter("all")}
                  className="text-xs sm:text-sm"
                >
                  <span className="sm:hidden">All</span>
                  <span className="hidden sm:inline">All</span>
                  <span className="ml-1">({totalCount})</span>
                </TabsTrigger>
                <TabsTrigger
                  value="deposits"
                  onClick={() => setFilter("deposits")}
                  className="text-xs sm:text-sm"
                >
                  <span className="sm:hidden">In</span>
                  <span className="hidden sm:inline">Deposits</span>
                  <span className="ml-1">({depositCount})</span>
                </TabsTrigger>
                <TabsTrigger
                  value="withdrawals"
                  onClick={() => setFilter("withdrawals")}
                  className="text-xs sm:text-sm"
                >
                  <span className="sm:hidden">Out</span>
                  <span className="hidden sm:inline">Withdrawals</span>
                  <span className="ml-1">({withdrawalCount})</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="px-2 pt-4 sm:px-6">
            {isLoading ? (
              <div className="flex h-48 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredTransactions.length > 0 ? (
              <div className="divide-y divide-border">
                {filteredTransactions.map((tx) => (
                  <TransactionRow key={tx.id} tx={tx} />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/30">
                  <HistoryIcon className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-foreground">No transactions yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your transaction history will appear here
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
