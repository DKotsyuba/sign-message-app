export enum NetworkType {
  Bitcoin = 'bitcoin',
  Solana = 'solana',
}

export interface ConnectWalletDriver {
  name: string;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signMessage: (message: string) => Promise<string>;
  getAddress: () => Promise<string>;
  verifySignature: (message: string, signature: string) => Promise<boolean>;
  isConnected: boolean;
  isDetected: boolean;
  connectOrDisconnectInProgress: boolean;
  address: string | null;
  network: NetworkType;
}
