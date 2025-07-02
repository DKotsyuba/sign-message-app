import { ConnectWalletDriver, NetworkType } from '@/models/ConnectWalletDriver';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { uint8ToBase64, verifyBitcoinSignature } from '@/utils';

type PhantomBitcoinProviderAccount = {
  address: string;
  publicKey: string;
  purpose: 'payment' | 'ordinals';
};

export interface PhantomBitcoinProvider {
  requestAccounts: () => Promise<PhantomBitcoinProviderAccount[]>;
  signMessage: (address: string, message: Uint8Array) => Promise<{ signature: Uint8Array }>;
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  off: (event: string, callback: (...args: unknown[]) => void) => void;
}

export const usePhantomBitcoinWalletDriver = (): ConnectWalletDriver => {
  const bitcoin = window.phantom?.bitcoin;

  const [account, setAccount] = useState<PhantomBitcoinProviderAccount | null>(null);
  const [connectOrDisconnectInProgress, setConnectOrDisconnectInProgress] = useState(false);

  const isDetected = useMemo(() => {
    return bitcoin !== undefined;
  }, [bitcoin]);

  const getAddress = useCallback(async () => {
    if (account !== null) {
      return account?.address;
    }
    if (bitcoin === undefined) {
      throw new Error('Phantom wallet not detected');
    }
    const accounts = await bitcoin.requestAccounts();
    const accountResult = accounts.find(a => a.purpose === 'payment');
    if (!accountResult) {
      throw new Error('No payment account found');
    }
    setAccount(accountResult);
    return accountResult.address;
  }, [account, bitcoin]);

  const connect = useCallback(async () => {
    if (bitcoin === undefined) {
      throw new Error('Phantom wallet not detected');
    }
    if (account !== null || connectOrDisconnectInProgress) {
      return;
    }
    setConnectOrDisconnectInProgress(true);
    await getAddress();
    setConnectOrDisconnectInProgress(false);
  }, [account, bitcoin, connectOrDisconnectInProgress, getAddress]);

  const disconnect = useCallback(async () => {
    if (bitcoin === undefined) {
      throw new Error('Phantom wallet not detected');
    }
    if (account === null || connectOrDisconnectInProgress) {
      return;
    }
    setConnectOrDisconnectInProgress(true);
    setAccount(null);
    setConnectOrDisconnectInProgress(false);
  }, [account, bitcoin, connectOrDisconnectInProgress]);

  const signMessage = useCallback(
    async (message: string) => {
      if (bitcoin === undefined) {
        throw new Error('Phantom wallet not detected');
      }
      const address = await getAddress();
      if (address === null) {
        throw new Error('Wallet not connected');
      }
      const messageUint8Array = new TextEncoder().encode(message);
      const result = await bitcoin.signMessage(address, messageUint8Array);
      return uint8ToBase64(result.signature);
    },
    [bitcoin, getAddress]
  );

  const verifySignature = useCallback(
    async (message: string, signature: string) => {
      if (bitcoin === undefined) {
        throw new Error('Phantom wallet not detected');
      }
      await getAddress();
      if (!account?.address) {
        throw new Error('Wallet not connected');
      }
      return verifyBitcoinSignature({
        message,
        address: account.address,
        signature: signature,
      });
    },
    [account?.address, bitcoin, getAddress]
  );

  const isConnected = useMemo(() => {
    return account !== null;
  }, [account]);

  useEffect(() => {
    if (!bitcoin) return;

    const handler = async () => {
      await getAddress();
    };

    bitcoin.on('accountsChanged', handler);

    return () => bitcoin.off('accountsChanged', handler);
  }, [bitcoin, getAddress]);

  return {
    name: 'Phantom Bitcoin',
    connect,
    disconnect,
    signMessage,
    getAddress,
    verifySignature,
    isDetected,
    address: account?.address ?? null,
    isConnected,
    connectOrDisconnectInProgress,
    network: NetworkType.Bitcoin,
  };
};
