import { createMultiBaaSClient } from "./client";
import { ethers } from "ethers";

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
    // Generate mock data based on address for demo purposes
    // In production, replace with actual MultiBaaSAPI calls

    // Use address to generate deterministic but varying data
    const addressHash = parseInt(address.slice(-8), 16);
    const seed = addressHash % 10000;

    const baseValue = 1000 + seed * 2;
    const tokenCount = 3 + (seed % 3);

    // Generate raw balances
    const rawBalances = [
      {
        token: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        symbol: "USDC",
        rawBalance: String(Math.floor(baseValue * 2) * 1000000),
        decimals: 6,
        valueUSD: Math.floor(baseValue * 2),
      },
      {
        token: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        symbol: "USDT",
        rawBalance: String(Math.floor(baseValue * 1.5) * 1000000),
        decimals: 6,
        valueUSD: Math.floor(baseValue * 1.5),
      },
      {
        token: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
        symbol: "DAI",
        rawBalance: String(BigInt(Math.floor(baseValue)) * BigInt(10 ** 18)),
        decimals: 18,
        valueUSD: Math.floor(baseValue),
      },
      {
        token: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
        symbol: "UNI",
        rawBalance: String(
          BigInt(Math.floor(baseValue * 0.15)) * BigInt(10 ** 18)
        ),
        decimals: 18,
        valueUSD: Math.floor(baseValue * 0.95),
      },
      {
        token: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
        symbol: "WBTC",
        rawBalance: String(Math.floor(baseValue * 0.01) * 100000000),
        decimals: 8,
        valueUSD: Math.floor(baseValue * 1.2),
      },
    ].slice(0, tokenCount);

    // Format balances to human-readable format
    const mockTokens: TokenBalance[] = rawBalances.map((token) => ({
      token: token.token,
      symbol: token.symbol,
      balance: ethers.formatUnits(token.rawBalance, token.decimals),
      decimals: token.decimals,
      valueUSD: token.valueUSD,
    }));

    const totalValue = mockTokens.reduce(
      (sum, token) => sum + (token.valueUSD || 0),
      0
    );

    const mockPortfolio: Portfolio = {
      address,
      totalValueUSD: totalValue,
      tokens: mockTokens,
      nfts: [],
      lastUpdated: new Date().toISOString(),
    };

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    return mockPortfolio;

    // Production code:
    // const response = await client.get<Portfolio>(`/api/v1/portfolio/${address}`);
    // return response;
  } catch (error) {
    console.error("Failed to fetch portfolio:", error);
    throw error;
  }
}

export async function getTokenBalances(
  address: string
): Promise<TokenBalance[]> {
  const portfolio = await getPortfolio(address);
  return portfolio.tokens;
}
