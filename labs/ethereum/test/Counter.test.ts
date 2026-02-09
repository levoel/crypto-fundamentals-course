// Hardhat 3 + viem test for Counter
// Run: npx hardhat test test/Counter.test.ts

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import hre from "hardhat";

describe("Counter", () => {
  async function deployCounter() {
    const connection = await hre.network.connect();
    return connection.viem.deployContract("Counter");
  }

  it("should start at 0", async () => {
    const counter = await deployCounter();
    const count = await counter.read.count();
    assert.equal(count, 0n);
  });

  it("should increment", async () => {
    const counter = await deployCounter();

    await counter.write.increment();
    const count = await counter.read.count();
    assert.equal(count, 1n);
  });

  it("should increment multiple times", async () => {
    const counter = await deployCounter();

    await counter.write.increment();
    await counter.write.increment();
    await counter.write.increment();
    const count = await counter.read.count();
    assert.equal(count, 3n);
  });

  it("should decrement", async () => {
    const counter = await deployCounter();

    await counter.write.increment();
    await counter.write.decrement();
    const count = await counter.read.count();
    assert.equal(count, 0n);
  });

  it("should revert on underflow", async () => {
    const counter = await deployCounter();

    await assert.rejects(
      async () => {
        await counter.write.decrement();
      },
      // Custom error: CounterUnderflow()
      (err: unknown) => {
        assert.ok(err instanceof Error);
        return true;
      }
    );
  });

  it("should reset to 0", async () => {
    const counter = await deployCounter();

    await counter.write.increment();
    await counter.write.increment();
    await counter.write.reset();
    const count = await counter.read.count();
    assert.equal(count, 0n);
  });

  it("should emit CountChanged event on increment", async () => {
    const connection = await hre.network.connect();
    const counter = await connection.viem.deployContract("Counter");
    const publicClient = await connection.viem.getPublicClient();

    const hash = await counter.write.increment();
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    assert.ok(receipt.logs.length > 0, "Expected CountChanged event log");
  });
});
