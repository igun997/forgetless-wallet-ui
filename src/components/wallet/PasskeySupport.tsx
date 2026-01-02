import { AlertTriangle, XCircle, ExternalLink, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { usePasskeySupport } from "@/hooks/use-passkey-support";

interface PasskeySupportProps {
  children: React.ReactNode;
}

/**
 * Wrapper component that checks for passkey support
 * Shows an error or warning if the browser doesn't support passkeys
 */
export function PasskeySupport({ children }: PasskeySupportProps) {
  const { isSupported, isLoading, reason, browserInfo } = usePasskeySupport();

  if (isLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm">Checking browser compatibility...</p>
        </div>
      </div>
    );
  }

  if (!isSupported) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Passkeys Not Supported</AlertTitle>
          <AlertDescription className="mt-2 space-y-3">
            <p>{reason}</p>
            {browserInfo.isWeb3Browser && (
              <p className="text-sm">
                Detected browser: <strong>{browserInfo.browserName}</strong>
              </p>
            )}
            <div className="rounded-md bg-destructive/10 p-3 text-sm">
              <p className="font-medium">How to fix:</p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>Open this page in Chrome, Safari, Firefox, or Edge</li>
                <li>Copy the URL and paste it in your regular browser</li>
                <li>Make sure your device has biometric authentication enabled</li>
              </ul>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => {
                void navigator.clipboard.writeText(window.location.href);
              }}
            >
              Copy Page URL
              <ExternalLink className="h-3 w-3" />
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Supported but with warning (e.g., web3 browser with limited support)
  if (reason) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Limited Passkey Support</AlertTitle>
          <AlertDescription className="mt-1">
            <p className="text-sm">{reason}</p>
            {browserInfo.browserName !== "Unknown" && (
              <p className="mt-1 text-xs text-muted-foreground">
                Browser: {browserInfo.browserName}
              </p>
            )}
          </AlertDescription>
        </Alert>
        {children}
      </div>
    );
  }

  return <>{children}</>;
}
