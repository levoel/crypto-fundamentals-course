// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../contracts/CourseNFT.sol";

contract CourseNFTTest is Test {
    CourseNFT public nft;
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");

    function setUp() public {
        nft = new CourseNFT();
    }

    // ---------------------------------------------------------------
    //  Minting
    // ---------------------------------------------------------------

    function test_MintByOwner() public {
        nft.mint(alice, "ipfs://QmTest1");
        assertEq(nft.ownerOf(0), alice);
    }

    function test_TokenURI() public {
        nft.mint(alice, "ipfs://QmTest1");
        assertEq(nft.tokenURI(0), "ipfs://QmTest1");
    }

    function test_AutoIncrementTokenId() public {
        nft.mint(alice, "ipfs://QmTest1");
        nft.mint(bob, "ipfs://QmTest2");

        assertEq(nft.ownerOf(0), alice);
        assertEq(nft.ownerOf(1), bob);
    }

    // ---------------------------------------------------------------
    //  Access control
    // ---------------------------------------------------------------

    function test_RevertWhen_NonOwnerMints() public {
        vm.prank(alice);
        vm.expectRevert();
        nft.mint(alice, "ipfs://QmUnauthorized");
    }

    // ---------------------------------------------------------------
    //  Transfers
    // ---------------------------------------------------------------

    function test_TransferNFT() public {
        nft.mint(alice, "ipfs://QmTest1");

        vm.prank(alice);
        nft.transferFrom(alice, bob, 0);

        assertEq(nft.ownerOf(0), bob);
    }

    // ---------------------------------------------------------------
    //  Balance tracking
    // ---------------------------------------------------------------

    function test_BalanceOfAfterMint() public {
        nft.mint(alice, "ipfs://QmTest1");
        nft.mint(alice, "ipfs://QmTest2");

        assertEq(nft.balanceOf(alice), 2);
    }
}
