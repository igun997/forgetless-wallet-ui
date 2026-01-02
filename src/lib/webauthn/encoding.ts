import { encodeAbiParameters } from "viem";
import { bytesToHex } from "@/lib/blockchain/contract";

// P-256 curve order for signature normalization
const P256_N = BigInt("0xFFFFFFFF00000000FFFFFFFFFFFFFFFFBCE6FAADA7179E84F3B9CAC2FC632551");
const P256_N_DIV_2 = P256_N / 2n;

/**
 * Extract P-256 public key coordinates from WebAuthn attestation object
 * The attestation object contains CBOR-encoded data including the public key
 */
export function extractP256PublicKey(attestationObject: ArrayBuffer): {
  x: `0x${string}`;
  y: `0x${string}`;
} {
  const data = new Uint8Array(attestationObject);

  // Find authData in CBOR (after "authData" key bytes: 68 61 75 74 68 44 61 74 61)
  // The authData starts after the CBOR map key
  const authDataKey = [0x68, 0x61, 0x75, 0x74, 0x68, 0x44, 0x61, 0x74, 0x61];
  let authDataStart = -1;

  for (let i = 0; i < data.length - authDataKey.length; i++) {
    let match = true;
    for (let j = 0; j < authDataKey.length; j++) {
      if (data[i + j] !== authDataKey[j]) {
        match = false;
        break;
      }
    }
    if (match) {
      // Skip the key and the CBOR byte string header
      authDataStart = i + authDataKey.length;
      // Skip CBOR header byte(s) for the byte string
      if (data[authDataStart] >= 0x58 && data[authDataStart] <= 0x5b) {
        // 2-byte length
        authDataStart += 2;
      } else {
        authDataStart += 1;
      }
      break;
    }
  }

  if (authDataStart === -1) {
    throw new Error("Could not find authData in attestation object");
  }

  // authData structure:
  // - rpIdHash: 32 bytes
  // - flags: 1 byte
  // - signCount: 4 bytes
  // - attestedCredentialData (if AT flag set):
  //   - aaguid: 16 bytes
  //   - credentialIdLength: 2 bytes (big endian)
  //   - credentialId: credentialIdLength bytes
  //   - credentialPublicKey: COSE-encoded

  const credIdLengthStart = authDataStart + 32 + 1 + 4 + 16;
  const credIdLength = (data[credIdLengthStart] << 8) | data[credIdLengthStart + 1];
  const coseKeyStart = credIdLengthStart + 2 + credIdLength;

  // Parse COSE key to extract x and y coordinates
  // COSE key for P-256 is a map with keys -1, -2, -3
  // -2 (0x21) = x coordinate
  // -3 (0x22) = y coordinate
  const coseKey = data.slice(coseKeyStart);

  let x: Uint8Array | null = null;
  let y: Uint8Array | null = null;

  // Simple COSE parsing - look for the coordinate markers
  for (let i = 0; i < coseKey.length - 33; i++) {
    // Look for -2 (x coordinate) encoded as 0x21 followed by byte string of 32 bytes (0x58 0x20)
    if (coseKey[i] === 0x21 && coseKey[i + 1] === 0x58 && coseKey[i + 2] === 0x20) {
      x = coseKey.slice(i + 3, i + 3 + 32);
    }
    // Look for -3 (y coordinate) encoded as 0x22 followed by byte string of 32 bytes (0x58 0x20)
    if (coseKey[i] === 0x22 && coseKey[i + 1] === 0x58 && coseKey[i + 2] === 0x20) {
      y = coseKey.slice(i + 3, i + 3 + 32);
    }
  }

  if (!x || !y) {
    throw new Error("Could not extract public key coordinates from COSE key");
  }

  return {
    x: bytesToHex(x),
    y: bytesToHex(y),
  };
}

/**
 * Parse DER-encoded ECDSA signature to extract r and s values
 * DER format: 0x30 [total-length] 0x02 [r-length] [r] 0x02 [s-length] [s]
 */
export function parseEcdsaSignature(signature: Uint8Array): { r: bigint; s: bigint } {
  let offset = 0;

  // Check sequence tag
  if (signature[offset++] !== 0x30) {
    throw new Error("Invalid DER signature: missing sequence tag");
  }

  // Skip sequence length
  const seqLength = signature[offset++];
  if (seqLength > 128) {
    // Long form length - skip additional bytes
    offset += seqLength - 128;
  }

  // Parse r
  if (signature[offset++] !== 0x02) {
    throw new Error("Invalid DER signature: missing r integer tag");
  }
  const rLength = signature[offset++];
  let r = 0n;
  for (let i = 0; i < rLength; i++) {
    r = (r << 8n) | BigInt(signature[offset++]);
  }

  // Parse s
  if (signature[offset++] !== 0x02) {
    throw new Error("Invalid DER signature: missing s integer tag");
  }
  const sLength = signature[offset++];
  let s = 0n;
  for (let i = 0; i < sLength; i++) {
    s = (s << 8n) | BigInt(signature[offset++]);
  }

  // Normalize s to low-S form (required by the contract)
  if (s > P256_N_DIV_2) {
    s = P256_N - s;
  }

  return { r, s };
}

/**
 * Encode WebAuthn authentication data for the smart contract
 * Format: abi.encode(authenticatorData, clientDataJSON, r, s)
 */
export function encodeAuthData(
  authenticatorData: Uint8Array,
  clientDataJSON: Uint8Array,
  r: bigint,
  s: bigint
): `0x${string}` {
  const rHex = `0x${r.toString(16).padStart(64, "0")}` as `0x${string}`;
  const sHex = `0x${s.toString(16).padStart(64, "0")}` as `0x${string}`;

  return encodeAbiParameters(
    [{ type: "bytes" }, { type: "bytes" }, { type: "bytes32" }, { type: "bytes32" }],
    [bytesToHex(authenticatorData), bytesToHex(clientDataJSON), rHex, sHex]
  );
}
