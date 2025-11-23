import { createMultiBaaSClient } from "./client";

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

export async function getDaoVotes(address: string): Promise<UserVotes> {
  const client = createMultiBaaSClient();

  try {
    // Generate dynamic mock data based on address
    const addressHash = parseInt(address.slice(-8), 16);
    const seed = addressHash % 10000;

    const votingPower = String(
      BigInt(Math.floor(50 + seed * 0.1)) * BigInt(10 ** 18)
    );
    const proposalCount = 2 + (seed % 3);

    const proposals: DAOProposal[] = [
      {
        id: "0x1",
        title: "Increase Treasury Allocation for Development",
        description:
          "Proposal to allocate 15% more funds to development initiatives",
        status: "active" as const,
        votesFor: String(
          BigInt(Math.floor(3000 + seed * 0.5)) * BigInt(10 ** 18)
        ),
        votesAgainst: String(
          BigInt(Math.floor(800 + seed * 0.2)) * BigInt(10 ** 18)
        ),
        endTime: new Date(Date.now() + 86400000 * 3).toISOString(),
        dao: "DemoDAO",
        proposalData: "0x1234567890abcdef",
      },
      {
        id: "0x2",
        title: "Update Governance Parameters",
        description: "Reduce voting period from 7 days to 5 days",
        status: "active" as const,
        votesFor: String(
          BigInt(Math.floor(2000 + seed * 0.3)) * BigInt(10 ** 18)
        ),
        votesAgainst: String(
          BigInt(Math.floor(1800 + seed * 0.25)) * BigInt(10 ** 18)
        ),
        endTime: new Date(Date.now() + 86400000 * 2).toISOString(),
        dao: "DemoDAO",
        proposalData: "0xabcdef1234567890",
      },
      {
        id: "0x3",
        title: "Add New Token to Liquidity Pool",
        description: "Proposal to add LINK token to the main liquidity pool",
        status: "passed" as const,
        votesFor: String(
          BigInt(Math.floor(5000 + seed * 0.7)) * BigInt(10 ** 18)
        ),
        votesAgainst: String(
          BigInt(Math.floor(300 + seed * 0.1)) * BigInt(10 ** 18)
        ),
        endTime: new Date(Date.now() - 86400000).toISOString(),
        dao: "DemoDAO",
      },
      {
        id: "0x4",
        title: "Grant Protocol Upgrade Permissions",
        description: "Allow multisig to upgrade protocol contracts",
        status: (seed % 2 === 0 ? "active" : "rejected") as
          | "active"
          | "rejected",
        votesFor: String(
          BigInt(Math.floor(1500 + seed * 0.4)) * BigInt(10 ** 18)
        ),
        votesAgainst: String(
          BigInt(Math.floor(2200 + seed * 0.35)) * BigInt(10 ** 18)
        ),
        endTime: new Date(Date.now() + 86400000 * 5).toISOString(),
        dao: "DemoDAO",
      },
    ].slice(0, proposalCount + 1);

    const activeVotes = proposals.filter((p) => p.status === "active").length;

    const mockVotes: UserVotes = {
      address,
      votingPower,
      activeVotes,
      totalVotes: 10 + (seed % 10),
      proposals,
    };

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 600));

    return mockVotes;

    // Production code:
    // const response = await client.get<UserVotes>(`/api/v1/governance/${address}/votes`);
    // return response;
  } catch (error) {
    console.error("Failed to fetch DAO votes:", error);
    throw error;
  }
}

export async function getActiveProposals(
  address: string
): Promise<DAOProposal[]> {
  const votes = await getDaoVotes(address);
  return votes.proposals.filter((p) => p.status === "active");
}

export async function encodeVote(
  proposalId: string,
  support: boolean
): Promise<string> {
  // Mock encoding for vote transaction
  // In production, this would use the actual DAO contract ABI
  return `0xVOTE_${proposalId}_${support ? "FOR" : "AGAINST"}`;
}
