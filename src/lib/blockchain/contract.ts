import { getContract } from "viem";
import { publicClient } from "./client";
import { contractAddress } from "./config";
import { FORGETLESS_WALLET_ABI } from "@/lib/abi/ForgetlessWallet";

// Read-only contract instance
export const forgetlessWallet = getContract({
  address: contractAddress,
  abi: FORGETLESS_WALLET_ABI,
  client: publicClient,
});

// Helper to convert bytes to hex string
export function bytesToHex(bytes: Uint8Array): `0x${string}` {
  return `0x${Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")}`;
}

// Helper to convert hex string to bytes
export function hexToBytes(hex: `0x${string}`): Uint8Array {
  const hexString = hex.slice(2);
  const bytes = new Uint8Array(hexString.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hexString.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}
