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
import { SUPPORTED_TOKENS, type Token, type CustomToken } from "@/lib/constants";
import { useCustomTokens } from "@/hooks/use-custom-tokens";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TokenSelectorProps {
  value: string;
  onChange: (token: Token) => void;
  label?: string;
  className?: string;
}

export function TokenSelector({
  value,
  onChange,
  label = "Select Token",
  className,
}: TokenSelectorProps) {
  const { customTokens, addToken, removeToken } = useCustomTokens();
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customAddress, setCustomAddress] = useState("");
  const [customSymbol, setCustomSymbol] = useState("");
  const [customName, setCustomName] = useState("");
  const [customDecimals, setCustomDecimals] = useState("18");

  const allTokens: Token[] = [...SUPPORTED_TOKENS, ...customTokens];

  const handleSelect = (address: string) => {
    if (address === "add_custom") {
      setShowCustomForm(true);
      return;
    }
    const token = allTokens.find((t) => t.address === address);
    if (token) {
      onChange(token);
    }
  };

  const handleAddCustom = () => {
    if (/^0x[a-fA-F0-9]{40}$/.test(customAddress) && customSymbol.trim() && customDecimals) {
      const newToken: CustomToken = {
        address: customAddress as `0x${string}`,
        symbol: customSymbol.toUpperCase(),
        name: customName || customSymbol,
        decimals: parseInt(customDecimals, 10),
      };
      addToken(newToken);
      onChange(newToken);
      setShowCustomForm(false);
      setCustomAddress("");
      setCustomSymbol("");
      setCustomName("");
      setCustomDecimals("18");
    }
  };

  const handleRemoveCustom = (address: `0x${string}`, e: React.MouseEvent) => {
    e.stopPropagation();
    removeToken(address);
  };

  const isCustomToken = (address: string) => customTokens.some((t) => t.address === address);

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label className="text-sm font-medium text-foreground">{label}</Label>}
      {showCustomForm ? (
        <div className="space-y-3 rounded-lg border border-border p-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Address</Label>
              <Input
                value={customAddress}
                onChange={(e) => setCustomAddress(e.target.value)}
                placeholder="0x..."
                className="font-mono text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Symbol</Label>
              <Input
                value={customSymbol}
                onChange={(e) => setCustomSymbol(e.target.value)}
                placeholder="USDC"
                className="text-xs"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Name (optional)</Label>
              <Input
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="USD Coin"
                className="text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Decimals</Label>
              <Input
                type="number"
                value={customDecimals}
                onChange={(e) => setCustomDecimals(e.target.value)}
                placeholder="18"
                className="text-xs"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAddCustom} size="sm" className="flex-1">
              Add Token
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowCustomForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Select value={value} onValueChange={handleSelect}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a token" />
          </SelectTrigger>
          <SelectContent>
            {allTokens.map((token) => (
              <SelectItem key={token.address} value={token.address}>
                <div className="flex w-full items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{token.symbol}</span>
                    <span className="text-xs text-muted-foreground">{token.name}</span>
                  </div>
                  {isCustomToken(token.address) && (
                    <button
                      onClick={(e) => handleRemoveCustom(token.address, e)}
                      className="ml-2 rounded p-0.5 hover:bg-destructive/20"
                    >
                      <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                    </button>
                  )}
                </div>
              </SelectItem>
            ))}
            <SelectItem value="add_custom">
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
