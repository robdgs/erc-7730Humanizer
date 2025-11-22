import { ethers } from "ethers";
import { getClaimable as getMockVesting } from "@/lib/multibaas/events";
import { getClaimableTokens as getRealVesting } from "@/lib/web3/vesting";

export interface VestingSchedule {
  startTime: string;
  endTime: string;
  totalAmount: string;
  claimedAmount: string;
  cliffPeriod?: string;
  vestingInterval: string;
}

export interface ClaimableToken {
  token: string;
  symbol: string;
  amount: string;
  decimals: number;
  claimableAt: string;
  isVested: boolean;
  vestingSchedule?: VestingSchedule;
  claimData?: string;
}

export interface ClaimableEvents {
  address: string;
  claimableTokens: ClaimableToken[];
  totalClaimableUSD: number;
}

/**
 * Unified vesting service
 * Fetches claimable tokens and vesting schedules with automatic fallback to mock data
 *
 * @param address - Ethereum address to fetch vesting data for
 * @param provider - Optional ethers provider for real data
 * @param forceMock - Force mock data even with provider
 * @returns Claimable tokens with vesting schedules
 */
export async function getVesting(
  address: string,
  provider?: ethers.Provider,
  forceMock: boolean = false
): Promise<ClaimableEvents> {
  // Use mock data if no provider or forceMock flag
  if (forceMock || !provider) {
    return getMockVesting(address);
  }

  try {
    // Fetch real on-chain vesting data
    const result = await getRealVesting(address, provider);
    return result;
  } catch (error) {
    console.error("Failed to fetch real vesting, falling back to mock:", error);
    // Fallback to mock on error
    return getMockVesting(address);
  }
}
