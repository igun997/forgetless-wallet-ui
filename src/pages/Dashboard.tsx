import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  X,
} from "lucide-react";
import { useWalletSession } from "@/hooks/use-wallet-session";
import { useUserNonce, useAllBalances } from "@/hooks/use-contract-read";
import { useCustomTokens } from "@/hooks/use-custom-tokens";
import { useWalletTokens } from "@/hooks/use-wallet-tokens";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { CustomToken } from "@/lib/constants";

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { session, isLoading: sessionLoading, isConnected } = useWalletSession();
  const { customTokens, addToken } = useCustomTokens();
  const { data: walletBalances, isLoading: walletLoading, isRefetching } = useWalletTokens();
  const { data: contractBalances, isLoading: contractLoading } = useAllBalances(
    session?.credentialIdHex,
    customTokens
  );
  const { data: nonce } = useUserNonce(session?.credentialIdHex);

  const balancesLoading = walletLoading || contractLoading;

  const [showAddToken, setShowAddToken] = useState(false);
  const [tokenAddress, setTokenAddress] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [tokenName, setTokenName] = useState("");
  const [tokenDecimals, setTokenDecimals] = useState("18");

  // Redirect if not connected
  useEffect(() => {
    if (!sessionLoading && !isConnected) {
      navigate("/register");
    }
  }, [sessionLoading, isConnected, navigate]);

  const handleRefresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["walletTokens"] });
    void queryClient.invalidateQueries({ queryKey: ["allBalances"] });
    void queryClient.invalidateQueries({ queryKey: ["userNonce"] });
  };

  const handleAddToken = () => {
    if (!/^0x[a-fA-F0-9]{40}$/.test(tokenAddress)) {
      toast.error("Invalid address format");
      return;
    }
    if (!tokenSymbol.trim()) {
      toast.error("Symbol is required");
      return;
    }

    const newToken: CustomToken = {
      address: tokenAddress as `0x${string}`,
      symbol: tokenSymbol.toUpperCase(),
      name: tokenName || tokenSymbol,
      decimals: parseInt(tokenDecimals, 10) || 18,
    };

    addToken(newToken);
    toast.success(`${newToken.symbol} added`);
    setShowAddToken(false);
    setTokenAddress("");
    setTokenSymbol("");
    setTokenName("");
    setTokenDecimals("18");
    handleRefresh();
  };

  // Filter wallet tokens with balance > 0
  const walletTokensWithBalance = walletBalances?.filter((t) => parseFloat(t.balance) > 0) ?? [];

  // Filter contract balances with balance > 0
  const contractTokensWithBalance =
    contractBalances?.filter((t) => parseFloat(t.formatted) > 0) ?? [];

  // Calculate total USD value from CONTRACT balances (deposited in Forgetless)
  const totalUsdValue = contractTokensWithBalance.reduce((sum, t) => {
    const balance = parseFloat(t.formatted);
    const prices: Record<string, number> = {
      ETH: 2000,
      USDC: 1,
      USDT: 1,
      DAI: 1,
    };
    const price = prices[t.symbol] ?? 0;
    return sum + balance * price;
  }, 0);

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
      <div className="space-y-6">
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
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="mb-1 text-sm text-muted-foreground">Total Balance</p>
                {balancesLoading ? (
                  <div className="h-10 w-32 animate-pulse rounded bg-muted" />
                ) : (
                  <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
                    ${totalUsdValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </h2>
                )}
              </div>
              <div className="flex gap-2">
                <Link to="/deposit">
                  <Button size="sm" className="gap-2">
                    <ArrowDownLeft className="h-4 w-4" />
                    Deposit
                  </Button>
                </Link>
                <Link to="/withdraw">
                  <Button variant="outline" size="sm" className="gap-2">
                    <ArrowUpRight className="h-4 w-4" />
                    Withdraw
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Balances - Left Column */}
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Your Assets</h3>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-primary"
                onClick={() => setShowAddToken(!showAddToken)}
              >
                {showAddToken ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {showAddToken ? "Cancel" : "Add Token"}
              </Button>
            </div>

            {/* Add Token Form */}
            {showAddToken && (
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="p-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label className="text-xs">Contract Address</Label>
                      <Input
                        value={tokenAddress}
                        onChange={(e) => setTokenAddress(e.target.value)}
                        placeholder="0x..."
                        className="mt-1 font-mono text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Symbol</Label>
                      <Input
                        value={tokenSymbol}
                        onChange={(e) => setTokenSymbol(e.target.value)}
                        placeholder="USDC"
                        className="mt-1 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Name (optional)</Label>
                      <Input
                        value={tokenName}
                        onChange={(e) => setTokenName(e.target.value)}
                        placeholder="USD Coin"
                        className="mt-1 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Decimals</Label>
                      <Input
                        type="number"
                        value={tokenDecimals}
                        onChange={(e) => setTokenDecimals(e.target.value)}
                        placeholder="18"
                        className="mt-1 text-xs"
                      />
                    </div>
                  </div>
                  <Button onClick={handleAddToken} size="sm" className="mt-3 w-full">
                    Add Token
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Contract Balances (In Forgetless) */}
            <h4 className="text-sm font-medium text-muted-foreground">In Forgetless Contract</h4>
            <div className="grid gap-3 sm:grid-cols-2">
              {contractLoading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <Card key={i} className="border-border/50">
                    <CardContent className="p-4">
                      <div className="h-14 animate-pulse rounded bg-muted" />
                    </CardContent>
                  </Card>
                ))
              ) : contractTokensWithBalance.length > 0 ? (
                contractTokensWithBalance.map((t) => {
                  const prices: Record<string, number> = {
                    ETH: 2000,
                    USDC: 1,
                    USDT: 1,
                    DAI: 1,
                  };
                  const price = prices[t.symbol] ?? 0;
                  const usdValue = parseFloat(t.formatted) * price;
                  return (
                    <BalanceCard
                      key={t.address}
                      symbol={t.symbol}
                      name={t.name}
                      balance={t.formatted}
                      usdValue={usdValue.toFixed(2)}
                    />
                  );
                })
              ) : (
                <p className="col-span-2 text-sm text-muted-foreground">
                  No deposits yet. Deposit funds to get started.
                </p>
              )}
            </div>

            {/* Wallet Balances (MetaMask) */}
            <h4 className="mt-4 text-sm font-medium text-muted-foreground">In Your Wallet</h4>
            <div className="grid gap-3 sm:grid-cols-2">
              {walletLoading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <Card key={`w-${i}`} className="border-border/50">
                    <CardContent className="p-4">
                      <div className="h-14 animate-pulse rounded bg-muted" />
                    </CardContent>
                  </Card>
                ))
              ) : walletTokensWithBalance.length > 0 ? (
                walletTokensWithBalance.map((t) => {
                  const prices: Record<string, number> = {
                    ETH: 2000,
                    USDC: 1,
                    USDT: 1,
                    DAI: 1,
                  };
                  const price = prices[t.token.symbol] ?? 0;
                  const usdValue = parseFloat(t.balance) * price;
                  return (
                    <BalanceCard
                      key={`wallet-${t.token.address}`}
                      symbol={t.token.symbol}
                      name={t.token.name}
                      balance={t.balance}
                      usdValue={usdValue.toFixed(2)}
                    />
                  );
                })
              ) : (
                <p className="col-span-2 text-sm text-muted-foreground">No tokens in wallet.</p>
              )}
            </div>

            {customTokens.length > 0 && (
              <p className="mt-2 text-xs text-muted-foreground">
                {customTokens.length} custom token{customTokens.length > 1 ? "s" : ""} tracked
              </p>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Receive Section */}
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Wallet className="h-4 w-4 text-primary" />
                  Receive Funds
                </CardTitle>
              </CardHeader>
              <CardContent>
                {session && <CredentialIdDisplay credentialId={session.credentialIdHex} showQR />}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link to="/deposit" className="block">
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <ArrowDownLeft className="h-4 w-4" />
                    Deposit
                  </Button>
                </Link>
                <Link to="/withdraw" className="block">
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <ArrowUpRight className="h-4 w-4" />
                    Withdraw
                  </Button>
                </Link>
                <Link to="/history" className="block">
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <History className="h-4 w-4" />
                    History
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Nonce Display */}
            <Card className="border-border/50 bg-muted/20">
              <CardContent className="p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Nonce</span>
                  <span className="font-mono text-foreground">
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
