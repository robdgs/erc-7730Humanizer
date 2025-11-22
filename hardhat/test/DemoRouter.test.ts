import { expect } from "chai";
import hre from "hardhat";

describe("DemoRouter - Hardhat 3 Tests", function () {
  let demoRouter: any;
  let owner: any;
  let user: any;

  beforeEach(async function () {
    console.log("🧪 Setting up test environment with Hardhat 3...");
    
    [owner, user] = await hre.ethers.getSigners();
    
    const DemoRouter = await hre.ethers.getContractFactory("DemoRouter");
    demoRouter = await DemoRouter.deploy();
    await demoRouter.waitForDeployment();
    
    console.log("✅ DemoRouter deployed for testing");
  });

  describe("Deployment", function () {
    it("Should deploy successfully with Hardhat 3", async function () {
      const address = await demoRouter.getAddress();
      expect(address).to.be.properAddress;
      console.log("✓ Contract address is valid:", address);
    });

    it("Should set the correct owner", async function () {
      expect(await demoRouter.owner()).to.equal(owner.address);
      console.log("✓ Owner is correctly set");
    });
  });

  describe("Simple Transfer", function () {
    it("Should encode simpleTransfer calldata correctly", async function () {
      const token = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
      const recipient = user.address;
      const amount = hre.ethers.parseUnits("100", 6);

      const calldata = demoRouter.interface.encodeFunctionData("simpleTransfer", [
        token,
        recipient,
        amount,
      ]);

      expect(calldata).to.be.a("string");
      expect(calldata).to.have.lengthOf.at.least(10);
      console.log("✓ Calldata generated:", calldata.slice(0, 20) + "...");

      const decoded = demoRouter.interface.decodeFunctionData("simpleTransfer", calldata);
      expect(decoded[0]).to.equal(token);
      expect(decoded[1]).to.equal(recipient);
      expect(decoded[2]).to.equal(amount);
      console.log("✓ Calldata decoded successfully");
    });
  });

  describe("Swap Function", function () {
    it("Should encode swapExactTokensForTokens calldata correctly", async function () {
      const params = {
        tokenIn: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        tokenOut: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        amountIn: hre.ethers.parseUnits("1000", 6),
        minAmountOut: hre.ethers.parseUnits("990", 6),
        recipient: user.address,
        deadline: Math.floor(Date.now() / 1000) + 3600,
      };

      const calldata = demoRouter.interface.encodeFunctionData(
        "swapExactTokensForTokens",
        [params]
      );

      expect(calldata).to.be.a("string");
      console.log("✓ Swap calldata generated:", calldata.slice(0, 20) + "...");

      const decoded = demoRouter.interface.decodeFunctionData(
        "swapExactTokensForTokens",
        calldata
      );
      expect(decoded[0].tokenIn).to.equal(params.tokenIn);
      expect(decoded[0].amountIn).to.equal(params.amountIn);
      console.log("✓ Swap calldata decoded successfully");
    });
  });

  describe("Liquidity Functions", function () {
    it("Should encode addLiquidity calldata correctly", async function () {
      const params = {
        tokenA: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        tokenB: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        amountA: hre.ethers.parseUnits("1000", 6),
        amountB: hre.ethers.parseUnits("1000", 6),
        recipient: user.address,
        deadline: Math.floor(Date.now() / 1000) + 3600,
      };

      const calldata = demoRouter.interface.encodeFunctionData("addLiquidity", [params]);

      expect(calldata).to.be.a("string");
      console.log("✓ AddLiquidity calldata generated");

      const decoded = demoRouter.interface.decodeFunctionData("addLiquidity", calldata);
      expect(decoded[0].tokenA).to.equal(params.tokenA);
      expect(decoded[0].amountA).to.equal(params.amountA);
      console.log("✓ AddLiquidity calldata decoded successfully");
    });

    it("Should encode removeLiquidity calldata correctly", async function () {
      const tokenA = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
      const tokenB = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
      const liquidity = hre.ethers.parseEther("100");
      const minAmountA = hre.ethers.parseUnits("50", 6);
      const minAmountB = hre.ethers.parseUnits("50", 6);
      const recipient = user.address;
      const deadline = Math.floor(Date.now() / 1000) + 3600;

      const calldata = demoRouter.interface.encodeFunctionData("removeLiquidity", [
        tokenA,
        tokenB,
        liquidity,
        minAmountA,
        minAmountB,
        recipient,
        deadline,
      ]);

      expect(calldata).to.be.a("string");
      console.log("✓ RemoveLiquidity calldata generated");

      const decoded = demoRouter.interface.decodeFunctionData("removeLiquidity", calldata);
      expect(decoded[0]).to.equal(tokenA);
      expect(decoded[2]).to.equal(liquidity);
      console.log("✓ RemoveLiquidity calldata decoded successfully");
    });
  });

  describe("Hardhat 3 Features", function () {
    it("Should demonstrate Hardhat 3 network capabilities", async function () {
      const network = await hre.ethers.provider.getNetwork();
      console.log("✓ Network:", network.name);
      console.log("✓ Chain ID:", network.chainId.toString());

      const blockNumber = await hre.ethers.provider.getBlockNumber();
      console.log("✓ Current block:", blockNumber);

      const balance = await hre.ethers.provider.getBalance(owner.address);
      console.log("✓ Owner balance:", hre.ethers.formatEther(balance), "ETH");

      expect(network.chainId).to.equal(31337n);
    });
  });
});
