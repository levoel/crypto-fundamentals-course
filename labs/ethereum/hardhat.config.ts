// Hardhat 3 ESM Configuration
// Requires Node.js >= 22.10.0
// Docs: https://hardhat.org/docs

import { HardhatUserConfig } from "hardhat/config";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    // Connect to Anvil Docker container
    anvil: {
      url: "http://localhost:8545",
    },
  },
};

export default config;
