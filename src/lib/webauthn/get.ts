import type { WebAuthnSignature } from "./types";

/**
 * Sign data using an existing passkey credential
 * This prompts the user for biometric/PIN authentication
 */
export async function signWithPasskey(
  credentialId: Uint8Array,
  challenge: Uint8Array
): Promise<WebAuthnSignature> {
  const credential = (await navigator.credentials.get({
    publicKey: {
      challenge,
      allowCredentials: [
        {
          id: credentialId,
          type: "public-key",
          transports: ["internal"],
        },
      ],
      userVerification: "required",
      timeout: 60000,
    },
  })) as PublicKeyCredential | null;

  if (!credential) {
    throw new Error("Failed to get passkey credential");
  }

  const response = credential.response as AuthenticatorAssertionResponse;

  return {
    authenticatorData: new Uint8Array(response.authenticatorData),
    clientDataJSON: new Uint8Array(response.clientDataJSON),
    signature: new Uint8Array(response.signature),
  };
}
