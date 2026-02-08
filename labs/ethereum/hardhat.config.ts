// Hardhat 3 ESM Configuration
// Requires Node.js >= 22.10.0
// Docs: https://hardhat.org/docs

import { defineConfig } from "hardhat/config";
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
  },
});
