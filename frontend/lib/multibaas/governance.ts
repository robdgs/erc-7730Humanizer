import { createMultiBaaSClient } from './client';

export interface DAOProposal {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'passed' | 'rejected' | 'pending';
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
    // Mock data for demo purposes
    const mockVotes: UserVotes = {
      address,
      votingPower: '125000000000000000000',
      activeVotes: 2,
      totalVotes: 15,
      proposals: [
        {
          id: '0x1',
          title: 'Increase Treasury Allocation for Development',
          description: 'Proposal to allocate 15% more funds to development initiatives',
          status: 'active',
          votesFor: '5250000000000000000000',
          votesAgainst: '1200000000000000000000',
          endTime: new Date(Date.now() + 86400000 * 3).toISOString(),
          dao: 'DemoDAO',
          proposalData: '0x1234567890abcdef',
        },
        {
          id: '0x2',
          title: 'Update Governance Parameters',
          description: 'Reduce voting period from 7 days to 5 days',
          status: 'active',
          votesFor: '3100000000000000000000',
          votesAgainst: '2800000000000000000000',
          endTime: new Date(Date.now() + 86400000 * 2).toISOString(),
          dao: 'DemoDAO',
          proposalData: '0xabcdef1234567890',
        },
        {
          id: '0x3',
          title: 'Add New Token to Liquidity Pool',
          description: 'Proposal to add LINK token to the main liquidity pool',
          status: 'passed',
          votesFor: '8500000000000000000000',
          votesAgainst: '500000000000000000000',
          endTime: new Date(Date.now() - 86400000).toISOString(),
          dao: 'DemoDAO',
        },
      ],
    };

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 600));

    return mockVotes;

    // Production code:
    // const response = await client.get<UserVotes>(`/api/v1/governance/${address}/votes`);
    // return response;
  } catch (error) {
    console.error('Failed to fetch DAO votes:', error);
    throw error;
  }
}

export async function getActiveProposals(address: string): Promise<DAOProposal[]> {
  const votes = await getDaoVotes(address);
  return votes.proposals.filter(p => p.status === 'active');
}

export async function encodeVote(proposalId: string, support: boolean): Promise<string> {
  // Mock encoding for vote transaction
  // In production, this would use the actual DAO contract ABI
  return `0xVOTE_${proposalId}_${support ? 'FOR' : 'AGAINST'}`;
}
