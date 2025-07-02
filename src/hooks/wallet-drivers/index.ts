import {
  PhantomBitcoinProvider,
  usePhantomBitcoinWalletDriver,
} from './usePhantomBitcoinWalletDriver.ts';
import {
  PhantomSolanaProvider,
  usePhantomSolanaWalletDriver,
} from './usePhantomSolanaWalletDriver.ts';

import { useXverseBitcoinWalletDriver } from './useXverseBitcoinWalletDriver.ts';

declare global {
  interface Window {
    phantom?: {
      bitcoin?: PhantomBitcoinProvider;
      solana?: PhantomSolanaProvider;
    };
  }
}

export {
  usePhantomBitcoinWalletDriver,
  usePhantomSolanaWalletDriver,
  useXverseBitcoinWalletDriver,
};
