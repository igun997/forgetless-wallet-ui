import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageContainer } from "@/components/layout/PageContainer";
import { CredentialIdDisplay } from "@/components/wallet/CredentialIdDisplay";
import { BalanceCard } from "@/components/wallet/BalanceCard";
import { ArrowDownLeft, ArrowUpRight, History, Plus, Wallet, RefreshCw } from "lucide-react";

// Mock balances for UI display
const mockBalances = [
  { symbol: "ETH", name: "Ethereum", balance: "1.2345", usdValue: "2,469.00", change24h: 2.34 },
  { symbol: "USDC", name: "USD Coin", balance: "500.00", usdValue: "500.00", change24h: 0.01 },
  { symbol: "USDT", name: "Tether USD", balance: "250.00", usdValue: "250.00", change24h: -0.02 },
  { symbol: "DAI", name: "Dai Stablecoin", balance: "100.00", usdValue: "100.00", change24h: 0.0 },
];

export default function Dashboard() {
  const [credentialId, setCredentialId] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Load credential from localStorage
    const stored = localStorage.getItem("forgetless_credential");
    if (stored) {
      setCredentialId(stored);
    } else {
      // Generate a mock credential for demo
      const mock =
        "0x" +
        Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      setCredentialId(mock);
      localStorage.setItem("forgetless_credential", mock);
    }
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsRefreshing(false);
  };

  const totalUsdValue = mockBalances.reduce(
    (sum, b) => sum + parseFloat(b.usdValue.replace(",", "")),
    0
  );

  return (
    <PageContainer>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Manage your Forgetless Wallet</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void handleRefresh()}
            className="gap-2 self-start sm:self-auto"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Total Balance Card */}
        <Card className="to-chart-1/5 border-primary/20 bg-gradient-to-br from-primary/5">
          <CardContent className="p-6">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
              <div>
                <p className="mb-1 text-sm text-muted-foreground">Total Balance</p>
                <h2 className="text-4xl font-bold text-foreground">
                  ${totalUsdValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </h2>
                <p className="mt-1 text-sm text-emerald-500">+$45.32 (1.38%) today</p>
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
              {mockBalances.map((token) => (
                <BalanceCard
                  key={token.symbol}
                  symbol={token.symbol}
                  name={token.name}
                  balance={token.balance}
                  usdValue={token.usdValue}
                  change24h={token.change24h}
                />
              ))}
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
                <CredentialIdDisplay credentialId={credentialId} showQR />
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
                  <span className="font-mono text-sm text-foreground">0</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
