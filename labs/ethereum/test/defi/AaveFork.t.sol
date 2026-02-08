// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// Aave V3 Fork Test (DEFI-06/07)
// Run: MAINNET_RPC_URL=... forge test --profile fork --match-path test/defi/AaveFork.t.sol -vvv
//
// Tests Aave V3 Pool on Ethereum mainnet fork:
// - getUserAccountData (default / after supply / after borrow)
// - Health factor computation
// - Supply WETH and verify collateral
// - Borrow DAI against WETH and verify health factor

import "forge-std/Test.sol";

// ---------------------------------------------------------------
//  Inline interfaces (no npm dependency on Aave packages)
// ---------------------------------------------------------------

interface IAavePool {
    /// @notice Returns the user account data across all reserves
    /// @return totalCollateralBase Total collateral in base currency (USD, 8 decimals)
    /// @return totalDebtBase Total debt in base currency
    /// @return availableBorrowsBase Available borrows in base currency
    /// @return currentLiquidationThreshold Weighted average liquidation threshold
    /// @return ltv Weighted average LTV
    /// @return healthFactor Health factor (1e18 = 1.0, type(uint256).max if no debt)
    function getUserAccountData(address user)
        external
        view
        returns (
            uint256 totalCollateralBase,
            uint256 totalDebtBase,
            uint256 availableBorrowsBase,
            uint256 currentLiquidationThreshold,
            uint256 ltv,
            uint256 healthFactor
        );

    /// @notice Supply an asset to the pool
    /// @param asset The address of the underlying asset
    /// @param amount The amount to supply (in asset's native decimals)
    /// @param onBehalfOf The address that will receive the aTokens
    /// @param referralCode Referral code (0 = none)
    function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external;

    /// @notice Borrow an asset from the pool
    /// @param asset The address of the asset to borrow
    /// @param amount The amount to borrow
    /// @param interestRateMode 1 = stable, 2 = variable
    /// @param referralCode Referral code (0 = none)
    /// @param onBehalfOf The address that will receive the debt tokens
    function borrow(
        address asset,
        uint256 amount,
        uint256 interestRateMode,
        uint16 referralCode,
        address onBehalfOf
    ) external;
}

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function decimals() external view returns (uint8);
}

interface IWETH is IERC20 {
    function deposit() external payable;
}

// ---------------------------------------------------------------
//  Constants
// ---------------------------------------------------------------

address constant AAVE_POOL = 0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2;
address constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
address constant DAI = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
address constant USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;

// ---------------------------------------------------------------
//  Test contract
// ---------------------------------------------------------------

contract AaveForkTest is Test {
    IAavePool pool = IAavePool(AAVE_POOL);
    IWETH weth = IWETH(WETH);
    IERC20 dai = IERC20(DAI);

    address user;

    function setUp() public {
        // Create a fresh user with 10 ETH
        user = makeAddr("aave-user");
        vm.deal(user, 10 ether);
    }

    // ---------------------------------------------------------------
    //  Test: Default account data (no positions)
    // ---------------------------------------------------------------

    function test_getUserAccountDataDefault() public view {
        (
            uint256 totalCollateralBase,
            uint256 totalDebtBase,
            uint256 availableBorrowsBase,
            ,
            ,
            uint256 healthFactor
        ) = pool.getUserAccountData(user);

        // Fresh address has no collateral and no debt
        assertEq(totalCollateralBase, 0, "collateral should be 0");
        assertEq(totalDebtBase, 0, "debt should be 0");
        assertEq(availableBorrowsBase, 0, "available borrows should be 0");
        // Health factor is max uint when no debt
        assertEq(healthFactor, type(uint256).max, "HF should be max with no debt");
    }

    // ---------------------------------------------------------------
    //  Test: Supply WETH as collateral
    // ---------------------------------------------------------------

    function test_supplyWETH() public {
        uint256 supplyAmount = 5 ether;

        vm.startPrank(user);

        // 1. Wrap ETH -> WETH
        weth.deposit{value: supplyAmount}();
        assertEq(weth.balanceOf(user), supplyAmount, "WETH balance after wrap");

        // 2. Approve Aave Pool to spend WETH
        weth.approve(AAVE_POOL, supplyAmount);

        // 3. Supply WETH to Aave
        pool.supply(WETH, supplyAmount, user, 0);

        vm.stopPrank();

        // 4. Verify collateral appeared
        (uint256 totalCollateralBase,, uint256 availableBorrowsBase,,, uint256 healthFactor) =
            pool.getUserAccountData(user);

        // Collateral should be > 0 (denominated in base currency, 8 decimals)
        assertGt(totalCollateralBase, 0, "collateral should be > 0 after supply");
        // Available borrows should be > 0 (LTV > 0 for WETH)
        assertGt(availableBorrowsBase, 0, "available borrows should be > 0");
        // Health factor is max uint when no debt
        assertEq(healthFactor, type(uint256).max, "HF max with collateral but no debt");
    }

    // ---------------------------------------------------------------
    //  Test: Health factor after borrow
    // ---------------------------------------------------------------

    function test_healthFactorAfterBorrow() public {
        uint256 supplyAmount = 10 ether;

        vm.startPrank(user);

        // 1. Wrap and supply 10 ETH
        weth.deposit{value: supplyAmount}();
        weth.approve(AAVE_POOL, supplyAmount);
        pool.supply(WETH, supplyAmount, user, 0);

        // 2. Borrow 1000 DAI (conservative, well within LTV)
        //    interestRateMode = 2 (variable rate)
        pool.borrow(DAI, 1000 * 1e18, 2, 0, user);

        vm.stopPrank();

        // 3. Check health factor
        (
            uint256 totalCollateralBase,
            uint256 totalDebtBase,
            ,
            uint256 currentLiquidationThreshold,
            uint256 ltv,
            uint256 healthFactor
        ) = pool.getUserAccountData(user);

        // Collateral and debt both > 0
        assertGt(totalCollateralBase, 0, "collateral > 0");
        assertGt(totalDebtBase, 0, "debt > 0");

        // Health factor should be finite (not max) and > 1e18 (healthy)
        assertLt(healthFactor, type(uint256).max, "HF should be finite with debt");
        assertGt(healthFactor, 1e18, "HF should be > 1.0 (healthy position)");

        // LTV and liquidation threshold should be reasonable for WETH
        // WETH on Aave V3: LTV ~80%, Liquidation threshold ~82.5%
        assertGt(ltv, 7000, "LTV should be > 70%");
        assertLt(ltv, 9000, "LTV should be < 90%");
        assertGt(currentLiquidationThreshold, ltv, "liquidation threshold > LTV");

        // Log values for educational output
        emit log_named_uint("Total Collateral (base, 8 dec)", totalCollateralBase);
        emit log_named_uint("Total Debt (base, 8 dec)", totalDebtBase);
        emit log_named_uint("LTV (basis points)", ltv);
        emit log_named_uint("Liquidation Threshold (bp)", currentLiquidationThreshold);
        emit log_named_uint("Health Factor (1e18 = 1.0)", healthFactor);

        // Verify: HF = collateral * liquidationThreshold / debt
        // (all in base currency, threshold in basis points)
        uint256 expectedHF = (totalCollateralBase * currentLiquidationThreshold * 1e18)
            / (totalDebtBase * 10000);
        // Allow 0.01 tolerance (due to interest accrual between blocks)
        assertApproxEqRel(healthFactor, expectedHF, 0.01e18, "HF matches formula");
    }
}
