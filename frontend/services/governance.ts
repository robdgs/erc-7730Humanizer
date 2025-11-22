import { ethers } from "ethers";
import { getDaoVotes as getMockGovernance } from "@/lib/multibaas/governance";
import { getUserGovernanceData as getRealGovernance } from "@/lib/web3/governance";

export interface DAOProposal {
  id: string;
  title: string;
  description: string;
  status: "active" | "passed" | "rejected" | "pending";
  votesFor: string;
  votesAgainst: string;
  endTime: string;
  dao: string;
  proposalData?: string;
}

export interface UserVotes {
  address: string;
  votingPower: string;
  proposals: DAOProposal[];
  activeVotes: number;
  totalVotes: number;
}

/**
 * Unified governance service
 * Fetches DAO votes and proposals with automatic fallback to mock data
 *
 * @param address - Ethereum address to fetch governance data for
 * @param provider - Optional ethers provider for real data
 * @param forceMock - Force mock data even with provider
 * @returns User voting power and proposals
 */
export async function getGovernance(
  address: string,
  provider?: ethers.Provider,
  forceMock: boolean = false
): Promise<UserVotes> {
  // Use mock data if no provider or forceMock flag
  if (forceMock || !provider) {
    return getMockGovernance(address);
  }

  try {
    // Fetch real on-chain governance data
    const result = await getRealGovernance(address, provider);
    return result;
  } catch (error) {
    console.error(
      "Failed to fetch real governance, falling back to mock:",
      error
    );
    // Fallback to mock on error
    return getMockGovernance(address);
  }
}
