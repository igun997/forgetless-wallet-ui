import { liskSepolia, lisk } from "viem/chains";
import { ACTIVE_NETWORK, CONTRACTS } from "@/lib/constants";

export const chains = {
  liskSepolia,
  lisk,
} as const;

export const activeChain = chains[ACTIVE_NETWORK];
export const contractAddress = CONTRACTS[ACTIVE_NETWORK].forgetlessWallet;
