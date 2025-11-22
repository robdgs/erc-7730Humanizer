"use client";

import React from "react";

interface Token {
  token: string;
  symbol: string;
  balance: string;
  decimals: number;
  valueUSD?: number;
}

interface TokenTableProps {
  tokens: Token[];
  onAction?: (token: Token, action: "stake" | "swap") => void;
}

export default function TokenTable({ tokens, onAction }: TokenTableProps) {
  const formatBalance = (balance: string, decimals: number): string => {
    // Check if balance is already formatted (contains decimal point)
    if (balance.includes(".")) {
      // Already formatted, just parse and format nicely
      const num = parseFloat(balance);
      return num.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 6,
      });
    }

    // Raw BigInt format - convert properly
    try {
      const value = BigInt(balance) / BigInt(10 ** decimals);
      return value.toString();
    } catch {
      // Fallback if conversion fails
      return balance;
    }
  };

  const formatUSD = (value?: number): string => {
    if (!value) return "-";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  return (
    <div className="terminal-box" style={{ padding: "1rem" }}>
      <div
        style={{
          borderBottom: "1px solid #00ff41",
          marginBottom: "1rem",
          paddingBottom: "0.5rem",
        }}
      ></div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #004d1a" }}>
            <th
              className="terminal-text"
              style={{
                textAlign: "left",
                padding: "0.75rem 1rem",
                fontSize: "0.75rem",
                fontWeight: 600,
                letterSpacing: "0.1em",
              }}
            >
              TOKEN
            </th>
            <th
              className="terminal-text"
              style={{
                textAlign: "right",
                padding: "0.75rem 1rem",
                fontSize: "0.75rem",
                fontWeight: 600,
                letterSpacing: "0.1em",
              }}
            >
              BALANCE
            </th>
            <th
              className="terminal-text"
              style={{
                textAlign: "right",
                padding: "0.75rem 1rem",
                fontSize: "0.75rem",
                fontWeight: 600,
                letterSpacing: "0.1em",
              }}
            >
              VALUE
            </th>
            <th
              className="terminal-text"
              style={{
                textAlign: "right",
                padding: "0.75rem 1rem",
                fontSize: "0.75rem",
                fontWeight: 600,
                letterSpacing: "0.1em",
              }}
            >
              ACTION
            </th>
          </tr>
        </thead>
        <tbody>
          {tokens.map((token, idx) => (
            <tr
              key={idx}
              style={{ borderBottom: "1px solid #004d1a" }}
              className="hover:bg-opacity-10"
            >
              <td style={{ padding: "1rem" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  <div
                    className="terminal-text terminal-glow"
                    style={{
                      width: "32px",
                      height: "32px",
                      border: "2px solid #00ff41",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.75rem",
                      fontWeight: "bold",
                    }}
                  >
                    {token.symbol.substring(0, 2)}
                  </div>
                  <div>
                    <div
                      className="terminal-text"
                      style={{ fontWeight: 600, fontSize: "0.9rem" }}
                    >
                      {token.symbol}
                    </div>
                    <div
                      className="terminal-dim"
                      style={{ fontSize: "0.7rem" }}
                    >
                      {token.token.substring(0, 6)}...
                      {token.token.substring(38)}
                    </div>
                  </div>
                </div>
              </td>
              <td
                className="terminal-text"
                style={{
                  padding: "1rem",
                  textAlign: "right",
                  fontSize: "0.9rem",
                }}
              >
                {formatBalance(token.balance, token.decimals)}
              </td>
              <td
                className="terminal-cyan"
                style={{
                  padding: "1rem",
                  textAlign: "right",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                }}
              >
                {formatUSD(token.valueUSD)}
              </td>
              <td style={{ padding: "1rem", textAlign: "right" }}>
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    onClick={() => onAction?.(token, "stake")}
                    className="terminal-button"
                    style={{ padding: "0.25rem 0.75rem", fontSize: "0.7rem" }}
                  >
                    [STAKE]
                  </button>
                  <button
                    onClick={() => onAction?.(token, "swap")}
                    className="terminal-button"
                    style={{
                      padding: "0.25rem 0.75rem",
                      fontSize: "0.7rem",
                      borderColor: "#00ffff",
                      color: "#00ffff",
                    }}
                  >
                    [SWAP]
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div
        style={{
          borderTop: "1px solid #00ff41",
          marginTop: "1rem",
          paddingTop: "0.5rem",
        }}
      ></div>
    </div>
  );
}
