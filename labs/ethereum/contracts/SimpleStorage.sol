// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title SimpleStorage
/// @notice A minimal contract to demonstrate Solidity storage, events,
///         and the compile-test-deploy workflow (ETH-06 / ETH-07).
contract SimpleStorage {
    // ---------------------------------------------------------------
    //  State  (slot 0)
    // ---------------------------------------------------------------
    uint256 private _value;

    // ---------------------------------------------------------------
    //  Events
    // ---------------------------------------------------------------
    event ValueChanged(uint256 newValue);

    // ---------------------------------------------------------------
    //  External functions
    // ---------------------------------------------------------------

    /// @notice Store a new value, overwriting the previous one.
    function store(uint256 newValue) external {
        _value = newValue;
        emit ValueChanged(newValue);
    }

    /// @notice Retrieve the current stored value.
    function retrieve() external view returns (uint256) {
        return _value;
    }
}
