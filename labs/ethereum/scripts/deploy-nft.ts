// Standalone ethers.js v6 deployment script for CourseNFT (ERC-721)
// NOT a Hardhat task — connects directly to Anvil RPC.
// Run: npx tsx scripts/deploy-nft.ts

import { ethers } from "ethers";
import { readFileSync } from "fs";

const provider = new ethers.JsonRpcProvider("http://localhost:8545");
const signer = await provider.getSigner(0); // Anvil account 0
const deployerAddress = await signer.getAddress();

console.log(`Deployer: ${deployerAddress}`);

// Read compiled artifact from Hardhat artifacts directory
const artifact = JSON.parse(
  readFileSync("./artifacts/contracts/CourseNFT.sol/CourseNFT.json", "utf8")
);

const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);
const nft = await factory.deploy();
await nft.waitForDeployment();

const address = await nft.getAddress();
console.log(`CourseNFT deployed to: ${address}`);

// Mint 3 example NFTs
const uris = [
  "ipfs://QmExampleCert1/metadata.json",
  "ipfs://QmExampleCert2/metadata.json",
  "ipfs://QmExampleCert3/metadata.json",
];

for (let i = 0; i < uris.length; i++) {
  const tx = await nft.mint(deployerAddress, uris[i]);
  await tx.wait();
  console.log(`Minted token #${i}: ${uris[i]}`);
}

console.log(`\nInteract with cast:`);
console.log(`  cast call ${address} "name()(string)" --rpc-url http://localhost:8545`);
console.log(`  cast call ${address} "ownerOf(uint256)(address)" 0 --rpc-url http://localhost:8545`);
console.log(`  cast call ${address} "tokenURI(uint256)(string)" 0 --rpc-url http://localhost:8545`);
