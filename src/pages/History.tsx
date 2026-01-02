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

  return (
    <div className="flex items-center justify-between rounded-lg p-4 transition-colors hover:bg-muted/20">
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full",
            isDeposit ? "bg-emerald-500/10" : "bg-chart-1/10"
          )}
        >
          {isDeposit ? (
            <ArrowDownLeft className="h-5 w-5 text-emerald-500" />
          ) : (
            <ArrowUpRight className="text-chart-1 h-5 w-5" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">{isDeposit ? "Received" : "Sent"}</span>
            <span className="font-semibold text-foreground">{tx.amount}</span>
            <span className="text-muted-foreground">{tx.asset}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              {isDeposit
                ? `From: ${truncateAddress(tx.address)}`
                : `To: ${truncateAddress(tx.address)}`}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <Badge
            variant="default"
            className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
          >
            Confirmed
          </Badge>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {timeAgo}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
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
          <CardHeader className="pb-0">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all" onClick={() => setFilter("all")}>
                  All ({totalCount})
                </TabsTrigger>
                <TabsTrigger value="deposits" onClick={() => setFilter("deposits")}>
                  Deposits ({depositCount})
                </TabsTrigger>
                <TabsTrigger value="withdrawals" onClick={() => setFilter("withdrawals")}>
                  Withdrawals ({withdrawalCount})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="pt-4">
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
