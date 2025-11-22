import fs from "fs";
import path from "path";

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

function validateDescriptor(): ValidationResult {
  console.log("🔍 Validating ERC-7730 descriptor...");
  
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
  };

  const descriptorPath = path.join(__dirname, "../descriptors/DemoRouter.json");
  
  if (!fs.existsSync(descriptorPath)) {
    result.valid = false;
    result.errors.push("Descriptor file not found at descriptors/DemoRouter.json");
    return result;
  }

  let descriptor: any;
  try {
    descriptor = JSON.parse(fs.readFileSync(descriptorPath, "utf8"));
  } catch (error) {
    result.valid = false;
    result.errors.push("Failed to parse descriptor JSON");
    return result;
  }

  if (!descriptor.context) {
    result.errors.push("Missing 'context' field");
    result.valid = false;
  }

  if (!descriptor.context?.contract) {
    result.errors.push("Missing 'context.contract' field");
    result.valid = false;
  }

  if (!descriptor.context?.contract?.abi || !Array.isArray(descriptor.context.contract.abi)) {
    result.errors.push("Missing or invalid 'context.contract.abi' field");
    result.valid = false;
  }

  if (!descriptor.context?.contract?.deployments || !Array.isArray(descriptor.context.contract.deployments)) {
    result.errors.push("Missing or invalid 'context.contract.deployments' field");
    result.valid = false;
  } else {
    descriptor.context.contract.deployments.forEach((deployment: any, idx: number) => {
      if (!deployment.chainId) {
        result.errors.push(`Deployment ${idx}: missing 'chainId'`);
        result.valid = false;
      }
      if (!deployment.address) {
        result.errors.push(`Deployment ${idx}: missing 'address'`);
        result.valid = false;
      }
      if (deployment.address === "0x0000000000000000000000000000000000000000") {
        result.warnings.push(`Deployment ${idx}: using zero address (contract not deployed?)`);
      }
    });
  }

  if (!descriptor.metadata) {
    result.errors.push("Missing 'metadata' field");
    result.valid = false;
  }

  if (!descriptor.display) {
    result.errors.push("Missing 'display' field");
    result.valid = false;
  }

  if (!descriptor.display?.formats || typeof descriptor.display.formats !== "object") {
    result.errors.push("Missing or invalid 'display.formats' field");
    result.valid = false;
  }

  if (descriptor.context?.contract?.abi) {
    const functions = descriptor.context.contract.abi.filter(
      (item: any) => item.type === "function" && item.stateMutability !== "view"
    );
    
    const formattedFunctions = Object.keys(descriptor.display?.formats || {});
    
    functions.forEach((func: any) => {
      const hasFormat = formattedFunctions.some(sig => sig.includes(func.name));
      if (!hasFormat) {
        result.warnings.push(`Function '${func.name}' has no display format defined`);
      }
    });
  }

  return result;
}

const result = validateDescriptor();

console.log("\n" + "=".repeat(60));
if (result.valid) {
  console.log("✅ Descriptor is valid!");
} else {
  console.log("❌ Descriptor validation failed!");
}
console.log("=".repeat(60));

if (result.errors.length > 0) {
  console.log("\n🚨 Errors:");
  result.errors.forEach((error) => console.log(`  - ${error}`));
}

if (result.warnings.length > 0) {
  console.log("\n⚠️  Warnings:");
  result.warnings.forEach((warning) => console.log(`  - ${warning}`));
}

if (result.valid && result.warnings.length === 0) {
  console.log("\n✨ No issues found!");
}

console.log("");

if (!result.valid) {
  process.exit(1);
}

process.exit(0);
