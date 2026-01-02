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
import { SUPPORTED_TOKENS, type Token } from "@/lib/constants";
import { toast } from "@/hooks/use-toast";

type DepositStatus = "idle" | "validating" | "approving" | "depositing" | "success" | "error";

export default function Deposit() {
  const [credentialId, setCredentialId] = useState("");
  const [ethAmount, setEthAmount] = useState("");
  const [tokenAmount, setTokenAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState<Token | { address: string; symbol: string }>(
    SUPPORTED_TOKENS[1] // USDC default
  );
  const [status, setStatus] = useState<DepositStatus>("idle");
  const [credentialValid, setCredentialValid] = useState<boolean | null>(null);
  const [needsApproval, setNeedsApproval] = useState(true);
  const [txHash, setTxHash] = useState("");

  const validateCredential = async (id: string) => {
    if (id.length < 10) {
      setCredentialValid(null);
      return;
    }
    setStatus("validating");
    await new Promise((r) => setTimeout(r, 500));
    // Mock validation - in real app would call isUserRegistered()
    setCredentialValid(id.startsWith("0x") && id.length === 66);
    setStatus("idle");
  };

  const handleCredentialChange = (value: string) => {
    setCredentialId(value);
    void validateCredential(value);
  };

  const handleDepositETH = async () => {
    if (!credentialValid) {
      toast({
        title: "Invalid Credential",
        description: "Please enter a valid credential ID",
        variant: "destructive",
      });
      return;
    }
    if (!ethAmount || parseFloat(ethAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    setStatus("depositing");
    await new Promise((r) => setTimeout(r, 2000));

    const mockTx =
      "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    setTxHash(mockTx);
    setStatus("success");
    toast({ title: "Deposit Successful", description: `${ethAmount} ETH deposited successfully` });
  };

  const handleApprove = async () => {
    setStatus("approving");
    await new Promise((r) => setTimeout(r, 1500));
    setNeedsApproval(false);
    setStatus("idle");
    toast({ title: "Approval Successful", description: "Token spending approved" });
  };

  const handleDepositToken = async () => {
    if (!credentialValid) {
      toast({
        title: "Invalid Credential",
        description: "Please enter a valid credential ID",
        variant: "destructive",
      });
      return;
    }
    if (!tokenAmount || parseFloat(tokenAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    if (needsApproval) {
      await handleApprove();
    }

    setStatus("depositing");
    await new Promise((r) => setTimeout(r, 2000));

    const mockTx =
      "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    setTxHash(mockTx);
    setStatus("success");
    toast({
      title: "Deposit Successful",
      description: `${tokenAmount} ${selectedToken.symbol} deposited successfully`,
    });
  };

  const resetForm = () => {
    setStatus("idle");
    setEthAmount("");
    setTokenAmount("");
    setTxHash("");
    setNeedsApproval(true);
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
              {credentialValid !== null && (
                <div className="mt-2 flex items-center gap-2 text-sm">
                  {credentialValid ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span className="text-emerald-500">Credential is registered</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-destructive" />
                      <span className="text-destructive">Credential not found</span>
                    </>
                  )}
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
                  {status === "idle" || status === "validating" ? (
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
                        onClick={() => void handleDepositETH()}
                        disabled={!credentialValid || !ethAmount}
                      >
                        Deposit ETH
                      </Button>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <TransactionStatus
                        status={
                          status === "depositing"
                            ? "loading"
                            : status === "success"
                              ? "success"
                              : "error"
                        }
                        txHash={txHash}
                        message={status === "depositing" ? "Processing ETH deposit..." : undefined}
                        onRetry={resetForm}
                      />
                      {status === "success" && (
                        <Button variant="outline" className="w-full" onClick={resetForm}>
                          Make Another Deposit
                        </Button>
                      )}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="token" className="mt-0 space-y-6">
                  {status === "idle" || status === "validating" ? (
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
                      <div className="flex gap-3">
                        {needsApproval && (
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => void handleApprove()}
                            disabled={!credentialValid || !tokenAmount}
                          >
                            Approve {selectedToken.symbol}
                          </Button>
                        )}
                        <Button
                          className="flex-1"
                          onClick={() => void handleDepositToken()}
                          disabled={!credentialValid || !tokenAmount || needsApproval}
                        >
                          Deposit {selectedToken.symbol}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <TransactionStatus
                        status={
                          status === "approving" || status === "depositing"
                            ? "loading"
                            : status === "success"
                              ? "success"
                              : "error"
                        }
                        txHash={txHash}
                        message={
                          status === "approving"
                            ? "Approving token spending..."
                            : status === "depositing"
                              ? "Processing token deposit..."
                              : undefined
                        }
                        onRetry={resetForm}
                      />
                      {status === "success" && (
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
