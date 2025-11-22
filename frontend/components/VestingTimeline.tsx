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
    <div className="space-y-4">
      {claimableTokens.map((token, idx) => {
        const canClaim = isClaimable(token.claimableAt);
        const progress = token.vestingSchedule
          ? getVestingProgress(token.vestingSchedule)
          : 100;

        return (
          <div
            key={idx}
            className={`bg-white rounded-lg border-2 p-5 transition-all ${
              canClaim ? "border-green-400 shadow-md" : "border-gray-200"
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-bold">
                  {token.symbol.substring(0, 2)}
                </div>
                <div>
                  <div className="font-semibold text-gray-800 text-lg">
                    {token.symbol}
                  </div>
                  <div className="text-sm text-gray-500">
                    {token.isVested ? "Vesting" : "Claimable"}
                  </div>
                </div>
              </div>

              {canClaim && onClaim && (
                <button
                  onClick={() => onClaim(token)}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all"
                >
                  Claim {formatAmount(token.amount, token.decimals)}
                </button>
              )}

              {!canClaim && (
                <div className="text-sm text-gray-500">
                  Claimable {formatDate(token.claimableAt)}
                </div>
              )}
            </div>

            {token.vestingSchedule && (
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-2">
                    <span>Progress: {progress.toFixed(1)}%</span>
                    <span>
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
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-gray-600 mb-1">Start Date</div>
                    <div className="font-semibold text-gray-800">
                      {formatDate(token.vestingSchedule.startTime)}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-gray-600 mb-1">End Date</div>
                    <div className="font-semibold text-gray-800">
                      {formatDate(token.vestingSchedule.endTime)}
                    </div>
                  </div>
                  {token.vestingSchedule.cliffPeriod && (
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-gray-600 mb-1">Cliff Period</div>
                      <div className="font-semibold text-gray-800">
                        {token.vestingSchedule.cliffPeriod}
                      </div>
                    </div>
                  )}
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-gray-600 mb-1">Vesting Interval</div>
                    <div className="font-semibold text-gray-800 capitalize">
                      {token.vestingSchedule.vestingInterval}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!token.isVested && canClaim && (
              <div className="mt-3 bg-green-50 border border-green-200 rounded p-3 text-sm text-green-800">
                💰{" "}
                <strong>
                  {formatAmount(token.amount, token.decimals)} {token.symbol}
                </strong>{" "}
                available to claim now!
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
