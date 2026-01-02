import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageContainer } from "@/components/layout/PageContainer";
import { AddressInput } from "@/components/wallet/AddressInput";
import { AmountInput } from "@/components/wallet/AmountInput";
import { TokenSelector } from "@/components/wallet/TokenSelector";
import { TransactionStatus } from "@/components/wallet/TransactionStatus";
import { ArrowUpRight, Fingerprint, Clock, AlertTriangle, Loader2 } from "lucide-react";
import { SUPPORTED_TOKENS, type Token, CURRENT_NETWORK } from "@/lib/constants";
import { toast } from "sonner";
import { useWalletSession } from "@/hooks/use-wallet-session";
import { useAllBalances, useUserNonce } from "@/hooks/use-contract-read";
import { useWithdrawETH, useWithdrawToken } from "@/hooks/use-withdraw";
import { useCustomTokens } from "@/hooks/use-custom-tokens";

const DEADLINES = [
  { value: "3600", label: "1 hour" },
  { value: "21600", label: "6 hours" },
  { value: "86400", label: "24 hours" },
];

export default function Withdraw() {
  const navigate = useNavigate();
  const {
    session,
    isLoading: sessionLoading,
    isConnected,
    getCredentialIdBytes,
  } = useWalletSession();
  const { customTokens } = useCustomTokens();
  const { data: balances, isLoading: balancesLoading } = useAllBalances(
    session?.credentialIdHex,
    customTokens
  );
  const { data: nonce } = useUserNonce(session?.credentialIdHex);

  const [selectedToken, setSelectedToken] = useState<Token>(SUPPORTED_TOKENS[0]);
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [deadline, setDeadline] = useState("3600");

  const withdrawETHMutation = useWithdrawETH();
  const withdrawTokenMutation = useWithdrawToken();

  // Redirect if not connected
  useEffect(() => {
    if (!sessionLoading && !isConnected) {
      navigate("/register");
    }
  }, [sessionLoading, isConnected, navigate]);

  // Prefill recipient with connected wallet address
  useEffect(() => {
    const getAccount = async () => {
      if (!window.ethereum) return;
      try {
        const accounts = (await window.ethereum.request({
          method: "eth_accounts",
        })) as string[];
        if (accounts && accounts.length > 0 && accounts[0]) {
          setRecipient(accounts[0]);
        }
      } catch {
        // Ignore errors
      }
    };
    void getAccount();
  }, []);

  const tokenAddress = selectedToken.address;
  const isETH = tokenAddress === "0x0000000000000000000000000000000000000000";

  // Find balance for selected token
  const selectedBalance = balances?.find(
    (b) => b.address.toLowerCase() === tokenAddress.toLowerCase()
  );
  const maxBalance = selectedBalance?.formatted ?? "0";

  const isValidRecipient = /^0x[a-fA-F0-9]{40}$/.test(recipient);
  const isValidAmount = parseFloat(amount) > 0 && parseFloat(amount) <= parseFloat(maxBalance);

  const isProcessing = withdrawETHMutation.isPending || withdrawTokenMutation.isPending;
  const isSuccess = withdrawETHMutation.isSuccess || withdrawTokenMutation.isSuccess;
  const txHash = withdrawETHMutation.data?.txHash ?? withdrawTokenMutation.data?.txHash;

  const handleWithdraw = () => {
    if (!isValidRecipient) {
      toast.error("Invalid Recipient", { description: "Please enter a valid address" });
      return;
    }
    if (!isValidAmount) {
      toast.error("Invalid Amount", { description: "Please enter a valid amount" });
      return;
    }
    if (!session || nonce === undefined) {
      toast.error("Wallet not ready", { description: "Please wait for wallet to load" });
      return;
    }

    const credentialId = getCredentialIdBytes();
    if (!credentialId) {
      toast.error("No credential found");
      return;
    }

    const commonParams = {
      credentialId,
      credentialIdHex: session.credentialIdHex,
      amount,
      recipient: recipient as `0x${string}`,
      nonce,
      deadlineSeconds: parseInt(deadline),
    };

    if (isETH) {
      withdrawETHMutation.mutate(commonParams);
    } else {
      withdrawTokenMutation.mutate({
        ...commonParams,
        tokenAddress: tokenAddress,
        decimals: selectedToken.decimals,
      });
    }
  };

  const resetForm = () => {
    withdrawETHMutation.reset();
    withdrawTokenMutation.reset();
    setAmount("");
    setRecipient("");
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
            <ArrowUpRight className="h-6 w-6 text-primary" />
            Withdraw Funds
          </h1>
          <p className="mt-1 text-muted-foreground">Send funds using your passkey signature</p>
        </div>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Withdrawal Details</CardTitle>
            <CardDescription>Select an asset and enter the recipient address</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isProcessing && !isSuccess ? (
              <>
                <TokenSelector
                  value={tokenAddress}
                  onChange={setSelectedToken}
                  label="Select Asset"
                />

                <AmountInput
                  value={amount}
                  onChange={setAmount}
                  maxAmount={maxBalance}
                  symbol={selectedToken.symbol}
                  label="Amount"
                  error={
                    amount && !isValidAmount
                      ? `Maximum available: ${maxBalance} ${selectedToken.symbol}`
                      : undefined
                  }
                />

                {balancesLoading && (
                  <p className="text-xs text-muted-foreground">Loading balance...</p>
                )}

                <AddressInput
                  value={recipient}
                  onChange={setRecipient}
                  label="Recipient Address"
                  placeholder="0x..."
                />

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    Transaction Deadline
                  </Label>
                  <Select value={deadline} onValueChange={setDeadline}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DEADLINES.map((d) => (
                        <SelectItem key={d.value} value={d.value}>
                          {d.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Transaction must be confirmed before the deadline expires
                  </p>
                </div>

                <div className="flex items-start gap-3 rounded-lg bg-muted/30 p-4">
                  <AlertTriangle className="text-chart-4 mt-0.5 h-5 w-5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-foreground">Double-check the recipient</p>
                    <p className="text-muted-foreground">
                      Transactions cannot be reversed. Make sure the address is correct.
                    </p>
                  </div>
                </div>

                <Button
                  className="w-full gap-2"
                  size="lg"
                  onClick={handleWithdraw}
                  disabled={!isValidRecipient || !isValidAmount || isProcessing}
                >
                  <Fingerprint className="h-5 w-5" />
                  Sign with Passkey
                </Button>

                <div className="flex justify-center">
                  <span className="text-xs text-muted-foreground">
                    Current nonce: {nonce !== undefined ? String(nonce) : "-"}
                  </span>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <TransactionStatus
                  status={isProcessing ? "loading" : isSuccess ? "success" : "error"}
                  txHash={txHash}
                  explorerUrl={txHash ? `${CURRENT_NETWORK.explorer}/tx/${txHash}` : undefined}
                  message={isProcessing ? "Sign with your passkey and confirm..." : undefined}
                  onRetry={resetForm}
                />
                {isSuccess && (
                  <Button variant="outline" className="w-full" onClick={resetForm}>
                    Make Another Withdrawal
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
