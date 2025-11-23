"use client";

import React, { useState } from "react";
import { ethers } from "ethers";
import type { FormattedTransaction } from "@/core/erc7730";
import { TransactionPreview } from "@/components/signing/TransactionPreview";
import LedgerSimulator from "../LedgerSimulator";
import LedgerSigner from "../LedgerSigner";

interface SigningModalProps {
  transaction: FormattedTransaction;
  provider?: ethers.Provider | null;
  onClose: () => void;
  onSigned?: (signature: string) => void;
  useLedgerDevice?: boolean;
}

type SigningStep = "preview" | "connect" | "ledger" | "signed";

export function SigningModal({
  transaction,
  provider,
  onClose,
  onSigned,
  useLedgerDevice = false,
}: SigningModalProps) {
  const [step, setStep] = useState<SigningStep>("preview");
  const [signature, setSignature] = useState<string>("");
  const [ledgerConnected, setLedgerConnected] = useState(false);
  const [ledgerAddress, setLedgerAddress] = useState("");

  const handleSign = () => {
    if (useLedgerDevice && !ledgerConnected) {
      setStep("connect");
    } else {
      setStep("ledger");
    }
  };

  const handleApprove = () => {
    // Generate mock signature
    const mockSig = `0x${Array.from({ length: 130 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("")}`;

    setSignature(mockSig);
    setStep("signed");

    if (onSigned) {
      onSigned(mockSig);
    }
  };

  const handleReject = () => {
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.95)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: "1rem",
      }}
      onClick={handleClose}
    >
      <div
        className="terminal-box"
        style={{
          padding: "2rem",
          maxWidth: "700px",
          width: "100%",
          border: "2px solid #00ff41",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="terminal-button"
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            padding: "0.5rem 1rem",
            fontSize: "0.8rem",
            borderColor: "#ff00ff",
            color: "#ff00ff",
          }}
        >
          [X]
        </button>

        {step === "preview" && (
          <div>
            <h2
              className="terminal-text terminal-glow"
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                marginBottom: "1.5rem",
                textAlign: "center",
              }}
            >
              &gt;&gt; TRANSACTION REVIEW
            </h2>

            <TransactionPreview transaction={transaction} />

            <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
              <button
                onClick={handleSign}
                className="terminal-button"
                style={{
                  flex: 1,
                  padding: "1rem",
                  fontSize: "1rem",
                  borderColor: "#00ff41",
                  color: "#00ff41",
                }}
              >
                {useLedgerDevice && !ledgerConnected
                  ? "[CONNECT_LEDGER]"
                  : "[PROCEED_TO_SIGN]"}
              </button>
              <button
                onClick={handleClose}
                className="terminal-button"
                style={{
                  flex: 1,
                  padding: "1rem",
                  fontSize: "1rem",
                  borderColor: "#ff00ff",
                  color: "#ff00ff",
                }}
              >
                [CANCEL]
              </button>
            </div>
          </div>
        )}

        {step === "connect" && (
          <div>
            <h2
              className="terminal-text terminal-glow"
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                marginBottom: "1.5rem",
                textAlign: "center",
              }}
            >
              &gt;&gt; CONNECT LEDGER
            </h2>

            <div
              className="terminal-dim"
              style={{
                fontSize: "0.85rem",
                marginBottom: "1.5rem",
                padding: "1rem",
                border: "1px solid #004d1a",
              }}
            >
              <p style={{ marginBottom: "0.5rem" }}>
                &gt;&gt; CONNECT YOUR LEDGER DEVICE:
              </p>
              <p>1. Plug in your Ledger via USB</p>
              <p>2. Unlock the device</p>
              <p>3. Open the Ethereum app</p>
              <p>4. Click "Connect Ledger Device" below</p>
            </div>

            <LedgerSigner
              onConnected={(address) => {
                setLedgerConnected(true);
                setLedgerAddress(address);
                setStep("ledger");
              }}
              onDisconnected={() => {
                setLedgerConnected(false);
                setLedgerAddress("");
              }}
              onError={(err) => {
                console.error("Ledger error:", err);
              }}
            />

            <button
              onClick={() => setStep("preview")}
              className="terminal-button"
              style={{
                width: "100%",
                marginTop: "1rem",
                padding: "0.75rem",
                fontSize: "0.9rem",
                borderColor: "#ff00ff",
                color: "#ff00ff",
              }}
            >
              [BACK]
            </button>
          </div>
        )}

        {step === "ledger" && (
          <div>
            <h2
              className="terminal-text terminal-glow"
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                marginBottom: "1.5rem",
                textAlign: "center",
              }}
            >
              &gt;&gt; LEDGER DEVICE
            </h2>

            <LedgerSimulator
              intent={transaction.intent}
              functionName={transaction.functionName}
              fields={transaction.fields}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          </div>
        )}

        {step === "signed" && (
          <div>
            <h2
              className="terminal-text terminal-glow"
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                marginBottom: "1.5rem",
                textAlign: "center",
              }}
            >
              &gt;&gt; TRANSACTION SIGNED
            </h2>

            <div
              className="terminal-box"
              style={{
                padding: "1.5rem",
                border: "2px solid #00ff41",
                marginBottom: "1.5rem",
              }}
            >
              <div
                className="terminal-dim"
                style={{ fontSize: "0.75rem", marginBottom: "0.5rem" }}
              >
                &gt; SIGNATURE
              </div>
              <div
                className="terminal-text"
                style={{
                  fontSize: "0.75rem",
                  wordBreak: "break-all",
                  fontFamily: "monospace",
                }}
              >
                {signature}
              </div>
            </div>

            <div
              className="terminal-cyan terminal-glow"
              style={{
                textAlign: "center",
                fontSize: "1.2rem",
                marginBottom: "1.5rem",
              }}
            >
              ✓ READY TO BROADCAST
            </div>

            <button
              onClick={handleClose}
              className="terminal-button"
              style={{
                width: "100%",
                padding: "1rem",
                fontSize: "1rem",
                borderColor: "#00ff41",
                color: "#00ff41",
              }}
            >
              [CLOSE]
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
