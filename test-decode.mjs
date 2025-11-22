import { Interface } from "ethers";
import fs from "fs";

// Carica il descriptor
const descriptor = JSON.parse(
  fs.readFileSync("./frontend/public/descriptors/DemoRouter.json", "utf8")
);

const contractInterface = new Interface(descriptor.context.contract.abi);

// Il calldata che hai testato
const calldata =
  "0xb7760c8f000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa960450000000000000000000000000000000000000000000000000000000005f5e100";

console.log("Testing calldata decoding...\n");

try {
  const decoded = contractInterface.parseTransaction({ data: calldata });
  console.log("✅ Successfully decoded!");
  console.log("Function:", decoded.name);
  console.log("Arguments:", decoded.args);
  console.log("\nArgs details:");
  decoded.args.forEach((arg, i) => {
    console.log(`  [${i}]:`, arg.toString());
  });
} catch (error) {
  console.error("❌ Error:", error.message);
}
