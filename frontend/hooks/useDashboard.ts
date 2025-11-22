"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { getPortfolio, type Portfolio } from "@/services/portfolio";
import { getGovernance, type UserVotes } from "@/services/governance";
import { getVesting, type ClaimableEvents } from "@/services/vesting";

export interface UseDashboardReturn {
  portfolio: Portfolio | null;
  governance: UserVotes | null;
  vesting: ClaimableEvents | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * React hook for fetching dashboard data
 * Aggregates portfolio, governance, and vesting data
 *
 * @param address - Ethereum address to fetch data for
 * @param provider - Optional ethers provider for real data
 * @param forceMock - Force mock data even with provider
 * @returns Dashboard data with loading and error states
 */
export function useDashboard(
  address: string | null,
  provider?: ethers.Provider | null,
  forceMock: boolean = false
): UseDashboardReturn {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [governance, setGovernance] = useState<UserVotes | null>(null);
  const [vesting, setVesting] = useState<ClaimableEvents | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!address) {
      setPortfolio(null);
      setGovernance(null);
      setVesting(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [portfolioData, governanceData, vestingData] = await Promise.all([
        getPortfolio(address, provider || undefined, forceMock),
        getGovernance(address, provider || undefined, forceMock),
        getVesting(address, provider || undefined, forceMock),
      ]);

      setPortfolio(portfolioData);
      setGovernance(governanceData);
      setVesting(vestingData);
    } catch (err: any) {
      const errorMsg = err.message || "Failed to load dashboard data";
      setError(errorMsg);
      console.error("Dashboard data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when address or provider changes
  useEffect(() => {
    fetchData();
  }, [address, provider, forceMock]);

  return {
    portfolio,
    governance,
    vesting,
    loading,
    error,
    refetch: fetchData,
  };
}
