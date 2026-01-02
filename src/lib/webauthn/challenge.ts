import { keccak256, encodeAbiParameters, concat, toBytes } from "viem";
import { forgetlessWallet } from "@/lib/blockchain/contract";
import type { WithdrawalParams } from "./types";

/**
 * Build EIP-712 challenge for withdrawal signing
 * The challenge is the digest that must be signed by the passkey
 */
export async function buildWithdrawalChallenge(params: WithdrawalParams): Promise<Uint8Array> {
  // Get domain separator and typehash from contract
  const [domainSeparator, withdrawalTypehash] = await Promise.all([
    forgetlessWallet.read.DOMAIN_SEPARATOR(),
    forgetlessWallet.read.WITHDRAWAL_TYPEHASH(),
  ]);

  // Hash the credential ID (same as Solidity: keccak256(credentialId))
  const credentialIdHash = keccak256(params.credentialIdHex);

  // Encode struct data and compute struct hash
  const structHash = keccak256(
    encodeAbiParameters(
      [
        { type: "bytes32" },
        { type: "bytes32" },
        { type: "address" },
        { type: "uint256" },
        { type: "address" },
        { type: "uint256" },
        { type: "uint256" },
      ],
      [
        withdrawalTypehash,
        credentialIdHash,
        params.token,
        params.amount,
        params.recipient,
        params.nonce,
        params.deadline,
      ]
    )
  );

  // Compute final digest: keccak256("\x19\x01" + domainSeparator + structHash)
  const digest = keccak256(
    concat([toBytes("0x1901" as `0x${string}`), toBytes(domainSeparator), toBytes(structHash)])
  );

  return toBytes(digest);
}
