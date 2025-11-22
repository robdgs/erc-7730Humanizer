"use client";

import React from "react";

interface VestingSchedule {
  startTime: string;
  endTime: string;
  totalAmount: string;
  claimedAmount: string;
  cliffPeriod?: string;
  vestingInterval: string;
}

interface ClaimableToken {
  token: string;
  symbol: string;
  amount: string;
  decimals: number;
  claimableAt: string;
  isVested: boolean;
  vestingSchedule?: VestingSchedule;
}

interface VestingTimelineProps {
  claimableTokens: ClaimableToken[];
  onClaim?: (token: ClaimableToken) => void;
}

export default function VestingTimeline({
  claimableTokens,
  onClaim,
}: VestingTimelineProps) {
  const formatAmount = (amount: string, decimals: number): string => {
    const value = Number(BigInt(amount) / BigInt(10 ** decimals));
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(
      value
    );
  };

  const getVestingProgress = (schedule: VestingSchedule): number => {
    const claimed = Number(BigInt(schedule.claimedAmount));
    const total = Number(BigInt(schedule.totalAmount));
    return (claimed / total) * 100;
  };

  const isClaimable = (claimableAt: string): boolean => {
    return new Date(claimableAt).getTime() <= Date.now();
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {claimableTokens.map((token, idx) => {
        const canClaim = isClaimable(token.claimableAt);
        const progress = token.vestingSchedule
          ? getVestingProgress(token.vestingSchedule)
          : 100;

        return (
          <div
            key={idx}
            className="terminal-box"
            style={{
              padding: "1.25rem",
              border: canClaim ? "2px solid #00ff41" : "1px solid #004d1a",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "start",
                marginBottom: "1rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <div
                  className="terminal-text"
                  style={{
                    width: "40px",
                    height: "40px",
                    border: "2px solid #00ff41",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                  }}
                >
                  {token.symbol.substring(0, 2)}
                </div>
                <div>
                  <div
                    className="terminal-text"
                    style={{ fontWeight: 600, fontSize: "1.1rem" }}
                  >
                    {token.symbol}
                  </div>
                  <div className="terminal-dim" style={{ fontSize: "0.8rem" }}>
                    {token.isVested ? "VESTING" : "CLAIMABLE"}
                  </div>
                </div>
              </div>

              {canClaim && onClaim && (
                <button
                  onClick={() => onClaim(token)}
                  className="terminal-button"
                  style={{
                    padding: "0.5rem 1rem",
                    fontSize: "0.8rem",
                    borderColor: "#00ff41",
                    color: "#00ff41",
                  }}
                >
                  [CLAIM {formatAmount(token.amount, token.decimals)}]
                </button>
              )}

              {!canClaim && (
                <div className="terminal-dim" style={{ fontSize: "0.8rem" }}>
                  &gt; {formatDate(token.claimableAt)}
                </div>
              )}
            </div>

            {token.vestingSchedule && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.75rem",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <span className="terminal-cyan">
                      PROGRESS: {progress.toFixed(1)}%
                    </span>
                    <span className="terminal-text">
                      {formatAmount(
                        token.vestingSchedule.claimedAmount,
                        token.decimals
                      )}{" "}
                      /{" "}
                      {formatAmount(
                        token.vestingSchedule.totalAmount,
                        token.decimals
                      )}
                    </span>
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: "6px",
                      background: "#0a0a0a",
                      border: "1px solid #004d1a",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        height: "100%",
                        width: `${progress}%`,
                        background: "#00ff41",
                        transition: "width 0.3s",
                      }}
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "1rem",
                    fontSize: "0.85rem",
                  }}
                >
                  <div
                    className="terminal-box"
                    style={{ padding: "0.75rem", border: "1px solid #004d1a" }}
                  >
                    <div
                      className="terminal-dim"
                      style={{ marginBottom: "0.25rem", fontSize: "0.75rem" }}
                    >
                      START_DATE
                    </div>
                    <div className="terminal-text" style={{ fontWeight: 600 }}>
                      {formatDate(token.vestingSchedule.startTime)}
                    </div>
                  </div>
                  <div
                    className="terminal-box"
                    style={{ padding: "0.75rem", border: "1px solid #004d1a" }}
                  >
                    <div
                      className="terminal-dim"
                      style={{ marginBottom: "0.25rem", fontSize: "0.75rem" }}
                    >
                      END_DATE
                    </div>
                    <div className="terminal-text" style={{ fontWeight: 600 }}>
                      {formatDate(token.vestingSchedule.endTime)}
                    </div>
                  </div>
                  {token.vestingSchedule.cliffPeriod && (
                    <div
                      className="terminal-box"
                      style={{
                        padding: "0.75rem",
                        border: "1px solid #004d1a",
                      }}
                    >
                      <div
                        className="terminal-dim"
                        style={{ marginBottom: "0.25rem", fontSize: "0.75rem" }}
                      >
                        CLIFF_PERIOD
                      </div>
                      <div
                        className="terminal-text"
                        style={{ fontWeight: 600 }}
                      >
                        {token.vestingSchedule.cliffPeriod}
                      </div>
                    </div>
                  )}
                  <div
                    className="terminal-box"
                    style={{ padding: "0.75rem", border: "1px solid #004d1a" }}
                  >
                    <div
                      className="terminal-dim"
                      style={{ marginBottom: "0.25rem", fontSize: "0.75rem" }}
                    >
                      INTERVAL
                    </div>
                    <div
                      className="terminal-text"
                      style={{ fontWeight: 600, textTransform: "uppercase" }}
                    >
                      {token.vestingSchedule.vestingInterval}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!token.isVested && canClaim && (
              <div
                className="terminal-text"
                style={{
                  marginTop: "0.75rem",
                  padding: "0.75rem",
                  border: "1px solid #00ff41",
                  fontSize: "0.85rem",
                }}
              >
                &gt;&gt;{" "}
                <strong>
                  {formatAmount(token.amount, token.decimals)} {token.symbol}
                </strong>{" "}
                AVAILABLE TO CLAIM NOW
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
