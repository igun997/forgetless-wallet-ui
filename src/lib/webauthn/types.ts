export interface PasskeyCredential {
  credentialId: Uint8Array;
  credentialIdHex: `0x${string}`;
  publicKeyX: `0x${string}`;
  publicKeyY: `0x${string}`;
  displayName: string;
}

export interface WebAuthnSignature {
  authenticatorData: Uint8Array;
  clientDataJSON: Uint8Array;
  signature: Uint8Array;
}

export interface WalletSession {
  credentialId: number[];
  credentialIdHex: `0x${string}`;
  displayName: string;
}

export interface WithdrawalParams {
  credentialId: Uint8Array;
  credentialIdHex: `0x${string}`;
  token: `0x${string}`;
  amount: bigint;
  recipient: `0x${string}`;
  nonce: bigint;
  deadline: bigint;
}
