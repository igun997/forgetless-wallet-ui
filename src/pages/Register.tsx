import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageContainer } from "@/components/layout/PageContainer";
import { TransactionStatus } from "@/components/wallet/TransactionStatus";
import { CredentialIdDisplay } from "@/components/wallet/CredentialIdDisplay";
import { PasskeySupport } from "@/components/wallet/PasskeySupport";
import { Fingerprint, ArrowRight, CheckCircle2, LogIn } from "lucide-react";
import { useRegister } from "@/hooks/use-register";
import { useLogin } from "@/hooks/use-login";
import { useWalletSession } from "@/hooks/use-wallet-session";

export default function Register() {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const { session, isConnected } = useWalletSession();
  const registerMutation = useRegister();
  const loginMutation = useLogin();

  // Redirect if already connected on mount
  useEffect(() => {
    if (isConnected && !registerMutation.isPending && !loginMutation.isPending) {
      navigate("/dashboard");
    }
  }, [isConnected, navigate, registerMutation.isPending, loginMutation.isPending]);

  // Auto-redirect after successful login/register (with brief delay to show success message)
  const isSuccess = registerMutation.isSuccess || loginMutation.isSuccess;
  useEffect(() => {
    if (isSuccess && session) {
      const timer = setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, session, navigate]);

  const handleCreatePasskey = () => {
    if (!displayName.trim()) {
      setError("Please enter a display name");
      return;
    }
    setError("");
    registerMutation.mutate(displayName);
  };

  const handleLogin = () => {
    loginMutation.mutate();
  };

  const handleContinue = () => {
    navigate("/dashboard");
  };

  const isPending = registerMutation.isPending || loginMutation.isPending;

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
          <PasskeySupport>
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

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Already have a wallet?
                    </span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full gap-2"
                  size="lg"
                  onClick={handleLogin}
                  disabled={isPending}
                >
                  <LogIn className="h-5 w-5" />
                  Login with Passkey
                </Button>
              </>
            )}

            {isPending && (
              <TransactionStatus
                status="loading"
                message={
                  registerMutation.isPending
                    ? "Creating and registering your wallet..."
                    : "Authenticating with your passkey..."
                }
              />
            )}

            {isSuccess && session && (
              <div className="space-y-6">
                <div className="flex flex-col items-center gap-4 py-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-foreground">
                      {registerMutation.isSuccess
                        ? "Wallet Created Successfully!"
                        : "Welcome Back!"}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {registerMutation.isSuccess
                        ? "Your passkey has been registered on-chain"
                        : "You have been logged in successfully"}
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
          </PasskeySupport>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
