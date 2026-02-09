// Hardhat 3 + viem fork test for Uniswap V2
// Run: npx hardhat test test/defi/UniswapV2Fork.test.ts --network mainnetFork
// Requires MAINNET_RPC_URL env variable

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import hre from "hardhat";
import { parseEther, formatEther, getAddress } from "viem";

// ---------------------------------------------------------------
//  Inline ABI fragments -- only the functions we need
// ---------------------------------------------------------------

const ROUTER_ABI = [
  {
    name: "swapExactETHForTokens",
    type: "function",
    stateMutability: "payable",
    inputs: [
      { name: "amountOutMin", type: "uint256" },
      { name: "path", type: "address[]" },
      { name: "to", type: "address" },
      { name: "deadline", type: "uint256" },
    ],
    outputs: [{ name: "amounts", type: "uint256[]" }],
  },
  {
    name: "getAmountsOut",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "amountIn", type: "uint256" },
      { name: "path", type: "address[]" },
    ],
    outputs: [{ name: "amounts", type: "uint256[]" }],
  },
] as const;

const ERC20_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

// ---------------------------------------------------------------
//  Mainnet addresses
// ---------------------------------------------------------------

const UNISWAP_V2_ROUTER = getAddress(
  "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
);
const WETH = getAddress("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2");
const DAI = getAddress("0x6B175474E89094C44Da98b954EedeAC495271d0F");

// ---------------------------------------------------------------
//  Tests
// ---------------------------------------------------------------

describe("Uniswap V2 Fork", () => {
  it("should swap ETH for DAI on mainnet fork", async () => {
    const connection = await hre.network.connect();
    const publicClient = await connection.viem.getPublicClient();
    const [walletClient] = await connection.viem.getWalletClients();
    const trader = walletClient.account.address;

    // Get expected output for 1 ETH
    const expectedAmounts = await publicClient.readContract({
      address: UNISWAP_V2_ROUTER,
      abi: ROUTER_ABI,
      functionName: "getAmountsOut",
      args: [parseEther("1"), [WETH, DAI]],
    });

    const expectedDAI = expectedAmounts[1];
    // 1% slippage tolerance
    const minOut = (expectedDAI * 99n) / 100n;

    // Execute swap
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 300);
    const hash = await walletClient.writeContract({
      address: UNISWAP_V2_ROUTER,
      abi: ROUTER_ABI,
      functionName: "swapExactETHForTokens",
      args: [minOut, [WETH, DAI], trader, deadline],
      value: parseEther("1"),
    });

    await publicClient.waitForTransactionReceipt({ hash });

    // Verify DAI balance
    const daiBalance = await publicClient.readContract({
      address: DAI,
      abi: ERC20_ABI,
      functionName: "balanceOf",
      args: [trader],
    });

    assert.ok(daiBalance > 0n, "Trader should have DAI after swap");
    assert.ok(daiBalance >= minOut, "Should receive at least minOut");

    console.log(`DAI received for 1 ETH: ${formatEther(daiBalance)}`);
  });

  it("should show price impact for large trades", async () => {
    const connection = await hre.network.connect();
    const publicClient = await connection.viem.getPublicClient();

    // Small trade: 0.01 ETH
    const smallAmounts = await publicClient.readContract({
      address: UNISWAP_V2_ROUTER,
      abi: ROUTER_ABI,
      functionName: "getAmountsOut",
      args: [parseEther("0.01"), [WETH, DAI]],
    });

    // Large trade: 100 ETH
    const largeAmounts = await publicClient.readContract({
      address: UNISWAP_V2_ROUTER,
      abi: ROUTER_ABI,
      functionName: "getAmountsOut",
      args: [parseEther("100"), [WETH, DAI]],
    });

    // Price per ETH: DAI output / ETH input (scaled)
    const smallPricePerETH = (smallAmounts[1] * parseEther("1")) / parseEther("0.01");
    const largePricePerETH = (largeAmounts[1] * parseEther("1")) / parseEther("100");

    // Large trade should get worse price (lower DAI per ETH)
    assert.ok(
      smallPricePerETH > largePricePerETH,
      "Large trade should have worse price due to price impact"
    );

    console.log(`Small trade (0.01 ETH) price: ${formatEther(smallPricePerETH)} DAI/ETH`);
    console.log(`Large trade (100 ETH) price: ${formatEther(largePricePerETH)} DAI/ETH`);

    const impactBps = ((smallPricePerETH - largePricePerETH) * 10000n) / smallPricePerETH;
    console.log(`Price impact: ${impactBps} bps`);
    assert.ok(impactBps > 0n, "Price impact should be positive");
  });
});
