// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

/// @title CourseToken
/// @notice ERC-20 fungible token with ERC-2612 permit (gasless approvals).
///         Used in ETH-08 lesson to demonstrate the ERC-20 standard.
contract CourseToken is ERC20, ERC20Permit {
    /// @param initialSupply Total supply minted to deployer (in wei, 18 decimals).
    constructor(uint256 initialSupply)
        ERC20("CourseToken", "CRST")
        ERC20Permit("CourseToken")
    {
        _mint(msg.sender, initialSupply);
    }
}
