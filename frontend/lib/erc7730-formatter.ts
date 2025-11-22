import { ethers } from 'ethers';

export interface ERC7730Descriptor {
  messages?: {
    [functionName: string]: {
      intent: string;
      fields: Array<{
        path: string;
        label: string;
        format?: string;
        nested?: string;
      }>;
    };
  };
  display?: {
    formats?: {
      [name: string]: {
        type: string;
        denomination?: string;
        prefix?: string;
        encoding?: string;
      };
    };
    definitions?: {
      [name: string]: {
        fields: Array<{
          path: string;
          label: string;
          format?: string;
        }>;
      };
    };
  };
  metadata?: {
    constants?: {
      [key: string]: string;
    };
  };
}

export interface FormattedField {
  label: string;
  value: string;
  rawValue: any;
  format?: string;
}

export interface FormattedTransaction {
  intent: string;
  functionName: string;
  fields: FormattedField[];
}

export class ERC7730Formatter {
  private descriptor: ERC7730Descriptor;

  constructor(descriptor: ERC7730Descriptor) {
    this.descriptor = descriptor;
  }

  formatTransaction(
    functionName: string,
    decodedArgs: any[]
  ): FormattedTransaction | null {
    // Try messages first (newer format)
    let message = this.descriptor.messages?.[functionName];
    
    // Fallback to display.formats (legacy format from generate-descriptor.ts)
    if (!message && this.descriptor.display?.formats) {
      // Try exact match first
      message = this.descriptor.display.formats[functionName] as any;
      
      // Try with signature
      if (!message) {
        const formatKey = Object.keys(this.descriptor.display.formats).find(key => 
          key.startsWith(functionName)
        );
        if (formatKey) {
          message = this.descriptor.display.formats[formatKey] as any;
        }
      }
    }
    
    if (!message) {
      return null;
    }

    const fields: FormattedField[] = [];

    for (const fieldDef of message.fields) {
      // Get the value - handle both direct array access and path navigation
      let value: any;
      
      if (fieldDef.path.startsWith('params') || fieldDef.path.match(/^\d+\./)) {
        // For paths like "params.tokenIn" or "0.tokenIn"
        value = this.getValueByPath(decodedArgs, fieldDef.path);
      } else {
        // Direct parameter access by name
        const pathParts = fieldDef.path.split('.');
        if (pathParts.length === 1 && decodedArgs.length > 0) {
          // Try to find in first argument if it's an object/struct
          if (typeof decodedArgs[0] === 'object' && decodedArgs[0] !== null) {
            value = decodedArgs[0][fieldDef.path];
          } else {
            // Try by index
            const paramIndex = parseInt(fieldDef.path);
            value = !isNaN(paramIndex) ? decodedArgs[paramIndex] : undefined;
          }
        } else {
          value = this.getValueByPath(decodedArgs, fieldDef.path);
        }
      }
      
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
        }
      } else {
        fields.push({
          label: fieldDef.label,
          value: this.formatValue(value, fieldDef.format),
          rawValue: value,
          format: fieldDef.format,
        });
      }
    }

    return {
      intent: message.intent,
      functionName,
      fields,
    };
  }

  private getValueByPath(obj: any, path: string): any {
    const parts = path.split('.');
    let current = obj;
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      
      if (current === null || current === undefined) {
        return undefined;
      }
      
      // Special handling for 'params' - it refers to the first argument
      if (part === 'params' && Array.isArray(current) && current.length > 0) {
        current = current[0];
        continue;
      }
      
      if (Array.isArray(current) && /^\d+$/.test(part)) {
        current = current[parseInt(part)];
      } else if (typeof current === 'object') {
        current = current[part];
      } else {
        return undefined;
      }
    }
    
    return current;
  }

  private formatValue(value: any, format?: string): string {
    if (value === null || value === undefined) {
      return 'N/A';
    }

    if (!format) {
      return String(value);
    }

    const formatDef = this.descriptor.display?.formats?.[format];
    
    if (formatDef) {
      switch (formatDef.type) {
        case 'amount':
          return this.formatAmount(value, formatDef.denomination || 'wei');
        case 'address':
          return this.formatAddress(value, formatDef.prefix);
        case 'date':
          return this.formatDate(value);
        default:
          return String(value);
      }
    }

    switch (format) {
      case 'tokenAmount':
      case 'amount':
        return this.formatAmount(value);
      case 'tokenAddress':
      case 'recipientAddress':
      case 'addressName':
      case 'address':
        return this.formatAddress(value);
      case 'timestamp':
      case 'date':
        return this.formatDate(value);
      default:
        return String(value);
    }
  }

  private formatAmount(value: any, denomination: string = 'wei'): string {
    try {
      const bn = BigInt(value.toString());
      
      // Detect decimals based on value size
      let decimals = 18;
      const valueStr = bn.toString();
      
      // If value is small (< 10^12), likely 6 decimals (USDC/USDT)
      if (valueStr.length <= 12) {
        decimals = 6;
      }
      
      const formatted = ethers.formatUnits(bn, decimals);
      const num = parseFloat(formatted);
      
      if (num === 0) return '0';
      
      // Better formatting for different ranges
      if (num < 0.000001) return num.toExponential(2);
      if (num < 1) {
        return num.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 6,
        });
      }
      if (num < 1000000) {
        return num.toLocaleString('en-US', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        });
      }
      
      // Large numbers: use K/M notation
      if (num >= 1000000) {
        return (num / 1000000).toFixed(2) + 'M';
      }
      if (num >= 1000) {
        return (num / 1000).toFixed(2) + 'K';
      }
      
      return num.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      });
    } catch (error) {
      return String(value);
    }
  }

  private formatAddress(value: any, prefix?: string): string {
    try {
      const address = String(value);
      if (!ethers.isAddress(address)) {
        return address;
      }

      const checksummed = ethers.getAddress(address);
      
      const knownAddresses: { [key: string]: string } = {
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48': 'USDC Token',
        '0xdAC17F958D2ee523a2206206994597C13D831ec7': 'USDT Token',
        '0x6B175474E89094C44Da98b954EedeAC495271d0F': 'DAI Token',
        '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2': 'WETH Token',
      };

      const name = knownAddresses[checksummed];
      
      if (name) {
        const short = `${checksummed.slice(0, 6)}...${checksummed.slice(-4)}`;
        return prefix ? `${prefix}${name}` : name;
      }
      
      // For unknown addresses, show shortened format
      const short = `${checksummed.slice(0, 6)}...${checksummed.slice(-4)}`;
      return prefix ? `${prefix}${short}` : short;
    } catch (error) {
      return String(value);
    }
  }

  private formatDate(value: any): string {
    try {
      const timestamp = typeof value === 'bigint' ? Number(value) : Number(value.toString());
      const date = new Date(timestamp * 1000);
      
      if (isNaN(date.getTime())) {
        return String(value);
      }
      
      const now = new Date();
      const diffMs = date.getTime() - now.getTime();
      const diffMinutes = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);
      
      // If in the future and within reasonable range, show relative time
      if (diffMs > 0 && diffDays < 7) {
        if (diffMinutes < 60) {
          return `in ${diffMinutes} minutes`;
        } else if (diffHours < 24) {
          return `in ${diffHours} hours`;
        } else {
          return `in ${diffDays} days`;
        }
      }
      
      // Otherwise show formatted date
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return String(value);
    }
  }
}
