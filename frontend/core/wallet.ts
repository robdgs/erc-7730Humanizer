import { ethers } from "ethers";

/**
 * Centralized wallet connection manager
 * Single source of truth for wallet state across the app
 */
export class WalletManager {
  private static provider: ethers.BrowserProvider | null = null;
  private static address: string | null = null;
  private static listeners: Set<(address: string | null) => void> = new Set();

  /**
   * Connect to MetaMask wallet
   * @returns Connected wallet address
   * @throws Error if MetaMask not installed or connection rejected
   */
  static async connect(): Promise<string> {
    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error(
        "MetaMask is not installed. Please install MetaMask to connect your wallet."
      );
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const address = accounts[0];

      this.provider = provider;
      this.address = address;

      // Setup account change listener
      this.setupAccountListener();

      // Notify all subscribers
      this.notifyListeners(address);

      return address;
    } catch (error: any) {
      throw new Error(error.message || "Failed to connect wallet");
    }
  }

  /**
   * Disconnect wallet and clear state
   */
  static disconnect(): void {
    this.provider = null;
    this.address = null;
    this.notifyListeners(null);
  }

  /**
   * Get current provider instance
   */
  static getProvider(): ethers.BrowserProvider | null {
    return this.provider;
  }

  /**
   * Get current connected address
   */
  static getAddress(): string | null {
    return this.address;
  }

  /**
   * Check if wallet is connected
   */
  static isConnected(): boolean {
    return !!this.address;
  }

  /**
   * Subscribe to address changes
   * @param callback Function to call when address changes
   * @returns Unsubscribe function
   */
  static subscribe(callback: (address: string | null) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Get network information
   */
  static async getNetwork(): Promise<ethers.Network | null> {
    if (!this.provider) return null;
    try {
      return await this.provider.getNetwork();
    } catch {
      return null;
    }
  }

  /**
   * Get ETH balance for current address
   */
  static async getBalance(): Promise<bigint | null> {
    if (!this.provider || !this.address) return null;
    try {
      return await this.provider.getBalance(this.address);
    } catch {
      return null;
    }
  }

  /**
   * Setup listener for MetaMask account changes
   */
  private static setupAccountListener(): void {
    if (!window.ethereum) return;

    // Remove previous listener if exists
    if (window.ethereum.removeAllListeners) {
      window.ethereum.removeAllListeners("accountsChanged");
    }

    // Add new listener
    window.ethereum.on("accountsChanged", (accounts: string[]) => {
      if (accounts.length > 0) {
        this.address = accounts[0];
        this.notifyListeners(accounts[0]);
      } else {
        this.disconnect();
      }
    });

    // Chain change listener
    window.ethereum.on("chainChanged", () => {
      // Reload on chain change to prevent stale state
      window.location.reload();
    });
  }

  /**
   * Notify all subscribers of address change
   */
  private static notifyListeners(address: string | null): void {
    this.listeners.forEach((callback) => callback(address));
  }

  /**
   * Try to reconnect if wallet was previously connected
   * Useful for page refreshes
   */
  static async tryReconnect(): Promise<string | null> {
    if (typeof window === "undefined" || !window.ethereum) {
      return null;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_accounts", []);

      if (accounts.length > 0) {
        this.provider = provider;
        this.address = accounts[0];
        this.setupAccountListener();
        this.notifyListeners(accounts[0]);
        return accounts[0];
      }
    } catch {
      // Silent fail - user not connected
    }

    return null;
  }
}

// Type augmentation for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}
