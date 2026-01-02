import { useState, useEffect, useCallback } from "react";
import { STORAGE_KEYS } from "@/lib/constants";
import type { PasskeyCredential, WalletSession } from "@/lib/webauthn/types";

// Custom event name for same-tab session sync
const SESSION_CHANGE_EVENT = "forgetless-session-change";

function loadSessionFromStorage(): WalletSession | null {
  const stored = localStorage.getItem(STORAGE_KEYS.session);
  if (stored) {
    try {
      return JSON.parse(stored) as WalletSession;
    } catch {
      localStorage.removeItem(STORAGE_KEYS.session);
    }
  }
  return null;
}

export function useWalletSession() {
  const [session, setSession] = useState<WalletSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load initial session
    setSession(loadSessionFromStorage());
    setIsLoading(false);

    // Listen for session changes from other components (same tab)
    const handleSessionChange = () => {
      setSession(loadSessionFromStorage());
    };

    // Listen for storage changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.session) {
        setSession(loadSessionFromStorage());
      }
    };

    window.addEventListener(SESSION_CHANGE_EVENT, handleSessionChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener(SESSION_CHANGE_EVENT, handleSessionChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const saveSession = useCallback((credential: PasskeyCredential) => {
    const sessionData: WalletSession = {
      credentialId: Array.from(credential.credentialId),
      credentialIdHex: credential.credentialIdHex,
      displayName: credential.displayName,
    };
    localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(sessionData));
    setSession(sessionData);
    // Notify other components in the same tab
    window.dispatchEvent(new Event(SESSION_CHANGE_EVENT));
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.session);
    setSession(null);
    // Notify other components in the same tab
    window.dispatchEvent(new Event(SESSION_CHANGE_EVENT));
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
