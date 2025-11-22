export interface ERC7730Field {
  path: string;
  label: string;
  format?: string;
  params?: Record<string, any>;
  nested?: string;
}

export interface ERC7730Message {
  intent: string;
  fields: ERC7730Field[];
}

export interface ERC7730FormatDefinition {
  type: string;
  denomination?: string;
  prefix?: string;
  encoding?: string;
}

export interface ERC7730NestedDefinition {
  fields: ERC7730Field[];
}

export interface ERC7730Descriptor {
  context?: {
    contract: {
      abi: any[];
      deployments: Array<{
        chainId: string;
        address: string;
      }>;
    };
  };
  metadata?: {
    owner?: string;
    info?: {
      legalName?: string;
      lastUpdate?: string;
      url?: string;
    };
    constants?: {
      [key: string]: string;
    };
  };
  messages?: {
    [functionName: string]: ERC7730Message;
  };
  display?: {
    formats?: {
      [name: string]: ERC7730FormatDefinition | ERC7730Message;
    };
    definitions?: {
      [name: string]: ERC7730NestedDefinition;
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
