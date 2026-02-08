// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../contracts/Counter.sol";

contract CounterTest is Test {
    Counter public counter;

    function setUp() public {
        counter = new Counter();
    }

    // ---------------------------------------------------------------
    //  Initial state
    // ---------------------------------------------------------------

    function test_InitialCountIsZero() public view {
        assertEq(counter.count(), 0);
    }

    // ---------------------------------------------------------------
    //  Increment
    // ---------------------------------------------------------------

    function test_Increment() public {
        counter.increment();
        assertEq(counter.count(), 1);
    }

    function test_IncrementMultiple() public {
        counter.increment();
        counter.increment();
        counter.increment();
        assertEq(counter.count(), 3);
    }

    function test_IncrementEmitsCountChanged() public {
        vm.expectEmit(true, true, true, true);
        emit Counter.CountChanged(1);
        counter.increment();
    }

    // ---------------------------------------------------------------
    //  Decrement
    // ---------------------------------------------------------------

    function test_Decrement() public {
        counter.increment();
        counter.decrement();
        assertEq(counter.count(), 0);
    }

    function test_DecrementRevertsOnUnderflow() public {
        vm.expectRevert(Counter.CounterUnderflow.selector);
        counter.decrement();
    }

    function test_DecrementEmitsCountChanged() public {
        counter.increment(); // count = 1
        vm.expectEmit(true, true, true, true);
        emit Counter.CountChanged(0);
        counter.decrement();
    }

    // ---------------------------------------------------------------
    //  Reset
    // ---------------------------------------------------------------

    function test_Reset() public {
        counter.increment();
        counter.increment();
        counter.reset();
        assertEq(counter.count(), 0);
    }

    function test_ResetEmitsCountChanged() public {
        counter.increment();
        vm.expectEmit(true, true, true, true);
        emit Counter.CountChanged(0);
        counter.reset();
    }

    // ---------------------------------------------------------------
    //  Access control (anyone can call)
    // ---------------------------------------------------------------

    function test_AnyoneCanIncrement() public {
        address alice = makeAddr("alice");
        vm.prank(alice);
        counter.increment();
        assertEq(counter.count(), 1);
    }
}
