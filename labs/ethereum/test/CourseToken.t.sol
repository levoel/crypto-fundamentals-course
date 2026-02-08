// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../contracts/CourseToken.sol";

contract CourseTokenTest is Test {
    CourseToken public token;
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");

    function setUp() public {
        token = new CourseToken(1_000_000 * 1e18);
    }

    // ---------------------------------------------------------------
    //  Initial state
    // ---------------------------------------------------------------

    function test_InitialSupply() public view {
        assertEq(token.totalSupply(), 1_000_000 * 1e18);
        assertEq(token.balanceOf(address(this)), 1_000_000 * 1e18);
    }

    function test_NameAndSymbol() public view {
        assertEq(token.name(), "CourseToken");
        assertEq(token.symbol(), "CRST");
    }

    // ---------------------------------------------------------------
    //  Transfer
    // ---------------------------------------------------------------

    function test_Transfer() public {
        token.transfer(alice, 100 * 1e18);
        assertEq(token.balanceOf(alice), 100 * 1e18);
        assertEq(token.balanceOf(address(this)), 999_900 * 1e18);
    }

    // ---------------------------------------------------------------
    //  Approve & TransferFrom
    // ---------------------------------------------------------------

    function test_ApproveAndTransferFrom() public {
        token.transfer(alice, 100 * 1e18);

        vm.prank(alice);
        token.approve(bob, 50 * 1e18);

        vm.prank(bob);
        token.transferFrom(alice, bob, 50 * 1e18);

        assertEq(token.balanceOf(bob), 50 * 1e18);
        assertEq(token.balanceOf(alice), 50 * 1e18);
    }

    // ---------------------------------------------------------------
    //  Reverts
    // ---------------------------------------------------------------

    function test_RevertWhen_TransferExceedsBalance() public {
        vm.prank(alice);
        vm.expectRevert();
        token.transfer(bob, 1);
    }

    function test_RevertWhen_TransferFromExceedsAllowance() public {
        token.transfer(alice, 100 * 1e18);

        vm.prank(alice);
        token.approve(bob, 10 * 1e18);

        vm.prank(bob);
        vm.expectRevert();
        token.transferFrom(alice, bob, 50 * 1e18);
    }
}
