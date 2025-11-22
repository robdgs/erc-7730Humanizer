"use client";

import React from "react";

interface DAOProposal {
  id: string;
  title: string;
  description: string;
  status: "active" | "passed" | "rejected" | "pending";
  votesFor: string;
  votesAgainst: string;
  endTime: string;
  dao: string;
}

interface DAOVotesProps {
  proposals: DAOProposal[];
  votingPower: string;
  onVote?: (proposalId: string, support: boolean) => void;
}

export default function DAOVotes({
  proposals,
  votingPower,
  onVote,
}: DAOVotesProps) {
  const formatVotes = (votes: string): string => {
    const value = Number(BigInt(votes) / BigInt(10 ** 18));
    return new Intl.NumberFormat("en-US").format(value);
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "passed":
        return "bg-blue-100 text-blue-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTimeRemaining = (endTime: string): string => {
    const end = new Date(endTime).getTime();
    const now = Date.now();
    const diff = end - now;

    if (diff < 0) return "Ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h remaining`;
  };

  const getVotePercentage = (
    votesFor: string,
    votesAgainst: string
  ): number => {
    const forVotes = Number(BigInt(votesFor));
    const againstVotes = Number(BigInt(votesAgainst));
    const total = forVotes + againstVotes;

    if (total === 0) return 50;
    return (forVotes / total) * 100;
  };

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-sm text-gray-600 mb-1">Your Voting Power</div>
            <div className="text-2xl font-bold text-gray-800">
              {formatVotes(votingPower)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600 mb-1">Active Proposals</div>
            <div className="text-2xl font-bold text-gray-800">
              {proposals.filter((p) => p.status === "active").length}
            </div>
          </div>
        </div>
      </div>

      {proposals.map((proposal) => {
        const percentage = getVotePercentage(
          proposal.votesFor,
          proposal.votesAgainst
        );

        return (
          <div
            key={proposal.id}
            className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-gray-800">
                    {proposal.title}
                  </h3>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                      proposal.status
                    )}`}
                  >
                    {proposal.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{proposal.description}</p>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>For: {formatVotes(proposal.votesFor)}</span>
                <span>Against: {formatVotes(proposal.votesAgainst)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {getTimeRemaining(proposal.endTime)}
              </div>

              {proposal.status === "active" && onVote && (
                <div className="flex gap-2">
                  <button
                    onClick={() => onVote(proposal.id, false)}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded transition-colors"
                  >
                    Vote Against
                  </button>
                  <button
                    onClick={() => onVote(proposal.id, true)}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded transition-colors"
                  >
                    Vote For
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
