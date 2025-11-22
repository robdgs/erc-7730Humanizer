"use client";

import React from "react";

interface Token {
  token: string;
  symbol: string;
  balance: string;
  decimals: number;
  valueUSD?: number;
}

interface TokenTableProps {
  tokens: Token[];
  onAction?: (token: Token, action: "stake" | "swap") => void;
}

export default function TokenTable({ tokens, onAction }: TokenTableProps) {
  const formatBalance = (balance: string, decimals: number): string => {
    const value = BigInt(balance) / BigInt(10 ** decimals);
    return value.toString();
  };

  const formatUSD = (value?: number): string => {
    if (!value) return "-";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-semibold text-gray-700">
              Token
            </th>
            <th className="text-right py-3 px-4 font-semibold text-gray-700">
              Balance
            </th>
            <th className="text-right py-3 px-4 font-semibold text-gray-700">
              Value (USD)
            </th>
            <th className="text-right py-3 px-4 font-semibold text-gray-700">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {tokens.map((token, idx) => (
            <tr
              key={idx}
              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <td className="py-4 px-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                    {token.symbol.substring(0, 2)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">
                      {token.symbol}
                    </div>
                    <div className="text-xs text-gray-500 font-mono">
                      {token.token.substring(0, 6)}...
                      {token.token.substring(38)}
                    </div>
                  </div>
                </div>
              </td>
              <td className="py-4 px-4 text-right font-mono text-gray-800">
                {formatBalance(token.balance, token.decimals)}
              </td>
              <td className="py-4 px-4 text-right font-semibold text-gray-800">
                {formatUSD(token.valueUSD)}
              </td>
              <td className="py-4 px-4 text-right">
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => onAction?.(token, "stake")}
                    className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded transition-colors"
                  >
                    Stake
                  </button>
                  <button
                    onClick={() => onAction?.(token, "swap")}
                    className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white text-sm rounded transition-colors"
                  >
                    Swap
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
