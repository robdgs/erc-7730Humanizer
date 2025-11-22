import { createMultiBaaSClient } from './client';

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

export interface VestingSchedule {
  startTime: string;
  endTime: string;
  totalAmount: string;
  claimedAmount: string;
  cliffPeriod?: string;
  vestingInterval: string;
}

export interface ClaimableEvents {
  address: string;
  claimableTokens: ClaimableToken[];
  totalClaimableUSD: number;
}

export async function getClaimable(address: string): Promise<ClaimableEvents> {
  const client = createMultiBaaSClient();

  try {
    // Mock data for demo purposes
    const now = Date.now();
    const mockClaimable: ClaimableEvents = {
      address,
      totalClaimableUSD: 4250.50,
      claimableTokens: [
        {
          token: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
          symbol: 'UNI',
          amount: '500000000000000000000',
          decimals: 18,
          claimableAt: new Date(now - 86400000).toISOString(),
          isVested: false,
          claimData: '0xCLAIM_UNI_AIRDROP',
        },
        {
          token: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
          symbol: 'DAI',
          amount: '1500000000000000000000',
          decimals: 18,
          claimableAt: new Date(now).toISOString(),
          isVested: true,
          vestingSchedule: {
            startTime: new Date(now - 86400000 * 180).toISOString(),
            endTime: new Date(now + 86400000 * 180).toISOString(),
            totalAmount: '10000000000000000000000',
            claimedAmount: '2500000000000000000000',
            cliffPeriod: '30 days',
            vestingInterval: 'daily',
          },
          claimData: '0xCLAIM_DAI_VESTING',
        },
        {
          token: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          symbol: 'USDC',
          amount: '750000000',
          decimals: 6,
          claimableAt: new Date(now + 86400000 * 7).toISOString(),
          isVested: true,
          vestingSchedule: {
            startTime: new Date(now - 86400000 * 90).toISOString(),
            endTime: new Date(now + 86400000 * 270).toISOString(),
            totalAmount: '5000000000',
            claimedAmount: '1250000000',
            vestingInterval: 'weekly',
          },
          claimData: '0xCLAIM_USDC_VESTING',
        },
      ],
    };

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 550));

    return mockClaimable;

    // Production code:
    // const response = await client.get<ClaimableEvents>(`/api/v1/events/${address}/claimable`);
    // return response;
  } catch (error) {
    console.error('Failed to fetch claimable tokens:', error);
    throw error;
  }
}

export async function getVestingSchedules(address: string): Promise<ClaimableToken[]> {
  const claimable = await getClaimable(address);
  return claimable.claimableTokens.filter(t => t.isVested);
}

export async function encodeClaim(token: string, amount: string): Promise<string> {
  // Mock encoding for claim transaction
  // In production, this would use the actual vesting contract ABI
  return `0xCLAIM_${token}_${amount}`;
}
