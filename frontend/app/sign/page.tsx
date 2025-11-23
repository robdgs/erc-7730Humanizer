"use client";

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import LedgerSimulator from "@/components/LedgerSimulator";
import LedgerSigner from "@/components/LedgerSigner";
import {
  ERC7730Formatter,
  type ERC7730Descriptor,
  type FormattedTransaction,
} from "@/lib/erc7730-formatter";

// Smart formatter for fallback when descriptor doesn't match
const formatArgumentsSmart = (args: any[], fragment: any) => {
  const fields: any[] = [];

  const formatValue = (value: any, type: string = ""): string => {
    if (value === null || value === undefined) return "N/A";

    // Detect address
    if (typeof value === "string" && value.match(/^0x[a-fA-F0-9]{40}$/)) {
      const knownTokens: any = {
        "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48": "USDC Token",
        "0x6B175474E89094C44Da98b954EedeAC495271d0F": "DAI Token",
        "0xdAC17F958D2ee523a2206206994597C13D831ec7": "USDT Token",
      };
      return knownTokens[value] || `${value.slice(0, 6)}...${value.slice(-4)}`;
    }

    // Detect number/amount
    if (
      typeof value === "bigint" ||
      (typeof value === "object" && value._isBigNumber)
    ) {
      try {
        const bn = BigInt(value.toString());
        const strVal = bn.toString();

        // Auto-detect decimals
        let decimals = strVal.length <= 12 ? 6 : 18;
        const formatted = ethers.formatUnits(bn, decimals);
        const num = parseFloat(formatted);

        if (num === 0) return "0";
        if (num < 1) return num.toFixed(6);
        return num.toLocaleString("en-US", { maximumFractionDigits: 2 });
      } catch {
        return value.toString();
      }
    }

    // Detect timestamp (reasonable unix timestamp range)
    if (typeof value === "number" || typeof value === "bigint") {
      const num = Number(value);
      if (num > 1600000000 && num < 2000000000) {
        const date = new Date(num * 1000);
        const now = new Date();
        const diffMinutes = Math.floor(
          (date.getTime() - now.getTime()) / 60000
        );

        if (diffMinutes > 0 && diffMinutes < 10080) {
          if (diffMinutes < 60) return `in ${diffMinutes} minutes`;
          if (diffMinutes < 1440)
            return `in ${Math.floor(diffMinutes / 60)} hours`;
          return `in ${Math.floor(diffMinutes / 1440)} days`;
        }

        return date.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }
    }

    return String(value);
  };

  // Handle tuple/struct parameters
  if (
    args.length === 1 &&
    typeof args[0] === "object" &&
    !Array.isArray(args[0])
  ) {
    const structObj = args[0];
    const keys = Object.keys(structObj).filter((k) => isNaN(Number(k)));

    for (const key of keys) {
      const value = structObj[key];
      const label =
        key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1");

      fields.push({
        label,
        value: formatValue(value),
        rawValue: value,
      });
    }
  } else {
    // Handle regular parameters
    const inputs = fragment?.inputs || [];

    args.forEach((arg: any, index: number) => {
      const input = inputs[index];
      const label = input?.name || `Param ${index}`;

      fields.push({
        label: label.charAt(0).toUpperCase() + label.slice(1),
        value: formatValue(arg, input?.type),
        rawValue: arg,
      });
    });
  }

  return fields;
};

