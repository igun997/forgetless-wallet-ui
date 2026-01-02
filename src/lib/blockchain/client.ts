import { createPublicClient, http } from "viem";
import { activeChain } from "./config";
import { NETWORKS, ACTIVE_NETWORK } from "@/lib/constants";

export const publicClient = createPublicClient({
  chain: activeChain,
  transport: http(NETWORKS[ACTIVE_NETWORK].rpcUrl),
});
