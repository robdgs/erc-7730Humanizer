import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ERC7730Descriptor {
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
    formats: Record<string, any>;
  };
}

async function generateDescriptor() {
  console.log("🔧 Generating ERC-7730 descriptor with Hardhat 3...");

  const artifactPath = path.join(
    __dirname,
    "../artifacts/contracts/DemoRouter.sol/DemoRouter.json"
  );

  if (!fs.existsSync(artifactPath)) {
    console.error("❌ Contract artifact not found. Run 'npm run compile' first.");
    process.exit(1);
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  const abi = artifact.abi;

  let deployedAddress = "0x0000000000000000000000000000000000000000";
  const deploymentPath = path.join(__dirname, "../deployments/DemoRouter.json");
  
  if (fs.existsSync(deploymentPath)) {
    const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
    deployedAddress = deployment.address;
  }

  const descriptor: ERC7730Descriptor = {
    context: {
      contract: {
        abi: abi,
        deployments: [
          {
            chainId: "eip155:31337",
            address: deployedAddress,
          },
        ],
      },
    },
    metadata: {
      owner: "Demo Team",
      info: {
        legalName: "DemoRouter Protocol",
        lastUpdate: new Date().toISOString(),
        url: "https://github.com/demo/erc7730-decoder",
      },
    },
    display: {
      formats: {
        "swapExactTokensForTokens(tuple)": {
          intent: "Swap tokens",
          fields: [
            {
              path: "params.tokenIn",
              label: "Token In",
              format: "addressName",
            },
            {
              path: "params.tokenOut",
              label: "Token Out",
              format: "addressName",
            },
            {
              path: "params.amountIn",
              label: "Amount In",
              format: "tokenAmount",
              params: {
                tokenPath: "params.tokenIn",
              },
            },
            {
              path: "params.minAmountOut",
              label: "Minimum Amount Out",
              format: "tokenAmount",
              params: {
                tokenPath: "params.tokenOut",
              },
            },
            {
              path: "params.recipient",
              label: "Recipient",
              format: "addressName",
            },
            {
              path: "params.deadline",
              label: "Deadline",
              format: "timestamp",
            },
          ],
        },
        "addLiquidity(tuple)": {
          intent: "Add liquidity",
          fields: [
            {
              path: "params.tokenA",
              label: "Token A",
              format: "addressName",
            },
            {
              path: "params.tokenB",
              label: "Token B",
              format: "addressName",
            },
            {
              path: "params.amountA",
              label: "Amount A",
              format: "tokenAmount",
              params: {
                tokenPath: "params.tokenA",
              },
            },
            {
              path: "params.amountB",
              label: "Amount B",
              format: "tokenAmount",
              params: {
                tokenPath: "params.tokenB",
              },
            },
            {
              path: "params.recipient",
              label: "Recipient",
              format: "addressName",
            },
          ],
        },
        "removeLiquidity(address,address,uint256,uint256,uint256,address,uint256)": {
          intent: "Remove liquidity",
          fields: [
            {
              path: "tokenA",
              label: "Token A",
              format: "addressName",
            },
            {
              path: "tokenB",
              label: "Token B",
              format: "addressName",
            },
            {
              path: "liquidity",
              label: "Liquidity Amount",
              format: "amount",
            },
            {
              path: "recipient",
              label: "Recipient",
              format: "addressName",
            },
          ],
        },
        "simpleTransfer(address,address,uint256)": {
          intent: "Transfer tokens",
          fields: [
            {
              path: "token",
              label: "Token",
              format: "addressName",
            },
            {
              path: "recipient",
              label: "To",
              format: "addressName",
            },
            {
              path: "amount",
              label: "Amount",
              format: "tokenAmount",
              params: {
                tokenPath: "token",
              },
            },
          ],
        },
      },
    },
  };

  const descriptorsDir = path.join(__dirname, "../descriptors");
  if (!fs.existsSync(descriptorsDir)) {
    fs.mkdirSync(descriptorsDir, { recursive: true });
  }

  const outputPath = path.join(descriptorsDir, "DemoRouter.json");
  fs.writeFileSync(outputPath, JSON.stringify(descriptor, null, 2));

  const frontendPublicDir = path.join(__dirname, "../../frontend/public/descriptors");
  if (!fs.existsSync(frontendPublicDir)) {
    fs.mkdirSync(frontendPublicDir, { recursive: true });
  }
  fs.writeFileSync(
    path.join(frontendPublicDir, "DemoRouter.json"),
    JSON.stringify(descriptor, null, 2)
  );

  console.log("✅ ERC-7730 descriptor generated successfully!");
  console.log("📄 Saved to:", outputPath);
  console.log("📄 Copied to frontend:", frontendPublicDir);
  console.log("\nDescriptor includes:");
  console.log("- Contract ABI");
  console.log("- Deployment address:", deployedAddress);
  console.log("- Human-readable display formats");
  console.log("- Field labels and formatting rules");
}

generateDescriptor()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Generation failed:", error);
    process.exit(1);
  });
