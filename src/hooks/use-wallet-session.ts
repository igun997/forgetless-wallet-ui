import { useState, useEffect, useCallback } from "react";
import { STORAGE_KEYS } from "@/lib/constants";
import type { PasskeyCredential, WalletSession } from "@/lib/webauthn/types";

export function useWalletSession() {
  const [session, setSession] = useState<WalletSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.session);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as WalletSession;
        setSession(parsed);
      } catch {
        localStorage.removeItem(STORAGE_KEYS.session);
      }
    }
    setIsLoading(false);
  }, []);

  const saveSession = useCallback((credential: PasskeyCredential) => {
    const sessionData: WalletSession = {
      credentialId: Array.from(credential.credentialId),
      credentialIdHex: credential.credentialIdHex,
      displayName: credential.displayName,
    };
    localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(sessionData));
    setSession(sessionData);
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.session);
    setSession(null);
  }, []);

  // Get credential ID as Uint8Array
  const getCredentialIdBytes = useCallback((): Uint8Array | null => {
    if (!session) return null;
    return new Uint8Array(session.credentialId);
  }, [session]);

  return {
    session,
    isLoading,
    saveSession,
    clearSession,
    getCredentialIdBytes,
    isConnected: !!session,
  };
}
