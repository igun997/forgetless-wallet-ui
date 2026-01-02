import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useWalletSession } from "./use-wallet-session";
import { forgetlessWallet, bytesToHex } from "@/lib/blockchain/contract";
import { ensureCorrectNetwork } from "@/lib/blockchain/switchNetwork";

export function useLogin() {
  const { saveSession } = useWalletSession();

  return useMutation({
    mutationFn: async () => {
      // Ensure correct network
      await ensureCorrectNetwork();

      toast.loading("Authenticate with your passkey...", { id: "login" });

      // Use discoverable credentials (no allowCredentials means user picks from available passkeys)
      const credential = (await navigator.credentials.get({
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          rpId: window.location.hostname,
          userVerification: "required",
          timeout: 60000,
        },
      })) as PublicKeyCredential | null;

      if (!credential) {
        throw new Error("No credential selected");
      }

      const credentialId = new Uint8Array(credential.rawId);
      const credentialIdHex = bytesToHex(credentialId);

      toast.loading("Verifying registration...", { id: "login" });

      // Check if user is registered on-chain
      const isRegistered = await forgetlessWallet.read.isUserRegistered([credentialIdHex]);

      if (!isRegistered) {
        throw new Error("This passkey is not registered. Please create a new wallet.");
      }

      // Get user info for display name (we'll use a default since we don't store it on-chain)
      const credentialShort = credentialIdHex.slice(0, 10) + "..." + credentialIdHex.slice(-6);

      return {
        credentialId,
        credentialIdHex,
        displayName: `Wallet ${credentialShort}`,
      };
    },
    onSuccess: (data) => {
      saveSession({
        credentialId: data.credentialId,
        credentialIdHex: data.credentialIdHex,
        displayName: data.displayName,
      });
      toast.success("Login successful!", { id: "login" });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Login failed";
      toast.error("Login failed", { id: "login", description: message });
    },
  });
}
