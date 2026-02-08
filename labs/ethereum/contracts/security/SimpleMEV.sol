// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title SimpleMEV -- Frontrunnable Swap Contract for MEV Demonstration
/// @notice This contract is INTENTIONALLY VULNERABLE to frontrunning.
///         It emits detailed events that expose pending trade details,
///         and the swap function has no slippage protection by default.
///
///         Purpose: Demonstrate why MEV exists and how searchers exploit
///         information leaked from the mempool and on-chain events.
///
///         DO NOT USE IN PRODUCTION. Educational only.
///
/// @dev Vulnerabilities (by design):
///      1. SwapRequested event leaks trade direction, size, and sender
///      2. No slippage protection (amountOutMin defaults to 0)
///      3. No deadline parameter (tx can be delayed and executed later)
///      4. Simple constant-product formula without fees
contract SimpleMEV {
    using SafeERC20 for IERC20;

    // ---------------------------------------------------------------
    //  State
    // ---------------------------------------------------------------

    IERC20 public immutable tokenA;
    IERC20 public immutable tokenB;
    uint256 public reserveA;
    uint256 public reserveB;

    // ---------------------------------------------------------------
    //  Events (INTENTIONALLY LEAKY)
    // ---------------------------------------------------------------

    /// @notice VULNERABILITY: This event exposes trade details BEFORE execution.
    ///         In a real scenario, pending transactions in the mempool already
    ///         leak this info, but events make post-execution analysis easy.
    event SwapRequested(
        address indexed trader,
        address indexed tokenIn,
        uint256 amountIn,
        uint256 expectedOut
    );

    /// @notice Emitted after swap completes
    event SwapExecuted(
        address indexed trader,
        address indexed tokenIn,
        uint256 amountIn,
        uint256 amountOut
    );

    /// @notice Emitted when liquidity is seeded
    event LiquiditySeeded(uint256 amountA, uint256 amountB);

    // ---------------------------------------------------------------
    //  Errors
    // ---------------------------------------------------------------

    error ZeroAmount();
    error InvalidToken();
    error NotSeeded();

    // ---------------------------------------------------------------
    //  Constructor
    // ---------------------------------------------------------------

    constructor(address _tokenA, address _tokenB) {
        tokenA = IERC20(_tokenA);
        tokenB = IERC20(_tokenB);
    }

    // ---------------------------------------------------------------
    //  Seed Liquidity (owner only for simplicity)
    // ---------------------------------------------------------------

    /// @notice Seed initial liquidity for the pool
    /// @param amountA Amount of tokenA to deposit
    /// @param amountB Amount of tokenB to deposit
    function seedLiquidity(uint256 amountA, uint256 amountB) external {
        if (amountA == 0 || amountB == 0) revert ZeroAmount();

        tokenA.safeTransferFrom(msg.sender, address(this), amountA);
        tokenB.safeTransferFrom(msg.sender, address(this), amountB);

        reserveA += amountA;
        reserveB += amountB;

        emit LiquiditySeeded(amountA, amountB);
    }

    // ---------------------------------------------------------------
    //  Swap (NO SLIPPAGE PROTECTION)
    // ---------------------------------------------------------------

    /// @notice Swap tokenIn for the other token using xy=k formula.
    /// @dev VULNERABLE:
    ///      - No amountOutMin parameter = no slippage protection
    ///      - No deadline = can be executed at any future time
    ///      - SwapRequested event leaks trade details
    ///      These are the exact vulnerabilities that MEV searchers exploit.
    /// @param tokenIn Address of the token to sell
    /// @param amountIn Amount to sell
    /// @return amountOut Amount received
    function swap(
        address tokenIn,
        uint256 amountIn
    ) external returns (uint256 amountOut) {
        if (amountIn == 0) revert ZeroAmount();
        if (reserveA == 0 || reserveB == 0) revert NotSeeded();

        bool isTokenA = (tokenIn == address(tokenA));
        if (!isTokenA && tokenIn != address(tokenB)) revert InvalidToken();

        (uint256 reserveIn, uint256 reserveOut) = isTokenA
            ? (reserveA, reserveB)
            : (reserveB, reserveA);

        // Constant product formula (no fee for simplicity)
        // amountOut = reserveOut * amountIn / (reserveIn + amountIn)
        amountOut = (reserveOut * amountIn) / (reserveIn + amountIn);

        // Emit BEFORE execution (leaks trade info)
        emit SwapRequested(msg.sender, tokenIn, amountIn, amountOut);

        // Execute swap
        if (isTokenA) {
            tokenA.safeTransferFrom(msg.sender, address(this), amountIn);
            tokenB.safeTransfer(msg.sender, amountOut);
            reserveA += amountIn;
            reserveB -= amountOut;
        } else {
            tokenB.safeTransferFrom(msg.sender, address(this), amountIn);
            tokenA.safeTransfer(msg.sender, amountOut);
            reserveB += amountIn;
            reserveA -= amountOut;
        }

        emit SwapExecuted(msg.sender, tokenIn, amountIn, amountOut);
    }

    // ---------------------------------------------------------------
    //  View Helpers
    // ---------------------------------------------------------------

    /// @notice Get current spot price of tokenA in terms of tokenB
    /// @return price Scaled by 1e18
    function getSpotPrice() external view returns (uint256 price) {
        if (reserveA == 0) return 0;
        price = (reserveB * 1e18) / reserveA;
    }

    /// @notice Preview swap output without executing
    /// @param tokenIn Token to sell
    /// @param amountIn Amount to sell
    /// @return amountOut Expected output
    function getAmountOut(
        address tokenIn,
        uint256 amountIn
    ) external view returns (uint256 amountOut) {
        bool isTokenA = (tokenIn == address(tokenA));
        if (!isTokenA && tokenIn != address(tokenB)) revert InvalidToken();

        (uint256 reserveIn, uint256 reserveOut) = isTokenA
            ? (reserveA, reserveB)
            : (reserveB, reserveA);

        amountOut = (reserveOut * amountIn) / (reserveIn + amountIn);
    }
}
