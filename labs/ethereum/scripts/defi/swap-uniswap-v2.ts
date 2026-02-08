// Standalone ethers.js script: Swap ETH for DAI on Uniswap V2 (Anvil fork)
// Usage: npx tsx scripts/defi/swap-uniswap-v2.ts
//
// Prerequisites:
//   docker compose --profile fork up -d   (Anvil fork on port 8546)

import { ethers } from "ethers";

// ---- Addresses (Ethereum mainnet, used on Anvil fork) ----
const ANVIL_FORK_URL = "http://localhost:8546";
const UNISWAP_V2_ROUTER = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";

// ---- ABI fragments (only functions we need) ----
const routerAbi = [
  "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)",
  "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)",
];

const erc20Abi = [
  "function balanceOf(address owner) external view returns (uint256)",
];

async function main() {
  console.log("=== Uniswap V2: Swap ETH -> DAI (Anvil fork) ===\n");

  // Connect to Anvil fork
  const provider = new ethers.JsonRpcProvider(ANVIL_FORK_URL);
  const signer = await provider.getSigner(0); // Anvil pre-funded account
  const signerAddress = await signer.getAddress();
  console.log(`Signer: ${signerAddress}`);

  const ethBalance = await provider.getBalance(signerAddress);
  console.log(`ETH balance: ${ethers.formatEther(ethBalance)} ETH\n`);

  // Router contract
  const router = new ethers.Contract(UNISWAP_V2_ROUTER, routerAbi, signer);

  // 1. Get expected output for 1 ETH -> DAI
  const amountIn = ethers.parseEther("1");
  const path = [WETH, DAI];
  const amounts = await router.getAmountsOut(amountIn, path);
  const expectedDai = amounts[1];
  console.log(`Input:    1 ETH`);
  console.log(`Expected: ${ethers.formatUnits(expectedDai, 18)} DAI`);

  // 2. Calculate minimum output with 1% slippage tolerance
  const minOut = (expectedDai * 99n) / 100n;
  console.log(`Min out:  ${ethers.formatUnits(minOut, 18)} DAI (1% slippage)\n`);

  // 3. Execute swap
  const deadline = Math.floor(Date.now() / 1000) + 300; // 5 minutes
  console.log("Executing swapExactETHForTokens...");
  const tx = await router.swapExactETHForTokens(
    minOut,
    path,
    signerAddress,
    deadline,
    { value: amountIn }
  );
  const receipt = await tx.wait();
  console.log(`Tx hash:  ${receipt.hash}`);
  console.log(`Gas used: ${receipt.gasUsed.toString()}\n`);

  // 4. Check DAI balance
  const dai = new ethers.Contract(DAI, erc20Abi, provider);
  const daiBalance = await dai.balanceOf(signerAddress);
  console.log(`DAI balance: ${ethers.formatUnits(daiBalance, 18)} DAI`);

  const ethBalanceAfter = await provider.getBalance(signerAddress);
  console.log(`ETH balance: ${ethers.formatEther(ethBalanceAfter)} ETH`);

  console.log("\n=== Swap complete! ===");
}

main().catch((error) => {
  console.error("Error:", error.message || error);
  process.exit(1);
});
