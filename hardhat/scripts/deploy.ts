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
  const networkInfo = await ethers.provider.getNetwork();
  const chainId = networkInfo.chainId;
  const networkName = networkInfo.name || process.env.HARDHAT_NETWORK || "unknown";
  
  console.log("📍 Deploying contracts with account:", deployer.address);
  console.log("🌐 Network:", networkName);
  console.log("🔗 Chain ID:", chainId.toString());

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");

  if (balance === 0n) {
    console.error("❌ Account has no balance. Please fund the deployer account.");
    process.exit(1);
  }

  console.log("\n📦 Deploying DemoRouter...");
  const DemoRouter = await ethers.getContractFactory("DemoRouter");
  const demoRouter = await DemoRouter.deploy();
  
  console.log("⏳ Waiting for deployment transaction...");
  await demoRouter.waitForDeployment();

  const address = await demoRouter.getAddress();
  console.log("✅ DemoRouter deployed to:", address);

  const deploymentInfo = {
    network: networkName,
    chainId: Number(chainId),
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

  const filename = networkName === "localhost" || networkName === "hardhat" 
    ? "DemoRouter.json" 
    : `DemoRouter-${networkName}.json`;

  fs.writeFileSync(
    path.join(deploymentsDir, filename),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log(`\n📄 Deployment info saved to deployments/${filename}`);
  console.log("\n🎉 Deployment complete!");
  console.log("━".repeat(60));
  console.log("Contract Address:", address);
  console.log("Network:", networkName);
  console.log("Chain ID:", chainId.toString());
  console.log("━".repeat(60));
  
  if (networkName === "arbitrum" || networkName === "arbitrumSepolia") {
    console.log("\n📝 To verify on Arbiscan:");
    console.log(`npx hardhat verify --network ${networkName} ${address}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
