import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { TokenIcon } from "./TokenIcon";
import { SUPPORTED_TOKENS, type Token } from "@/lib/constants";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface TokenSelectorProps {
  value: string;
  onChange: (token: Token | { address: string; symbol: string }) => void;
  label?: string;
  className?: string;
}

export function TokenSelector({
  value,
  onChange,
  label = "Select Token",
  className,
}: TokenSelectorProps) {
  const [showCustom, setShowCustom] = useState(false);
  const [customAddress, setCustomAddress] = useState("");

  const handleSelect = (address: string) => {
    if (address === "custom") {
      setShowCustom(true);
      return;
    }
    const token = SUPPORTED_TOKENS.find((t) => t.address === address);
    if (token) {
      onChange(token);
    }
  };

  const handleAddCustom = () => {
    if (/^0x[a-fA-F0-9]{40}$/.test(customAddress)) {
      onChange({ address: customAddress, symbol: "CUSTOM" });
      setShowCustom(false);
      setCustomAddress("");
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label className="text-sm font-medium text-foreground">{label}</Label>}
      {showCustom ? (
        <div className="flex gap-2">
          <Input
            value={customAddress}
            onChange={(e) => setCustomAddress(e.target.value)}
            placeholder="0x..."
            className="font-mono text-sm"
          />
          <Button onClick={handleAddCustom} size="sm">
            Add
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowCustom(false)}>
            Cancel
          </Button>
        </div>
      ) : (
        <Select value={value} onValueChange={handleSelect}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a token" />
          </SelectTrigger>
          <SelectContent>
            {SUPPORTED_TOKENS.map((token) => (
              <SelectItem key={token.address} value={token.address}>
                <div className="flex items-center gap-2">
                  <TokenIcon symbol={token.symbol} size="sm" />
                  <span>{token.symbol}</span>
                  <span className="text-xs text-muted-foreground">{token.name}</span>
                </div>
              </SelectItem>
            ))}
            <SelectItem value="custom">
              <div className="flex items-center gap-2 text-primary">
                <Plus className="h-4 w-4" />
                <span>Add Custom Token</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
