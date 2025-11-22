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
    <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="text-sm opacity-90 mb-1">Total Portfolio Value</div>
          <div className="text-4xl font-bold">{formatUSD(totalValueUSD)}</div>
        </div>
        <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2">
          <div className="text-xs opacity-90">Assets</div>
          <div className="text-2xl font-bold">{tokenCount}</div>
        </div>
      </div>

      <div className="border-t border-white border-opacity-20 pt-4">
        <div className="flex justify-between items-center text-sm">
          <div>
            <div className="opacity-75 mb-1">Wallet Address</div>
            <div className="font-mono">
              {address.substring(0, 6)}...{address.substring(38)}
            </div>
          </div>
          <div className="text-right">
            <div className="opacity-75 mb-1">Last Updated</div>
            <div>{formatDate(lastUpdated)}</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }
      `}</style>
    </div>
  );
}
