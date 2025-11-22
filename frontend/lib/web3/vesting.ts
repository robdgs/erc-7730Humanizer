import { ethers } from "ethers";

// Common vesting contract ABI
const VESTING_ABI = [
  "function getVestingSchedule(address beneficiary) view returns (uint256 start, uint256 cliff, uint256 duration, uint256 amount, uint256 released)",
  "function computeReleasableAmount(address beneficiary) view returns (uint256)",
  "function released(address beneficiary) view returns (uint256)",
  "function releasableAmount(address beneficiary) view returns (uint256)",
  "function vestedAmount(address beneficiary, uint64 timestamp) view returns (uint256)",
];

// Token locker / vesting contract
const TOKEN_LOCKER_ABI = [
  "function locked(address user) view returns (uint256 amount, uint256 end)",
  "function balanceOf(address account) view returns (uint256)",
];

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

export interface VestingContract {
  address: string;
  tokenAddress: string;
  name: string;
}

// Example vesting contracts (expandable)
export const KNOWN_VESTING_CONTRACTS: VestingContract[] = [
  // Add known vesting contract addresses here
];

export async function getVestingSchedule(
  vestingContractAddress: string,
  beneficiary: string,
  provider: ethers.Provider
): Promise<VestingSchedule | null> {
  try {
    const contract = new ethers.Contract(
      vestingContractAddress,
      VESTING_ABI,
      provider
    );

    const schedule = await contract.getVestingSchedule(beneficiary);
    const released = await contract.released(beneficiary);

    const startTime = Number(schedule.start);
    const duration = Number(schedule.duration);
    const cliff = Number(schedule.cliff);

    return {
      startTime: new Date(startTime * 1000).toISOString(),
      endTime: new Date((startTime + duration) * 1000).toISOString(),
      totalAmount: schedule.amount.toString(),
      claimedAmount: released.toString(),
      cliffPeriod: cliff > 0 ? `${cliff / 86400} days` : undefined,
      vestingInterval: "continuous",
    };
  } catch (error) {
    console.error(`Failed to get vesting schedule:`, error);
    return null;
  }
}

export async function getReleasableAmount(
  vestingContractAddress: string,
  beneficiary: string,
  provider: ethers.Provider
): Promise<string> {
  try {
    const contract = new ethers.Contract(
      vestingContractAddress,
      VESTING_ABI,
      provider
    );

    // Try different method names for compatibility
    try {
      const amount = await contract.computeReleasableAmount(beneficiary);
      return amount.toString();
    } catch {
      const amount = await contract.releasableAmount(beneficiary);
      return amount.toString();
    }
  } catch (error) {
    console.error(`Failed to get releasable amount:`, error);
    return "0";
  }
}

export async function getAllVestingSchedules(
  walletAddress: string,
  provider: ethers.Provider,
  vestingContracts: VestingContract[] = KNOWN_VESTING_CONTRACTS
): Promise<ClaimableToken[]> {
  const results: ClaimableToken[] = [];

  for (const vestingContract of vestingContracts) {
    try {
      const schedule = await getVestingSchedule(
        vestingContract.address,
        walletAddress,
        provider
      );

      if (!schedule || BigInt(schedule.totalAmount) === 0n) {
        continue;
      }

      const releasableAmount = await getReleasableAmount(
        vestingContract.address,
        walletAddress,
        provider
      );

      // Get token info
      const tokenContract = new ethers.Contract(
        vestingContract.tokenAddress,
        [
          "function symbol() view returns (string)",
          "function decimals() view returns (uint8)",
        ],
        provider
      );

      const [symbol, decimals] = await Promise.all([
        tokenContract.symbol(),
        tokenContract.decimals(),
      ]);

      results.push({
        token: vestingContract.tokenAddress,
        symbol,
        amount: releasableAmount,
        decimals: Number(decimals),
        claimableAt: schedule.startTime,
        isVested: true,
        vestingSchedule: schedule,
        claimData: vestingContract.address,
      });
    } catch (error) {
      console.error(
        `Failed to process vesting contract ${vestingContract.address}:`,
        error
      );
    }
  }

  return results;
}

export interface ClaimableEvents {
  address: string;
  claimableTokens: ClaimableToken[];
  totalClaimableUSD: number;
}

export async function getClaimableTokens(
  walletAddress: string,
  provider: ethers.Provider
): Promise<ClaimableEvents> {
  try {
    const claimableTokens = await getAllVestingSchedules(
      walletAddress,
      provider
    );

    // Calculate total USD value (would need price feed integration)
    const totalClaimableUSD = 0; // Placeholder - integrate with price feeds

    return {
      address: walletAddress,
      claimableTokens,
      totalClaimableUSD,
    };
  } catch (error) {
    console.error("Failed to get claimable tokens:", error);
    throw error;
  }
}
