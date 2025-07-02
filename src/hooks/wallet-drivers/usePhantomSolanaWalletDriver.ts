import { ConnectWalletDriver, NetworkType } from '@/models/ConnectWalletDriver';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { uint8ToBase64, verifySolanaSignature } from '@/utils';

export interface PhantomSolanaProvider {
  connect: () => Promise<{ publicKey: { toString: () => string } }>;
  disconnect: () => Promise<void>;
  isConnected: boolean;
  publicKey: { toString: () => string } | null;
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  off: (event: string, callback: (...args: unknown[]) => void) => void;
  signMessage: (message: Uint8Array) => Promise<{ signature: Uint8Array }>;
}

export const usePhantomSolanaWalletDriver = (): ConnectWalletDriver => {
  const solana = window.phantom?.solana;

  const [address, setAddress] = useState<string | null>(null);
  const [connectOrDisconnectInProgress, setConnectOrDisconnectInProgress] = useState(false);

  const isDetected = useMemo(() => {
    return solana !== undefined;
  }, [solana]);

  const getAddress = useCallback(async () => {
    if (solana === undefined) {
      throw new Error('Phantom wallet not detected');
    }
    if (address !== null) {
      return address;
    }
    const resp = await solana.connect();
    const publicKey = resp.publicKey.toString();
    setAddress(publicKey);
    return publicKey;
  }, [address, solana]);

  const connect = useCallback(async () => {
    if (solana === undefined) {
      throw new Error('Phantom wallet not detected');
    }
    if (address !== null || connectOrDisconnectInProgress) {
      return;
    }
    setConnectOrDisconnectInProgress(true);
    const resp = await solana.connect();
    setAddress(resp.publicKey.toString());
    setConnectOrDisconnectInProgress(false);
  }, [address, connectOrDisconnectInProgress, solana]);

  const disconnect = useCallback(async () => {
    if (solana === undefined) {
      throw new Error('Phantom wallet not detected');
    }
    if (address === null || connectOrDisconnectInProgress) {
      return;
    }
    setConnectOrDisconnectInProgress(true);
    await solana.disconnect();
    setAddress(null);
    setConnectOrDisconnectInProgress(false);
  }, [address, connectOrDisconnectInProgress, solana]);

  const signMessage = useCallback(
    async (message: string) => {
      if (solana === undefined) {
        throw new Error('Phantom wallet not detected');
      }
      const address = await getAddress();
      if (address === null) {
        throw new Error('Wallet not connected');
      }
      const messageUint8Array = new TextEncoder().encode(message);
      const result = await solana.signMessage(messageUint8Array);
      return uint8ToBase64(result.signature);
    },
    [getAddress, solana]
  );

  const verifySignature = useCallback(
    async (message: string, signature: string) => {
      if (solana === undefined) {
        throw new Error('Phantom wallet not detected');
      }
      const address = await getAddress();
      if (address === null) {
        throw new Error('Wallet not connected');
      }
      return verifySolanaSignature({
        message,
        signatureB64: signature,
        pubKeyB58: address,
      });
    },
    [solana, getAddress]
  );

  const isConnected = useMemo(() => {
    return address !== null;
  }, [address]);

  useEffect(() => {
    if (!solana) return;

    const handler = async () => {
      await getAddress();
    };

    solana.on('connect', handler);
    return () => solana.off('connect', handler);
  }, [getAddress, solana]);

  return {
    name: 'Phantom Solana',
    connect,
    disconnect,
    isDetected,
    getAddress,
    verifySignature,
    address,
    isConnected,
    signMessage,
    connectOrDisconnectInProgress,
    network: NetworkType.Solana,
  };
};
