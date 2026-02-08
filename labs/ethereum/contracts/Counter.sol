// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title Counter
/// @notice Increment / decrement / reset counter.
///         Demonstrates custom errors, events, and basic testing patterns
///         for ETH-07 (Solidity Patterns & Testing).
contract Counter {
    uint256 public count;

    event CountChanged(uint256 newCount);

    error CounterUnderflow();

    function increment() external {
        count += 1;
        emit CountChanged(count);
    }

    function decrement() external {
        if (count == 0) revert CounterUnderflow();
        count -= 1;
        emit CountChanged(count);
    }

    function reset() external {
        count = 0;
        emit CountChanged(0);
    }
}
