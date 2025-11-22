"use client";

import { useState } from "react";
import TransactionPreview from "./TransactionPreview";
import { decodeCalldata, generateExampleCalldata } from "@/lib/decoder";
import type { DecodedTransaction } from "@/lib/decoder";

export default function CalldataDecoder() {
  const [calldata, setCalldata] = useState("");
  const [decodedTx, setDecodedTx] = useState<DecodedTransaction | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleDecode = async () => {
    console.log("🎯 Decode button clicked!");
    console.log("📝 Current calldata:", calldata);

    setError("");
    setDecodedTx(null);
    setIsLoading(true);

    try {
      if (!calldata.trim()) {
        throw new Error("Please enter calldata");
      }

      if (!calldata.startsWith("0x")) {
        throw new Error("Calldata must start with 0x");
      }

      console.log("📞 Calling decodeCalldata...");
      const decoded = await decodeCalldata(calldata);
      console.log("✅ Decode successful:", decoded);
      setDecodedTx(decoded);
    } catch (err: any) {
      console.error("❌ Decode error:", err);
      setError(err.message || "Failed to decode calldata");
    } finally {
      console.log("🏁 Decode finished");
      setIsLoading(false);
    }
  };

  const loadExample = async (exampleType: string) => {
    setError("");
    setDecodedTx(null);
    setIsLoading(true);

    try {
      const exampleCalldata = await generateExampleCalldata(exampleType);
      setCalldata(exampleCalldata);
      const decoded = await decodeCalldata(exampleCalldata);
      setDecodedTx(decoded);
    } catch (err: any) {
      setError(err.message || "Failed to load example");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="terminal-box"
      style={{ padding: "2rem", border: "2px solid #00ff41" }}
    >
      <h2
        className="terminal-text"
        style={{
          fontSize: "1.5rem",
          fontWeight: 600,
          marginBottom: "1.5rem",
          letterSpacing: "0.1em",
        }}
      >
        &gt; DECODE_TRANSACTION_CALLDATA
      </h2>

      <div style={{ marginBottom: "1.5rem" }}>
        <label
          className="terminal-dim"
          style={{
            display: "block",
            fontSize: "0.75rem",
            marginBottom: "0.5rem",
            letterSpacing: "0.1em",
          }}
        >
          &gt; TRANSACTION_CALLDATA_HEX
        </label>
        <textarea
          value={calldata}
          onChange={(e) => setCalldata(e.target.value)}
          placeholder="0x..."
          className="terminal-input"
          style={{
            width: "100%",
            height: "120px",
            fontSize: "0.85rem",
            resize: "vertical",
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem",
          marginBottom: "1.5rem",
        }}
      >
        <button
          onClick={handleDecode}
          disabled={isLoading}
          className="terminal-button"
          style={{
            padding: "0.75rem 1.5rem",
            fontSize: "0.9rem",
            opacity: isLoading ? 0.5 : 1,
            cursor: isLoading ? "not-allowed" : "pointer",
          }}
        >
          {isLoading ? "[DECODING...]" : "[DECODE_CALLDATA]"}
        </button>

        <div style={{ flex: 1 }} />

        <button
          onClick={() => loadExample("swap")}
          disabled={isLoading}
          className="terminal-button"
          style={{
            padding: "0.75rem 1rem",
            fontSize: "0.75rem",
            borderColor: "#004d1a",
            color: "#00ff41",
            opacity: isLoading ? 0.5 : 1,
            cursor: isLoading ? "not-allowed" : "pointer",
          }}
        >
          &gt; SWAP
        </button>

        <button
          onClick={() => loadExample("addLiquidity")}
          disabled={isLoading}
          className="terminal-button"
          style={{
            padding: "0.75rem 1rem",
            fontSize: "0.75rem",
            borderColor: "#004d1a",
            color: "#00ff41",
            opacity: isLoading ? 0.5 : 1,
            cursor: isLoading ? "not-allowed" : "pointer",
          }}
        >
          &gt; ADD_LIQUIDITY
        </button>

        <button
          onClick={() => loadExample("transfer")}
          disabled={isLoading}
          className="terminal-button"
          style={{
            padding: "0.75rem 1rem",
            fontSize: "0.75rem",
            borderColor: "#004d1a",
            color: "#00ff41",
            opacity: isLoading ? 0.5 : 1,
            cursor: isLoading ? "not-allowed" : "pointer",
          }}
        >
          &gt; TRANSFER
        </button>
      </div>

      {error && (
        <div
          className="terminal-red"
          style={{
            marginBottom: "1.5rem",
            padding: "1rem",
            border: "1px solid #ff0040",
            fontSize: "0.85rem",
          }}
        >
          &gt;&gt; ERROR: {error}
        </div>
      )}

      {decodedTx && <TransactionPreview transaction={decodedTx} />}
    </div>
  );
}
