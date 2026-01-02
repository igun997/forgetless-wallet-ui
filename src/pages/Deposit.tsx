import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageContainer } from "@/components/layout/PageContainer";
import { AddressInput } from "@/components/wallet/AddressInput";
import { AmountInput } from "@/components/wallet/AmountInput";
import { TokenSelector } from "@/components/wallet/TokenSelector";
import { TransactionStatus } from "@/components/wallet/TransactionStatus";
import { ArrowDownLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import { SUPPORTED_TOKENS, type Token, CURRENT_NETWORK } from "@/lib/constants";
import { toast } from "sonner";
import { useIsUserRegistered } from "@/hooks/use-contract-read";
import { useDepositETH, useDepositToken } from "@/hooks/use-deposit";

export default function Deposit() {
  const [credentialId, setCredentialId] = useState("");
  const [ethAmount, setEthAmount] = useState("");
  const [tokenAmount, setTokenAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState<Token | { address: string; symbol: string }>(
    SUPPORTED_TOKENS[1] // USDC default
  );

  const credentialIdHex = credentialId.startsWith("0x")
    ? (credentialId as `0x${string}`)
    : undefined;

  const { data: isRegistered, isLoading: isValidating } = useIsUserRegistered(
    credentialIdHex && credentialId.length >= 66 ? credentialIdHex : undefined
  );

  const depositETHMutation = useDepositETH();
  const depositTokenMutation = useDepositToken();

  const credentialValid = credentialIdHex && credentialId.length === 66 ? isRegistered : null;
  const isProcessing = depositETHMutation.isPending || depositTokenMutation.isPending;

  const handleCredentialChange = (value: string) => {
    setCredentialId(value);
  };

  const handleDepositETH = () => {
    if (!credentialValid || !credentialIdHex) {
      toast.error("Invalid Credential", { description: "Please enter a valid credential ID" });
      return;
    }
    if (!ethAmount || parseFloat(ethAmount) <= 0) {
      toast.error("Invalid Amount", { description: "Please enter a valid amount" });
      return;
    }

    depositETHMutation.mutate({ credentialIdHex, amount: ethAmount });
  };

  const handleDepositToken = () => {
    if (!credentialValid || !credentialIdHex) {
      toast.error("Invalid Credential", { description: "Please enter a valid credential ID" });
      return;
    }
    if (!tokenAmount || parseFloat(tokenAmount) <= 0) {
      toast.error("Invalid Amount", { description: "Please enter a valid amount" });
      return;
    }

    const tokenAddress = ("address" in selectedToken ? selectedToken.address : "") as `0x${string}`;
    const decimals = "decimals" in selectedToken ? selectedToken.decimals : 18;

    depositTokenMutation.mutate({
      credentialIdHex,
      tokenAddress,
      amount: tokenAmount,
      decimals,
    });
  };

  const resetForm = () => {
    depositETHMutation.reset();
    depositTokenMutation.reset();
    setEthAmount("");
    setTokenAmount("");
  };

  return (
    <PageContainer maxWidth="md">
      <div className="space-y-6">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
            <ArrowDownLeft className="h-6 w-6 text-primary" />
            Deposit Funds
          </h1>
          <p className="mt-1 text-muted-foreground">
            Send ETH or tokens to any registered credential
          </p>
        </div>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Recipient Credential</CardTitle>
            <CardDescription>
              Enter the credential ID of the wallet you want to deposit to
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <AddressInput
                value={credentialId}
                onChange={handleCredentialChange}
                label=""
                placeholder="0x..."
              />
              {credentialId.length >= 66 && (
                <div className="mt-2 flex items-center gap-2 text-sm">
                  {isValidating ? (
                    <span className="text-muted-foreground">Checking...</span>
                  ) : credentialValid ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span className="text-emerald-500">Credential is registered</span>
                    </>
                  ) : credentialValid === false ? (
                    <>
                      <AlertCircle className="h-4 w-4 text-destructive" />
                      <span className="text-destructive">Credential not found</span>
                    </>
                  ) : null}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

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
                <TabsContent value="eth" className="mt-0 space-y-6">
                  {!isProcessing && !depositETHMutation.isSuccess ? (
                    <>
                      <AmountInput
                        value={ethAmount}
                        onChange={setEthAmount}
                        maxAmount="10.0"
                        symbol="ETH"
                        label="Amount"
                      />
                      <Button
                        className="w-full"
                        size="lg"
                        onClick={handleDepositETH}
                        disabled={!credentialValid || !ethAmount || isProcessing}
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

                <TabsContent value="token" className="mt-0 space-y-6">
                  {!isProcessing && !depositTokenMutation.isSuccess ? (
                    <>
                      <TokenSelector
                        value={"address" in selectedToken ? selectedToken.address : ""}
                        onChange={setSelectedToken}
                        label="Select Token"
                      />
                      <AmountInput
                        value={tokenAmount}
                        onChange={setTokenAmount}
                        maxAmount="1000.00"
                        symbol={selectedToken.symbol}
                        label="Amount"
                      />
                      <Button
                        className="w-full"
                        onClick={handleDepositToken}
                        disabled={!credentialValid || !tokenAmount || isProcessing}
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
