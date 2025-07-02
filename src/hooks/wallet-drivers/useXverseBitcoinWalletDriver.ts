import { ConnectWalletDriver, NetworkType } from '@/models/ConnectWalletDriver';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AddressPurpose, request, addListener } from 'sats-connect';
import { verifyBitcoinSignature } from '@/utils';
import mitt from 'mitt';

type Account = { address: string; publicKey: string; purpose: AddressPurpose };

type Events = {
  accountChange: Account[] | undefined;
  connect: void;
  disconnect: void;
};

const emitter = mitt<Events>();
addListener('accountChange', res => {
  if (res.type === 'accountChange') {
    emitter.emit('accountChange', res.addresses);
  }
});

export const useXverseBitcoinWalletDriver = (): ConnectWalletDriver => {
  const [account, setAccount] = useState<Account | null>(null);
  const [connectOrDisconnectInProgress, setConnectOrDisconnectInProgress] = useState(false);

  const isDetected = useMemo(() => {
    return true;
  }, []);

  const getAddress = useCallback(async () => {
    if (account) return account.address;

    const res = await request('getAddresses', {
      purposes: [AddressPurpose.Payment],
      message: 'Connect to Xverse',
    });

    if (res.status === 'error') {
      throw new Error(res.error.message);
    }
    if (res.status === 'success') {
      const found = res.result.addresses.find(a => a.purpose === AddressPurpose.Payment);
      if (!found) throw new Error('Payment not exists');

      setAccount(found);
      return found.address;
    }
    throw new Error(`Unexpected response: ${JSON.stringify(res, null, 2)}`);
  }, [account]);

  const connect = useCallback(async () => {
    if (account || connectOrDisconnectInProgress) return;
    setConnectOrDisconnectInProgress(true);
    try {
      const res = await request('wallet_connect', null);
      if (res.status === 'error') {
        throw new Error(res.error.message);
      }
      if (res.status === 'success') {
        const found = res.result.addresses.find(a => a.purpose === AddressPurpose.Payment);
        if (!found) throw new Error('Payment not exists');
        setAccount(found);
        emitter.emit('connect');
      }
    } finally {
      setConnectOrDisconnectInProgress(false);
    }
  }, [account, connectOrDisconnectInProgress]);

  const disconnect = useCallback(async () => {
    try {
      setConnectOrDisconnectInProgress(true);
      const res = await request('wallet_disconnect', null);
      if (res.status === 'error') {
        throw new Error(res.error.message);
      }
      if (res.status === 'success') {
        setAccount(null);
        emitter.emit('disconnect');
      }
    } finally {
      setConnectOrDisconnectInProgress(false);
    }
  }, []);

  const signMessage = useCallback(
    async (message: string) => {
      if (!account) throw new Error('Wallet not connected');

      const result = await request('signMessage', {
        message,
        address: account.address,
      });

      if (result.status !== 'success') {
        throw new Error('Не удалось подписать сообщение');
      }

      return result.result.signature;
    },
    [account]
  );

  const verifySignature = useCallback(
    async (message: string, signature: string) => {
      if (!account?.address) {
        throw new Error('Wallet not connected');
      }
      return verifyBitcoinSignature({
        message,
        address: account.address,
        signature: signature,
      });
    },
    [account?.address]
  );

  const isConnected = useMemo(() => !!account, [account]);

  useEffect(() => {
    const handlerAccountChange = async () => {
      await getAddress();
    };
    const handlerDisconnect = async () => {
      setAccount(null);
    };

    emitter.on('accountChange', handlerAccountChange);
    emitter.on('connect', handlerAccountChange);
    emitter.on('disconnect', handlerDisconnect);
    return () => {
      emitter.off('accountChange', handlerAccountChange);
      emitter.off('connect', handlerAccountChange);
      emitter.off('disconnect', handlerDisconnect);
    };
  }, [getAddress]);

  return {
    name: 'Xverse Wallet',
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
