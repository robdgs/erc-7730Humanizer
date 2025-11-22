"use client";

import React, { useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { useDashboard } from "@/hooks/useDashboard";
import { ConnectButton } from "@/components/wallet/ConnectButton";
import { AddressDisplay } from "@/components/wallet/AddressDisplay";
import { SigningModal } from "@/components/signing/SigningModal";
import PortfolioCard from "@/components/PortfolioCard";
import TokenTable from "@/components/TokenTable";
import DAOVotes from "@/components/DAOVotes";
import VestingTimeline from "@/components/VestingTimeline";
import { ethers } from "ethers";
import {
  ERC7730Formatter,
  loadDescriptor,
  type FormattedTransaction,
} from "@/core/erc7730";

export default function DashboardPage() {
  const {
    address: walletAddress,
    provider,
    isConnected,
    isConnecting,
    connect,
    disconnect,
  } = useWallet();
  const [manualAddress, setManualAddress] = useState("");
  const [useManualAddress, setUseManualAddress] = useState(false);
  const [forceMock, setForceMock] = useState(false);

  // Use manual address if set, otherwise use wallet address
  const activeAddress = useManualAddress ? manualAddress : walletAddress;

  const { portfolio, governance, vesting, loading, error } = useDashboard(
    activeAddress,
    forceMock || useManualAddress ? null : provider,
    forceMock || useManualAddress
  );
  const [txToSign, setTxToSign] = useState<FormattedTransaction | null>(null);

  // Build transaction for signing
  const buildTransaction = async (
    type: "vote" | "claim" | "stake" | "swap",
    data: any
  ): Promise<FormattedTransaction> => {
    // Load descriptor for formatting
    const descriptor = await loadDescriptor();
    const formatter = new ERC7730Formatter(descriptor);

    // Mock transaction building - in production, encode real calldata
    const functionName =
      type === "vote" ? "castVote" : type === "claim" ? "claim" : type;
    const fields = Object.entries(data).map(([key, value]) => ({
      label: key.charAt(0).toUpperCase() + key.slice(1),
      value: String(value),
      rawValue: value,
    }));

    return {
      intent: `${type.charAt(0).toUpperCase() + type.slice(1)} Operation`,
      functionName,
      fields,
    };
  };

  const handleVote = async (proposalId: string, support: boolean) => {
    const proposal = governance?.proposals.find((p) => p.id === proposalId);
    if (!proposal) return;

    const tx = await buildTransaction("vote", {
      proposalId,
      support: support ? "FOR" : "AGAINST",
      proposal: proposal.title,
      dao: proposal.dao,
    });

    setTxToSign(tx);
  };

  const handleClaim = async (token: any) => {
    const tx = await buildTransaction("claim", {
      token: token.symbol,
      amount: ethers.formatUnits(token.amount, token.decimals),
      tokenAddress: token.token,
    });

    setTxToSign(tx);
  };

  const handleTokenAction = async (token: any, action: "stake" | "swap") => {
    const tx = await buildTransaction(action, {
      token: token.symbol,
      amount: token.balance,
      tokenAddress: token.token,
    });

    setTxToSign(tx);
  };

  return (
    <main className="min-h-screen" style={{ background: "#000000" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div
            className="terminal-dim"
            style={{ fontSize: "0.8rem", marginBottom: "0.5rem" }}
          >
            <a href="/" style={{ textDecoration: "none", color: "#00ff41" }}>
              &lt; RETURN_TO_MAINFRAME
            </a>
          </div>
          <h1
            className="terminal-text terminal-glow"
            style={{
              fontSize: "3rem",
              fontWeight: "bold",
              marginBottom: "1rem",
              letterSpacing: "0.1em",
            }}
          >
            &gt; ASSET DASHBOARD
          </h1>
          <p className="terminal-cyan" style={{ fontSize: "1.25rem" }}>
            PORTFOLIO | GOVERNANCE | VESTING
          </p>
        </div>

        {/* Connection Section */}
        {!isConnected && !useManualAddress ? (
          <div
            className="terminal-box"
            style={{
              padding: "3rem",
              textAlign: "center",
              border: "2px solid #00ffff",
              marginBottom: "2rem",
            }}
          >
            <div
              className="terminal-amber terminal-glow"
              style={{ fontSize: "4rem", marginBottom: "1rem" }}
            >
              [ ! ]
            </div>
            <h3
              className="terminal-text"
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                marginBottom: "0.5rem",
              }}
            >
              &gt; CONNECT WALLET
            </h3>
            <p
              className="terminal-dim"
              style={{ fontSize: "0.9rem", marginBottom: "2rem" }}
            >
              CONNECT METAMASK OR ENTER ADDRESS MANUALLY
            </p>
            <div
              style={{
                display: "flex",
                gap: "1rem",
                justifyContent: "center",
                marginBottom: "2rem",
              }}
            >
              <ConnectButton onConnect={connect} isConnecting={isConnecting} />
            </div>

            {/* Manual Address Entry */}
            <div
              style={{
                maxWidth: "600px",
                margin: "0 auto",
                marginTop: "2rem",
                paddingTop: "2rem",
                borderTop: "1px solid #004d1a",
              }}
            >
              <p
                className="terminal-dim"
                style={{ fontSize: "0.8rem", marginBottom: "1rem" }}
              >
                &gt;&gt; OR ENTER ADDRESS MANUALLY (MOCK DATA)
              </p>
              <div style={{ display: "flex", gap: "1rem" }}>
                <input
                  type="text"
                  placeholder="0x..."
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                  className="terminal-input"
                  style={{ flex: 1, fontSize: "0.9rem" }}
                />
                <button
                  onClick={() => {
                    if (
                      manualAddress &&
                      /^0x[a-fA-F0-9]{40}$/.test(manualAddress)
                    ) {
                      setUseManualAddress(true);
                      setForceMock(true);
                    }
                  }}
                  disabled={
                    !manualAddress || !/^0x[a-fA-F0-9]{40}$/.test(manualAddress)
                  }
                  className="terminal-button"
                  style={{
                    padding: "0.75rem 2rem",
                    fontSize: "0.9rem",
                    borderColor: "#ffb000",
                    color: "#ffb000",
                    opacity:
                      !manualAddress ||
                      !/^0x[a-fA-F0-9]{40}$/.test(manualAddress)
                        ? 0.5
                        : 1,
                  }}
                >
                  [LOAD]
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Connected Controls */}
            <div
              className="terminal-box"
              style={{
                padding: "1.5rem",
                marginBottom: "2rem",
                border: "2px solid #00ff41",
              }}
            >
              <AddressDisplay address={activeAddress!} />
              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  marginTop: "1rem",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                {isConnected && (
                  <>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        cursor: "pointer",
                      }}
                    >
                      <div
                        style={{
                          width: "16px",
                          height: "16px",
                          border: "2px solid #00ff41",
                          background: forceMock ? "#00ff41" : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                        }}
                      >
                        {forceMock && (
                          <span
                            style={{
                              color: "#000",
                              fontSize: "12px",
                              fontWeight: "bold",
                            }}
                          >
                            ✓
                          </span>
                        )}
                      </div>
                      <input
                        type="checkbox"
                        checked={forceMock}
                        onChange={(e) => setForceMock(e.target.checked)}
                        style={{
                          position: "absolute",
                          opacity: 0,
                          pointerEvents: "none",
                        }}
                      />
                      <span
                        className="terminal-amber"
                        style={{ fontSize: "0.8rem" }}
                      >
                        USE_MOCK_DATA
                      </span>
                    </label>
                    <button
                      onClick={disconnect}
                      className="terminal-button"
                      style={{
                        padding: "0.5rem 1rem",
                        fontSize: "0.75rem",
                        borderColor: "#ff0040",
                        color: "#ff0040",
                      }}
                    >
                      [DISCONNECT_WALLET]
                    </button>
                  </>
                )}
                {useManualAddress && (
                  <button
                    onClick={() => {
                      setUseManualAddress(false);
                      setManualAddress("");
                      setForceMock(false);
                    }}
                    className="terminal-button"
                    style={{
                      padding: "0.5rem 1rem",
                      fontSize: "0.75rem",
                      borderColor: "#ff0040",
                      color: "#ff0040",
                    }}
                  >
                    [CLEAR_ADDRESS]
                  </button>
                )}
                {(forceMock || useManualAddress) && (
                  <span
                    className="terminal-amber"
                    style={{ fontSize: "0.75rem" }}
                  >
                    [MOCK_MODE]
                  </span>
                )}
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div
                className="terminal-box"
                style={{
                  padding: "1.5rem",
                  border: "2px solid #ff0040",
                  marginBottom: "2rem",
                }}
              >
                <p className="terminal-red" style={{ fontWeight: 600 }}>
                  &gt;&gt; ERROR: {error}
                </p>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div
                className="terminal-box"
                style={{
                  padding: "2rem",
                  textAlign: "center",
                  border: "1px solid #00ff41",
                  marginBottom: "2rem",
                }}
              >
                <div
                  className="terminal-dim ascii-spinner"
                  style={{ fontSize: "0.9rem" }}
                >
                  LOADING DASHBOARD DATA...
                </div>
              </div>
            )}

            {/* Dashboard Content */}
            {portfolio && !loading && (
              <div className="space-y-8">
                {/* Access Banner */}
                <div
                  className="terminal-box"
                  style={{
                    padding: "1rem",
                    border: "2px solid #00ff41",
                    textAlign: "center",
                  }}
                >
                  <div
                    className="terminal-text terminal-glow"
                    style={{ fontSize: "1.5rem", letterSpacing: "0.2em" }}
                  >
                    &gt;&gt;&gt; ACCESS GRANTED &lt;&lt;&lt;
                  </div>
                </div>

                {/* Portfolio */}
                <div>
                  <h2
                    className="terminal-text"
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: "bold",
                      marginBottom: "1rem",
                      letterSpacing: "0.1em",
                    }}
                  >
                    &gt; PORTFOLIO_OVERVIEW
                  </h2>
                  <PortfolioCard
                    totalValueUSD={portfolio.totalValueUSD}
                    tokenCount={portfolio.tokens.length}
                    address={portfolio.address}
                    lastUpdated={portfolio.lastUpdated}
                  />
                </div>

                {/* Tokens */}
                <div>
                  <h2
                    className="terminal-text"
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: "bold",
                      marginBottom: "1rem",
                      letterSpacing: "0.1em",
                    }}
                  >
                    &gt; TOKEN_HOLDINGS
                  </h2>
                  <TokenTable
                    tokens={portfolio.tokens}
                    onAction={handleTokenAction}
                  />
                </div>

                {/* Governance */}
                {governance && (
                  <div>
                    <h2
                      className="terminal-text"
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: "bold",
                        marginBottom: "1rem",
                        letterSpacing: "0.1em",
                      }}
                    >
                      &gt; DAO_GOVERNANCE
                    </h2>
                    <DAOVotes
                      proposals={governance.proposals}
                      votingPower={governance.votingPower}
                      onVote={handleVote}
                    />
                  </div>
                )}

                {/* Vesting */}
                {vesting && vesting.claimableTokens.length > 0 && (
                  <div>
                    <h2
                      className="terminal-text"
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: "bold",
                        marginBottom: "1rem",
                        letterSpacing: "0.1em",
                      }}
                    >
                      &gt; VESTING_SCHEDULE
                    </h2>
                    <div
                      className="terminal-box"
                      style={{
                        marginBottom: "1rem",
                        padding: "1rem",
                        border: "1px solid #00ff41",
                      }}
                    >
                      <div
                        className="terminal-dim"
                        style={{ fontSize: "0.8rem", marginBottom: "0.25rem" }}
                      >
                        &gt; TOTAL CLAIMABLE
                      </div>
                      <div
                        className="terminal-cyan terminal-glow"
                        style={{ fontSize: "2rem", fontWeight: "bold" }}
                      >
                        $
                        {vesting.totalClaimableUSD.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </div>
                    </div>
                    <VestingTimeline
                      claimableTokens={vesting.claimableTokens}
                      onClaim={handleClaim}
                    />
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Signing Modal */}
      {txToSign && (
        <SigningModal
          transaction={txToSign}
          provider={provider}
          onClose={() => setTxToSign(null)}
          onSigned={(sig) => {
            console.log("Transaction signed:", sig);
            setTxToSign(null);
          }}
        />
      )}
    </main>
  );
}
