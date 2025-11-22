import { createMultiBaaSClient } from "./client";

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
    // Generate dynamic mock data based on address
    const addressHash = parseInt(address.slice(-8), 16);
    const seed = addressHash % 10000;
    const now = Date.now();

    const uniAmount = Math.floor(200 + seed * 0.05);
    const daiAmount = Math.floor(800 + seed * 0.1);
    const usdcAmount = Math.floor(400 + seed * 0.08);

    const daiTotal = Math.floor(daiAmount * 5);
    const daiClaimed = Math.floor(daiAmount * 1.5);

    const usdcTotal = Math.floor(usdcAmount * 4);
    const usdcClaimed = Math.floor(usdcAmount * 1.2);

    const claimableTokens: ClaimableToken[] = [
      {
        token: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
        symbol: "UNI",
        amount: String(BigInt(uniAmount) * BigInt(10 ** 18)),
        decimals: 18,
        claimableAt: new Date(now - 86400000).toISOString(),
        isVested: false,
        claimData: "0xCLAIM_UNI_AIRDROP",
      },
      {
        token: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
        symbol: "DAI",
        amount: String(BigInt(daiAmount) * BigInt(10 ** 18)),
        decimals: 18,
        claimableAt: new Date(now).toISOString(),
        isVested: true,
        vestingSchedule: {
          startTime: new Date(now - 86400000 * 180).toISOString(),
          endTime: new Date(now + 86400000 * 180).toISOString(),
          totalAmount: String(BigInt(daiTotal) * BigInt(10 ** 18)),
          claimedAmount: String(BigInt(daiClaimed) * BigInt(10 ** 18)),
          cliffPeriod: "30 days",
          vestingInterval: "daily",
        },
        claimData: "0xCLAIM_DAI_VESTING",
      },
      {
        token: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        symbol: "USDC",
        amount: String(usdcAmount * 1000000),
        decimals: 6,
        claimableAt: new Date(now + 86400000 * 7).toISOString(),
        isVested: true,
        vestingSchedule: {
          startTime: new Date(now - 86400000 * 90).toISOString(),
          endTime: new Date(now + 86400000 * 270).toISOString(),
          totalAmount: String(usdcTotal * 1000000),
          claimedAmount: String(usdcClaimed * 1000000),
          vestingInterval: "weekly",
        },
        claimData: "0xCLAIM_USDC_VESTING",
      },
    ];

    // Filter based on seed to vary token count
    const visibleTokens = claimableTokens.slice(0, 2 + (seed % 2));

    const totalClaimableUSD = uniAmount * 6.5 + daiAmount + usdcAmount;

    const mockClaimable: ClaimableEvents = {
      address,
      totalClaimableUSD,
      claimableTokens: visibleTokens,
    };

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 550));

    return mockClaimable;

    // Production code:
    // const response = await client.get<ClaimableEvents>(`/api/v1/events/${address}/claimable`);
    // return response;
  } catch (error) {
    console.error("Failed to fetch claimable tokens:", error);
    throw error;
  }
}

export async function getVestingSchedules(
  address: string
): Promise<ClaimableToken[]> {
  const claimable = await getClaimable(address);
  return claimable.claimableTokens.filter((t) => t.isVested);
}

export async function encodeClaim(
  token: string,
  amount: string
): Promise<string> {
  // Mock encoding for claim transaction
  // In production, this would use the actual vesting contract ABI
  return `0xCLAIM_${token}_${amount}`;
}
