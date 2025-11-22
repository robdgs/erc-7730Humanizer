export interface ERC7730Field {
  path: string;
  label: string;
  format: string;
  params?: Record<string, any>;
}

export interface ERC7730Format {
  intent: string;
  fields: ERC7730Field[];
}

export interface ERC7730Descriptor {
  context: {
    contract: {
      abi: any[];
      deployments: Array<{
        chainId: string;
        address: string;
      }>;
    };
  };
  metadata: {
    owner: string;
    info: {
      legalName: string;
      lastUpdate: string;
      url: string;
    };
  };
  display: {
    formats: Record<string, ERC7730Format>;
  };
}

let cachedDescriptor: ERC7730Descriptor | null = null;

export async function loadDescriptor(): Promise<ERC7730Descriptor> {
  if (cachedDescriptor) {
    return cachedDescriptor;
  }

  const response = await fetch("/descriptors/DemoRouter.json");
  if (!response.ok) {
    throw new Error("Failed to load ERC-7730 descriptor");
  }

  const data = await response.json();
  cachedDescriptor = data;
  return data;
}

export function findFormat(
  descriptor: ERC7730Descriptor,
  functionSignature: string
): ERC7730Format | null {
  for (const [sig, format] of Object.entries(descriptor.display.formats)) {
    if (
      sig.includes(functionSignature) ||
      functionSignature.includes(sig.split("(")[0])
    ) {
      return format;
    }
  }
  return null;
}

export function formatValue(
  value: any,
  format: string,
  params?: Record<string, any>
): string {
  switch (format) {
    case "addressName":
      return formatAddress(value);

    case "tokenAmount":
      return formatTokenAmount(value);

    case "amount":
      return formatAmount(value);

    case "timestamp":
      return formatTimestamp(value);

    default:
      return String(value);
  }
}

function formatAddress(address: string): string {
  if (!address) return "N/A";

  const knownAddresses: Record<string, string> = {
    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48": "USDC",
    "0xdAC17F958D2ee523a2206206994597C13D831ec7": "USDT",
    "0x6B175474E89094C44Da98b954EedeAC495271d0F": "DAI",
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2": "WETH",
  };

  return (
    knownAddresses[address] || `${address.slice(0, 6)}...${address.slice(-4)}`
  );
}

function formatTokenAmount(amount: any): string {
  if (!amount) return "0";

  const value = BigInt(amount.toString());
  const divisor = BigInt(10 ** 6);
  const result = Number(value) / Number(divisor);

  return result.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
}

function formatAmount(amount: any): string {
  if (!amount) return "0";

  const value = BigInt(amount.toString());
  const divisor = BigInt(10 ** 18);
  const result = Number(value) / Number(divisor);

  return result.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
}

function formatTimestamp(timestamp: any): string {
  if (!timestamp) return "N/A";

  const ts = Number(timestamp.toString());
  const date = new Date(ts * 1000);

  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
