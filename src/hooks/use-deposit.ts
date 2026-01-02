import { useMutation, useQueryClient } from "@tanstack/react-query";
import { encodeFunctionData, parseEther, parseUnits, erc20Abi, type Hash } from "viem";
import { toast } from "sonner";
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

export function useDepositETH() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      credentialIdHex,
      amount,
    }: {
      credentialIdHex: `0x${string}`;
      amount: string;
    }) => {
      if (!window.ethereum) {
        throw new Error("No wallet found");
      }

      toast.loading("Confirm deposit in your wallet...", { id: "deposit" });

      const data = encodeFunctionData({
        abi: FORGETLESS_WALLET_ABI,
        functionName: "depositETH",
        args: [credentialIdHex],
      });

      const value = parseEther(amount);

      const txHash = (await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            to: contractAddress,
            data,
            value: `0x${value.toString(16)}`,
          },
        ],
      })) as Hash;

      toast.loading("Waiting for confirmation...", { id: "deposit" });
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

      if (receipt.status === "reverted") {
        throw new Error("Deposit transaction reverted");
      }

      return { txHash, receipt };
    },
    onSuccess: ({ txHash }) => {
      void queryClient.invalidateQueries({ queryKey: ["ethBalance"] });
      void queryClient.invalidateQueries({ queryKey: ["allBalances"] });
      toast.success("ETH deposited successfully!", {
        id: "deposit",
        description: `Transaction: ${txHash.slice(0, 10)}...`,
      });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error("Deposit failed", { id: "deposit", description: message });
    },
  });
}

export function useDepositToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      credentialIdHex,
      tokenAddress,
      amount,
      decimals,
    }: {
      credentialIdHex: `0x${string}`;
      tokenAddress: `0x${string}`;
      amount: string;
      decimals: number;
    }) => {
      if (!window.ethereum) {
        throw new Error("No wallet found");
      }

      const parsedAmount = parseUnits(amount, decimals);

      // Step 1: Check allowance
      const accounts = (await window.ethereum.request({
        method: "eth_accounts",
      })) as string[];
      if (!accounts[0]) {
        throw new Error("No account connected");
      }

      const allowance = await publicClient.readContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "allowance",
        args: [accounts[0] as `0x${string}`, contractAddress],
      });

      // Step 2: Approve if needed
      if (allowance < parsedAmount) {
        toast.loading("Approve token spending...", { id: "deposit" });

        const approveData = encodeFunctionData({
          abi: erc20Abi,
          functionName: "approve",
          args: [contractAddress, parsedAmount],
        });

        const approveTxHash = (await window.ethereum.request({
          method: "eth_sendTransaction",
          params: [
            {
              to: tokenAddress,
              data: approveData,
            },
          ],
        })) as Hash;

        await publicClient.waitForTransactionReceipt({ hash: approveTxHash });
      }

      // Step 3: Deposit token
      toast.loading("Confirm deposit in your wallet...", { id: "deposit" });

      const depositData = encodeFunctionData({
        abi: FORGETLESS_WALLET_ABI,
        functionName: "depositToken",
        args: [credentialIdHex, tokenAddress, parsedAmount],
      });

      const txHash = (await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            to: contractAddress,
            data: depositData,
          },
        ],
      })) as Hash;

      toast.loading("Waiting for confirmation...", { id: "deposit" });
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

      if (receipt.status === "reverted") {
        throw new Error("Token deposit transaction reverted");
      }

      return { txHash, receipt };
    },
    onSuccess: ({ txHash }) => {
      void queryClient.invalidateQueries({ queryKey: ["tokenBalance"] });
      void queryClient.invalidateQueries({ queryKey: ["allBalances"] });
      toast.success("Token deposited successfully!", {
        id: "deposit",
        description: `Transaction: ${txHash.slice(0, 10)}...`,
      });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error("Token deposit failed", { id: "deposit", description: message });
    },
  });
}
