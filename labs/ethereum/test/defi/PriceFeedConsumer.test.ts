// Hardhat 3 + viem fork test for PriceFeedConsumer
// Run: npx hardhat test test/defi/PriceFeedConsumer.test.ts --network mainnetFork
// Requires MAINNET_RPC_URL in .env (Alchemy / Infura)

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import hre from "hardhat";
import { parseEther, formatEther } from "viem";

// Chainlink ETH/USD mainnet feed address
const ETH_USD_FEED = "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419";

describe("PriceFeedConsumer (mainnet fork)", () => {
  async function deployPriceFeedConsumer() {
    return hre.viem.deployContract("PriceFeedConsumer", [ETH_USD_FEED]);
  }

  it("should read ETH/USD price from Chainlink", async () => {
    const consumer = await deployPriceFeedConsumer();

    const price = await consumer.read.getEthUsdPrice();

    // Price should be positive
    assert.ok(price > 0n, "Price should be positive");

    // Price is in 8 decimals, so $100 = 10_000_000_000, $100,000 = 10_000_000_000_000
    // Reasonable ETH price: $100 to $100,000
    const priceNum = Number(price) / 1e8;
    assert.ok(priceNum > 100, `Price $${priceNum} should be > $100`);
    assert.ok(priceNum < 100_000, `Price $${priceNum} should be < $100,000`);
  });

  it("should convert ETH to USD", async () => {
    const consumer = await deployPriceFeedConsumer();

    // Convert 1 ETH to USD
    const oneEth = parseEther("1");
    const usdValue = await consumer.read.ethToUsd([oneEth]);

    // usdValue has 18 decimals, so format it
    const usdNum = Number(formatEther(usdValue));

    // 1 ETH should be worth $100 to $100,000
    assert.ok(usdNum > 100, `1 ETH = $${usdNum} should be > $100`);
    assert.ok(usdNum < 100_000, `1 ETH = $${usdNum} should be < $100,000`);
  });

  it("should convert fractional ETH amounts", async () => {
    const consumer = await deployPriceFeedConsumer();

    // Convert 0.5 ETH
    const halfEth = parseEther("0.5");
    const halfUsd = await consumer.read.ethToUsd([halfEth]);

    // Convert 1 ETH for comparison
    const oneEth = parseEther("1");
    const fullUsd = await consumer.read.ethToUsd([oneEth]);

    // 0.5 ETH should be exactly half of 1 ETH (integer division may differ by 1)
    const diff = fullUsd / 2n - halfUsd;
    assert.ok(diff >= 0n && diff <= 1n, "0.5 ETH value should be half of 1 ETH value");
  });
});
