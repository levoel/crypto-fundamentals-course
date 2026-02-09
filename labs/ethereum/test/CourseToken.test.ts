// Hardhat 3 + viem test for CourseToken (ERC-20)
// Run: npx hardhat test test/CourseToken.test.ts

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import hre from "hardhat";
import { parseEther, getAddress } from "viem";

describe("CourseToken", () => {
  async function deployToken() {
    const connection = await hre.network.connect();
    const token = await connection.viem.deployContract("CourseToken", [
      parseEther("1000000"),
    ]);
    const publicClient = await connection.viem.getPublicClient();
    const [deployer, alice, bob] = await connection.viem.getWalletClients();
    return { connection, token, publicClient, deployer, alice, bob };
  }

  it("should have correct name and symbol", async () => {
    const { token } = await deployToken();

    const name = await token.read.name();
    const symbol = await token.read.symbol();

    assert.equal(name, "CourseToken");
    assert.equal(symbol, "CRST");
  });

  it("should mint initial supply to deployer", async () => {
    const { token, deployer } = await deployToken();

    const totalSupply = await token.read.totalSupply();
    const balance = await token.read.balanceOf([
      getAddress(deployer.account.address),
    ]);

    assert.equal(totalSupply, parseEther("1000000"));
    assert.equal(balance, parseEther("1000000"));
  });

  it("should transfer tokens", async () => {
    const { token, alice } = await deployToken();

    await token.write.transfer([
      getAddress(alice.account.address),
      parseEther("100"),
    ]);

    const balance = await token.read.balanceOf([
      getAddress(alice.account.address),
    ]);
    assert.equal(balance, parseEther("100"));
  });

  it("should approve and transferFrom", async () => {
    const { connection, token, deployer, alice, bob } = await deployToken();

    // Deployer transfers 100 to alice
    await token.write.transfer([
      getAddress(alice.account.address),
      parseEther("100"),
    ]);

    // Alice approves bob to spend 50
    const aliceToken = await connection.viem.getContractAt(
      "CourseToken",
      token.address,
      { client: { wallet: alice } }
    );
    await aliceToken.write.approve([
      getAddress(bob.account.address),
      parseEther("50"),
    ]);

    // Bob calls transferFrom
    const bobToken = await connection.viem.getContractAt(
      "CourseToken",
      token.address,
      { client: { wallet: bob } }
    );
    await bobToken.write.transferFrom([
      getAddress(alice.account.address),
      getAddress(bob.account.address),
      parseEther("50"),
    ]);

    const bobBalance = await token.read.balanceOf([
      getAddress(bob.account.address),
    ]);
    const aliceBalance = await token.read.balanceOf([
      getAddress(alice.account.address),
    ]);
    assert.equal(bobBalance, parseEther("50"));
    assert.equal(aliceBalance, parseEther("50"));
  });

  it("should revert on transfer exceeding balance", async () => {
    const { connection, token, alice, bob } = await deployToken();

    const aliceToken = await connection.viem.getContractAt(
      "CourseToken",
      token.address,
      { client: { wallet: alice } }
    );

    await assert.rejects(
      async () => {
        await aliceToken.write.transfer([
          getAddress(bob.account.address),
          parseEther("1"),
        ]);
      },
      (err: unknown) => {
        assert.ok(err instanceof Error);
        return true;
      }
    );
  });
});
