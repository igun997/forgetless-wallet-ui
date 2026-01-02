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

// Supported Tokens
export const SUPPORTED_TOKENS = [
  {
    symbol: "ETH",
    name: "Ethereum",
    address: "0x0000000000000000000000000000000000000000",
    decimals: 18,
    logo: "/tokens/eth.svg",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    decimals: 6,
    logo: "/tokens/usdc.svg",
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    address: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2",
    decimals: 6,
    logo: "/tokens/usdt.svg",
  },
  {
    symbol: "DAI",
    name: "Dai Stablecoin",
    address: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
    decimals: 18,
    logo: "/tokens/dai.svg",
  },
  {
    symbol: "WETH",
    name: "Wrapped Ether",
    address: "0x4200000000000000000000000000000000000006",
    decimals: 18,
    logo: "/tokens/weth.svg",
  },
] as const;

export type Token = (typeof SUPPORTED_TOKENS)[number];

// Contract address placeholder
export const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000";
