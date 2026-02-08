// Hardhat 3 + viem test for CourseNFT (ERC-721)
// Run: npx hardhat test test/CourseNFT.test.ts

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import hre from "hardhat";
import { getAddress } from "viem";

describe("CourseNFT", () => {
  async function deployNFT() {
    const nft = await hre.viem.deployContract("CourseNFT");
    const publicClient = await hre.viem.getPublicClient();
    const [deployer, alice, bob] = await hre.viem.getWalletClients();
    return { nft, publicClient, deployer, alice, bob };
  }

  it("should mint an NFT with URI", async () => {
    const { nft, deployer } = await deployNFT();

    await nft.write.mint([
      getAddress(deployer.account.address),
      "ipfs://QmTest1",
    ]);

    const owner = await nft.read.ownerOf([0n]);
    assert.equal(
      getAddress(owner),
      getAddress(deployer.account.address)
    );
  });

  it("should return correct tokenURI", async () => {
    const { nft, deployer } = await deployNFT();

    await nft.write.mint([
      getAddress(deployer.account.address),
      "ipfs://QmTest1",
    ]);

    const uri = await nft.read.tokenURI([0n]);
    assert.equal(uri, "ipfs://QmTest1");
  });

  it("should revert when non-owner mints", async () => {
    const { nft, alice } = await deployNFT();

    const aliceNFT = await hre.viem.getContractAt("CourseNFT", nft.address, {
      client: { wallet: alice },
    });

    await assert.rejects(
      async () => {
        await aliceNFT.write.mint([
          getAddress(alice.account.address),
          "ipfs://QmUnauthorized",
        ]);
      },
      (err: unknown) => {
        assert.ok(err instanceof Error);
        return true;
      }
    );
  });

  it("should transfer NFT between accounts", async () => {
    const { nft, deployer, alice } = await deployNFT();

    // Mint to deployer
    await nft.write.mint([
      getAddress(deployer.account.address),
      "ipfs://QmTest1",
    ]);

    // Transfer to alice
    await nft.write.transferFrom([
      getAddress(deployer.account.address),
      getAddress(alice.account.address),
      0n,
    ]);

    const newOwner = await nft.read.ownerOf([0n]);
    assert.equal(
      getAddress(newOwner),
      getAddress(alice.account.address)
    );
  });
});
