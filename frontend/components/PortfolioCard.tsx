"use client";

import React from "react";

interface PortfolioCardProps {
  totalValueUSD: number;
  tokenCount: number;
  address: string;
  lastUpdated: string;
}

export default function PortfolioCard({
  totalValueUSD,
  tokenCount,
  address,
  lastUpdated,
}: PortfolioCardProps) {
  const formatUSD = (value: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className="terminal-box"
      style={{ padding: "1.5rem", border: "2px solid #00ff41" }}
    >
      <div style={{ marginBottom: "1.5rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div
              className="terminal-dim"
              style={{ fontSize: "0.75rem", marginBottom: "0.25rem" }}
            >
              &gt; TOTAL VALUE
            </div>
            <div
              className="terminal-text terminal-glow"
              style={{ fontSize: "2.5rem", fontWeight: "bold" }}
            >
              {formatUSD(totalValueUSD)}
            </div>
          </div>
          <div
            className="terminal-box"
            style={{ padding: "1rem", border: "1px solid #00ff41" }}
          >
            <div
              className="terminal-dim"
              style={{ fontSize: "0.7rem", marginBottom: "0.25rem" }}
            >
              ASSETS
            </div>
            <div
              className="terminal-cyan"
              style={{
                fontSize: "1.75rem",
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              {tokenCount}
            </div>
          </div>
        </div>
      </div>

      <div style={{ borderTop: "1px solid #004d1a", paddingTop: "1rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.8rem",
          }}
        >
          <div>
            <div className="terminal-dim" style={{ marginBottom: "0.25rem" }}>
              &gt; WALLET_ADDRESS
            </div>
            <div className="terminal-text">
              {address.substring(0, 6)}...{address.substring(38)}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="terminal-dim" style={{ marginBottom: "0.25rem" }}>
              &gt; LAST_SYNC
            </div>
            <div className="terminal-amber">{formatDate(lastUpdated)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
