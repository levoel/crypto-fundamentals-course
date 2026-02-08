// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title VulnerableVault
/// @notice INTENTIONALLY VULNERABLE -- ETH vault with reentrancy vulnerability.
///         Used in SEC-02 to demonstrate single-function reentrancy.
///         DO NOT use in production.
///
/// @dev Vulnerability: external call (Interaction) BEFORE state update (Effect).
///      The CEI (Checks-Effects-Interactions) pattern is violated.
///
///      Attack flow:
///      1. Attacker deposits 1 ETH
///      2. Attacker calls withdraw()
///      3. Vault sends ETH via call{} BEFORE updating balances
///      4. Attacker's receive() re-enters withdraw()
///      5. balances[attacker] is still > 0 -- withdraw succeeds again
///      6. Repeat until vault is drained
contract VulnerableVault {
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
    /// @dev VULNERABLE: sends ETH before updating balance (violates CEI).
    function withdraw() external {
        uint256 balance = balances[msg.sender];
        require(balance > 0, "No balance");

        // BUG: Interaction BEFORE Effect
        // msg.sender.call{} triggers receive()/fallback() on attacker contract
        (bool success, ) = msg.sender.call{value: balance}("");
        require(success, "Transfer failed");

        // This line executes AFTER the entire re-entrant call stack unwinds
        balances[msg.sender] = 0;

        emit Withdraw(msg.sender, balance);
    }

    /// @notice Get vault's total ETH balance.
    function getVaultBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
