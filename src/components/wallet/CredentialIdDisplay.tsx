import { useState } from "react";
import { Copy, Check, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CredentialIdDisplayProps {
  credentialId: string;
  showQR?: boolean;
  className?: string;
}

export function CredentialIdDisplay({
  credentialId,
  showQR = false,
  className,
}: CredentialIdDisplayProps) {
  const [copied, setCopied] = useState(false);

  const truncatedId = `${credentialId.slice(0, 10)}...${credentialId.slice(-8)}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(credentialId);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/20 p-2">
        <code className="min-w-0 flex-1 truncate font-mono text-xs text-foreground/80">
          {truncatedId}
        </code>
        <div className="flex shrink-0 gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void handleCopy()}
            className="h-7 w-7 p-0"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
          </Button>
          {showQR && (
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              <QrCode className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">Share this ID to receive deposits</p>
    </div>
  );
}
