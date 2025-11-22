"use client";

import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { WalletManager } from "@/core/wallet";

export interface UseWalletReturn {
  /** Current connected wallet address */
  address: string | null;
  /** Ethers provider instance */
  provider: ethers.BrowserProvider | null;
  /** Whether wallet is connected */
  isConnected: boolean;
  /** Whether connection is in progress */
  isConnecting: boolean;
  /** Current error message */
  error: string | null;
  /** Connect to MetaMask */
  connect: () => Promise<void>;
  /** Disconnect wallet */
  disconnect: () => void;
  /** Clear error message */
  clearError: () => void;
  /** Current network info */
  network: ethers.Network | null;
  /** ETH balance in wei */
  balance: bigint | null;
}

/**
 * React hook for wallet connection management
 * Wraps WalletManager with React state
 *
 * @example
 * ```tsx
 * const { address, connect, isConnected } = useWallet();
 *
 * if (!isConnected) {
 *   return <button onClick={connect}>Connect Wallet</button>;
 * }
 *
 * return <div>Connected: {address}</div>;
 * ```
 */
export function useWallet(): UseWalletReturn {
  const [address, setAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [network, setNetwork] = useState<ethers.Network | null>(null);
  const [balance, setBalance] = useState<bigint | null>(null);

  // Initialize - try to reconnect if previously connected
  useEffect(() => {
    const init = async () => {
      const addr = await WalletManager.tryReconnect();
      if (addr) {
        setAddress(addr);
        setProvider(WalletManager.getProvider());
        await updateNetworkInfo();
      }
    };
    init();
  }, []);

  // Subscribe to wallet changes
  useEffect(() => {
    const unsubscribe = WalletManager.subscribe((newAddress) => {
      setAddress(newAddress);
      setProvider(WalletManager.getProvider());
      if (newAddress) {
        updateNetworkInfo();
      } else {
        setNetwork(null);
        setBalance(null);
      }
    });

    return unsubscribe;
  }, []);

  // Update network and balance info
  const updateNetworkInfo = async () => {
    const net = await WalletManager.getNetwork();
    const bal = await WalletManager.getBalance();
    setNetwork(net);
    setBalance(bal);
  };

  // Connect wallet
  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const addr = await WalletManager.connect();
      setAddress(addr);
      setProvider(WalletManager.getProvider());
      await updateNetworkInfo();
    } catch (err: any) {
      const errorMsg = err.message || "Failed to connect wallet";
      setError(errorMsg);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Disconnect wallet
  const disconnect = useCallback(() => {
    WalletManager.disconnect();
    setAddress(null);
    setProvider(null);
    setNetwork(null);
    setBalance(null);
    setError(null);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    address,
    provider,
    isConnected: !!address,
    isConnecting,
    error,
    connect,
    disconnect,
    clearError,
    network,
    balance,
  };
}
