// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title UnsafeToken
/// @notice INTENTIONALLY VULNERABLE -- ERC-20 with public mint/burn (no access control).
///         Used in SEC-04 to demonstrate access control vulnerabilities.
///         DO NOT use in production.
///
/// @dev Vulnerability: mint() and burn() are public functions without any access
///      control modifiers. Anyone can:
///      1. Mint unlimited tokens to themselves
///      2. Burn tokens from ANY address (using _burn with arbitrary 'from')
///
///      Attack scenario:
///      - Attacker calls mint(attacker, 1_000_000e18) to create tokens
///      - Attacker dumps tokens on DEX, crashing the price
///      - Alternatively, attacker burns other users' tokens
contract UnsafeToken is ERC20 {
    constructor() ERC20("UnsafeToken", "UNSAFE") {
        _mint(msg.sender, 1_000_000 * 1e18);
    }

    /// @notice Mint tokens to any address.
    /// @dev VULNERABLE: no access control -- anyone can call this.
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }

    /// @notice Burn tokens from any address.
    /// @dev VULNERABLE: no access control AND burns from arbitrary address.
    function burn(address from, uint256 amount) public {
        _burn(from, amount);
    }
}
