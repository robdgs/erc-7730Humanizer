import { createMultiBaaSClient } from './client';

export interface TokenBalance {
  token: string;
  symbol: string;
  balance: string;
  decimals: number;
  valueUSD?: number;
}

export interface Portfolio {
  address: string;
  totalValueUSD: number;
  tokens: TokenBalance[];
  nfts: any[];
  lastUpdated: string;
}

export async function getPortfolio(address: string): Promise<Portfolio> {
  const client = createMultiBaaSClient();

  try {
    // Mock data for demo purposes
    // In production, replace with actual MultiBaAS API calls
    const mockPortfolio: Portfolio = {
      address,
      totalValueUSD: 12450.75,
      tokens: [
        {
          token: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          symbol: 'USDC',
          balance: '5000000000',
          decimals: 6,
          valueUSD: 5000,
        },
        {
          token: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
          symbol: 'USDT',
          balance: '3500000000',
          decimals: 6,
          valueUSD: 3500,
        },
        {
          token: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
          symbol: 'DAI',
          balance: '2000000000000000000000',
          decimals: 18,
          valueUSD: 2000,
        },
        {
          token: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
          symbol: 'UNI',
          balance: '250000000000000000000',
          decimals: 18,
          valueUSD: 1950.75,
        },
      ],
      nfts: [],
      lastUpdated: new Date().toISOString(),
    };

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    return mockPortfolio;

    // Production code:
    // const response = await client.get<Portfolio>(`/api/v1/portfolio/${address}`);
    // return response;
  } catch (error) {
    console.error('Failed to fetch portfolio:', error);
    throw error;
  }
}

export async function getTokenBalances(address: string): Promise<TokenBalance[]> {
  const portfolio = await getPortfolio(address);
  return portfolio.tokens;
}
