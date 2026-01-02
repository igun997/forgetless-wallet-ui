import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageContainer } from "@/components/layout/PageContainer";
import { AmountInput } from "@/components/wallet/AmountInput";
import { TokenSelector } from "@/components/wallet/TokenSelector";
import { TransactionStatus } from "@/components/wallet/TransactionStatus";
import { ArrowDownLeft, Wallet, Loader2 } from "lucide-react";
import { SUPPORTED_TOKENS, type Token, CURRENT_NETWORK } from "@/lib/constants";
import { toast } from "sonner";
import { useDepositETH, useDepositToken } from "@/hooks/use-deposit";
import { useWalletTokens } from "@/hooks/use-wallet-tokens";
import { useWalletSession } from "@/hooks/use-wallet-session";

export default function Deposit() {
  const navigate = useNavigate();
  const { session, isLoading: sessionLoading, isConnected } = useWalletSession();
  const [ethAmount, setEthAmount] = useState("");
  const [tokenAmount, setTokenAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState<Token>(SUPPORTED_TOKENS[1]);

  const { data: walletBalances } = useWalletTokens();

  const depositETHMutation = useDepositETH();
  const depositTokenMutation = useDepositToken();

  const isProcessing = depositETHMutation.isPending || depositTokenMutation.isPending;

  // Redirect if not connected
  useEffect(() => {
    if (!sessionLoading && !isConnected) {
      navigate("/register");
    }
  }, [sessionLoading, isConnected, navigate]);

  const getWalletBalance = (address: string) => {
    const balance = walletBalances?.find(
      (b) => b.token.address.toLowerCase() === address.toLowerCase()
    );
    return balance ? balance.balance : "0";
  };

  const ethBalance = getWalletBalance("0x0000000000000000000000000000000000000000");
  const tokenBalance = getWalletBalance(selectedToken.address);

  const isEthAmountValid =
    ethAmount && parseFloat(ethAmount) > 0 && parseFloat(ethAmount) <= parseFloat(ethBalance);
  const isTokenAmountValid =
    tokenAmount &&
    parseFloat(tokenAmount) > 0 &&
    parseFloat(tokenAmount) <= parseFloat(tokenBalance);

  const handleDepositETH = () => {
    if (!session?.credentialIdHex) {
      toast.error("Not connected", { description: "Please register first" });
      return;
    }
    if (!ethAmount || parseFloat(ethAmount) <= 0) {
      toast.error("Invalid Amount", { description: "Please enter a valid amount" });
      return;
    }
    if (parseFloat(ethAmount) > parseFloat(ethBalance)) {
      toast.error("Insufficient Balance", {
        description: `You only have ${parseFloat(ethBalance).toFixed(4)} ETH`,
      });
      return;
    }

    depositETHMutation.mutate({
      credentialIdHex: session.credentialIdHex as `0x${string}`,
      amount: ethAmount,
    });
  };

  const handleDepositToken = () => {
    if (!session?.credentialIdHex) {
      toast.error("Not connected", { description: "Please register first" });
      return;
    }
    if (!tokenAmount || parseFloat(tokenAmount) <= 0) {
      toast.error("Invalid Amount", { description: "Please enter a valid amount" });
      return;
    }
    if (parseFloat(tokenAmount) > parseFloat(tokenBalance)) {
      toast.error("Insufficient Balance", {
        description: `You only have ${parseFloat(tokenBalance).toFixed(4)} ${selectedToken.symbol}`,
      });
      return;
    }

    depositTokenMutation.mutate({
      credentialIdHex: session.credentialIdHex as `0x${string}`,
      tokenAddress: selectedToken.address,
      amount: tokenAmount,
      decimals: selectedToken.decimals,
    });
  };

  const resetForm = () => {
    depositETHMutation.reset();
    depositTokenMutation.reset();
    setEthAmount("");
    setTokenAmount("");
  };

  if (sessionLoading) {
    return (
      <PageContainer maxWidth="md">
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="md">
      <div className="space-y-6">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
            <ArrowDownLeft className="h-6 w-6 text-primary" />
            Deposit Funds
          </h1>
          <p className="mt-1 text-muted-foreground">Deposit ETH or tokens to your wallet</p>
        </div>

        <Card className="border-border/50">
          <CardContent className="p-0">
            <Tabs defaultValue="eth" className="w-full">
              <TabsList className="w-full rounded-none rounded-t-lg border-b">
                <TabsTrigger value="eth" className="flex-1">
                  ETH
                </TabsTrigger>
                <TabsTrigger value="token" className="flex-1">
                  Token
                </TabsTrigger>
              </TabsList>

              <div className="p-6">
                <TabsContent value="eth" className="mt-0 space-y-4">
                  {!isProcessing && !depositETHMutation.isSuccess ? (
                    <>
                      <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Wallet className="h-4 w-4" />
                          <span>Your Wallet</span>
                        </div>
                        <span className="font-medium">{parseFloat(ethBalance).toFixed(4)} ETH</span>
                      </div>
                      <AmountInput
                        value={ethAmount}
                        onChange={setEthAmount}
                        maxAmount={ethBalance}
                        symbol="ETH"
                        label="Amount to Deposit"
                        error={
                          ethAmount && parseFloat(ethAmount) > parseFloat(ethBalance)
                            ? "Insufficient balance"
                            : undefined
                        }
                      />
                      <Button
                        className="w-full"
                        size="lg"
                        onClick={handleDepositETH}
                        disabled={!isEthAmountValid || isProcessing}
                      >
                        Deposit ETH
                      </Button>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <TransactionStatus
                        status={
                          depositETHMutation.isPending
                            ? "loading"
                            : depositETHMutation.isSuccess
                              ? "success"
                              : "error"
                        }
                        txHash={depositETHMutation.data?.txHash}
                        explorerUrl={
                          depositETHMutation.data?.txHash
                            ? `${CURRENT_NETWORK.explorer}/tx/${depositETHMutation.data.txHash}`
                            : undefined
                        }
                        message={
                          depositETHMutation.isPending ? "Processing ETH deposit..." : undefined
                        }
                        onRetry={resetForm}
                      />
                      {depositETHMutation.isSuccess && (
                        <Button variant="outline" className="w-full" onClick={resetForm}>
                          Make Another Deposit
                        </Button>
                      )}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="token" className="mt-0 space-y-4">
                  {!isProcessing && !depositTokenMutation.isSuccess ? (
                    <>
                      <TokenSelector
                        value={selectedToken.address}
                        onChange={setSelectedToken}
                        label="Select Token"
                      />
                      <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Wallet className="h-4 w-4" />
                          <span>Your Wallet</span>
                        </div>
                        <span className="font-medium">
                          {parseFloat(tokenBalance).toFixed(4)} {selectedToken.symbol}
                        </span>
                      </div>
                      <AmountInput
                        value={tokenAmount}
                        onChange={setTokenAmount}
                        maxAmount={tokenBalance}
                        symbol={selectedToken.symbol}
                        label="Amount to Deposit"
                        error={
                          tokenAmount && parseFloat(tokenAmount) > parseFloat(tokenBalance)
                            ? "Insufficient balance"
                            : undefined
                        }
                      />
                      <Button
                        className="w-full"
                        onClick={handleDepositToken}
                        disabled={!isTokenAmountValid || isProcessing}
                      >
                        Deposit {selectedToken.symbol}
                      </Button>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <TransactionStatus
                        status={
                          depositTokenMutation.isPending
                            ? "loading"
                            : depositTokenMutation.isSuccess
                              ? "success"
                              : "error"
                        }
                        txHash={depositTokenMutation.data?.txHash}
                        explorerUrl={
                          depositTokenMutation.data?.txHash
                            ? `${CURRENT_NETWORK.explorer}/tx/${depositTokenMutation.data.txHash}`
                            : undefined
                        }
                        message={
                          depositTokenMutation.isPending ? "Processing token deposit..." : undefined
                        }
                        onRetry={resetForm}
                      />
                      {depositTokenMutation.isSuccess && (
                        <Button variant="outline" className="w-full" onClick={resetForm}>
                          Make Another Deposit
                        </Button>
                      )}
                    </div>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
