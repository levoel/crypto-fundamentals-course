// Standalone ethers.js v6 deployment script for CourseToken (ERC-20)
// NOT a Hardhat task — connects directly to Anvil RPC.
// Run: npx tsx scripts/deploy-token.ts

import { ethers } from "ethers";
import { readFileSync } from "fs";

const provider = new ethers.JsonRpcProvider("http://localhost:8545");
const signer = await provider.getSigner(0); // Anvil account 0

console.log(`Deployer: ${await signer.getAddress()}`);

// Read compiled artifact from Hardhat artifacts directory
const artifact = JSON.parse(
  readFileSync("./artifacts/contracts/CourseToken.sol/CourseToken.json", "utf8")
);

const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);
const token = await factory.deploy(ethers.parseEther("1000000"));
await token.waitForDeployment();

const address = await token.getAddress();
const totalSupply = await token.totalSupply();

console.log(`CourseToken deployed to: ${address}`);
console.log(`Total supply: ${ethers.formatEther(totalSupply)} CRST`);
console.log(`\nInteract with cast:`);
console.log(`  cast call ${address} "name()(string)" --rpc-url http://localhost:8545`);
console.log(`  cast call ${address} "totalSupply()(uint256)" --rpc-url http://localhost:8545`);
