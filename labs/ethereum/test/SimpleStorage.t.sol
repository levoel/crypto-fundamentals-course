// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../contracts/SimpleStorage.sol";

contract SimpleStorageTest is Test {
    SimpleStorage public store;

    function setUp() public {
        store = new SimpleStorage();
    }

    // ---------------------------------------------------------------
    //  Basic behavior
    // ---------------------------------------------------------------

    function test_InitialValueIsZero() public view {
        assertEq(store.retrieve(), 0);
    }

    function test_StoreValue() public {
        store.store(42);
        assertEq(store.retrieve(), 42);
    }

    function test_StoreOverwritesPrevious() public {
        store.store(1);
        store.store(2);
        assertEq(store.retrieve(), 2);
    }

    // ---------------------------------------------------------------
    //  Events
    // ---------------------------------------------------------------

    function test_EmitsValueChanged() public {
        vm.expectEmit(true, true, true, true);
        emit SimpleStorage.ValueChanged(42);
        store.store(42);
    }

    // ---------------------------------------------------------------
    //  Fuzz testing
    // ---------------------------------------------------------------

    function testFuzz_StoreAnyValue(uint256 value) public {
        store.store(value);
        assertEq(store.retrieve(), value);
    }

    // ---------------------------------------------------------------
    //  Access from different addresses (vm.prank)
    // ---------------------------------------------------------------

    function test_AnyoneCanStore() public {
        address alice = makeAddr("alice");

        vm.prank(alice);
        store.store(99);
        assertEq(store.retrieve(), 99);
    }
}
