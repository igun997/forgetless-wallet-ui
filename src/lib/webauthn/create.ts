import { extractP256PublicKey } from "./encoding";
import { bytesToHex } from "@/lib/blockchain/contract";
import type { PasskeyCredential } from "./types";

/**
 * Create a new passkey credential using WebAuthn API
 * This prompts the user for biometric/PIN authentication
 */
export async function createPasskeyCredential(displayName: string): Promise<PasskeyCredential> {
  // Generate random challenge for registration
  const challenge = crypto.getRandomValues(new Uint8Array(32));

  // Generate random user ID
  const userId = crypto.getRandomValues(new Uint8Array(32));

  const credential = (await navigator.credentials.create({
    publicKey: {
      challenge,
      rp: {
        name: "Forgetless Wallet",
        id: window.location.hostname,
      },
      user: {
        id: userId,
        name: displayName,
        displayName,
      },
      pubKeyCredParams: [
        { alg: -7, type: "public-key" }, // ES256 (P-256)
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        residentKey: "required",
        userVerification: "required",
      },
      attestation: "none",
      timeout: 60000,
    },
  })) as PublicKeyCredential | null;

  if (!credential) {
    throw new Error("Failed to create passkey credential");
  }

  const response = credential.response as AuthenticatorAttestationResponse;

  // Extract P-256 public key from attestation object
  const { x, y } = extractP256PublicKey(response.attestationObject);

  // Convert credential ID to hex
  const credentialIdBytes = new Uint8Array(credential.rawId);
  const credentialIdHex = bytesToHex(credentialIdBytes);

  return {
    credentialId: credentialIdBytes,
    credentialIdHex,
    publicKeyX: x,
    publicKeyY: y,
    displayName,
  };
}
