// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {ERC20Votes} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import {Nonces} from "@openzeppelin/contracts/utils/Nonces.sol";

/// @title GovernanceToken -- ERC20 with voting power delegation
/// @notice Demonstrates ERC20Votes extension for DAO governance.
///         Uses timestamp-based clock (IERC6372) for intuitive governance timing.
///
/// @dev Key concepts:
///      - ERC20Votes requires explicit delegation to activate voting power
///      - balanceOf(user) can be 1M while getVotes(user) is 0 without delegation
///      - Checkpoints track historical voting power for snapshot-based governance
///      - clock() returns block.timestamp (not block.number) for human-readable delays
contract GovernanceToken is ERC20, ERC20Permit, ERC20Votes {
    constructor()
        ERC20("Governance Token", "GOV")
        ERC20Permit("Governance Token")
    {
        _mint(msg.sender, 1_000_000 * 1e18);
    }

    // --- Required overrides for multiple inheritance ---

    /// @dev Chains ERC20 base _update and ERC20Votes checkpoint update.
    ///      super._update() follows C3 linearization: ERC20Votes._update -> ERC20._update
    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Votes)
    {
        super._update(from, to, value);
    }

    /// @dev Resolves nonces conflict between ERC20Permit and Nonces
    function nonces(address owner)
        public
        view
        override(ERC20Permit, Nonces)
        returns (uint256)
    {
        return super.nonces(owner);
    }

    // --- Timestamp-based clock (IERC6372) ---

    /// @dev Returns block.timestamp as uint48 for timestamp-based governance
    function clock() public view override returns (uint48) {
        return uint48(block.timestamp);
    }

    /// @dev Declares timestamp mode so Governor uses seconds for delays
    function CLOCK_MODE() public pure override returns (string memory) {
        return "mode=timestamp";
    }
}
