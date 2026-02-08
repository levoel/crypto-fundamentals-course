// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";

/// @title IUniswapV2Router02 (partial)
/// @notice Inline interface -- only the functions needed for fork testing.
///         Avoids npm package dependency and Solidity version conflicts.
interface IUniswapV2Router02 {
    function swapExactETHForTokens(
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external payable returns (uint256[] memory amounts);

    function getAmountsOut(
        uint256 amountIn,
        address[] calldata path
    ) external view returns (uint256[] memory amounts);

    function WETH() external pure returns (address);
}

/// @title UniswapV2ForkTest
/// @notice Fork tests against real Uniswap V2 contracts on Ethereum mainnet.
///         Run with: forge test --match-path test/defi/UniswapV2Fork.t.sol --profile fork
/// @dev Requires MAINNET_RPC_URL environment variable (Alchemy/Infura/etc).
///      Forks at block 21400000 (configured in foundry.toml [profile.fork]).
contract UniswapV2ForkTest is Test {
    // ---------------------------------------------------------------
    //  Constants: mainnet addresses
    // ---------------------------------------------------------------

    address constant UNISWAP_V2_ROUTER = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
    address constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address constant DAI = 0x6B175474E89094C44Da98b954EedeAC495271d0F;

    IUniswapV2Router02 router;
    address trader;

    // ---------------------------------------------------------------
    //  Setup
    // ---------------------------------------------------------------

    function setUp() public {
        router = IUniswapV2Router02(UNISWAP_V2_ROUTER);
        trader = makeAddr("trader");
        vm.deal(trader, 10 ether);
    }

    // ---------------------------------------------------------------
    //  Tests
    // ---------------------------------------------------------------

    /// @notice Swap ETH for DAI via Uniswap V2 Router on mainnet fork.
    ///         Verifies that the trader receives DAI tokens after swapping 1 ETH.
    function test_swapETHForDAI() public {
        address[] memory path = new address[](2);
        path[0] = WETH;
        path[1] = DAI;

        // Get expected output for 1 ETH
        uint256[] memory expectedAmounts = router.getAmountsOut(1 ether, path);
        uint256 expectedDAI = expectedAmounts[1];

        // Minimum output: 99% of expected (1% slippage tolerance)
        uint256 minOut = (expectedDAI * 99) / 100;

        vm.startPrank(trader);
        uint256[] memory amounts = router.swapExactETHForTokens{value: 1 ether}(
            minOut,
            path,
            trader,
            block.timestamp + 300
        );
        vm.stopPrank();

        // Verify trader received DAI
        uint256 daiBalance = IERC20(DAI).balanceOf(trader);
        assertGt(daiBalance, 0, "Trader should have DAI after swap");
        assertEq(daiBalance, amounts[1], "Balance should match swap output");
        assertGe(daiBalance, minOut, "Should receive at least minOut");

        emit log_named_uint("DAI received for 1 ETH", daiBalance);
        emit log_named_uint("Effective price (DAI/ETH)", daiBalance / 1e18);
    }

    /// @notice Compare price impact: small trade vs large trade.
    ///         A larger trade should get a worse effective price per ETH.
    function test_priceImpact() public {
        address[] memory path = new address[](2);
        path[0] = WETH;
        path[1] = DAI;

        // Small trade: 0.01 ETH
        uint256[] memory smallAmounts = router.getAmountsOut(0.01 ether, path);
        uint256 smallPricePerETH = (smallAmounts[1] * 1e18) / 0.01 ether;

        // Large trade: 100 ETH
        uint256[] memory largeAmounts = router.getAmountsOut(100 ether, path);
        uint256 largePricePerETH = (largeAmounts[1] * 1e18) / 100 ether;

        // Large trade should get worse price per ETH (lower DAI per ETH)
        assertGt(
            smallPricePerETH,
            largePricePerETH,
            "Large trade should have worse price (more impact)"
        );

        emit log_named_uint("Small trade (0.01 ETH) price", smallPricePerETH);
        emit log_named_uint("Large trade (100 ETH) price", largePricePerETH);

        // Calculate price impact percentage: (small - large) / small * 100
        uint256 impactBps = ((smallPricePerETH - largePricePerETH) * 10000) / smallPricePerETH;
        emit log_named_uint("Price impact (bps)", impactBps);
        assertGt(impactBps, 0, "Price impact should be positive");
    }
}

/// @notice Minimal IERC20 interface for balance checks.
interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
}
