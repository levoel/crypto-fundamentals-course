// Standalone ethers.js script: Supply ETH to Aave V3 (Anvil fork)
// Usage: npx tsx scripts/defi/supply-aave.ts
//
// Flow: Wrap ETH -> WETH, Approve Aave Pool, Supply WETH, Read account data
//
// Prerequisites:
//   docker compose --profile fork up -d   (Anvil fork on port 8546)

import { ethers } from "ethers";

// ---- Addresses (Ethereum mainnet, used on Anvil fork) ----
const ANVIL_FORK_URL = "http://localhost:8546";
const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const AAVE_POOL = "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2";

// ---- ABI fragments ----
const wethAbi = [
  "function deposit() external payable",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address owner) external view returns (uint256)",
];

const poolAbi = [
  "function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external",
  "function getUserAccountData(address user) external view returns (uint256 totalCollateralBase, uint256 totalDebtBase, uint256 availableBorrowsBase, uint256 currentLiquidationThreshold, uint256 ltv, uint256 healthFactor)",
];

async function main() {
  console.log("=== Aave V3: Supply ETH as WETH (Anvil fork) ===\n");

  // Connect to Anvil fork
  const provider = new ethers.JsonRpcProvider(ANVIL_FORK_URL);
  const signer = await provider.getSigner(0); // Anvil pre-funded account
  const signerAddress = await signer.getAddress();
  console.log(`Signer: ${signerAddress}`);

  const ethBalance = await provider.getBalance(signerAddress);
  console.log(`ETH balance: ${ethers.formatEther(ethBalance)} ETH\n`);

  const supplyAmount = ethers.parseEther("1");

  // 1. Wrap ETH to WETH
  console.log("Step 1: Wrapping 1 ETH -> WETH...");
  const weth = new ethers.Contract(WETH, wethAbi, signer);
  const wrapTx = await weth.deposit({ value: supplyAmount });
  await wrapTx.wait();
  const wethBalance = await weth.balanceOf(signerAddress);
  console.log(`WETH balance: ${ethers.formatEther(wethBalance)} WETH\n`);

  // 2. Approve Aave Pool to spend WETH
  console.log("Step 2: Approving Aave Pool to spend WETH...");
  const approveTx = await weth.approve(AAVE_POOL, supplyAmount);
  await approveTx.wait();
  console.log("Approved!\n");

  // 3. Supply WETH to Aave V3
  console.log("Step 3: Supplying 1 WETH to Aave V3...");
  const pool = new ethers.Contract(AAVE_POOL, poolAbi, signer);
  const supplyTx = await pool.supply(WETH, supplyAmount, signerAddress, 0);
  const receipt = await supplyTx.wait();
  console.log(`Tx hash:  ${receipt.hash}`);
  console.log(`Gas used: ${receipt.gasUsed.toString()}\n`);

  // 4. Read account data
  console.log("Step 4: Reading account data...");
  const data = await pool.getUserAccountData(signerAddress);

  // Aave V3 returns base currency values in USD with 8 decimals
  const totalCollateral = ethers.formatUnits(data[0], 8);
  const totalDebt = ethers.formatUnits(data[1], 8);
  const availableBorrows = ethers.formatUnits(data[2], 8);
  const ltv = Number(data[4]) / 100; // basis points to percentage
  const healthFactor = ethers.formatEther(data[5]);

  console.log(`Total collateral:   $${totalCollateral}`);
  console.log(`Total debt:         $${totalDebt}`);
  console.log(`Available to borrow: $${availableBorrows}`);
  console.log(`LTV:                ${ltv}%`);
  console.log(`Health factor:      ${healthFactor}`);

  console.log("\n=== Supply complete! You can now borrow against your collateral. ===");
}

main().catch((error) => {
  console.error("Error:", error.message || error);
  process.exit(1);
});
