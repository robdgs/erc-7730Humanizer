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
      <div
        className="terminal-box"
        style={{ padding: "1rem", border: "2px solid #00ffff" }}
      >
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
              &gt; YOUR_VOTING_POWER
            </div>
            <div
              className="terminal-cyan terminal-glow"
              style={{ fontSize: "1.75rem", fontWeight: "bold" }}
            >
              {formatVotes(votingPower)}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              className="terminal-dim"
              style={{ fontSize: "0.75rem", marginBottom: "0.25rem" }}
            >
              &gt; ACTIVE_PROPOSALS
            </div>
            <div
              className="terminal-amber terminal-glow"
              style={{ fontSize: "1.75rem", fontWeight: "bold" }}
            >
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

        const statusColors: Record<string, string> = {
          active: "#00ff41",
          passed: "#00ffff",
          rejected: "#ff0040",
          pending: "#666666",
        };

        return (
          <div
            key={proposal.id}
            className="terminal-box"
            style={{
              padding: "1.25rem",
              border: `1px solid ${statusColors[proposal.status] || "#004d1a"}`,
            }}
          >
            <div style={{ marginBottom: "1rem" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  marginBottom: "0.75rem",
                }}
              >
                <div
                  className="terminal-prompt"
                  style={{ margin: 0, padding: 0 }}
                ></div>
                <h3
                  className="terminal-text"
                  style={{ fontWeight: 600, fontSize: "1rem" }}
                >
                  {proposal.title}
                </h3>
                <span
                  className="terminal-blink"
                  style={{
                    fontSize: "0.7rem",
                    padding: "0.25rem 0.75rem",
                    border: `1px solid ${statusColors[proposal.status]}`,
                    color: statusColors[proposal.status],
                    letterSpacing: "0.1em",
                  }}
                >
                  [{proposal.status.toUpperCase()}]
                </span>
              </div>
              <p
                className="terminal-dim"
                style={{ fontSize: "0.85rem", marginLeft: "1.5rem" }}
              >
                {proposal.description}
              </p>
            </div>

            <div style={{ marginBottom: "1rem", marginLeft: "1.5rem" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.75rem",
                  marginBottom: "0.5rem",
                }}
              >
                <span className="terminal-text">
                  FOR: {formatVotes(proposal.votesFor)}
                </span>
                <span className="terminal-red">
                  AGAINST: {formatVotes(proposal.votesAgainst)}
                </span>
              </div>
              <div
                style={{
                  width: "100%",
                  height: "4px",
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
                    width: `${percentage}%`,
                    background: "#00ff41",
                    boxShadow: "0 0 10px #00ff41",
                    transition: "width 0.3s",
                  }}
                />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginLeft: "1.5rem",
              }}
            >
              <div className="terminal-amber" style={{ fontSize: "0.8rem" }}>
                {getTimeRemaining(proposal.endTime)}
              </div>

              {proposal.status === "active" && onVote && (
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    onClick={() => onVote(proposal.id, false)}
                    className="terminal-button"
                    style={{
                      padding: "0.4rem 1rem",
                      fontSize: "0.75rem",
                      borderColor: "#ff0040",
                      color: "#ff0040",
                    }}
                  >
                    [AGAINST]
                  </button>
                  <button
                    onClick={() => onVote(proposal.id, true)}
                    className="terminal-button"
                    style={{
                      padding: "0.4rem 1rem",
                      fontSize: "0.75rem",
                      borderColor: "#00ff41",
                      color: "#00ff41",
                    }}
                  >
                    [FOR]
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
