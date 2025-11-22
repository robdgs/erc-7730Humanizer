"use client";

import React, { useState } from "react";
import Link from "next/link";
import { getPortfolio } from "@/lib/multibaas/portfolio";
import { getDaoVotes } from "@/lib/multibaas/governance";
import { getClaimable } from "@/lib/multibaas/events";
import PortfolioCard from "@/components/PortfolioCard";
import TokenTable from "@/components/TokenTable";
import DAOVotes from "@/components/DAOVotes";
import VestingTimeline from "@/components/VestingTimeline";
import LedgerSimulator from "@/components/LedgerSimulator";

interface ActionFlow {
  type: "vote" | "claim" | "stake" | "swap";
  data: any;
}

export default function Dashboard() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [portfolioData, setPortfolioData] = useState<any>(null);
  const [governanceData, setGovernanceData] = useState<any>(null);
  const [claimableData, setClaimableData] = useState<any>(null);
  const [error, setError] = useState("");
  const [actionFlow, setActionFlow] = useState<ActionFlow | null>(null);
  const [showLedger, setShowLedger] = useState(false);

  const loadDashboard = async () => {
    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      setError("Please enter a valid Ethereum address");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [portfolio, governance, claimable] = await Promise.all([
        getPortfolio(address),
        getDaoVotes(address),
        getClaimable(address),
      ]);

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
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-gray-900 mb-4 inline-block"
          >
            ← Back to Home
          </Link>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            Digital Asset Dashboard
          </h1>
          <p className="text-xl text-gray-600">
            Track your portfolio, governance, and vesting with MultiBaAS
          </p>
        </div>

        {/* Address Input */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Enter Ethereum address (0x...)"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={loadDashboard}
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Loading..." : "Load Portfolio"}
            </button>
          </div>
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Ledger Simulator Modal */}
        {showLedger && actionFlow && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">
                Review Transaction
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
            {/* Portfolio Overview */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Portfolio Overview
              </h2>
              <PortfolioCard
                totalValueUSD={portfolioData.totalValueUSD}
                tokenCount={portfolioData.tokens.length}
                address={portfolioData.address}
                lastUpdated={portfolioData.lastUpdated}
              />
            </div>

            {/* Token Holdings */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Token Holdings
              </h2>
              <TokenTable
                tokens={portfolioData.tokens}
                onAction={handleTokenAction}
              />
            </div>

            {/* DAO Governance */}
            {governanceData && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  DAO Governance
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
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Vesting & Claimable Tokens
                </h2>
                <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                  <div className="text-sm text-gray-600">
                    Total Claimable Value
                  </div>
                  <div className="text-3xl font-bold text-gray-800">
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
          </div>
        )}

        {/* Empty State */}
        {!portfolioData && !loading && (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Enter an address to get started
            </h3>
            <p className="text-gray-600">
              View portfolio balances, DAO votes, and vesting schedules all in
              one place
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
