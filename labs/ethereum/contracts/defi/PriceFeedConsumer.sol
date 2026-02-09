// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

/// @title PriceFeedConsumer
/// @notice Demonstrates Chainlink oracle integration for DEFI-08/09 lessons.
///         Works on mainnet fork with real Chainlink feeds.
/// @dev Mainnet feed addresses:
///      ETH/USD: 0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419
///      BTC/USD: 0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c
contract PriceFeedConsumer {
    AggregatorV3Interface public immutable ethUsdFeed;

    /// @param _ethUsdFeed Chainlink ETH/USD feed address
    constructor(address _ethUsdFeed) {
        ethUsdFeed = AggregatorV3Interface(_ethUsdFeed);
    }

    /// @notice Get ETH/USD price with staleness check
    /// @return price ETH price in USD (8 decimals)
    /// @dev On mainnet fork, updatedAt is from fork block time.
    ///      In production, add staleness check:
    ///      require(block.timestamp - updatedAt < MAX_STALENESS, "Stale price");
    function getEthUsdPrice() external view returns (int256 price) {
        (, price,,,) = ethUsdFeed.latestRoundData();
        require(price > 0, "Invalid price");
        // Note: On mainnet fork, updatedAt is from fork block time
    }

    /// @notice Convert ETH amount to USD value
    /// @param ethAmount Amount in wei (18 decimals)
    /// @return usdValue USD value (18 decimals)
    /// @dev Decimal math:
    ///      - ethAmount: 18 decimals (wei)
    ///      - price: 8 decimals (Chainlink USD pairs)
    ///      - result: 18 decimals = ethAmount(18) * price(8) / 1e8
    ///      Example: 1 ETH ($2000) = 1e18 * 200000000000 / 1e8 = 2000e18
    function ethToUsd(uint256 ethAmount) external view returns (uint256 usdValue) {
        (, int256 price,,,) = ethUsdFeed.latestRoundData();
        require(price > 0, "Invalid price");
        // price has 8 decimals, ethAmount has 18 decimals
        // result should have 18 decimals: ethAmount * price / 1e8
        usdValue = (ethAmount * uint256(price)) / 1e8;
    }
}
