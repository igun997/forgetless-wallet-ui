import { useMutation, useQueryClient } from "@tanstack/react-query";
import { encodeFunctionData, type Hash } from "viem";
import { toast } from "sonner";
import { createPasskeyCredential } from "@/lib/webauthn/create";
import { FORGETLESS_WALLET_ABI } from "@/lib/abi/ForgetlessWallet";
import { contractAddress } from "@/lib/blockchain/config";
import { publicClient } from "@/lib/blockchain/client";
import { ensureCorrectNetwork } from "@/lib/blockchain/switchNetwork";
import { useWalletSession } from "./use-wallet-session";
import type { PasskeyCredential } from "@/lib/webauthn/types";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
  }
}

export function useRegister() {
  const queryClient = useQueryClient();
  const { saveSession } = useWalletSession();

  return useMutation({
    mutationFn: async (displayName: string): Promise<PasskeyCredential> => {
      // Step 1: Create passkey using WebAuthn
      toast.loading("Creating passkey...", { id: "register" });
      const credential = await createPasskeyCredential(displayName);

      // Step 2: Check if wallet is available
      if (!window.ethereum) {
        throw new Error("No wallet found. Please install MetaMask or another Web3 wallet.");
      }

      // Step 3: Ensure correct network
      await ensureCorrectNetwork();

      // Step 4: Request account access
      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];

      if (!accounts[0]) {
        throw new Error("No account connected");
      }

      // Step 5: Encode register call
      toast.loading("Confirm transaction in your wallet...", { id: "register" });
      const data = encodeFunctionData({
        abi: FORGETLESS_WALLET_ABI,
        functionName: "register",
        args: [credential.credentialIdHex, credential.publicKeyX, credential.publicKeyY],
      });

      // Step 6: Send transaction via wallet
      const txHash = (await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: accounts[0],
            to: contractAddress,
            data,
          },
        ],
      })) as Hash;

      // Step 7: Wait for confirmation with timeout
      toast.loading("Waiting for confirmation...", { id: "register" });

      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
        timeout: 60_000, // 60 second timeout
        pollingInterval: 2_000, // Poll every 2 seconds
      });

      if (receipt.status === "reverted") {
        throw new Error("Registration transaction reverted");
      }

      return credential;
    },
    onSuccess: (credential) => {
      saveSession(credential);
      void queryClient.invalidateQueries({ queryKey: ["isUserRegistered"] });
      toast.success("Wallet created successfully!", { id: "register" });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error("Registration failed", { id: "register", description: message });
    },
  });
}
