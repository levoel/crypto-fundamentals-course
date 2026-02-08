// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title Treasury -- Simple treasury controlled by governance timelock
/// @notice Holds ETH and allows releases via governance proposals.
///         Ownership is transferred to TimelockController so only
///         governance-approved proposals can release funds.
contract Treasury is Ownable {
    event Released(address indexed to, uint256 amount);

    constructor() Ownable(msg.sender) {}

    /// @dev Only callable by owner (timelock), releases ETH to recipient
    function release(address payable to, uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "Insufficient balance");
        to.transfer(amount);
        emit Released(to, amount);
    }

    receive() external payable {}
}
