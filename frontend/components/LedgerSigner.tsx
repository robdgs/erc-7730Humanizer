"use client";

import React, { useState } from "react";
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import Eth from "@ledgerhq/hw-app-eth";
import { ethers } from "ethers";

interface LedgerSignerProps {
  onConnected?: (address: string) => void;
  onDisconnected?: () => void;
  onError?: (error: string) => void;
}

export default function LedgerSigner({
  onConnected,
  onDisconnected,
  onError,
}: LedgerSignerProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [transport, setTransport] = useState<any>(null);

  const connectLedger = async () => {
    setIsConnecting(true);
    try {
      const newTransport = await TransportWebUSB.create();
      const eth = new Eth(newTransport);

      const derivationPath = "44'/60'/0'/0/0";
      const result = await eth.getAddress(derivationPath);

      setTransport(newTransport);
      setAddress(result.address);
      setIsConnected(true);

      if (onConnected) {
        onConnected(result.address);
      }
    } catch (error: any) {
      console.error("Failed to connect to Ledger:", error);
      const errorMessage =
        error.message || "Failed to connect to Ledger device";

      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectLedger = async () => {
    if (transport) {
      await transport.close();
      setTransport(null);
    }
    setIsConnected(false);
    setAddress("");

    if (onDisconnected) {
      onDisconnected();
    }
  };

  const signTransaction = async (transaction: any): Promise<string | null> => {
    if (!transport || !isConnected) {
      if (onError) {
        onError("Ledger not connected");
      }
      return null;
    }

    try {
      const eth = new Eth(transport);
      const derivationPath = "44'/60'/0'/0/0";

      const serializedTx =
        ethers.Transaction.from(transaction).unsignedSerialized;
      const signature = await eth.signTransaction(
        derivationPath,
        serializedTx.slice(2)
      );

      return signature.r + signature.s + signature.v;
    } catch (error: any) {
      console.error("Failed to sign transaction:", error);
      if (onError) {
        onError(error.message || "Failed to sign transaction");
      }
      return null;
    }
  };

  return (
    <div className="ledger-signer">
      {!isConnected ? (
        <button
          onClick={connectLedger}
          disabled={isConnecting}
          className="connect-button"
        >
          {isConnecting ? (
            <span className="flex items-center gap-2">
              <span className="spinner"></span>
              Connecting to Ledger...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.5 9.5h-4v-4h4m0 15h-4v-4h4m-15 0h4v4h-4m0-15h4v4h-4" />
              </svg>
              Connect Ledger Device
            </span>
          )}
        </button>
      ) : (
        <div className="connected-status">
          <div className="status-indicator">
            <div className="status-dot"></div>
            <span className="status-text">Ledger Connected</span>
          </div>
          <div className="address-display">
            {address.slice(0, 6)}...{address.slice(-4)}
          </div>
          <button onClick={disconnectLedger} className="disconnect-button">
            Disconnect
          </button>
        </div>
      )}

      <style jsx>{`
        .ledger-signer {
          width: 100%;
        }

        .connect-button {
          width: 100%;
          padding: 16px 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        .connect-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
        }

        .connect-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .connected-status {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          background: #f0fdf4;
          border: 2px solid #10b981;
          border-radius: 12px;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .status-dot {
          width: 10px;
          height: 10px;
          background: #10b981;
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .status-text {
          font-weight: 600;
          color: #065f46;
        }

        .address-display {
          font-family: "Courier New", monospace;
          font-size: 14px;
          color: #065f46;
          background: white;
          padding: 6px 12px;
          border-radius: 6px;
        }

        .disconnect-button {
          padding: 8px 16px;
          background: white;
          border: 2px solid #10b981;
          color: #065f46;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .disconnect-button:hover {
          background: #10b981;
          color: white;
        }
      `}</style>
    </div>
  );
}

export { LedgerSigner };
export type { LedgerSignerProps };
