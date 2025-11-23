"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ethers } from "ethers";
import { getPortfolio } from "@/lib/multibaas/portfolio";
import { getDaoVotes } from "@/lib/multibaas/governance";
import { getClaimable } from "@/lib/multibaas/events";
import { getPortfolioWithPrices } from "@/lib/web3/tokenBalances";
import { getUserGovernanceData } from "@/lib/web3/governance";
import { getClaimableTokens } from "@/lib/web3/vesting";
import PortfolioCard from "@/components/PortfolioCard";
import TokenTable from "@/components/TokenTable";
import DAOVotes from "@/components/DAOVotes";
import VestingTimeline from "@/components/VestingTimeline";
import LedgerSimulator from "@/components/LedgerSimulator";

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface ActionFlow {
  type: "vote" | "claim" | "stake" | "swap";
  data: any;
}

export default function Dashboard() {
  const [address, setAddress] = useState("");
  const [connectedAddress, setConnectedAddress] = useState("");
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [useMockData, setUseMockData] = useState(false);
  const [loading, setLoading] = useState(false);
  const [portfolioData, setPortfolioData] = useState<any>(null);
  const [governanceData, setGovernanceData] = useState<any>(null);
  const [claimableData, setClaimableData] = useState<any>(null);
  const [error, setError] = useState("");
  const [actionFlow, setActionFlow] = useState<ActionFlow | null>(null);
  const [showLedger, setShowLedger] = useState(false);

  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      setError(
        "MetaMask is not installed. Please install MetaMask to connect your wallet."
      );
      return;
    }

    try {
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await web3Provider.send("eth_requestAccounts", []);
      const walletAddress = accounts[0];

      setAddress(walletAddress);
      setConnectedAddress(walletAddress);
      setProvider(web3Provider);

      // Auto-load dashboard after connection
      loadDashboard(walletAddress, web3Provider);

      // Listen for account changes
      window.ethereum.on("accountsChanged", (newAccounts: string[]) => {
        if (newAccounts.length > 0) {
          const newAddress = newAccounts[0];
          setAddress(newAddress);
          setConnectedAddress(newAddress);
          loadDashboard(newAddress, web3Provider);
        } else {
          setConnectedAddress("");
          setPortfolioData(null);
        }
      });
    } catch (err: any) {
      setError(err.message || "Failed to connect wallet");
    }
  };

  const loadMockDashboard = async () => {
    const targetAddress = address || connectedAddress;

    if (!targetAddress || !/^0x[a-fA-F0-9]{40}$/.test(targetAddress)) {
      setError("Please enter a valid Ethereum address");
      return;
    }

    setUseMockData(true);
    setLoading(true);
    setError("");

    try {
      const [portfolio, governance, claimable] = await Promise.all([
        getPortfolio(targetAddress),
        getDaoVotes(targetAddress),
        getClaimable(targetAddress),
      ]);

      setPortfolioData(portfolio);
      setGovernanceData(governance);
      setClaimableData(claimable);
    } catch (err: any) {
      setError(err.message || "Failed to load mock dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const loadDashboard = async (
    walletAddress?: string,
    web3Provider?: ethers.BrowserProvider
  ) => {
    const targetAddress = walletAddress || address;
    const activeProvider = web3Provider || provider;

    if (!targetAddress || !/^0x[a-fA-F0-9]{40}$/.test(targetAddress)) {
      setError("Please enter a valid Ethereum address");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let portfolio;
      let governance;
      let claimable;

      // Use real RPC calls if provider is available and mock mode is off
      if (activeProvider && !useMockData) {
        const [portfolioResult, governanceResult, claimableResult] =
          await Promise.all([
            getPortfolioWithPrices(targetAddress, activeProvider),
            getUserGovernanceData(targetAddress, activeProvider),
            getClaimableTokens(targetAddress, activeProvider),
          ]);

        // Format portfolio to match expected structure
        portfolio = {
          address: targetAddress,
          totalValueUSD: portfolioResult.totalValueUSD,
          tokens: portfolioResult.tokens.map((token) => ({
            token: token.token,
            symbol: token.symbol,
            balance: ethers.formatUnits(token.balance, token.decimals),
            valueUSD: token.valueUSD || 0,
            name: token.name,
            icon: `/tokens/${token.symbol.toLowerCase()}.svg`, // placeholder
          })),
          lastUpdated: new Date().toISOString(),
        };

        // Use real governance data
        governance = governanceResult;

        // Use real vesting/claimable data
        claimable = claimableResult;
      } else {
        // Fallback to mock data for manual address entry
        const [portfolioData, governanceData, claimableData] =
          await Promise.all([
            getPortfolio(targetAddress),
            getDaoVotes(targetAddress),
            getClaimable(targetAddress),
          ]);

        portfolio = portfolioData;
        governance = governanceData;
        claimable = claimableData;
      }

      setPortfolioData(portfolio);
      setGovernanceData(governance);
      setClaimableData(claimable);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleVote = (proposalId: string, support: boolean) => {
    const proposal = governanceData?.proposals.find(
      (p: any) => p.id === proposalId
    );
    if (!proposal) return;

    setActionFlow({
      type: "vote",
      data: {
        proposalId,
        support,
        proposal,
      },
    });
    setShowLedger(true);
  };

  const handleClaim = (token: any) => {
    setActionFlow({
      type: "claim",
      data: { token },
    });
    setShowLedger(true);
  };

  const handleTokenAction = (token: any, action: "stake" | "swap") => {
    setActionFlow({
      type: action,
      data: { token },
    });
    setShowLedger(true);
  };

  const getLedgerFields = () => {
    if (!actionFlow) return [];

    switch (actionFlow.type) {
      case "vote":
        return [
          { label: "Proposal ID", value: actionFlow.data.proposalId },
          { label: "Proposal", value: actionFlow.data.proposal.title },
          { label: "Vote", value: actionFlow.data.support ? "FOR" : "AGAINST" },
          { label: "DAO", value: actionFlow.data.proposal.dao },
        ];

      case "claim":
        return [
          { label: "Token", value: actionFlow.data.token.symbol },
          { label: "Amount", value: actionFlow.data.token.amount },
          { label: "Token Address", value: actionFlow.data.token.token },
        ];

      case "stake":
        return [
          { label: "Action", value: "Stake Tokens" },
          { label: "Token", value: actionFlow.data.token.symbol },
          { label: "Amount", value: actionFlow.data.token.balance },
        ];

      case "swap":
        return [
          { label: "Action", value: "Swap Tokens" },
          { label: "From Token", value: actionFlow.data.token.symbol },
          { label: "Amount", value: actionFlow.data.token.balance },
        ];

      default:
        return [];
    }
  };

  const getIntent = () => {
    if (!actionFlow) return "";

    switch (actionFlow.type) {
      case "vote":
        return `Vote ${actionFlow.data.support ? "FOR" : "AGAINST"} proposal`;
      case "claim":
        return `Claim ${actionFlow.data.token.symbol} tokens`;
      case "stake":
        return `Stake ${actionFlow.data.token.symbol}`;
      case "swap":
        return `Swap ${actionFlow.data.token.symbol}`;
      default:
        return "";
    }
  };

  const handleLedgerApprove = () => {
    console.log("Transaction approved:", actionFlow);
    setTimeout(() => {
      setShowLedger(false);
      setActionFlow(null);
      alert("Transaction signed! (Mock)");
    }, 1000);
  };

  const handleLedgerReject = () => {
    console.log("Transaction rejected");
    setTimeout(() => {
      setShowLedger(false);
      setActionFlow(null);
    }, 1000);
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
            TRACKING PORTFOLIO | GOVERNANCE | VESTING :: MULTIBAAS PROTOCOL
          </p>
        </div>

        {/* Address Input */}
        <div
          className="terminal-box"
          style={{
            padding: "1.5rem",
            marginBottom: "2rem",
            border: "2px solid #00ff41",
          }}
        >
          <div style={{ display: "flex", gap: "1rem" }}>
            <input
              type="text"
              placeholder="0x..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="terminal-input"
              style={{ flex: 1, fontSize: "0.9rem" }}
            />
            <button
              onClick={connectWallet}
              className="terminal-button"
              style={{
                padding: "0.75rem 2rem",
                fontSize: "0.9rem",
                borderColor: "#ff00ff",
                color: "#ff00ff",
              }}
            >
              [CONNECT_WALLET]
            </button>
            <button
              onClick={() => loadDashboard()}
              disabled={loading}
              className="terminal-button"
              style={{
                padding: "0.75rem 2rem",
                fontSize: "0.9rem",
                opacity: loading ? 0.5 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "[LOADING...]" : "[LOAD_MANUAL]"}
            </button>
            <button
              onClick={loadMockDashboard}
              disabled={loading}
              className="terminal-button"
              style={{
                padding: "0.75rem 2rem",
                fontSize: "0.9rem",
                borderColor: "#ffb000",
                color: "#ffb000",
                opacity: loading ? 0.5 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              [LOAD_MOCK]
            </button>
          </div>
          {connectedAddress && (
            <div
              className="terminal-cyan"
              style={{ marginTop: "0.5rem", fontSize: "0.8rem" }}
            >
              &gt;&gt; CONNECTED: {connectedAddress.substring(0, 6)}...
              {connectedAddress.substring(38)}
              {useMockData && (
                <span className="terminal-amber" style={{ marginLeft: "1rem" }}>
                  [MOCK_MODE]
                </span>
              )}
            </div>
          )}
          {error && (
            <div
              className="terminal-red"
              style={{
                marginTop: "1rem",
                padding: "0.75rem",
                border: "1px solid #ff00ff",
                fontSize: "0.85rem",
              }}
            >
              &gt;&gt; ERROR: {error}
            </div>
          )}
        </div>

        {/* Ledger Simulator Modal */}
        {showLedger && actionFlow && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.95)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 50,
              padding: "1rem",
            }}
          >
            <div
              className="terminal-box"
              style={{
                padding: "2rem",
                maxWidth: "600px",
                width: "100%",
                border: "2px solid #00ff41",
              }}
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
                &gt;&gt; TRANSACTION REVIEW
              </h2>
              <LedgerSimulator
                intent={getIntent()}
                functionName={actionFlow.type}
                fields={getLedgerFields()}
                onApprove={handleLedgerApprove}
                onReject={handleLedgerReject}
              />
            </div>
          </div>
        )}

        {/* Dashboard Data */}
        {portfolioData && (
          <div className="space-y-8">
            {/* ACCESS GRANTED Banner */}
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
              <div
                className="terminal-dim ascii-spinner"
                style={{ marginTop: "0.5rem", fontSize: "0.8rem" }}
              >
                LOADING PORTFOLIO DATA...
              </div>
            </div>

            {/* Portfolio Overview */}
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
                totalValueUSD={portfolioData.totalValueUSD}
                tokenCount={portfolioData.tokens.length}
                address={portfolioData.address}
                lastUpdated={portfolioData.lastUpdated}
              />
            </div>

            {/* Token Holdings */}
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
                tokens={portfolioData.tokens}
                onAction={handleTokenAction}
              />
            </div>

            {/* DAO Governance */}
            {governanceData && (
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
                  proposals={governanceData.proposals}
                  votingPower={governanceData.votingPower}
                  onVote={handleVote}
                />
              </div>
            )}

            {/* Vesting & Claimable */}
            {claimableData && claimableData.claimableTokens.length > 0 && (
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
                    {claimableData.totalClaimableUSD.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                </div>
                <VestingTimeline
                  claimableTokens={claimableData.claimableTokens}
                  onClaim={handleClaim}
                />
              </div>
            )}

            {/* Event Stream Footer */}
            <div
              className="terminal-box"
              style={{ padding: "1rem", border: "1px solid #004d1a" }}
            >
              <div
                className="terminal-dim"
                style={{ fontSize: "0.75rem", letterSpacing: "0.1em" }}
              >
                &gt;&gt; EVENT_STREAM :: ALL_SYSTEMS_OPERATIONAL
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!portfolioData && !loading && (
          <div
            className="terminal-box"
            style={{
              padding: "3rem",
              textAlign: "center",
              border: "2px solid #004d1a",
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
              &gt; AWAITING CONNECTION
            </h3>
            <p className="terminal-dim" style={{ fontSize: "0.9rem" }}>
              ENTER WALLET ADDRESS TO ACCESS DASHBOARD
            </p>
            <div
              className="terminal-dim"
              style={{
                marginTop: "2rem",
                fontSize: "0.75rem",
                letterSpacing: "0.05em",
              }}
            >
              PROTOCOL: PORTFOLIO | DAO VOTES | VESTING
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
