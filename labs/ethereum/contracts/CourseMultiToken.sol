// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title CourseMultiToken
/// @notice ERC-1155 multi-token: fungible (GOLD, SILVER) and non-fungible (BADGE)
///         in a single contract. Used in ETH-09 for ERC-1155 comparison.
contract CourseMultiToken is ERC1155, Ownable {
    uint256 public constant GOLD = 0;
    uint256 public constant SILVER = 1;
    uint256 public constant BADGE = 2;

    constructor() ERC1155("https://example.com/api/token/{id}.json") Ownable(msg.sender) {
        _mint(msg.sender, GOLD, 1000, "");
        _mint(msg.sender, SILVER, 5000, "");
        _mint(msg.sender, BADGE, 1, "");
    }

    /// @notice Mint tokens of a given ID. Only the contract owner can mint.
    function mint(address to, uint256 id, uint256 amount) public onlyOwner {
        _mint(to, id, amount, "");
    }

    /// @notice Batch-mint multiple token types. Only the contract owner can mint.
    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts) public onlyOwner {
        _mintBatch(to, ids, amounts, "");
    }
}
