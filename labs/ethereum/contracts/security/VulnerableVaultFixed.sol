// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title VulnerableVaultFixed
/// @notice Fixed version of VulnerableVault with CEI pattern + ReentrancyGuard.
///         Used in SEC-02 to demonstrate reentrancy defenses.
///
/// @dev Two layers of protection:
///      1. CEI pattern: state update (Effect) BEFORE external call (Interaction)
///      2. ReentrancyGuard: nonReentrant modifier as defense-in-depth
///
///      Even if an attacker re-enters withdraw(), the check will fail because
///      balances[msg.sender] is already 0 (CEI), AND the nonReentrant modifier
///      will revert (defense-in-depth).
contract VulnerableVaultFixed is ReentrancyGuard {
    mapping(address => uint256) public balances;

    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);

    /// @notice Deposit ETH into the vault.
    function deposit() external payable {
        require(msg.value > 0, "Must deposit > 0");
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    /// @notice Withdraw all deposited ETH.
    /// @dev FIXED: follows CEI pattern + nonReentrant modifier.
    function withdraw() external nonReentrant {
        uint256 balance = balances[msg.sender];
        require(balance > 0, "No balance");

        // EFFECT: update state BEFORE interaction
        balances[msg.sender] = 0;

        // INTERACTION: external call AFTER state update
        (bool success, ) = msg.sender.call{value: balance}("");
        require(success, "Transfer failed");

        emit Withdraw(msg.sender, balance);
    }

    /// @notice Get vault's total ETH balance.
    function getVaultBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
