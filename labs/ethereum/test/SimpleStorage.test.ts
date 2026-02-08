// Hardhat 3 + viem test for SimpleStorage
// Run: npx hardhat test test/SimpleStorage.test.ts

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import hre from "hardhat";

describe("SimpleStorage", () => {
  it("should start with value 0", async () => {
    const contract = await hre.viem.deployContract("SimpleStorage");
    const value = await contract.read.retrieve();
    assert.equal(value, 0n);
  });

  it("should store and retrieve a value", async () => {
    const contract = await hre.viem.deployContract("SimpleStorage");

    await contract.write.store([42n]);
    const value = await contract.read.retrieve();
    assert.equal(value, 42n);
  });

  it("should overwrite the previous value", async () => {
    const contract = await hre.viem.deployContract("SimpleStorage");

    await contract.write.store([1n]);
    await contract.write.store([2n]);
    const value = await contract.read.retrieve();
    assert.equal(value, 2n);
  });

  it("should emit ValueChanged event", async () => {
    const contract = await hre.viem.deployContract("SimpleStorage");
    const publicClient = await hre.viem.getPublicClient();

    const hash = await contract.write.store([42n]);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    // Check that logs contain the event
    assert.ok(receipt.logs.length > 0, "Expected at least one log (ValueChanged)");
  });
});
