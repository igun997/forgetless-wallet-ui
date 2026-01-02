import { keccak256, encodeAbiParameters, concat, toBytes } from "viem";
import { forgetlessWallet } from "@/lib/blockchain/contract";
import type { WithdrawalParams } from "./types";

// Typehash for WithdrawalRequest struct
const WITHDRAWAL_TYPEHASH =
  "0xe3f7b23e902258b931bec34d4752f26e16cf91d06c15795cfc4e6ae21f40870f" as `0x${string}`;

/**
 * Build EIP-712 challenge for withdrawal signing
 * The challenge is the digest that must be signed by the passkey
 */
export async function buildWithdrawalChallenge(params: WithdrawalParams): Promise<Uint8Array> {
  // Get domain separator from contract
  const domainSeparator = await forgetlessWallet.read.DOMAIN_SEPARATOR();

  // Hash the credential ID
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
        WITHDRAWAL_TYPEHASH,
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
