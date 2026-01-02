import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageContainer } from "@/components/layout/PageContainer";
import { TransactionStatus } from "@/components/wallet/TransactionStatus";
import { CredentialIdDisplay } from "@/components/wallet/CredentialIdDisplay";
import { Fingerprint, ArrowRight, CheckCircle2 } from "lucide-react";
import { useRegister } from "@/hooks/use-register";
import { useWalletSession } from "@/hooks/use-wallet-session";

export default function Register() {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const { session, isConnected } = useWalletSession();
  const registerMutation = useRegister();

  // Redirect if already registered
  useEffect(() => {
    if (isConnected) {
      navigate("/dashboard");
    }
  }, [isConnected, navigate]);

  const handleCreatePasskey = () => {
    if (!displayName.trim()) {
      setError("Please enter a display name");
      return;
    }
    setError("");
    registerMutation.mutate(displayName);
  };

  const handleContinue = () => {
    navigate("/dashboard");
  };

  const isSuccess = registerMutation.isSuccess;
  const isPending = registerMutation.isPending;

  return (
    <PageContainer maxWidth="sm">
      <Card className="border-border/50">
        <CardHeader className="pb-2 text-center">
          <div className="to-chart-1 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary">
            <Fingerprint className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Create Your Wallet</CardTitle>
          <CardDescription>Register a new passkey to secure your wallet</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isPending && !isSuccess && (
            <>
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="My Forgetless Wallet"
                  className={error ? "border-destructive" : ""}
                  disabled={isPending}
                />
                {error && <p className="text-xs text-destructive">{error}</p>}
                <p className="text-xs text-muted-foreground">
                  This name helps you identify your passkey on your device
                </p>
              </div>

              <div className="space-y-3 rounded-lg bg-muted/30 p-4">
                <h4 className="text-sm font-medium text-foreground">What happens next:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs text-primary">
                      1
                    </div>
                    Your browser will prompt for biometric/PIN verification
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs text-primary">
                      2
                    </div>
                    A unique credential ID will be generated
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs text-primary">
                      3
                    </div>
                    Your wallet will be registered on-chain
                  </li>
                </ul>
              </div>

              <Button
                className="w-full gap-2"
                size="lg"
                onClick={handleCreatePasskey}
                disabled={isPending}
              >
                <Fingerprint className="h-5 w-5" />
                Create Passkey
              </Button>
            </>
          )}

          {isPending && (
            <TransactionStatus status="loading" message="Creating and registering your wallet..." />
          )}

          {isSuccess && session && (
            <div className="space-y-6">
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-foreground">
                    Wallet Created Successfully!
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Your passkey has been registered on-chain
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Your Credential ID</Label>
                <p className="mb-2 text-xs text-muted-foreground">
                  Share this ID to receive deposits
                </p>
                <CredentialIdDisplay credentialId={session.credentialIdHex} showQR />
              </div>

              <Button className="w-full gap-2" size="lg" onClick={handleContinue}>
                Go to Dashboard
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
