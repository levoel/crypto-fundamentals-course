// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../../contracts/security/OracleManipulable.sol";

// ---------------------------------------------------------------
//  Mock ERC20 for testing
// ---------------------------------------------------------------

contract MockERC20 is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

// ---------------------------------------------------------------
//  MockPair: Simplified Uniswap V2 pair for oracle testing
// ---------------------------------------------------------------

/// @notice Minimal mock of IUniswapV2Pair with swap functionality.
///         Implements getReserves() and swap to demonstrate oracle manipulation.
contract MockPair {
    address public token0;
    address public token1;
    uint112 public reserve0;
    uint112 public reserve1;

    constructor(address _token0, address _token1) {
        token0 = _token0;
        token1 = _token1;
    }

    function seedLiquidity(uint112 amount0, uint112 amount1) external {
        IERC20(token0).transferFrom(msg.sender, address(this), amount0);
        IERC20(token1).transferFrom(msg.sender, address(this), amount1);
        reserve0 += amount0;
        reserve1 += amount1;
    }

    function getReserves() external view returns (uint112, uint112, uint32) {
        return (reserve0, reserve1, uint32(block.timestamp));
    }

    /// @notice Swap tokenIn for the other token. Constant product formula.
    function swap(address tokenIn, uint256 amountIn) external returns (uint256 amountOut) {
        bool isToken0 = (tokenIn == token0);
        require(isToken0 || tokenIn == token1, "Invalid token");

        (uint256 rIn, uint256 rOut) = isToken0
            ? (uint256(reserve0), uint256(reserve1))
            : (uint256(reserve1), uint256(reserve0));

        amountOut = (rOut * amountIn) / (rIn + amountIn);

        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);
        address tokenOut = isToken0 ? token1 : token0;
        IERC20(tokenOut).transfer(msg.sender, amountOut);

        reserve0 = uint112(IERC20(token0).balanceOf(address(this)));
        reserve1 = uint112(IERC20(token1).balanceOf(address(this)));
    }
}

// ---------------------------------------------------------------
//  Test Suite
// ---------------------------------------------------------------

/// @title OracleManipulationTest
/// @notice Demonstrates that spot price oracles (getReserves) are
///         trivially manipulable by large swaps.
///
///         Key insight: A single large swap can move the oracle price
///         by 50%+ in one transaction. This is why Chainlink and TWAP
///         exist -- they resist single-block manipulation.
///
///         Run: forge test --match-path test/security/OracleManipulation.t.sol -vvv
contract OracleManipulationTest is Test {
    // ---------------------------------------------------------------
    //  State
    // ---------------------------------------------------------------

    MockERC20 weth;
    MockERC20 usdc;
    MockPair pair;
    OracleManipulable oracle;

    address attacker;

    // ---------------------------------------------------------------
    //  Setup
    // ---------------------------------------------------------------

    function setUp() public {
        attacker = makeAddr("attacker");

        // Deploy tokens
        weth = new MockERC20("Wrapped Ether", "WETH");
        usdc = new MockERC20("USD Coin", "USDC");

        // Deploy pair with liquidity: 1000 WETH / 2,000,000 USDC
        // Initial price: 2000 USDC per WETH
        pair = new MockPair(address(weth), address(usdc));
        weth.mint(address(this), 1_000 ether);
        usdc.mint(address(this), 2_000_000e18);
        weth.approve(address(pair), 1_000 ether);
        usdc.approve(address(pair), 2_000_000e18);
        pair.seedLiquidity(uint112(1_000 ether), uint112(2_000_000e18));

        // Deploy oracle pointing to the pair
        // token0IsBase = true means price = reserve1/reserve0 (USDC per WETH)
        oracle = new OracleManipulable(address(pair), true);

        // Give attacker tokens for manipulation
        weth.mint(attacker, 500 ether);
    }

    // ---------------------------------------------------------------
    //  Tests
    // ---------------------------------------------------------------

    /// @notice Verify oracle returns correct initial price
    function test_initialPrice() public {
        uint256 price = oracle.getPriceView();
        assertApproxEqRel(price, 2000e18, 0.01e18); // 2000 USDC/WETH within 1%
    }

    /// @notice Prove that a large swap manipulates the oracle price.
    ///         Attacker swaps 500 WETH into a 1000 WETH pool.
    ///         Price drops by >33% in a single transaction.
    function test_oracleManipulation() public {
        // Price before: ~2000 USDC/WETH
        uint256 priceBefore = oracle.getPriceView();

        // Attacker performs large swap: 500 WETH -> USDC
        vm.startPrank(attacker);
        weth.approve(address(pair), 500 ether);
        pair.swap(address(weth), 500 ether);
        vm.stopPrank();

        // Price after: significantly lower
        uint256 priceAfter = oracle.getPriceView();

        // Price should have dropped by > 33%
        // With xy=k: new reserves are 1500 WETH / ~1,333,333 USDC
        // New price: 1,333,333 / 1,500 = ~888 USDC/WETH (55% drop)
        assertLt(priceAfter, priceBefore, "Price should decrease");
        assertLt(priceAfter, (priceBefore * 67) / 100, "Price should drop >33%");

        // Log educational output
        emit log_named_uint("Price BEFORE manipulation (USDC/WETH)", priceBefore / 1e18);
        emit log_named_uint("Price AFTER manipulation (USDC/WETH)", priceAfter / 1e18);
        emit log_named_uint("Price change (%)", ((priceBefore - priceAfter) * 100) / priceBefore);
    }

    /// @notice Demonstrate price impact scales with swap size.
    ///         Small swap = small impact. Large swap = large impact.
    function test_priceImpactScaling() public {
        uint256 priceBefore = oracle.getPriceView();

        // Small swap: 10 WETH (1% of pool)
        weth.mint(attacker, 10 ether);
        vm.startPrank(attacker);
        weth.approve(address(pair), 10 ether);
        pair.swap(address(weth), 10 ether);
        vm.stopPrank();

        uint256 priceAfterSmall = oracle.getPriceView();
        uint256 dropSmall = priceBefore - priceAfterSmall;

        // Reset: deploy fresh pair
        pair = new MockPair(address(weth), address(usdc));
        weth.mint(address(this), 1_000 ether);
        usdc.mint(address(this), 2_000_000e18);
        weth.approve(address(pair), 1_000 ether);
        usdc.approve(address(pair), 2_000_000e18);
        pair.seedLiquidity(uint112(1_000 ether), uint112(2_000_000e18));
        oracle = new OracleManipulable(address(pair), true);

        // Large swap: 500 WETH (50% of pool)
        vm.startPrank(attacker);
        weth.approve(address(pair), 500 ether);
        pair.swap(address(weth), 500 ether);
        vm.stopPrank();

        uint256 priceAfterLarge = oracle.getPriceView();
        uint256 dropLarge = priceBefore - priceAfterLarge;

        // Larger swap = larger price drop
        assertGt(dropLarge, dropSmall, "Larger swap should cause larger price drop");

        emit log_named_uint("Drop from 10 WETH swap ($)", dropSmall / 1e18);
        emit log_named_uint("Drop from 500 WETH swap ($)", dropLarge / 1e18);
    }

    /// @notice Verify that the oracle emits PriceQueried event
    function test_oracleEmitsEvent() public {
        (uint112 r0, uint112 r1, ) = pair.getReserves();
        uint256 expectedPrice = (uint256(r1) * 1e18) / uint256(r0);

        vm.expectEmit(true, true, true, true);
        emit OracleManipulable.PriceQueried(expectedPrice, r0, r1);
        oracle.getPrice();
    }
}
