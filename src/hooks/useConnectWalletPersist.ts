import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type WalletName = string;

interface WalletConnectionState {
  connections: Record<WalletName, boolean>;
  activeWallet: WalletName | null;

  setWalletConnected: (walletName: WalletName, isConnected: boolean) => void;
  setActiveWallet: (walletName: WalletName | null) => void;
}

export const useConnectWalletPersist = create<WalletConnectionState>()(
  persist(
    set => ({
      connections: {},
      activeWallet: null,

      setWalletConnected: (walletName, isConnected) =>
        set(state => ({
          connections: {
            ...state.connections,
            [walletName]: isConnected,
          },
          activeWallet:
            state.activeWallet === walletName && !isConnected ? null : state.activeWallet,
        })),

      setActiveWallet: walletName =>
        set(() => ({
          activeWallet: walletName,
        })),
    }),
    {
      name: 'wallet-connection-persist',
      partialize: state => ({
        connections: state.connections,
        activeWallet: state.activeWallet,
      }),
    }
  )
);
