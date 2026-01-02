export interface WalletState {
  credentialId: string | null;
  isRegistered: boolean;
  ethBalance: string;
  tokenBalances: Record<string, string>;
  currentNonce: number;
  pendingTx: string | null;
}

export interface Transaction {
  id: string;
  type: "deposit" | "withdrawal";
  asset: string;
  amount: string;
  recipient?: string;
  sender?: string;
  timestamp: Date;
  txHash: string;
  status: "pending" | "confirmed" | "failed";
}

export interface WithdrawalRequest {
  credentialId: string;
  token: string;
  amount: string;
  recipient: string;
  nonce: number;
  deadline: number;
}
