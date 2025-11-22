import { ethers } from "ethers";
import type {
  ERC7730Descriptor,
  FormattedTransaction,
  FormattedField,
} from "./types";

/**
 * ERC-7730 transaction formatter
 * Converts decoded transaction data into human-readable format
 */
export class ERC7730Formatter {
  private descriptor: ERC7730Descriptor;

  constructor(descriptor: ERC7730Descriptor) {
    this.descriptor = descriptor;
  }

  /**
   * Format a decoded transaction using ERC-7730 descriptor
   * @param functionName - Function name from ABI
   * @param decodedArgs - Decoded function arguments
   * @returns Formatted transaction with human-readable fields
   */
  formatTransaction(
    functionName: string,
    decodedArgs: any[]
  ): FormattedTransaction | null {
    // Try messages first (newer format)
    let message = this.descriptor.messages?.[functionName];

    // Fallback to display.formats (legacy format)
    if (!message && this.descriptor.display?.formats) {
      const formatKey = Object.keys(this.descriptor.display.formats).find(
        (key) => key.startsWith(functionName)
      );
      if (formatKey) {
        message = this.descriptor.display.formats[formatKey] as any;
      }
    }

    if (!message) {
      return null;
    }

    const fields: FormattedField[] = [];

    for (const fieldDef of message.fields) {
      let value = this.getValueByPath(decodedArgs, fieldDef.path);

      // Handle nested definitions
      if (fieldDef.nested && this.descriptor.display?.definitions) {
        const nestedDef = this.descriptor.display.definitions[fieldDef.nested];
        if (nestedDef) {
          for (const nestedField of nestedDef.fields) {
            const nestedValue = this.getValueByPath(value, nestedField.path);
            fields.push({
              label: nestedField.label,
              value: this.formatValue(nestedValue, nestedField.format),
              rawValue: nestedValue,
              format: nestedField.format,
            });
          }
          continue;
        }
      }

      fields.push({
        label: fieldDef.label,
        value: this.formatValue(value, fieldDef.format),
        rawValue: value,
        format: fieldDef.format,
      });
    }

    return {
      intent: message.intent,
      functionName,
      fields,
    };
  }

  /**
   * Navigate object path to get nested value
   */
  private getValueByPath(obj: any, path: string): any {
    const parts = path.split(".");
    let current = obj;

    for (const part of parts) {
      if (current === null || current === undefined) {
        return undefined;
      }

      // 'params' refers to first argument (struct)
      if (part === "params" && Array.isArray(current) && current.length > 0) {
        current = current[0];
        continue;
      }

      // Array index access
      if (Array.isArray(current) && /^\d+$/.test(part)) {
        current = current[parseInt(part)];
      } else if (typeof current === "object") {
        current = current[part];
      } else {
        return undefined;
      }
    }

    return current;
  }

  /**
   * Format value based on format type
   */
  private formatValue(value: any, format?: string): string {
    if (value === null || value === undefined) {
      return "N/A";
    }

    if (!format) {
      return String(value);
    }

    // Check for format definition
    const formatDef = this.descriptor.display?.formats?.[format];
    if (formatDef && "type" in formatDef) {
      switch (formatDef.type) {
        case "amount":
          return this.formatAmount(value, formatDef.denomination || "wei");
        case "address":
          return this.formatAddress(value, formatDef.prefix);
        case "date":
          return this.formatDate(value);
      }
    }

    // Fallback format detection
    switch (format) {
      case "tokenAmount":
      case "amount":
        return this.formatAmount(value);
      case "tokenAddress":
      case "recipientAddress":
      case "addressName":
      case "address":
        return this.formatAddress(value);
      case "timestamp":
      case "date":
        return this.formatDate(value);
      default:
        return String(value);
    }
  }

  /**
   * Format token amount with proper decimals
   */
  private formatAmount(value: any, denomination: string = "wei"): string {
    try {
      const bn = BigInt(value.toString());
      const valueStr = bn.toString();

      // Auto-detect decimals
      const decimals = valueStr.length <= 12 ? 6 : 18;
      const formatted = ethers.formatUnits(bn, decimals);
      const num = parseFloat(formatted);

      if (num === 0) return "0";
      if (num < 0.000001) return num.toExponential(2);
      if (num < 1) return num.toFixed(6);
      if (num >= 1000000) return (num / 1000000).toFixed(2) + "M";
      if (num >= 1000) return (num / 1000).toFixed(2) + "K";

      return num.toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      });
    } catch {
      return String(value);
    }
  }

  /**
   * Format Ethereum address with known names
   */
  private formatAddress(value: any, prefix?: string): string {
    try {
      const address = String(value);
      if (!ethers.isAddress(address)) {
        return address;
      }

      const checksummed = ethers.getAddress(address);

      const knownAddresses: Record<string, string> = {
        "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48": "USDC Token",
        "0xdAC17F958D2ee523a2206206994597C13D831ec7": "USDT Token",
        "0x6B175474E89094C44Da98b954EedeAC495271d0F": "DAI Token",
        "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2": "WETH Token",
      };

      const name = knownAddresses[checksummed];
      const short = `${checksummed.slice(0, 6)}...${checksummed.slice(-4)}`;

      if (name) {
        return prefix ? `${prefix}${name}` : name;
      }

      return prefix ? `${prefix}${short}` : short;
    } catch {
      return String(value);
    }
  }

  /**
   * Format Unix timestamp to human-readable date
   */
  private formatDate(value: any): string {
    try {
      const timestamp =
        typeof value === "bigint" ? Number(value) : Number(value.toString());
      const date = new Date(timestamp * 1000);

      if (isNaN(date.getTime())) {
        return String(value);
      }

      const now = new Date();
      const diffMs = date.getTime() - now.getTime();
      const diffMinutes = Math.floor(diffMs / 60000);

      // Relative time for near-future dates
      if (diffMs > 0 && diffMinutes < 10080) {
        if (diffMinutes < 60) return `in ${diffMinutes} minutes`;
        if (diffMinutes < 1440)
          return `in ${Math.floor(diffMinutes / 60)} hours`;
        return `in ${Math.floor(diffMinutes / 1440)} days`;
      }

      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return String(value);
    }
  }
}
