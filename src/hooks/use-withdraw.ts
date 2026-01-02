import { useMutation, useQueryClient } from "@tanstack/react-query";
import { encodeFunctionData, parseEther, parseUnits, zeroAddress, type Hash } from "viem";
import { toast } from "sonner";
import { signWithPasskey } from "@/lib/webauthn/get";
import { buildWithdrawalChallenge } from "@/lib/webauthn/challenge";
import { parseEcdsaSignature, encodeAuthData } from "@/lib/webauthn/encoding";
import { FORGETLESS_WALLET_ABI } from "@/lib/abi/ForgetlessWallet";
import { contractAddress } from "@/lib/blockchain/config";
import { publicClient } from "@/lib/blockchain/client";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
  }
}

interface WithdrawParams {
  credentialId: Uint8Array;
  credentialIdHex: `0x${string}`;
  amount: string;
  recipient: `0x${string}`;
  nonce: bigint;
  deadlineSeconds: number;
}

export function useWithdrawETH() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      credentialId,
      credentialIdHex,
      amount,
      recipient,
      nonce,
      deadlineSeconds,
    }: WithdrawParams) => {
      if (!window.ethereum) {
        throw new Error("No wallet found");
      }

      const parsedAmount = parseEther(amount);
      const deadline = BigInt(Math.floor(Date.now() / 1000) + deadlineSeconds);

      // Step 1: Build EIP-712 challenge
      toast.loading("Building transaction...", { id: "withdraw" });
      const challenge = await buildWithdrawalChallenge({
        credentialId,
        credentialIdHex,
        token: zeroAddress,
        amount: parsedAmount,
        recipient,
        nonce,
        deadline,
      });

      // Step 2: Sign with passkey
      toast.loading("Sign with your passkey...", { id: "withdraw" });
      const webauthnResult = await signWithPasskey(credentialId, challenge);

      // Step 3: Parse signature and encode authData
      const { r, s } = parseEcdsaSignature(webauthnResult.signature);
      const authData = encodeAuthData(
        webauthnResult.authenticatorData,
        webauthnResult.clientDataJSON,
        r,
        s
      );

      // Step 4: Build withdrawal request
      const request = {
        credentialId: credentialIdHex,
        token: zeroAddress,
        amount: parsedAmount,
        recipient,
        nonce,
        deadline,
      };

      // Step 5: Get connected account and encode transaction
      toast.loading("Confirm transaction in your wallet...", { id: "withdraw" });

      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];
      if (!accounts || accounts.length === 0) {
        throw new Error("No account connected");
      }
      const from = accounts[0];

      const data = encodeFunctionData({
        abi: FORGETLESS_WALLET_ABI,
        functionName: "withdrawETH",
        args: [request, authData],
      });

      const txHash = (await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from,
            to: contractAddress,
            data,
          },
        ],
      })) as Hash;

      toast.loading("Waiting for confirmation...", { id: "withdraw" });
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

      if (receipt.status === "reverted") {
        throw new Error("Withdrawal transaction reverted");
      }

      return { txHash, receipt };
    },
    onSuccess: ({ txHash }) => {
      void queryClient.invalidateQueries({ queryKey: ["ethBalance"] });
      void queryClient.invalidateQueries({ queryKey: ["allBalances"] });
      void queryClient.invalidateQueries({ queryKey: ["userNonce"] });
      toast.success("Withdrawal successful!", {
        id: "withdraw",
        description: `Transaction: ${txHash.slice(0, 10)}...`,
      });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error("Withdrawal failed", { id: "withdraw", description: message });
    },
  });
}

interface WithdrawTokenParams extends WithdrawParams {
  tokenAddress: `0x${string}`;
  decimals: number;
}

export function useWithdrawToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      credentialId,
      credentialIdHex,
      tokenAddress,
      amount,
      decimals,
      recipient,
      nonce,
      deadlineSeconds,
    }: WithdrawTokenParams) => {
      if (!window.ethereum) {
        throw new Error("No wallet found");
      }

      const parsedAmount = parseUnits(amount, decimals);
      const deadline = BigInt(Math.floor(Date.now() / 1000) + deadlineSeconds);

      // Step 1: Build EIP-712 challenge
      toast.loading("Building transaction...", { id: "withdraw" });
      const challenge = await buildWithdrawalChallenge({
        credentialId,
        credentialIdHex,
        token: tokenAddress,
        amount: parsedAmount,
        recipient,
        nonce,
        deadline,
      });

      // Step 2: Sign with passkey
      toast.loading("Sign with your passkey...", { id: "withdraw" });
      const webauthnResult = await signWithPasskey(credentialId, challenge);

      // Step 3: Parse signature and encode authData
      const { r, s } = parseEcdsaSignature(webauthnResult.signature);
      const authData = encodeAuthData(
        webauthnResult.authenticatorData,
        webauthnResult.clientDataJSON,
        r,
        s
      );

      // Step 4: Build withdrawal request
      const request = {
        credentialId: credentialIdHex,
        token: tokenAddress,
        amount: parsedAmount,
        recipient,
        nonce,
        deadline,
      };

      // Step 5: Get connected account and encode transaction
      toast.loading("Confirm transaction in your wallet...", { id: "withdraw" });

      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];
      if (!accounts || accounts.length === 0) {
        throw new Error("No account connected");
      }
      const from = accounts[0];

      const data = encodeFunctionData({
        abi: FORGETLESS_WALLET_ABI,
        functionName: "withdrawToken",
        args: [request, authData],
      });

      const txHash = (await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from,
            to: contractAddress,
            data,
          },
        ],
      })) as Hash;

      toast.loading("Waiting for confirmation...", { id: "withdraw" });
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

      if (receipt.status === "reverted") {
        throw new Error("Token withdrawal transaction reverted");
      }

      return { txHash, receipt };
    },
    onSuccess: ({ txHash }) => {
      void queryClient.invalidateQueries({ queryKey: ["tokenBalance"] });
      void queryClient.invalidateQueries({ queryKey: ["allBalances"] });
      void queryClient.invalidateQueries({ queryKey: ["userNonce"] });
      toast.success("Token withdrawal successful!", {
        id: "withdraw",
        description: `Transaction: ${txHash.slice(0, 10)}...`,
      });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error("Token withdrawal failed", { id: "withdraw", description: message });
    },
  });
}
