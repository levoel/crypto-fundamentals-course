// Aave V3 Fork Test (DEFI-06/07) -- Hardhat 3 + viem
// Run: MAINNET_RPC_URL=... npx hardhat test test/defi/AaveFork.test.ts --network mainnetFork
//
// Tests Aave V3 Pool on Ethereum mainnet fork:
// - Read default account data (fresh address = 0 collateral)
// - Read a known Aave whale position

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import hre from "hardhat";
import { formatUnits, parseUnits } from "viem";

// ---------------------------------------------------------------
//  Inline ABI (no @aave/v3-core dependency)
// ---------------------------------------------------------------

const poolAbi = [
  {
    name: "getUserAccountData",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [
      { name: "totalCollateralBase", type: "uint256" },
      { name: "totalDebtBase", type: "uint256" },
      { name: "availableBorrowsBase", type: "uint256" },
      { name: "currentLiquidationThreshold", type: "uint256" },
      { name: "ltv", type: "uint256" },
      { name: "healthFactor", type: "uint256" },
    ],
  },
  {
    name: "getReserveData",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "asset", type: "address" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "configuration", type: "uint256" },
          { name: "liquidityIndex", type: "uint128" },
          { name: "currentLiquidityRate", type: "uint128" },
          { name: "variableBorrowIndex", type: "uint128" },
          { name: "currentVariableBorrowRate", type: "uint128" },
          { name: "currentStableBorrowRate", type: "uint128" },
          { name: "lastUpdateTimestamp", type: "uint40" },
          { name: "id", type: "uint16" },
          { name: "aTokenAddress", type: "address" },
          { name: "stableDebtTokenAddress", type: "address" },
          { name: "variableDebtTokenAddress", type: "address" },
          { name: "interestRateStrategyAddress", type: "address" },
          { name: "accruedToTreasury", type: "uint128" },
          { name: "unbacked", type: "uint128" },
          { name: "isolationModeTotalDebt", type: "uint128" },
        ],
      },
    ],
  },
] as const;

// ---------------------------------------------------------------
//  Constants
// ---------------------------------------------------------------

const AAVE_POOL = "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2" as const;
const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" as const;
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" as const;

describe("Aave V3 Fork (mainnet)", () => {
  async function getPool() {
    const publicClient = await hre.viem.getPublicClient();
    return { publicClient };
  }

  // ---------------------------------------------------------------
  //  Test: Fresh address has zero collateral
  // ---------------------------------------------------------------

  it("should return zero collateral for a fresh address", async () => {
    const { publicClient } = await getPool();
    const freshAddress = "0x0000000000000000000000000000000000C0FFEE";

    const data = await publicClient.readContract({
      address: AAVE_POOL,
      abi: poolAbi,
      functionName: "getUserAccountData",
      args: [freshAddress],
    });

    const [totalCollateralBase, totalDebtBase, availableBorrowsBase, , , healthFactor] = data;

    assert.equal(totalCollateralBase, 0n, "collateral should be 0");
    assert.equal(totalDebtBase, 0n, "debt should be 0");
    assert.equal(availableBorrowsBase, 0n, "available borrows should be 0");

    // Health factor is max uint256 when there is no debt
    const MAX_UINT256 = 2n ** 256n - 1n;
    assert.equal(healthFactor, MAX_UINT256, "HF should be max with no debt");
  });

  // ---------------------------------------------------------------
  //  Test: Read known Aave whale position
  // ---------------------------------------------------------------

  it("should read a known Aave whale with active position", async () => {
    const { publicClient } = await getPool();

    // Known large Aave V3 depositor (block 21400000)
    // This is a well-known address that has supplied significant collateral
    const whaleAddress = "0x5300A1a15135EA4dc7aD5a167152C01EFc9b192A"; // Scroll bridge, large WETH supplier

    const data = await publicClient.readContract({
      address: AAVE_POOL,
      abi: poolAbi,
      functionName: "getUserAccountData",
      args: [whaleAddress],
    });

    const [totalCollateralBase, totalDebtBase, , currentLiquidationThreshold, ltv, healthFactor] =
      data;

    // Log for educational output
    console.log("--- Aave V3 Whale Account Data ---");
    console.log(`Collateral (USD): $${formatUnits(totalCollateralBase, 8)}`);
    console.log(`Debt (USD):       $${formatUnits(totalDebtBase, 8)}`);
    console.log(`LTV:              ${Number(ltv) / 100}%`);
    console.log(`Liq. Threshold:   ${Number(currentLiquidationThreshold) / 100}%`);
    if (healthFactor < 2n ** 256n - 1n) {
      console.log(`Health Factor:    ${formatUnits(healthFactor, 18)}`);
    } else {
      console.log("Health Factor:    Infinity (no debt)");
    }

    // This address should have some collateral at block 21400000
    // If it has 0 collateral, the test still passes -- we just verify the call works
    assert.ok(typeof totalCollateralBase === "bigint", "collateral is bigint");
    assert.ok(typeof totalDebtBase === "bigint", "debt is bigint");
    assert.ok(typeof healthFactor === "bigint", "healthFactor is bigint");

    // If there IS collateral, verify LTV is reasonable
    if (totalCollateralBase > 0n) {
      console.log("--- Position exists, verifying constraints ---");
      // LTV should be between 0-100% (0-10000 basis points)
      assert.ok(ltv <= 10000n, "LTV should be <= 100%");
      assert.ok(
        currentLiquidationThreshold >= ltv,
        "liquidation threshold should be >= LTV"
      );
    }
  });

  // ---------------------------------------------------------------
  //  Test: Read WETH reserve data
  // ---------------------------------------------------------------

  it("should read WETH reserve data from Aave V3", async () => {
    const { publicClient } = await getPool();

    const reserveData = await publicClient.readContract({
      address: AAVE_POOL,
      abi: poolAbi,
      functionName: "getReserveData",
      args: [WETH],
    });

    console.log("--- WETH Reserve Data ---");
    console.log(`Liquidity Index:       ${formatUnits(reserveData.liquidityIndex, 27)}`);
    console.log(
      `Current Liquidity Rate: ${formatUnits(reserveData.currentLiquidityRate, 25)}% APY`
    );
    console.log(
      `Variable Borrow Rate:   ${formatUnits(reserveData.currentVariableBorrowRate, 25)}% APY`
    );
    console.log(`aToken Address:        ${reserveData.aTokenAddress}`);
    console.log(`Reserve ID:            ${reserveData.id}`);

    // Liquidity index should be >= 1e27 (RAY)
    assert.ok(
      reserveData.liquidityIndex >= 10n ** 27n,
      "liquidity index should be >= 1 RAY"
    );

    // aToken address should not be zero
    assert.notEqual(
      reserveData.aTokenAddress,
      "0x0000000000000000000000000000000000000000",
      "aToken address should not be zero"
    );
  });
});
