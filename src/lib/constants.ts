// Active Network (controlled by environment variable)
export const ACTIVE_NETWORK = (import.meta.env.VITE_NETWORK || "baseSepolia") as
  | "base"
  | "baseSepolia";

// Network Configuration
export const NETWORKS = {
  base: {
    chainId: 8453,
    name: "Base",
    explorer: "https://basescan.org",
    rpcUrl: "https://mainnet.base.org",
  },
  baseSepolia: {
    chainId: 84532,
    name: "Base Sepolia",
    explorer: "https://sepolia.basescan.org",
    rpcUrl: "https://sepolia.base.org",
  },
} as const;

// Contract Addresses per Network
export const CONTRACTS = {
  base: {
    forgetlessWallet: "0x0000000000000000000000000000000000000000" as `0x${string}`,
  },
  baseSepolia: {
    forgetlessWallet: "0xe28B90cb851c9bc144e3Ad0737310ABCF6f13c91" as `0x${string}`,
  },
} as const;

// Helper to check if testnet
export const IS_TESTNET = ACTIVE_NETWORK === "baseSepolia";

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

export type Token = (typeof SUPPORTED_TOKENS)[number];
export type NetworkKey = keyof typeof NETWORKS;

// Storage keys
export const STORAGE_KEYS = {
  session: "forgetless_session",
  credential: "forgetless_credential",
  displayName: "forgetless_displayName",
} as const;
