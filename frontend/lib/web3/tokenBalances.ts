import { ethers } from "ethers";

// Standard ERC-20 ABI for balanceOf and basic info
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
];

// Common token addresses on Ethereum Mainnet
export const KNOWN_TOKENS = {
  USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  UNI: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
  WBTC: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
  WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  LINK: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
};

export interface TokenBalance {
  token: string;
  symbol: string;
  name: string;
  balance: string;
  decimals: number;
  valueUSD?: number;
}

export async function getTokenBalance(
  tokenAddress: string,
  walletAddress: string,
  provider: ethers.Provider
): Promise<TokenBalance | null> {
  try {
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);

    const [balance, decimals, symbol, name] = await Promise.all([
      contract.balanceOf(walletAddress),
      contract.decimals(),
      contract.symbol(),
      contract.name(),
    ]);

    return {
      token: tokenAddress,
      symbol,
      name,
      balance: balance.toString(),
      decimals: Number(decimals),
    };
  } catch (error) {
    console.error(`Failed to fetch balance for ${tokenAddress}:`, error);
    return null;
  }
}

export async function getMultipleTokenBalances(
  walletAddress: string,
  provider: ethers.Provider,
  tokenAddresses?: string[]
): Promise<TokenBalance[]> {
  const addresses = tokenAddresses || Object.values(KNOWN_TOKENS);

  const balances = await Promise.all(
    addresses.map((tokenAddress) =>
      getTokenBalance(tokenAddress, walletAddress, provider)
    )
  );

  // Filter out null values and tokens with zero balance
  return balances.filter(
    (balance): balance is TokenBalance =>
      balance !== null && BigInt(balance.balance) > 0n
  );
}

export async function getETHBalance(
  walletAddress: string,
  provider: ethers.Provider
): Promise<TokenBalance> {
  const balance = await provider.getBalance(walletAddress);

  return {
    token: "0x0000000000000000000000000000000000000000",
    symbol: "ETH",
    name: "Ethereum",
    balance: balance.toString(),
    decimals: 18,
  };
}

// Fetch prices from a price API (mock for now)
export async function getTokenPrices(
  symbols: string[]
): Promise<Record<string, number>> {
  // In production, use a real price API like CoinGecko, 1inch, or similar
  // For now, return mock prices
  const mockPrices: Record<string, number> = {
    ETH: 2000,
    USDC: 1,
    USDT: 1,
    DAI: 1,
    UNI: 6.5,
    WBTC: 42000,
    WETH: 2000,
    LINK: 15,
  };

  return symbols.reduce((acc, symbol) => {
    acc[symbol] = mockPrices[symbol] || 0;
    return acc;
  }, {} as Record<string, number>);
}

export async function getPortfolioWithPrices(
  walletAddress: string,
  provider: ethers.Provider
): Promise<{
  tokens: TokenBalance[];
  totalValueUSD: number;
}> {
  // Get ETH balance
  const ethBalance = await getETHBalance(walletAddress, provider);

  // Get ERC-20 token balances
  const tokenBalances = await getMultipleTokenBalances(walletAddress, provider);

  // Combine all balances
  const allBalances = [ethBalance, ...tokenBalances];

  // Get prices
  const symbols = allBalances.map((b) => b.symbol);
  const prices = await getTokenPrices(symbols);

  // Calculate USD values
  const tokensWithValues = allBalances.map((token) => {
    const price = prices[token.symbol] || 0;
    const balance = Number(ethers.formatUnits(token.balance, token.decimals));
    const valueUSD = balance * price;

    return {
      ...token,
      valueUSD,
    };
  });

  const totalValueUSD = tokensWithValues.reduce(
    (sum, token) => sum + (token.valueUSD || 0),
    0
  );

  return {
    tokens: tokensWithValues,
    totalValueUSD,
  };
}
