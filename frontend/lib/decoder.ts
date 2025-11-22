import { Interface } from "ethers";
import { loadDescriptor, findFormat, formatValue } from "./erc7730";

export interface DecodedField {
  label: string;
  rawValue: string;
  displayValue: string;
  format: string;
}

export interface DecodedTransaction {
  functionName: string;
  intent: string;
  fields: DecodedField[];
  rawCalldata: string;
}

export async function decodeCalldata(
  calldata: string
): Promise<DecodedTransaction> {
  // Validate calldata format
  if (!calldata || !calldata.startsWith('0x')) {
    throw new Error("Calldata must start with 0x");
  }
  
  // Check if it looks like a transaction hash (32 bytes = 64 hex chars + 0x)
  if (calldata.length === 66) {
    throw new Error("This looks like a transaction hash. Please provide the transaction calldata/input data instead. You can find it in the transaction details under 'Input Data'.");
  }
  
  // Calldata should be at least 10 characters (0x + 4 bytes function selector)
  if (calldata.length < 10) {
    throw new Error("Calldata is too short. It should include at least the function selector (4 bytes).");
  }
  
  const descriptor = await loadDescriptor();
  const contractInterface = new Interface(descriptor.context.contract.abi);

  let decoded;
  try {
    decoded = contractInterface.parseTransaction({ data: calldata });
  } catch (error: any) {
    throw new Error(`Failed to parse calldata: ${error.message || 'Invalid calldata format'}. Make sure you're using the transaction input data, not the transaction hash.`);
  }
  
  if (!decoded) {
    throw new Error("Failed to parse calldata: Unknown error");
  }

  const format = findFormat(descriptor, decoded.name);
  if (!format) {
    throw new Error(`No ERC-7730 format found for function: ${decoded.name}`);
  }

  const fields: DecodedField[] = [];

  for (const fieldConfig of format.fields) {
    const path = fieldConfig.path;
    let value: any;

    if (path.includes(".")) {
      const parts = path.split(".");
      value = decoded.args[parts[0]];
      for (let i = 1; i < parts.length; i++) {
        value = value[parts[i]];
      }
    } else {
      value = decoded.args[path];
    }

    const rawValue = value?.toString() || "N/A";
    const displayValue = formatValue(
      value,
      fieldConfig.format,
      fieldConfig.params
    );

    fields.push({
      label: fieldConfig.label,
      rawValue,
      displayValue,
      format: fieldConfig.format,
    });
  }

  return {
    functionName: decoded.name,
    intent: format.intent,
    fields,
    rawCalldata: calldata,
  };
}

export async function generateExampleCalldata(
  exampleType: string
): Promise<string> {
  const descriptor = await loadDescriptor();
  const contractInterface = new Interface(descriptor.context.contract.abi);

  const deadline = Math.floor(Date.now() / 1000) + 3600;

  switch (exampleType) {
    case 'swap':
      return contractInterface.encodeFunctionData('swapExactTokensForTokens', [
        {
          tokenIn: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          tokenOut: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
          amountIn: BigInt(1000 * 10 ** 6),
          minAmountOut: BigInt(990 * 10 ** 6),
          recipient: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
          deadline,
        },
      ])

    case 'addLiquidity':
      return contractInterface.encodeFunctionData('addLiquidity', [
        {
          tokenA: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          tokenB: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
          amountA: BigInt(5000 * 10 ** 6),
          amountB: BigInt(5000 * 10 ** 6),
          recipient: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
          deadline,
        },
      ])

    case "transfer":
      return contractInterface.encodeFunctionData("simpleTransfer", [
        "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
        BigInt(100 * 10 ** 6),
      ]);

    default:
      throw new Error("Unknown example type");
  }
}
