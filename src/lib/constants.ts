// Active Network (controlled by environment variable)
export const ACTIVE_NETWORK = (import.meta.env.VITE_NETWORK || "liskSepolia") as
  | "lisk"
  | "liskSepolia";

// Network Configuration
export const NETWORKS = {
  lisk: {
    chainId: 1135,
    name: "Lisk",
    explorer: "https://blockscout.lisk.com",
    rpcUrl: "https://rpc.api.lisk.com",
  },
  liskSepolia: {
    chainId: 4202,
    name: "Lisk Sepolia",
    explorer: "https://sepolia-blockscout.lisk.com",
    rpcUrl: "https://rpc.sepolia-api.lisk.com",
  },
} as const;

// Contract Addresses per Network (can be overridden by env var)
const DEFAULT_CONTRACTS = {
  lisk: {
    forgetlessWallet: "0x0000000000000000000000000000000000000000" as `0x${string}`,
  },
  liskSepolia: {
    forgetlessWallet: "0xBd9F781727dc49a50D1CAB9a14ee1413b3c3A83E" as `0x${string}`,
  },
} as const;

export const CONTRACTS = {
  lisk: {
    forgetlessWallet: (import.meta.env.VITE_CONTRACT_ADDRESS ||
      DEFAULT_CONTRACTS.lisk.forgetlessWallet) as `0x${string}`,
  },
  liskSepolia: {
    forgetlessWallet: (import.meta.env.VITE_CONTRACT_ADDRESS ||
      DEFAULT_CONTRACTS.liskSepolia.forgetlessWallet) as `0x${string}`,
  },
};

// Helper to check if testnet
export const IS_TESTNET = ACTIVE_NETWORK === "liskSepolia";

// Current network config
export const CURRENT_NETWORK = NETWORKS[ACTIVE_NETWORK];
export const CONTRACT_ADDRESS = CONTRACTS[ACTIVE_NETWORK].forgetlessWallet;

// Supported Tokens (Base Sepolia addresses)
export const SUPPORTED_TOKENS = [
  {
    symbol: "ETH",
    name: "Ethereum",
    address: "0x0000000000000000000000000000000000000000" as `0x${string}`,
    decimals: 18,
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as `0x${string}`,
    decimals: 6,
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    address: "0x7169D38820dfd117C3FA1f22a697dBA58d90BA06" as `0x${string}`,
    decimals: 6,
  },
  {
    symbol: "DAI",
    name: "Dai Stablecoin",
    address: "0x7683022d84F726a96c4A6611cD31DBf5409c0Ac9" as `0x${string}`,
    decimals: 18,
  },
] as const;

export type DefaultToken = (typeof SUPPORTED_TOKENS)[number];
export type CustomToken = {
  symbol: string;
  name: string;
  address: `0x${string}`;
  decimals: number;
};
export type Token = DefaultToken | CustomToken;
export type NetworkKey = keyof typeof NETWORKS;

// Storage keys
export const STORAGE_KEYS = {
  session: "forgetless_session",
  credential: "forgetless_credential",
  displayName: "forgetless_displayName",
  customTokens: "forgetless_customTokens",
} as const;
