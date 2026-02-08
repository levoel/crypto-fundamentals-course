// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title SimpleDEX -- Minimal Constant-Product AMM for Teaching
/// @notice Demonstrates xy=k mechanics: addLiquidity, removeLiquidity, swap.
///         NOT for production use. No reentrancy guard, no flash loan protection,
///         no oracle, no governance. Educational only.
/// @dev Uses the same integer math as Uniswap V2:
///      amountOut = reserveOut * amountIn * 997 / (reserveIn * 1000 + amountIn * 997)
contract SimpleDEX {
    using SafeERC20 for IERC20;

    // ---------------------------------------------------------------
    //  State
    // ---------------------------------------------------------------

    IERC20 public immutable tokenA;
    IERC20 public immutable tokenB;

    uint256 public reserveA;
    uint256 public reserveB;
    uint256 public totalLiquidity;
    mapping(address => uint256) public liquidity;

    // ---------------------------------------------------------------
    //  Constants
    // ---------------------------------------------------------------

    uint256 public constant FEE_NUMERATOR = 3; // 0.3% fee
    uint256 public constant FEE_DENOMINATOR = 1000;
    uint256 public constant MINIMUM_LIQUIDITY = 1000;

    // ---------------------------------------------------------------
    //  Events
    // ---------------------------------------------------------------

    event LiquidityAdded(
        address indexed provider,
        uint256 amountA,
        uint256 amountB,
        uint256 liquidityMinted
    );

    event LiquidityRemoved(
        address indexed provider,
        uint256 amountA,
        uint256 amountB,
        uint256 liquidityBurned
    );

    event Swap(
        address indexed trader,
        address indexed tokenIn,
        uint256 amountIn,
        uint256 amountOut
    );

    // ---------------------------------------------------------------
    //  Errors
    // ---------------------------------------------------------------

    error ZeroAmount();
    error InsufficientLiquidity();
    error InvalidToken();
    error InsufficientOutput();

    // ---------------------------------------------------------------
    //  Constructor
    // ---------------------------------------------------------------

    constructor(address _tokenA, address _tokenB) {
        tokenA = IERC20(_tokenA);
        tokenB = IERC20(_tokenB);
    }

    // ---------------------------------------------------------------
    //  Add Liquidity
    // ---------------------------------------------------------------

    /// @notice Provide liquidity to the pool.
    /// @dev First provider: liquidity = sqrt(amountA * amountB) - MINIMUM_LIQUIDITY.
    ///      Subsequent: liquidity = min(amountA * totalLiquidity / reserveA,
    ///                                  amountB * totalLiquidity / reserveB).
    /// @param amountA Amount of tokenA to deposit
    /// @param amountB Amount of tokenB to deposit
    /// @return liquidityMinted Amount of LP tokens minted
    function addLiquidity(
        uint256 amountA,
        uint256 amountB
    ) external returns (uint256 liquidityMinted) {
        if (amountA == 0 || amountB == 0) revert ZeroAmount();

        tokenA.safeTransferFrom(msg.sender, address(this), amountA);
        tokenB.safeTransferFrom(msg.sender, address(this), amountB);

        if (totalLiquidity == 0) {
            // First provider: geometric mean minus minimum liquidity
            // Locking MINIMUM_LIQUIDITY prevents manipulation of LP token value
            liquidityMinted = sqrt(amountA * amountB) - MINIMUM_LIQUIDITY;
            totalLiquidity = liquidityMinted + MINIMUM_LIQUIDITY;
            // MINIMUM_LIQUIDITY is permanently locked (sent to address(0))
        } else {
            // Subsequent providers: min of the two ratios
            // This ensures the provider matches the current pool ratio
            uint256 liquidityA = (amountA * totalLiquidity) / reserveA;
            uint256 liquidityB = (amountB * totalLiquidity) / reserveB;
            liquidityMinted = min(liquidityA, liquidityB);
        }

        if (liquidityMinted == 0) revert InsufficientLiquidity();

        liquidity[msg.sender] += liquidityMinted;
        reserveA += amountA;
        reserveB += amountB;

        emit LiquidityAdded(msg.sender, amountA, amountB, liquidityMinted);
    }

    // ---------------------------------------------------------------
    //  Remove Liquidity
    // ---------------------------------------------------------------

    /// @notice Withdraw proportional share of the pool.
    /// @param liquidityAmount Amount of LP tokens to burn
    /// @return amountA Amount of tokenA returned
    /// @return amountB Amount of tokenB returned
    function removeLiquidity(
        uint256 liquidityAmount
    ) external returns (uint256 amountA, uint256 amountB) {
        if (liquidityAmount == 0) revert ZeroAmount();
        if (liquidity[msg.sender] < liquidityAmount) revert InsufficientLiquidity();

        // Proportional share of reserves
        amountA = (liquidityAmount * reserveA) / totalLiquidity;
        amountB = (liquidityAmount * reserveB) / totalLiquidity;

        liquidity[msg.sender] -= liquidityAmount;
        totalLiquidity -= liquidityAmount;
        reserveA -= amountA;
        reserveB -= amountB;

        tokenA.safeTransfer(msg.sender, amountA);
        tokenB.safeTransfer(msg.sender, amountB);

        emit LiquidityRemoved(msg.sender, amountA, amountB, liquidityAmount);
    }

    // ---------------------------------------------------------------
    //  Swap
    // ---------------------------------------------------------------

    /// @notice Swap tokenIn for the other token using constant-product formula.
    /// @dev Uses Uniswap V2 integer math:
    ///      amountOut = reserveOut * amountIn * 997 / (reserveIn * 1000 + amountIn * 997)
    /// @param tokenIn Address of the token being sold
    /// @param amountIn Amount of tokenIn to sell
    /// @param amountOutMin Minimum acceptable output (slippage protection)
    /// @return amountOut Actual output amount
    function swap(
        address tokenIn,
        uint256 amountIn,
        uint256 amountOutMin
    ) external returns (uint256 amountOut) {
        if (amountIn == 0) revert ZeroAmount();

        bool isTokenA = (tokenIn == address(tokenA));
        bool isTokenB = (tokenIn == address(tokenB));
        if (!isTokenA && !isTokenB) revert InvalidToken();

        (uint256 reserveIn, uint256 reserveOut) = isTokenA
            ? (reserveA, reserveB)
            : (reserveB, reserveA);

        // Uniswap V2 integer formula: multiply by 997 to apply 0.3% fee
        // amountOut = reserveOut * amountInWithFee / (reserveIn * 1000 + amountInWithFee)
        uint256 amountInWithFee = amountIn * (FEE_DENOMINATOR - FEE_NUMERATOR); // * 997
        uint256 numerator = reserveOut * amountInWithFee;
        uint256 denominator = (reserveIn * FEE_DENOMINATOR) + amountInWithFee;
        amountOut = numerator / denominator;

        if (amountOut < amountOutMin) revert InsufficientOutput();

        // Transfer tokens
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

        emit Swap(msg.sender, tokenIn, amountIn, amountOut);
    }

    // ---------------------------------------------------------------
    //  Helpers
    // ---------------------------------------------------------------

    /// @notice Integer square root (Babylonian method)
    /// @dev Used for first-provider LP token calculation: sqrt(amountA * amountB)
    function sqrt(uint256 x) internal pure returns (uint256 y) {
        if (x == 0) return 0;
        uint256 z = (x + 1) / 2;
        y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
    }

    /// @notice Returns the smaller of two values
    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }
}
