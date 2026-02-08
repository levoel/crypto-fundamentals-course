// Hardhat 3 ESM Configuration
// Requires Node.js >= 22.10.0
// Docs: https://hardhat.org/docs

import { defineConfig, configVariable } from "hardhat/config";
import HardhatToolboxViem from "@nomicfoundation/hardhat-toolbox-viem";

export default defineConfig({
  solidity: "0.8.28",
  plugins: [HardhatToolboxViem],
  networks: {
    // Connect to Anvil Docker container
    anvil: {
      type: "http",
      url: "http://localhost:8545",
    },
    // Mainnet fork for DeFi testing (LAB-05)
    mainnetFork: {
      type: "edr-simulated",
      chainType: "l1",
      forking: {
        url: configVariable("MAINNET_RPC_URL"),
        blockNumber: 21400000,
      },
    },
  },
});
