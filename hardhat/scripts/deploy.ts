import { network } from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("🚀 Starting deployment with Hardhat 3...");

  // Connettiti alla rete e ottieni ethers
  const { ethers } = await network.connect();

  const [deployer] = await ethers.getSigners();
  console.log("📍 Deploying contracts with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");

  console.log("\n📦 Deploying DemoRouter...");
  const DemoRouter = await ethers.getContractFactory("DemoRouter");
  const demoRouter = await DemoRouter.deploy();
  await demoRouter.waitForDeployment();

  const address = await demoRouter.getAddress();
  console.log("✅ DemoRouter deployed to:", address);

  const deploymentInfo = {
    network: "localhost",
    chainId: 31337,
    contract: "DemoRouter",
    address: address,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber(),
  };

  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(deploymentsDir, "DemoRouter.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\n📄 Deployment info saved to deployments/DemoRouter.json");
  console.log("\n🎉 Deployment complete!");
  console.log("━".repeat(60));
  console.log("Contract Address:", address);
  console.log("Network:", "Hardhat Local Node (Chain ID: 31337)");
  console.log("Mainnet Fork:", "Enabled");
  console.log("━".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
