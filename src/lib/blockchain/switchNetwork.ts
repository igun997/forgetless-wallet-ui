import { NETWORKS, ACTIVE_NETWORK } from "@/lib/constants";

const targetNetwork = NETWORKS[ACTIVE_NETWORK];
const targetChainIdHex = `0x${targetNetwork.chainId.toString(16)}`;

async function getCurrentChainId(): Promise<string | null> {
  if (!window.ethereum) return null;
  try {
    return (await window.ethereum.request({ method: "eth_chainId" })) as string;
  } catch {
    // Try net_version as fallback
    try {
      const netVersion = (await window.ethereum.request({ method: "net_version" })) as string;
      return `0x${parseInt(netVersion, 10).toString(16)}`;
    } catch {
      return null;
    }
  }
}

export async function ensureCorrectNetwork(): Promise<void> {
  if (!window.ethereum) {
    throw new Error("No wallet found. Please install MetaMask.");
  }

  // Check current chain
  const currentChain = await getCurrentChainId();
  if (currentChain?.toLowerCase() === targetChainIdHex.toLowerCase()) {
    return; // Already on correct chain
  }

  // Try to add the chain first (this also switches to it)
  try {
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: targetChainIdHex,
          chainName: targetNetwork.name,
          nativeCurrency: {
            name: "Ethereum",
            symbol: "ETH",
            decimals: 18,
          },
          rpcUrls: [targetNetwork.rpcUrl],
          blockExplorerUrls: [targetNetwork.explorer],
        },
      ],
    });
  } catch (error) {
    const addError = error as { code?: number };
    // If chain already exists, try switching
    if (addError.code === 4001) {
      throw new Error("Please switch to " + targetNetwork.name + " to continue");
    }
    // Try switch as fallback
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: targetChainIdHex }],
      });
    } catch (switchError) {
      const se = switchError as { code?: number };
      if (se.code === 4001) {
        throw new Error("Please switch to " + targetNetwork.name + " to continue");
      }
    }
  }

  // Verify we're now on the correct chain
  const newChain = await getCurrentChainId();
  if (newChain?.toLowerCase() !== targetChainIdHex.toLowerCase()) {
    throw new Error(
      `Please manually switch to ${targetNetwork.name} (Chain ID: ${targetNetwork.chainId}) in your wallet`
    );
  }
}
