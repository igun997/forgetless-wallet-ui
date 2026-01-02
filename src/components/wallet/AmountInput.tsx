import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  maxAmount?: string;
  symbol?: string;
  label?: string;
  placeholder?: string;
  error?: string;
  className?: string;
}

export function AmountInput({
  value,
  onChange,
  maxAmount,
  symbol = "ETH",
  label = "Amount",
  placeholder = "0.00",
  error,
  className,
}: AmountInputProps) {
  const handleMaxClick = () => {
    if (maxAmount) {
      onChange(maxAmount);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label className="text-sm font-medium text-foreground">{label}</Label>}
      <div className="relative">
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "pr-24 text-lg font-medium",
            error && "border-destructive focus-visible:ring-destructive"
          )}
          step="any"
          min="0"
        />
        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-2">
          {maxAmount && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleMaxClick}
              className="h-7 px-2 text-xs text-primary hover:text-primary/80"
            >
              MAX
            </Button>
          )}
          <span className="text-sm font-medium text-muted-foreground">{symbol}</span>
        </div>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
