// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title UnsafeTokenFixed
/// @notice Fixed version of UnsafeToken with Ownable access control.
///         Used in SEC-04 to demonstrate proper access control patterns.
///
/// @dev Fixes applied:
///      1. mint() restricted to onlyOwner via Ownable modifier
///      2. burn() only allows msg.sender to burn their OWN tokens
///      3. Ownable(initialOwner) sets deployer as initial owner
contract UnsafeTokenFixed is ERC20, Ownable {
    constructor(address initialOwner)
        ERC20("UnsafeTokenFixed", "SAFETK")
        Ownable(initialOwner)
    {
        _mint(initialOwner, 1_000_000 * 1e18);
    }

    /// @notice Mint tokens to any address.
    /// @dev FIXED: only the contract owner can mint new tokens.
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    /// @notice Burn tokens from the caller's balance.
    /// @dev FIXED: msg.sender can only burn their own tokens.
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
}
