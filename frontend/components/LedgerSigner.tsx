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
          className="terminal-button"
          style={{
            width: "100%",
            padding: "1rem 1.5rem",
            fontSize: "0.9rem",
            borderColor: "#ff00ff",
            color: "#ff00ff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.75rem",
            letterSpacing: "0.1em",
          }}
        >
          {isConnecting ? (
            <>
              <span
                className="ascii-spinner"
                style={{ margin: 0, fontSize: "1rem" }}
              ></span>
              <span>CONNECTING_TO_LEDGER</span>
            </>
          ) : (
            <>
              <span style={{ fontSize: "1.2rem" }}>🔐</span>
              <span>[CONNECT_LEDGER_DEVICE]</span>
            </>
          )}
        </button>
      ) : (
        <div
          className="terminal-box"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1rem",
            border: "2px solid #00ff41",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <div
              style={{
                width: "10px",
                height: "10px",
                background: "#00ff41",
                borderRadius: "50%",
                boxShadow: "0 0 10px #00ff41",
                animation: "blink 2s ease-in-out infinite",
              }}
            ></div>
            <span
              className="terminal-text"
              style={{ fontSize: "0.85rem", fontWeight: 600 }}
            >
              LEDGER_CONNECTED
            </span>
          </div>
          <div
            className="terminal-cyan"
            style={{
              fontFamily: "monospace",
              fontSize: "0.85rem",
              padding: "0.5rem 1rem",
              border: "1px solid #004d1a",
              background: "#000",
            }}
          >
            {address.slice(0, 6)}...{address.slice(-4)}
          </div>
          <button
            onClick={disconnectLedger}
            className="terminal-button"
            style={{
              padding: "0.5rem 1rem",
              fontSize: "0.75rem",
              borderColor: "#ff0040",
              color: "#ff0040",
            }}
          >
            [DISCONNECT]
          </button>
        </div>
      )}

      <style jsx>{`
        .ledger-signer {
          width: 100%;
        }

        @keyframes blink {
          0%,
          49% {
            opacity: 1;
          }
          50%,
          100% {
            opacity: 0.3;
          }
        }

        @media (max-width: 640px) {
          .terminal-box {
            flex-direction: column;
            align-items: stretch !important;
          }
        }
      `}</style>
    </div>
  );
}

export { LedgerSigner };
export type { LedgerSignerProps };
