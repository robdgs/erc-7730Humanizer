import { defineConfig } from "hardhat/config";
import hardhatEthers from "@nomicfoundation/hardhat-ethers";

export default defineConfig({
  plugins: [hardhatEthers],
  solidity: "0.8.24",

  networks: {
    hardhat: {
      type: "edr-simulated",
      chainId: 31337,
      forking: {
        url: process.env.MAINNET_RPC_URL || "https://eth.llamarpc.com",
      },
    },

    localhost: {
      type: "http",
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
  },
});
