import { ethers } from "ethers";

// Common Governor Bravo / OpenZeppelin Governor ABI
const GOVERNOR_ABI = [
  "function getVotes(address account) view returns (uint256)",
  "function proposals(uint256 proposalId) view returns (uint256 id, address proposer, uint256 eta, uint256 startBlock, uint256 endBlock, uint256 forVotes, uint256 againstVotes, uint256 abstainVotes, bool canceled, bool executed)",
  "function state(uint256 proposalId) view returns (uint8)",
  "function proposalCount() view returns (uint256)",
  "function proposalThreshold() view returns (uint256)",
  "function quorum(uint256 blockNumber) view returns (uint256)",
];

// Token contract for voting power (delegation based)
const GOVERNANCE_TOKEN_ABI = [
  "function balanceOf(address account) view returns (uint256)",
  "function delegates(address account) view returns (address)",
  "function getCurrentVotes(address account) view returns (uint96)",
  "function getVotes(address account) view returns (uint256)",
];

export interface GovernanceContract {
  governorAddress: string;
  tokenAddress: string;
  name: string;
}

// Known governance contracts (expandable)
export const KNOWN_DAOS: Record<string, GovernanceContract> = {
  UNI: {
    governorAddress: "0x408ED6354d4973f66138C91495F2f2FCbd8724C3",
    tokenAddress: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    name: "Uniswap",
  },
  COMP: {
    governorAddress: "0xc0Da02939E1441F497fd74F78cE7Decb17B66529",
    tokenAddress: "0xc00e94Cb662C3520282E6f5717214004A7f26888",
    name: "Compound",
  },
};

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

export async function getVotingPower(
  walletAddress: string,
  governanceConfig: GovernanceContract,
  provider: ethers.Provider
): Promise<string> {
  try {
    const tokenContract = new ethers.Contract(
      governanceConfig.tokenAddress,
      GOVERNANCE_TOKEN_ABI,
      provider
    );

    // Try modern getVotes first, fallback to getCurrentVotes for older contracts
    try {
      const votes = await tokenContract.getVotes(walletAddress);
      return votes.toString();
    } catch {
      const votes = await tokenContract.getCurrentVotes(walletAddress);
      return votes.toString();
    }
  } catch (error) {
    console.error(
      `Failed to get voting power for ${governanceConfig.name}:`,
      error
    );
    return "0";
  }
}

export async function getProposals(
  governanceConfig: GovernanceContract,
  provider: ethers.Provider,
  limit: number = 10
): Promise<DAOProposal[]> {
  try {
    const governorContract = new ethers.Contract(
      governanceConfig.governorAddress,
      GOVERNOR_ABI,
      provider
    );

    const proposalCount = await governorContract.proposalCount();
    const count = Number(proposalCount);

    const startId = Math.max(1, count - limit + 1);
    const proposals: DAOProposal[] = [];

    for (let i = count; i >= startId && i > 0; i--) {
      try {
        const proposal = await governorContract.proposals(i);
        const state = await governorContract.state(i);

        const statusMap: Record<
          number,
          "pending" | "active" | "passed" | "rejected"
        > = {
          0: "pending",
          1: "active",
          2: "passed",
          3: "rejected",
          4: "passed",
          5: "rejected",
          6: "rejected",
          7: "passed",
        };

        proposals.push({
          id: i.toString(),
          title: `Proposal #${i}`,
          description: `Governance proposal for ${governanceConfig.name}`,
          status: statusMap[state] || "pending",
          votesFor: proposal.forVotes.toString(),
          votesAgainst: proposal.againstVotes.toString(),
          endTime: new Date(Number(proposal.endBlock) * 15000).toISOString(), // approximate
          dao: governanceConfig.name,
          proposalData: proposal.id.toString(),
        });
      } catch (err) {
        console.error(`Failed to fetch proposal ${i}:`, err);
      }
    }

    return proposals;
  } catch (error) {
    console.error(
      `Failed to get proposals for ${governanceConfig.name}:`,
      error
    );
    return [];
  }
}

export async function getUserGovernanceData(
  walletAddress: string,
  provider: ethers.Provider,
  daos: GovernanceContract[] = Object.values(KNOWN_DAOS)
): Promise<UserVotes> {
  try {
    // Get voting power and proposals from all DAOs
    const results = await Promise.all(
      daos.map(async (dao) => {
        const [votingPower, proposals] = await Promise.all([
          getVotingPower(walletAddress, dao, provider),
          getProposals(dao, provider, 5),
        ]);
        return { votingPower, proposals };
      })
    );

    // Aggregate results
    const totalVotingPower = results.reduce(
      (sum, r) => sum + BigInt(r.votingPower),
      0n
    );
    const allProposals = results.flatMap((r) => r.proposals);
    const activeVotes = allProposals.filter(
      (p) => p.status === "active"
    ).length;

    return {
      address: walletAddress,
      votingPower: totalVotingPower.toString(),
      proposals: allProposals,
      activeVotes,
      totalVotes: allProposals.length,
    };
  } catch (error) {
    console.error("Failed to get governance data:", error);
    throw error;
  }
}
