import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageContainer } from "@/components/layout/PageContainer";
import { CredentialIdDisplay } from "@/components/wallet/CredentialIdDisplay";
import { BalanceCard } from "@/components/wallet/BalanceCard";
import {
  ArrowDownLeft,
  ArrowUpRight,
  History,
  Plus,
  Wallet,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { useWalletSession } from "@/hooks/use-wallet-session";
import { useAllBalances, useUserNonce } from "@/hooks/use-contract-read";
import { useQueryClient } from "@tanstack/react-query";

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { session, isLoading: sessionLoading, isConnected } = useWalletSession();
  const {
    data: balances,
    isLoading: balancesLoading,
    isRefetching,
  } = useAllBalances(session?.credentialIdHex);
  const { data: nonce } = useUserNonce(session?.credentialIdHex);

  // Redirect if not connected
  useEffect(() => {
    if (!sessionLoading && !isConnected) {
      navigate("/register");
    }
  }, [sessionLoading, isConnected, navigate]);

  const handleRefresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["allBalances"] });
    void queryClient.invalidateQueries({ queryKey: ["userNonce"] });
  };

  // Calculate total USD value (mock pricing for now)
  const totalUsdValue =
    balances?.reduce((sum, token) => {
      const balance = parseFloat(token.formatted);
      // Mock USD prices
      const prices: Record<string, number> = {
        ETH: 2000,
        USDC: 1,
        USDT: 1,
        DAI: 1,
      };
      const price = prices[token.symbol] ?? 0;
      return sum + balance * price;
    }, 0) ?? 0;

  if (sessionLoading) {
    return (
      <PageContainer>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">{session?.displayName ?? "Forgetless Wallet"}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefetching}
            className="gap-2 self-start sm:self-auto"
          >
            <RefreshCw className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Total Balance Card */}
        <Card className="to-chart-1/5 border-primary/20 bg-gradient-to-br from-primary/5">
          <CardContent className="p-6">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
              <div>
                <p className="mb-1 text-sm text-muted-foreground">Total Balance</p>
                {balancesLoading ? (
                  <div className="h-10 w-32 animate-pulse rounded bg-muted" />
                ) : (
                  <h2 className="text-4xl font-bold text-foreground">
                    ${totalUsdValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </h2>
                )}
              </div>
              <div className="flex gap-3">
                <Link to="/deposit">
                  <Button className="gap-2">
                    <ArrowDownLeft className="h-4 w-4" />
                    Deposit
                  </Button>
                </Link>
                <Link to="/withdraw">
                  <Button variant="outline" className="gap-2">
                    <ArrowUpRight className="h-4 w-4" />
                    Withdraw
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Balances */}
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Your Assets</h3>
              <Button variant="ghost" size="sm" className="gap-2 text-primary">
                <Plus className="h-4 w-4" />
                Add Token
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {balancesLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="border-border/50">
                      <CardContent className="p-4">
                        <div className="h-16 animate-pulse rounded bg-muted" />
                      </CardContent>
                    </Card>
                  ))
                : balances?.map((token) => {
                    const prices: Record<string, number> = { ETH: 2000, USDC: 1, USDT: 1, DAI: 1 };
                    const price = prices[token.symbol] ?? 0;
                    const usdValue = parseFloat(token.formatted) * price;
                    return (
                      <BalanceCard
                        key={token.symbol}
                        symbol={token.symbol}
                        name={token.name}
                        balance={token.formatted}
                        usdValue={usdValue.toFixed(2)}
                        change24h={0}
                      />
                    );
                  })}
            </div>
          </div>

          {/* Receive Section */}
          <div className="space-y-4">
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Wallet className="h-4 w-4 text-primary" />
                  Receive Funds
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {session && <CredentialIdDisplay credentialId={session.credentialIdHex} showQR />}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link to="/deposit" className="block">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <ArrowDownLeft className="h-4 w-4" />
                    Deposit Funds
                  </Button>
                </Link>
                <Link to="/withdraw" className="block">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <ArrowUpRight className="h-4 w-4" />
                    Withdraw Funds
                  </Button>
                </Link>
                <Link to="/history" className="block">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <History className="h-4 w-4" />
                    Transaction History
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Nonce Display */}
            <Card className="border-border/50 bg-muted/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Current Nonce</span>
                  <span className="font-mono text-sm text-foreground">
                    {nonce !== undefined ? String(nonce) : "-"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