export default function SignPage() {
  const [calldata, setCalldata] = useState("");
  const [decodedTx, setDecodedTx] = useState<FormattedTransaction | null>(null);
  const [error, setError] = useState("");
  const [showLedger, setShowLedger] = useState(false);
  const [signature, setSignature] = useState("");
  const [descriptor, setDescriptor] = useState<ERC7730Descriptor | null>(null);
  const [abi, setAbi] = useState<any[]>([]);
  const [useLedgerDevice, setUseLedgerDevice] = useState(false);
  const [ledgerConnected, setLedgerConnected] = useState(false);

  useEffect(() => {
    const loadDescriptor = async () => {
      try {
        const response = await fetch("/descriptors/DemoRouter.json");
        const data = await response.json();
        setDescriptor(data);
        setAbi(data.context?.contract?.abi || []);
      } catch (err) {
        console.error("Failed to load descriptor:", err);
      }
    };
    loadDescriptor();
  }, []);

  const decodeCalldata = () => {
    setError("");
    setDecodedTx(null);
    setSignature("");

    if (!calldata.trim()) {
      setError("Please enter calldata");
      return;
    }

    if (!abi.length) {
      setError("ABI not loaded");
      return;
    }

    try {
      // Ensure calldata starts with 0x
      const normalizedCalldata = calldata.startsWith("0x")
        ? calldata
        : `0x${calldata}`;

      // Check if calldata has minimum length (function selector = 4 bytes = 8 hex chars)
      if (normalizedCalldata.length < 10) {
        setError("Calldata too short - missing function selector");
        return;
      }

      const iface = new ethers.Interface(abi);
      const decoded = iface.parseTransaction({ data: normalizedCalldata });

      if (!decoded) {
        setError("Failed to decode calldata");
        return;
      }

      const functionName = decoded.name;
      const args = decoded.args;

      if (descriptor) {
        const formatter = new ERC7730Formatter(descriptor);
        const formatted = formatter.formatTransaction(functionName, args);

        if (formatted) {
          setDecodedTx(formatted);
        } else {
          // Fallback: smart formatting based on value type
          const smartFields = formatArgumentsSmart(args, decoded.fragment);
          setDecodedTx({
            intent: `Execute ${functionName}`,
            functionName,
            fields: smartFields,
          });
        }
      }
    } catch (err: any) {
      console.error("Decode error:", err);
      setError(
        `Failed to decode: ${
          err.shortMessage || err.message || "Unknown error"
        }`
      );
    }
  };

  const handleSign = () => {
    if (!decodedTx) {
      setError("Please decode calldata first");
      return;
    }
    setShowLedger(true);
  };

  const handleApprove = () => {
    const mockSignature = `0x${Array.from({ length: 130 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("")}`;

    setSignature(mockSignature);
    setShowLedger(false);
  };

  const handleReject = () => {
    setError("Transaction rejected by user");
    setShowLedger(false);
  };

  const generateExampleCalldata = () => {
    if (!abi.length) return [];

    try {
      const iface = new ethers.Interface(abi);

      const swapParams = {
        tokenIn: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
        tokenOut: "0x6B175474E89094C44Da98b954EedeAC495271d0F", // DAI
        amountIn: ethers.parseUnits("1000", 6), // 1000 USDC
        minAmountOut: ethers.parseUnits("990", 18), // 990 DAI
        recipient: "0x742d35Cc6634C0532925a3b844Bc9e7595f0000",
        deadline: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
      };

      const liquidityParams = {
        tokenA: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
        tokenB: "0x6B175474E89094C44Da98b954EedeAC495271d0F", // DAI
        amountA: ethers.parseUnits("1000", 6), // 1000 USDC
        amountB: ethers.parseUnits("1000", 18), // 1000 DAI
        recipient: "0x742d35Cc6634C0532925a3b844Bc9e7595f0000",
        deadline: Math.floor(Date.now() / 1000) + 3600,
      };

      return [
        {
          name: "Swap Tokens",
          data: iface.encodeFunctionData("swapExactTokensForTokens", [
            swapParams,
          ]),
        },
        {
          name: "Add Liquidity",
          data: iface.encodeFunctionData("addLiquidity", [liquidityParams]),
        },
        {
          name: "Simple Transfer",
          data: iface.encodeFunctionData("simpleTransfer", [
            "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
            "0x742d35Cc6634C0532925a3b844Bc9e7595f0000",
            ethers.parseUnits("100", 6), // 100 USDC
          ]),
        },
      ];
    } catch (err) {
      console.error("Failed to generate examples:", err);
      return [];
    }
  };

  const exampleCalldata = generateExampleCalldata();

  return (
    <main className="min-h-screen" style={{ background: "#000000" }}>
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1
            className="terminal-text terminal-glow"
            style={{
              fontSize: "2.5rem",
              fontWeight: "bold",
              marginBottom: "1rem",
              letterSpacing: "0.15em",
            }}
          >
            &gt;&gt; HARDWARE SECURE SIGNING
          </h1>
          <p
            className="terminal-cyan"
            style={{ fontSize: "1.1rem", letterSpacing: "0.05em" }}
          >
            LEDGER INTEGRATION :: ERC-7730 PROTOCOL :: AIR-GAPPED SIGNING
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "2rem",
          }}
        >
          {/* Left Column - Input */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
          >
            <div
              className="terminal-box"
              style={{ padding: "2rem", border: "2px solid #00ff41" }}
            >
              <div
                className="terminal-dim"
                style={{
                  fontSize: "0.8rem",
                  marginBottom: "1rem",
                  letterSpacing: "0.1em",
                }}
              >
                ┌─ TRANSACTION CALLDATA ────────────────────────────┐
              </div>

              <h2
                className="terminal-text"
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "bold",
                  marginBottom: "1rem",
                }}
              >
                &gt; INPUT_DATA
              </h2>

              <div style={{ marginBottom: "1rem" }}>
                <label
                  className="terminal-dim"
                  style={{
                    display: "block",
                    fontSize: "0.75rem",
                    marginBottom: "0.5rem",
                    letterSpacing: "0.1em",
                  }}
                >
                  &gt; PASTE_CALLDATA_HEX
                </label>
                <textarea
                  value={calldata}
                  onChange={(e) => setCalldata(e.target.value)}
                  placeholder="0x1760feec..."
                  className="terminal-input"
                  style={{
                    width: "100%",
                    height: "120px",
                    fontSize: "0.8rem",
                    resize: "none",
                  }}
                />
              </div>

              <button
                onClick={decodeCalldata}
                className="terminal-button"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  fontSize: "0.9rem",
                }}
              >
                [DECODE_TRANSACTION]
              </button>

              <div style={{ marginTop: "1.5rem" }}>
                <p
                  className="terminal-dim"
                  style={{
                    fontSize: "0.75rem",
                    marginBottom: "0.75rem",
                    letterSpacing: "0.1em",
                  }}
                >
                  &gt; QUICK_EXAMPLES:
                </p>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  {exampleCalldata.length > 0 ? (
                    exampleCalldata.map((example, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setCalldata(example.data);
                          setError("");
                          setDecodedTx(null);
                        }}
                        className="terminal-button"
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "0.5rem 1rem",
                          fontSize: "0.75rem",
                          borderColor: "#004d1a",
                        }}
                      >
                        &gt; {example.name}
                      </button>
                    ))
                  ) : (
                    <div
                      className="terminal-dim ascii-spinner"
                      style={{ fontSize: "0.75rem" }}
                    >
                      LOADING EXAMPLES
                    </div>
                  )}
                </div>
              </div>

              <div
                className="terminal-dim"
                style={{
                  fontSize: "0.8rem",
                  marginTop: "1.5rem",
                  letterSpacing: "0.1em",
                }}
              >
                └───────────────────────────────────────────────────┘
              </div>
            </div>

            {/* Ledger Connection */}
            <div
              className="terminal-box"
              style={{ padding: "2rem", border: "1px solid #ff00ff" }}
            >
              <h2
                className="terminal-cyan"
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "bold",
                  marginBottom: "1rem",
                }}
              >
                &gt; LEDGER_CONNECTION
              </h2>

              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={useLedgerDevice}
                    onChange={(e) => setUseLedgerDevice(e.target.checked)}
                    style={{ width: "16px", height: "16px" }}
                  />
                  <span
                    className="terminal-cyan"
                    style={{ fontSize: "0.8rem" }}
                  >
                    USE_REAL_DEVICE (WebUSB)
                  </span>
                </label>
              </div>

              {useLedgerDevice && (
                <LedgerSigner
                  onConnected={(address) => {
                    setLedgerConnected(true);
                    console.log("Ledger connected:", address);
                  }}
                  onDisconnected={() => setLedgerConnected(false)}
                  onError={(err) => setError(err)}
                />
              )}

              {!useLedgerDevice && (
                <div
                  className="terminal-dim"
                  style={{
                    fontSize: "0.75rem",
                    padding: "1rem",
                    border: "1px solid #004d1a",
                  }}
                >
                  &gt;&gt; SIMULATION MODE ACTIVE
                  <br />
                  &gt;&gt; ENABLE CHECKBOX FOR REAL DEVICE
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Display */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
          >
            {error && (
              <div
                className="terminal-box"
                style={{ padding: "1.5rem", border: "2px solid #ff00ff" }}
              >
                <p className="terminal-red" style={{ fontWeight: 600 }}>
                  &gt;&gt; ERROR: {error}
                </p>
              </div>
            )}

            {decodedTx && (
              <div
                className="terminal-box"
                style={{ padding: "2rem", border: "2px solid #ff00ff" }}
              >
                <div
                  className="terminal-dim"
                  style={{
                    fontSize: "0.8rem",
                    marginBottom: "1rem",
                    letterSpacing: "0.1em",
                  }}
                >
                  ┌─ DECODED OUTPUT ──────────────────────────────────┐
                </div>

                <h2
                  className="terminal-cyan"
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: "bold",
                    marginBottom: "1.5rem",
                  }}
                >
                  &gt; HUMAN_READABLE_PREVIEW
                </h2>

                <div
                  className="terminal-box"
                  style={{
                    marginBottom: "1.5rem",
                    padding: "1.5rem",
                    border: "2px solid #00ff41",
                  }}
                >
                  <div
                    className="terminal-dim"
                    style={{
                      fontSize: "0.7rem",
                      marginBottom: "0.5rem",
                      letterSpacing: "0.1em",
                    }}
                  >
                    &gt;&gt; TRANSACTION_INTENT
                  </div>
                  <div
                    className="terminal-text terminal-glow"
                    style={{
                      fontSize: "2rem",
                      fontWeight: "bold",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {decodedTx.intent}
                  </div>
                  <div
                    className="terminal-dim"
                    style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}
                  >
                    [{decodedTx.functionName}()]
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                >
                  {decodedTx.fields.map((field, index) => {
                    const isAmount = field.label
                      .toLowerCase()
                      .includes("amount");
                    const isAddress =
                      field.label.toLowerCase().includes("token") ||
                      field.label.toLowerCase().includes("recipient");
                    const isTime = field.label
                      .toLowerCase()
                      .includes("deadline");

                    return (
                      <div
                        key={index}
                        className="terminal-box"
                        style={{ padding: "1rem", border: "1px solid #004d1a" }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "start",
                            gap: "0.5rem",
                            marginBottom: "0.5rem",
                          }}
                        >
                          {isAmount && (
                            <span className="terminal-amber">$</span>
                          )}
                          {isAddress && (
                            <span className="terminal-cyan">@</span>
                          )}
                          {isTime && <span className="terminal-amber">⏱</span>}
                          <div
                            className="terminal-dim"
                            style={{
                              fontSize: "0.7rem",
                              letterSpacing: "0.1em",
                              fontWeight: "bold",
                            }}
                          >
                            {field.label.toUpperCase()}
                          </div>
                        </div>
                        <div
                          className="terminal-text"
                          style={{
                            fontSize: "1rem",
                            fontWeight: 600,
                            wordBreak: "break-all",
                            marginLeft: "1.5rem",
                          }}
                        >
                          {field.value}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={handleSign}
                  className="terminal-button"
                  style={{
                    width: "100%",
                    marginTop: "1.5rem",
                    padding: "1rem",
                    fontSize: "1rem",
                    fontWeight: "bold",
                    borderColor: "#00ff41",
                    color: "#00ff41",
                  }}
                >
                  [SIGN_WITH_LEDGER]
                </button>

                <div
                  className="terminal-dim"
                  style={{
                    fontSize: "0.8rem",
                    marginTop: "1.5rem",
                    letterSpacing: "0.1em",
                  }}
                >
                  └───────────────────────────────────────────────────┘
                </div>
              </div>
            )}

            {showLedger && decodedTx && (
              <div
                className="terminal-box"
                style={{ padding: "2rem", border: "2px solid #00ff41" }}
              >
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
                  intent={decodedTx.intent}
                  functionName={decodedTx.functionName}
                  fields={decodedTx.fields}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              </div>
            )}

            {signature && (
              <div
                className="terminal-box"
                style={{ padding: "2rem", border: "2px solid #00ff41" }}
              >
                <h2
                  className="terminal-text terminal-glow"
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: "bold",
                    marginBottom: "1rem",
                  }}
                >
                  &gt; SIGNED_TRANSACTION
                </h2>
                <div style={{ padding: "1rem", border: "1px solid #00ff41" }}>
                  <div
                    className="terminal-dim"
                    style={{ fontSize: "0.7rem", marginBottom: "0.5rem" }}
                  >
                    &gt; SIGNATURE
                  </div>
                  <div
                    className="terminal-text"
                    style={{ fontSize: "0.75rem", wordBreak: "break-all" }}
                  >
                    {signature}
                  </div>
                </div>
                <div
                  className="terminal-cyan"
                  style={{ marginTop: "1rem", fontSize: "0.85rem" }}
                >
                  &gt;&gt; READY_TO_BROADCAST
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div
          className="terminal-box"
          style={{
            marginTop: "3rem",
            padding: "2rem",
            border: "1px solid #004d1a",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "2rem",
            }}
          >
            <div>
              <h4
                className="terminal-text"
                style={{
                  fontWeight: "bold",
                  fontSize: "1rem",
                  marginBottom: "0.5rem",
                }}
              >
                &gt; ERC-7730
              </h4>
              <p className="terminal-dim" style={{ fontSize: "0.8rem" }}>
                HUMAN-READABLE TX DESCRIPTIONS
              </p>
            </div>
            <div>
              <h4
                className="terminal-cyan"
                style={{
                  fontWeight: "bold",
                  fontSize: "1rem",
                  marginBottom: "0.5rem",
                }}
              >
                &gt; LEDGER INTEGRATION
              </h4>
              <p className="terminal-dim" style={{ fontSize: "0.8rem" }}>
                DIRECT HARDWARE WALLET SIGNING VIA WEBUSB
              </p>
            </div>
            <div>
              <h4
                className="terminal-amber"
                style={{
                  fontWeight: "bold",
                  fontSize: "1rem",
                  marginBottom: "0.5rem",
                }}
              >
                &gt; AIR-GAPPED SECURITY
              </h4>
              <p className="terminal-dim" style={{ fontSize: "0.8rem" }}>
                KEYS NEVER LEAVE THE DEVICE
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 1024px) {
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}
