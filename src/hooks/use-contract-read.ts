import { useQuery } from "@tanstack/react-query";
import { formatEther, formatUnits } from "viem";
import { forgetlessWallet } from "@/lib/blockchain/contract";
import { SUPPORTED_TOKENS } from "@/lib/constants";

export function useIsUserRegistered(credentialIdHex: `0x${string}` | undefined) {
  return useQuery({
    queryKey: ["isUserRegistered", credentialIdHex],
    queryFn: async () => {
      if (!credentialIdHex) throw new Error("No credential ID");
      return forgetlessWallet.read.isUserRegistered([credentialIdHex]);
    },
    enabled: !!credentialIdHex,
    staleTime: 30000,
  });
}

export function useETHBalance(credentialIdHex: `0x${string}` | undefined) {
  return useQuery({
    queryKey: ["ethBalance", credentialIdHex],
    queryFn: async () => {
      if (!credentialIdHex) throw new Error("No credential ID");
      const balance = await forgetlessWallet.read.getETHBalance([credentialIdHex]);
      return {
        raw: balance,
        formatted: formatEther(balance),
      };
    },
    enabled: !!credentialIdHex,
    refetchInterval: 15000,
  });
}

export function useTokenBalance(
  credentialIdHex: `0x${string}` | undefined,
  tokenAddress: `0x${string}`,
  decimals: number = 18
) {
  return useQuery({
    queryKey: ["tokenBalance", credentialIdHex, tokenAddress],
    queryFn: async () => {
      if (!credentialIdHex) throw new Error("No credential ID");
      const balance = await forgetlessWallet.read.getTokenBalance([credentialIdHex, tokenAddress]);
      return {
        raw: balance,
        formatted: formatUnits(balance, decimals),
      };
    },
    enabled: !!credentialIdHex && tokenAddress !== "0x0000000000000000000000000000000000000000",
    refetchInterval: 15000,
  });
}

export function useAllBalances(
  credentialIdHex: `0x${string}` | undefined,
  additionalTokens: {
    address: `0x${string}`;
    symbol: string;
    name: string;
    decimals: number;
  }[] = []
) {
  // Combine supported tokens with additional tokens, avoiding duplicates
  const allTokens = [...SUPPORTED_TOKENS];
  for (const token of additionalTokens) {
    if (!allTokens.some((t) => t.address.toLowerCase() === token.address.toLowerCase())) {
      allTokens.push(token);
    }
  }

  return useQuery({
    queryKey: ["allBalances", credentialIdHex, additionalTokens.map((t) => t.address)],
    queryFn: async () => {
      if (!credentialIdHex) return [];

      const balances = await Promise.all(
        allTokens.map(async (token) => {
          try {
            if (token.address === "0x0000000000000000000000000000000000000000") {
              const balance = await forgetlessWallet.read.getETHBalance([credentialIdHex]);
              return {
                ...token,
                balance: balance,
                formatted: formatEther(balance),
              };
            } else {
              const balance = await forgetlessWallet.read.getTokenBalance([
                credentialIdHex,
                token.address,
              ]);
              return {
                ...token,
                balance: balance,
                formatted: formatUnits(balance, token.decimals),
              };
            }
          } catch {
            return {
              ...token,
              balance: 0n,
              formatted: "0",
            };
          }
        })
      );

      return balances;
    },
    enabled: !!credentialIdHex,
    refetchInterval: 15000,
  });
}

export function useUserNonce(credentialIdHex: `0x${string}` | undefined) {
  return useQuery({
    queryKey: ["userNonce", credentialIdHex],
    queryFn: async () => {
      if (!credentialIdHex) throw new Error("No credential ID");
      return forgetlessWallet.read.getNonce([credentialIdHex]);
    },
    enabled: !!credentialIdHex,
    staleTime: 5000,
  });
}

export function useUser(credentialIdHex: `0x${string}` | undefined) {
  return useQuery({
    queryKey: ["user", credentialIdHex],
    queryFn: async () => {
      if (!credentialIdHex) throw new Error("No credential ID");
      const [publicKeyX, publicKeyY, nonce, isRegistered] = await forgetlessWallet.read.getUser([
        credentialIdHex,
      ]);
      return { publicKeyX, publicKeyY, nonce, isRegistered };
    },
    enabled: !!credentialIdHex,
    staleTime: 30000,
  });
}
