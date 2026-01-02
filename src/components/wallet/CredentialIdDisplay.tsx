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
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/20 p-3">
        <code className="flex-1 font-mono text-sm text-foreground/80">{truncatedId}</code>
        <Button variant="ghost" size="sm" onClick={() => void handleCopy()} className="h-8 w-8 p-0">
          {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
        </Button>
        {showQR && (
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <QrCode className="h-4 w-4" />
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">Share this ID to receive deposits</p>
    </div>
  );
}
