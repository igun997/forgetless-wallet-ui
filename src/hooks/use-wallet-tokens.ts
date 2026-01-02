import { useQuery } from "@tanstack/react-query";
import { formatEther, formatUnits, erc20Abi } from "viem";
import { publicClient } from "@/lib/blockchain/client";
import { SUPPORTED_TOKENS, type Token } from "@/lib/constants";
import { useCustomTokens } from "./use-custom-tokens";

export interface TokenBalance {
  token: Token;
  balance: string;
  balanceRaw: bigint;
}

async function getConnectedAccount(): Promise<`0x${string}` | null> {
  if (!window.ethereum) return null;
  try {
    const accounts = (await window.ethereum.request({
      method: "eth_accounts",
    })) as string[];
    if (!accounts || accounts.length === 0 || !accounts[0]) return null;
    return accounts[0] as `0x${string}`;
  } catch {
    return null;
  }
}

async function fetchTokenBalance(token: Token, account: `0x${string}`): Promise<TokenBalance> {
  const isETH = token.address === "0x0000000000000000000000000000000000000000";

  if (isETH) {
    const balance = await publicClient.getBalance({ address: account });
    return {
      token,
      balance: formatEther(balance),
      balanceRaw: balance,
    };
  }

  const balance = await publicClient.readContract({
    address: token.address,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [account],
  });

  return {
    token,
    balance: formatUnits(balance, token.decimals),
    balanceRaw: balance,
  };
}

export function useWalletTokens() {
  const { customTokens } = useCustomTokens();

  const allTokens: Token[] = [...SUPPORTED_TOKENS, ...customTokens];

  return useQuery({
    queryKey: ["walletTokens", customTokens.map((t) => t.address)],
    queryFn: async (): Promise<TokenBalance[]> => {
      const account = await getConnectedAccount();
      if (!account) return [];

      const balances = await Promise.all(
        allTokens.map((token) =>
          fetchTokenBalance(token, account).catch(() => ({
            token,
            balance: "0",
            balanceRaw: BigInt(0),
          }))
        )
      );

      return balances;
    },
    refetchInterval: 15000,
    staleTime: 10000,
  });
}

export function useConnectedAccount() {
  return useQuery({
    queryKey: ["connectedAccount"],
    queryFn: getConnectedAccount,
    refetchInterval: 5000,
  });
}
