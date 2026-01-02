import { useQuery } from "@tanstack/react-query";
import { keccak256, formatEther, formatUnits } from "viem";
import { publicClient } from "@/lib/blockchain/client";
import { contractAddress } from "@/lib/blockchain/config";
import { SUPPORTED_TOKENS, CURRENT_NETWORK } from "@/lib/constants";

export interface Transaction {
  id: string;
  type: "deposit" | "withdrawal";
  asset: string;
  amount: string;
  address: string;
  timestamp: Date;
  txHash: `0x${string}`;
  blockNumber: bigint;
  status: "confirmed";
}

// Helper to get token symbol from address
function getTokenSymbol(tokenAddress: string): string {
  const token = SUPPORTED_TOKENS.find(
    (t) => t.address.toLowerCase() === tokenAddress.toLowerCase()
  );
  return token?.symbol ?? "TOKEN";
}

// Helper to get token decimals from address
function getTokenDecimals(tokenAddress: string): number {
  const token = SUPPORTED_TOKENS.find(
    (t) => t.address.toLowerCase() === tokenAddress.toLowerCase()
  );
  return token?.decimals ?? 18;
}

export function useTransactionHistory(credentialIdHex: `0x${string}` | undefined) {
  return useQuery({
    queryKey: ["transactionHistory", credentialIdHex],
    queryFn: async (): Promise<Transaction[]> => {
      if (!credentialIdHex) return [];

      const credentialIdHash = keccak256(credentialIdHex);

      // Fetch all event types
      const [ethDeposits, ethWithdrawals, tokenDeposits, tokenWithdrawals] = await Promise.all([
        publicClient.getLogs({
          address: contractAddress,
          event: {
            type: "event",
            name: "ETHDeposited",
            inputs: [
              { type: "bytes32", indexed: true, name: "credentialIdHash" },
              { type: "address", indexed: true, name: "depositor" },
              { type: "uint256", indexed: false, name: "amount" },
            ],
          },
          args: { credentialIdHash },
          fromBlock: "earliest",
        }),
        publicClient.getLogs({
          address: contractAddress,
          event: {
            type: "event",
            name: "ETHWithdrawn",
            inputs: [
              { type: "bytes32", indexed: true, name: "credentialIdHash" },
              { type: "address", indexed: true, name: "recipient" },
              { type: "uint256", indexed: false, name: "amount" },
            ],
          },
          args: { credentialIdHash },
          fromBlock: "earliest",
        }),
        publicClient.getLogs({
          address: contractAddress,
          event: {
            type: "event",
            name: "TokenDeposited",
            inputs: [
              { type: "bytes32", indexed: true, name: "credentialIdHash" },
              { type: "address", indexed: true, name: "token" },
              { type: "address", indexed: true, name: "depositor" },
              { type: "uint256", indexed: false, name: "amount" },
            ],
          },
          args: { credentialIdHash },
          fromBlock: "earliest",
        }),
        publicClient.getLogs({
          address: contractAddress,
          event: {
            type: "event",
            name: "TokenWithdrawn",
            inputs: [
              { type: "bytes32", indexed: true, name: "credentialIdHash" },
              { type: "address", indexed: true, name: "token" },
              { type: "address", indexed: true, name: "recipient" },
              { type: "uint256", indexed: false, name: "amount" },
            ],
          },
          args: { credentialIdHash },
          fromBlock: "earliest",
        }),
      ]);

      // Get block timestamps for all transactions
      const allLogs = [...ethDeposits, ...ethWithdrawals, ...tokenDeposits, ...tokenWithdrawals];
      const blockNumbers = [...new Set(allLogs.map((log) => log.blockNumber))];

      const blocks = await Promise.all(
        blockNumbers.map((blockNumber) =>
          publicClient.getBlock({ blockNumber }).then((block) => ({
            number: blockNumber,
            timestamp: block.timestamp,
          }))
        )
      );

      const blockTimestamps = new Map(blocks.map((b) => [b.number, b.timestamp]));

      // Transform events to transactions
      const transactions: Transaction[] = [];

      for (const log of ethDeposits) {
        const args = log.args as { depositor?: `0x${string}`; amount?: bigint };
        transactions.push({
          id: `${log.transactionHash}-${log.logIndex}`,
          type: "deposit",
          asset: "ETH",
          amount: formatEther(args.amount ?? 0n),
          address: args.depositor ?? "0x",
          timestamp: new Date(Number(blockTimestamps.get(log.blockNumber) ?? 0n) * 1000),
          txHash: log.transactionHash,
          blockNumber: log.blockNumber,
          status: "confirmed",
        });
      }

      for (const log of ethWithdrawals) {
        const args = log.args as { recipient?: `0x${string}`; amount?: bigint };
        transactions.push({
          id: `${log.transactionHash}-${log.logIndex}`,
          type: "withdrawal",
          asset: "ETH",
          amount: formatEther(args.amount ?? 0n),
          address: args.recipient ?? "0x",
          timestamp: new Date(Number(blockTimestamps.get(log.blockNumber) ?? 0n) * 1000),
          txHash: log.transactionHash,
          blockNumber: log.blockNumber,
          status: "confirmed",
        });
      }

      for (const log of tokenDeposits) {
        const args = log.args as {
          token?: `0x${string}`;
          depositor?: `0x${string}`;
          amount?: bigint;
        };
        const tokenAddress = args.token ?? "0x";
        const decimals = getTokenDecimals(tokenAddress);
        transactions.push({
          id: `${log.transactionHash}-${log.logIndex}`,
          type: "deposit",
          asset: getTokenSymbol(tokenAddress),
          amount: formatUnits(args.amount ?? 0n, decimals),
          address: args.depositor ?? "0x",
          timestamp: new Date(Number(blockTimestamps.get(log.blockNumber) ?? 0n) * 1000),
          txHash: log.transactionHash,
          blockNumber: log.blockNumber,
          status: "confirmed",
        });
      }

      for (const log of tokenWithdrawals) {
        const args = log.args as {
          token?: `0x${string}`;
          recipient?: `0x${string}`;
          amount?: bigint;
        };
        const tokenAddress = args.token ?? "0x";
        const decimals = getTokenDecimals(tokenAddress);
        transactions.push({
          id: `${log.transactionHash}-${log.logIndex}`,
          type: "withdrawal",
          asset: getTokenSymbol(tokenAddress),
          amount: formatUnits(args.amount ?? 0n, decimals),
          address: args.recipient ?? "0x",
          timestamp: new Date(Number(blockTimestamps.get(log.blockNumber) ?? 0n) * 1000),
          txHash: log.transactionHash,
          blockNumber: log.blockNumber,
          status: "confirmed",
        });
      }

      // Sort by block number descending
      transactions.sort((a, b) => Number(b.blockNumber - a.blockNumber));

      return transactions;
    },
    enabled: !!credentialIdHex,
    staleTime: 30000,
  });
}

// Helper to get explorer URL for a transaction
export function getExplorerUrl(txHash: string): string {
  return `${CURRENT_NETWORK.explorer}/tx/${txHash}`;
}
