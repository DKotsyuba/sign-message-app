import {
  usePhantomBitcoinWalletDriver,
  usePhantomSolanaWalletDriver,
  useXverseBitcoinWalletDriver,
} from '@/hooks/wallet-drivers';
import { ConnectWalletDriver, NetworkType } from '@/models/ConnectWalletDriver.ts';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useConnectWalletPersist } from './useConnectWalletPersist.ts';

interface ConnectWallet {
  activeWalletAddress: string | null;
  activeWalletName: string | null;
  activeWalletNetwork: NetworkType | null;
  isWalletConnected: boolean;
  connect: (driver: ConnectWalletDriver) => Promise<void>;
  switchWallet: (driver: ConnectWalletDriver) => void;
  signMessage: (message: string) => Promise<string>;
  disconnect: () => Promise<void>;
  verifySignature: (message: string, signature: string) => Promise<boolean>;
  detectedWallets: ConnectWalletDriver[];
}

export const useConnectWallet = (): ConnectWallet => {
  const isConnectionRestore = useRef(false);
  const phantomSolana = usePhantomSolanaWalletDriver();
  const phantomBitcoin = usePhantomBitcoinWalletDriver();
  const xverseBitcoin = useXverseBitcoinWalletDriver();

  const {
    connections: connectionsPersist,
    activeWallet: activeWalletPersist,
    setActiveWallet: setActiveWalletPersist,
    setWalletConnected: setWalletConnectedPersist,
  } = useConnectWalletPersist();

  const walletDrivers = useMemo(
    () => [phantomSolana, phantomBitcoin, xverseBitcoin],
    [phantomSolana, phantomBitcoin, xverseBitcoin]
  );

  const activeWallet = useMemo(() => {
    return walletDrivers.find(d => d.name === activeWalletPersist) ?? null;
  }, [activeWalletPersist, walletDrivers]);

  const detectedWallets = useMemo(() => {
    return walletDrivers.filter(d => d.isDetected);
  }, [walletDrivers]);

  const activeWalletAddress = useMemo(() => {
    return activeWallet?.address ?? null;
  }, [activeWallet?.address]);

  const activeWalletName = useMemo(() => {
    return activeWallet?.name ?? null;
  }, [activeWallet?.name]);

  const activeWalletNetwork = useMemo(() => {
    return activeWallet?.network ?? null;
  }, [activeWallet?.network]);

  const isWalletConnected = useMemo(() => {
    return activeWallet?.isConnected ?? false;
  }, [activeWallet?.isConnected]);

  const connect = useCallback(
    async (driver: ConnectWalletDriver) => {
      await driver.connect();
      setWalletConnectedPersist(driver.name, true);
      setActiveWalletPersist(driver.name);
    },
    [setActiveWalletPersist, setWalletConnectedPersist]
  );

  const switchWallet = useCallback(
    (driver: ConnectWalletDriver) => {
      setActiveWalletPersist(driver.name);
    },
    [setActiveWalletPersist]
  );

  const disconnect = useCallback(async () => {
    if (!activeWallet) {
      return;
    }
    await activeWallet.disconnect();
    setWalletConnectedPersist(activeWallet.name, false);

    const newActiveWallet = detectedWallets.find(
      d => d.name !== activeWallet.name && d.isConnected
    );
    if (newActiveWallet) {
      switchWallet(newActiveWallet);
    }
  }, [activeWallet, detectedWallets, setWalletConnectedPersist, switchWallet]);

  const signMessage = useCallback(
    async (message: string) => {
      if (!activeWallet) {
        throw new Error('Wallet not connected');
      }
      return activeWallet.signMessage(message);
    },
    [activeWallet]
  );

  const verifySignature = useCallback(
    async (message: string, signature: string) => {
      if (!activeWallet) {
        throw new Error('Wallet not connected');
      }
      return activeWallet.verifySignature(message, signature);
    },
    [activeWallet]
  );

  // restore wallet
  useEffect(() => {
    if (isConnectionRestore.current) return;
    try {
      if (Object.keys(connectionsPersist).length === 0) return;
      const drivers: Map<string, ConnectWalletDriver> = new Map();
      for (const driver of walletDrivers) {
        drivers.set(driver.name, driver);
      }
      for (const [name, isConnected] of Object.entries(connectionsPersist)) {
        if (!isConnected) continue;
        const driver = drivers.get(name);
        if (!driver) continue;
        driver.connect().catch(error => {
          console.error(error);
          setWalletConnectedPersist(name, false);
        });
      }
    } finally {
      isConnectionRestore.current = true;
    }
  }, [connectionsPersist, setWalletConnectedPersist, walletDrivers]);

  return {
    activeWalletAddress,
    activeWalletName,
    activeWalletNetwork,
    isWalletConnected,
    connect,
    disconnect,
    switchWallet,
    signMessage,
    verifySignature,
    detectedWallets,
  };
};
