"use client";

import React from "react";
import type { FormattedTransaction } from "@/core/erc7730";

interface TransactionPreviewProps {
  transaction: FormattedTransaction;
}

export function TransactionPreview({ transaction }: TransactionPreviewProps) {
  return (
    <div>
      {/* Intent */}
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
            fontSize: "1.75rem",
            fontWeight: "bold",
            marginBottom: "0.5rem",
          }}
        >
          {transaction.intent}
        </div>
        <div
          className="terminal-dim"
          style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}
        >
          [{transaction.functionName}()]
        </div>
      </div>

      {/* Fields */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {transaction.fields.map((field, index) => {
          const isAmount = field.label.toLowerCase().includes("amount");
          const isAddress =
            field.label.toLowerCase().includes("token") ||
            field.label.toLowerCase().includes("recipient");
          const isTime = field.label.toLowerCase().includes("deadline");

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
                {isAmount && <span className="terminal-amber">$</span>}
                {isAddress && <span className="terminal-cyan">@</span>}
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
                  fontSize: "0.95rem",
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
    </div>
  );
}
