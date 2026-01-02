import { useState } from "react";
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
import { ArrowUpRight, Fingerprint, Clock, AlertTriangle } from "lucide-react";
import { SUPPORTED_TOKENS, type Token } from "@/lib/constants";
import { toast } from "@/hooks/use-toast";

type WithdrawStatus = "idle" | "signing" | "submitting" | "success" | "error";

const DEADLINES = [
  { value: "3600", label: "1 hour" },
  { value: "21600", label: "6 hours" },
  { value: "86400", label: "24 hours" },
];

// Mock balances
const mockBalances: Record<string, string> = {
  "0x0000000000000000000000000000000000000000": "1.2345",
  "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913": "500.00",
  "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2": "250.00",
  "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb": "100.00",
  "0x4200000000000000000000000000000000000006": "0.5",
};

export default function Withdraw() {
  const [selectedToken, setSelectedToken] = useState<Token | { address: string; symbol: string }>(
    SUPPORTED_TOKENS[0] // ETH default
  );
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [deadline, setDeadline] = useState("3600");
  const [status, setStatus] = useState<WithdrawStatus>("idle");
  const [txHash, setTxHash] = useState("");
  const [currentNonce, setCurrentNonce] = useState(0);

  const tokenAddress = "address" in selectedToken ? selectedToken.address : "";
  const maxBalance = mockBalances[tokenAddress] || "0";

  const isValidRecipient = /^0x[a-fA-F0-9]{40}$/.test(recipient);
  const isValidAmount = parseFloat(amount) > 0 && parseFloat(amount) <= parseFloat(maxBalance);

  const handleWithdraw = async () => {
    if (!isValidRecipient) {
      toast({
        title: "Invalid Recipient",
        description: "Please enter a valid address",
        variant: "destructive",
      });
      return;
    }
    if (!isValidAmount) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    // Step 1: Sign with passkey
    setStatus("signing");
    toast({
      title: "Passkey Required",
      description: "Please authenticate with your passkey",
    });

    try {
      await new Promise((r) => setTimeout(r, 2000));

      // Step 2: Submit transaction
      setStatus("submitting");
      await new Promise((r) => setTimeout(r, 2000));

      const mockTx =
        "0x" +
        Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      setTxHash(mockTx);
      setCurrentNonce((n) => n + 1);
      setStatus("success");
      toast({
        title: "Withdrawal Successful",
        description: `${amount} ${selectedToken.symbol} sent to ${recipient.slice(0, 8)}...`,
      });
    } catch {
      setStatus("error");
      toast({
        title: "Withdrawal Failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setStatus("idle");
    setAmount("");
    setRecipient("");
    setTxHash("");
  };

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
            {status === "idle" ? (
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
                  onClick={() => void handleWithdraw()}
                  disabled={!isValidRecipient || !isValidAmount}
                >
                  <Fingerprint className="h-5 w-5" />
                  Sign with Passkey
                </Button>

                <div className="flex justify-center">
                  <span className="text-xs text-muted-foreground">
                    Current nonce: {currentNonce}
                  </span>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <TransactionStatus
                  status={status === "signing" || status === "submitting" ? "loading" : status}
                  txHash={txHash}
                  message={
                    status === "signing"
                      ? "Waiting for passkey authentication..."
                      : status === "submitting"
                        ? "Submitting transaction..."
                        : undefined
                  }
                  onRetry={resetForm}
                />
                {status === "success" && (
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
