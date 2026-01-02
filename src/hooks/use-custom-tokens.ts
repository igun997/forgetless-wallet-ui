import { useState, useEffect, useCallback } from "react";
import { STORAGE_KEYS, type CustomToken } from "@/lib/constants";

export function useCustomTokens() {
  const [customTokens, setCustomTokens] = useState<CustomToken[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.customTokens);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as CustomToken[];
        setCustomTokens(parsed);
      } catch {
        localStorage.removeItem(STORAGE_KEYS.customTokens);
      }
    }
    setIsLoading(false);
  }, []);

  const addToken = useCallback((token: CustomToken) => {
    setCustomTokens((prev) => {
      const exists = prev.some((t) => t.address.toLowerCase() === token.address.toLowerCase());
      if (exists) return prev;

      const updated = [...prev, token];
      localStorage.setItem(STORAGE_KEYS.customTokens, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeToken = useCallback((address: `0x${string}`) => {
    setCustomTokens((prev) => {
      const updated = prev.filter((t) => t.address.toLowerCase() !== address.toLowerCase());
      localStorage.setItem(STORAGE_KEYS.customTokens, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearTokens = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.customTokens);
    setCustomTokens([]);
  }, []);

  return {
    customTokens,
    isLoading,
    addToken,
    removeToken,
    clearTokens,
  };
}
