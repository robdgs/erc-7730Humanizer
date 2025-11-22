import { ethers } from "ethers";
import { getPortfolio as getMockPortfolio } from "@/lib/multibaas/portfolio";
import { getPortfolioWithPrices as getRealPortfolio } from "@/lib/web3/tokenBalances";

export interface Token {
  token: string;
  symbol: string;
  balance: string;
  decimals: number;
  valueUSD?: number;
  name?: string;
  icon?: string;
}

export interface Portfolio {
  address: string;
  totalValueUSD: number;
  tokens: Token[];
  lastUpdated: string;
}

/**
 * Unified portfolio service
 * Fetches token balances with automatic fallback to mock data
 *
 * @param address - Ethereum address to fetch portfolio for
 * @param provider - Optional ethers provider for real data
 * @param forceMock - Force mock data even with provider
 * @returns Portfolio with tokens and total value
 */
export async function getPortfolio(
  address: string,
  provider?: ethers.Provider,
  forceMock: boolean = false
): Promise<Portfolio> {
  // Use mock data if no provider or forceMock flag
  if (forceMock || !provider) {
    return getMockPortfolio(address);
  }

  try {
    // Fetch real on-chain data
    const result = await getRealPortfolio(address, provider);

    // Format to match expected Portfolio structure
    return {
      address,
      totalValueUSD: result.totalValueUSD,
      tokens: result.tokens.map((token) => ({
        token: token.token,
        symbol: token.symbol,
        balance: ethers.formatUnits(token.balance, token.decimals),
        decimals: token.decimals,
        valueUSD: token.valueUSD || 0,
        name: token.name,
        icon: `/tokens/${token.symbol.toLowerCase()}.svg`,
      })),
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error(
      "Failed to fetch real portfolio, falling back to mock:",
      error
    );
    // Fallback to mock on error
    return getMockPortfolio(address);
  }
}
