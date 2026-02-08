// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title IUniswapV2Pair (minimal interface for oracle reading)
/// @notice Inline interface -- only getReserves() needed for spot price oracle.
///         Avoids npm package dependency and Solidity version conflicts.
interface IUniswapV2Pair {
    function getReserves()
        external
        view
        returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);
}

/// @title OracleManipulable -- Spot Price Oracle (INTENTIONALLY VULNERABLE)
/// @notice Reads Uniswap V2 reserves to calculate spot price.
///         This is the #1 oracle vulnerability in DeFi -- spot price can be
///         manipulated within a single transaction via flash loans.
///
///         DO NOT USE IN PRODUCTION. Educational only.
///
/// @dev Root vulnerability: getReserves() returns CURRENT reserves,
///      which can be moved by large swaps in the same block.
///      Correct approach: Chainlink price feed or Uniswap V2 TWAP.
contract OracleManipulable {
    // ---------------------------------------------------------------
    //  State
    // ---------------------------------------------------------------

    /// @notice The Uniswap V2 pair used as price source
    IUniswapV2Pair public immutable pair;

    /// @notice Whether token0 is the base token (denominator in price)
    bool public immutable token0IsBase;

    // ---------------------------------------------------------------
    //  Events
    // ---------------------------------------------------------------

    /// @notice Emitted when price is queried (for test observability)
    event PriceQueried(uint256 price, uint112 reserve0, uint112 reserve1);

    // ---------------------------------------------------------------
    //  Constructor
    // ---------------------------------------------------------------

    /// @param _pair Address of the Uniswap V2 pair
    /// @param _token0IsBase If true, price = reserve1 / reserve0 (token1 per token0)
    ///                      If false, price = reserve0 / reserve1 (token0 per token1)
    constructor(address _pair, bool _token0IsBase) {
        pair = IUniswapV2Pair(_pair);
        token0IsBase = _token0IsBase;
    }

    // ---------------------------------------------------------------
    //  Price Query (VULNERABLE)
    // ---------------------------------------------------------------

    /// @notice Get current spot price from Uniswap V2 reserves.
    /// @dev VULNERABLE: This reads getReserves() which returns current
    ///      on-chain reserves. A flash loan can move reserves within
    ///      a single transaction, making this price unreliable.
    ///
    ///      Attack vector:
    ///      1. Flash loan large amount of token0
    ///      2. Swap on Uniswap (moves reserves)
    ///      3. Call getPrice() -- returns manipulated price
    ///      4. Exploit the manipulated price (liquidation, borrow)
    ///      5. Swap back and repay flash loan
    ///
    /// @return price The spot price scaled by 1e18
    function getPrice() external returns (uint256 price) {
        (uint112 reserve0, uint112 reserve1, ) = pair.getReserves();

        if (token0IsBase) {
            // price = reserve1 / reserve0 (how many token1 per 1 token0)
            price = (uint256(reserve1) * 1e18) / uint256(reserve0);
        } else {
            // price = reserve0 / reserve1 (how many token0 per 1 token1)
            price = (uint256(reserve0) * 1e18) / uint256(reserve1);
        }

        emit PriceQueried(price, reserve0, reserve1);
    }

    /// @notice View version of getPrice for off-chain queries
    /// @return price The spot price scaled by 1e18
    function getPriceView() external view returns (uint256 price) {
        (uint112 reserve0, uint112 reserve1, ) = pair.getReserves();

        if (token0IsBase) {
            price = (uint256(reserve1) * 1e18) / uint256(reserve0);
        } else {
            price = (uint256(reserve0) * 1e18) / uint256(reserve1);
        }
    }
}
