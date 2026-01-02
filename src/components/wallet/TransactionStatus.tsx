import { Loader2, CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Status = "idle" | "loading" | "success" | "error";

interface TransactionStatusProps {
  status: Status;
  txHash?: string;
  explorerUrl?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function TransactionStatus({
  status,
  txHash,
  explorerUrl = "https://basescan.org",
  message,
  onRetry,
  className,
}: TransactionStatusProps) {
  if (status === "idle") return null;

  const statusConfig = {
    loading: {
      icon: <Loader2 className="h-8 w-8 animate-spin text-primary" />,
      title: "Processing Transaction",
      description: message || "Please wait while your transaction is being processed...",
      bg: "bg-primary/5 border-primary/20",
    },
    success: {
      icon: <CheckCircle2 className="h-8 w-8 text-emerald-500" />,
      title: "Transaction Successful",
      description: message || "Your transaction has been confirmed.",
      bg: "bg-emerald-500/5 border-emerald-500/20",
    },
    error: {
      icon: <XCircle className="h-8 w-8 text-destructive" />,
      title: "Transaction Failed",
      description: message || "Something went wrong. Please try again.",
      bg: "bg-destructive/5 border-destructive/20",
    },
  };

  const config = statusConfig[status];

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 rounded-xl border p-6 text-center",
        config.bg,
        className
      )}
    >
      {config.icon}
      <div className="space-y-1">
        <h4 className="font-semibold text-foreground">{config.title}</h4>
        <p className="text-sm text-muted-foreground">{config.description}</p>
      </div>
      <div className="flex gap-2">
        {txHash && status === "success" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`${explorerUrl}/tx/${txHash}`, "_blank")}
            className="gap-2"
          >
            View on Explorer
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        )}
        {status === "error" && onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}
