// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// ---------------------------------------------------------------
//  Mock ERC20 tokens for testing
// ---------------------------------------------------------------

contract MockToken is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

// ---------------------------------------------------------------
//  MockDEX: Simplified constant-product AMM
// ---------------------------------------------------------------

/// @notice Minimal DEX with xy=k formula. No fees.
///         Used to demonstrate price manipulation via large swaps.
contract MockDEX {
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

    function swap(address tokenIn, uint256 amountIn) external returns (uint256 amountOut) {
        bool isToken0 = (tokenIn == token0);
        require(isToken0 || tokenIn == token1, "Invalid token");

        (uint256 rIn, uint256 rOut) = isToken0
            ? (uint256(reserve0), uint256(reserve1))
            : (uint256(reserve1), uint256(reserve0));

        // xy = k formula (no fee)
        amountOut = (rOut * amountIn) / (rIn + amountIn);

        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);
        address tokenOut = isToken0 ? token1 : token0;
        IERC20(tokenOut).transfer(msg.sender, amountOut);

        // Update reserves
        if (isToken0) {
            reserve0 = uint112(IERC20(token0).balanceOf(address(this)));
            reserve1 = uint112(IERC20(token1).balanceOf(address(this)));
        } else {
            reserve0 = uint112(IERC20(token0).balanceOf(address(this)));
            reserve1 = uint112(IERC20(token1).balanceOf(address(this)));
        }
    }
}

// ---------------------------------------------------------------
//  MockFlashLender: Simplified flash loan provider
// ---------------------------------------------------------------

/// @notice Minimal flash loan provider.
///         Calls onFlashLoan() callback, then pulls repayment.
///         Fee: 0.1% (1 bps = 10 / 10000)
contract MockFlashLender {
    uint256 public constant FEE_BPS = 10; // 0.1%

    function flashLoan(address borrower, address token, uint256 amount) external {
        uint256 balanceBefore = IERC20(token).balanceOf(address(this));

        // Transfer tokens to borrower
        IERC20(token).transfer(borrower, amount);

        // Calculate fee
        uint256 fee = (amount * FEE_BPS) / 10000;

        // Callback: borrower executes attack logic
        IFlashBorrower(borrower).onFlashLoan(token, amount, fee);

        // Pull repayment (amount + fee)
        IERC20(token).transferFrom(borrower, address(this), amount + fee);

        // Verify repayment
        uint256 balanceAfter = IERC20(token).balanceOf(address(this));
        require(balanceAfter >= balanceBefore + fee, "Flash loan not repaid");
    }
}

interface IFlashBorrower {
    function onFlashLoan(address token, uint256 amount, uint256 fee) external;
}

// ---------------------------------------------------------------
//  Import the attacker contract
// ---------------------------------------------------------------

import "../../contracts/security/FlashLoanAttacker.sol";

// ---------------------------------------------------------------
//  Test Suite
// ---------------------------------------------------------------

/// @title FlashLoanAttackTest
/// @notice Proves that flash loans can manipulate spot price oracles.
///         The attack demonstrates price before != price during attack,
///         showing why getReserves() should NEVER be used as a price oracle.
///
///         Run: forge test --match-path test/security/FlashLoanAttack.t.sol -vvv
contract FlashLoanAttackTest is Test {
    // ---------------------------------------------------------------
    //  State
    // ---------------------------------------------------------------

    MockToken weth;
    MockToken usdc;
    MockDEX dex;
    MockFlashLender lender;
    FlashLoanAttacker attacker;

    address attackerEOA;

    // ---------------------------------------------------------------
    //  Setup
    // ---------------------------------------------------------------

    function setUp() public {
        attackerEOA = makeAddr("attacker");

        // Deploy tokens
        weth = new MockToken("Wrapped Ether", "WETH");
        usdc = new MockToken("USD Coin", "USDC");

        // Deploy DEX with liquidity
        dex = new MockDEX(address(weth), address(usdc));
        weth.mint(address(this), 1_000 ether);
        usdc.mint(address(this), 2_000_000e18);
        weth.approve(address(dex), 1_000 ether);
        usdc.approve(address(dex), 2_000_000e18);
        dex.seedLiquidity(uint112(1_000 ether), uint112(2_000_000e18));

        // Deploy lender with flash loan liquidity
        lender = new MockFlashLender();
        weth.mint(address(lender), 10_000 ether);

        // Deploy attacker contract (owned by attackerEOA)
        vm.prank(attackerEOA);
        attacker = new FlashLoanAttacker(address(lender), address(dex));
    }

    // ---------------------------------------------------------------
    //  Tests
    // ---------------------------------------------------------------

    /// @notice Prove that a flash loan can manipulate spot price.
    ///         Before attack: price = 2000e18 (2000 USDC per WETH)
    ///         During attack: price is significantly lower (WETH dumped)
    ///         After attack: price approximately recovers
    function test_flashLoanAttack() public {
        // Verify initial price: 2000 USDC per WETH
        (uint112 r0, uint112 r1, ) = dex.getReserves();
        uint256 initialPrice = (uint256(r1) * 1e18) / uint256(r0);
        assertApproxEqRel(initialPrice, 2000e18, 0.01e18); // within 1%

        // Execute attack: borrow 500 WETH
        vm.prank(attackerEOA);
        attacker.attack(address(weth), 500 ether);

        // Verify price was manipulated during attack
        uint256 priceBefore = attacker.priceBeforeAttack();
        uint256 priceDuring = attacker.priceDuringAttack();
        uint256 priceAfter = attacker.priceAfterAttack();

        // Price during attack should be significantly lower than before
        // (attacker dumped 500 WETH into a 1000 WETH pool)
        assertGt(priceBefore, priceDuring, "Price should drop during attack");
        assertLt(priceDuring, priceBefore * 80 / 100, "Price should drop >20%");

        // Price should approximately recover after swap back
        // (not exact due to slippage from round-trip)
        assertApproxEqRel(priceAfter, priceBefore, 0.05e18); // within 5%

        // Log results for educational value
        emit log_named_uint("Price BEFORE attack (USDC/WETH)", priceBefore / 1e18);
        emit log_named_uint("Price DURING attack (USDC/WETH)", priceDuring / 1e18);
        emit log_named_uint("Price AFTER attack (USDC/WETH)", priceAfter / 1e18);
        emit log_named_uint("Price drop during attack (%)", ((priceBefore - priceDuring) * 100) / priceBefore);
    }

    /// @notice Verify the attack can only be initiated by the owner
    function test_attackOnlyOwner() public {
        address notOwner = makeAddr("notOwner");
        vm.prank(notOwner);
        vm.expectRevert(FlashLoanAttacker.OnlyOwner.selector);
        attacker.attack(address(weth), 100 ether);
    }

    /// @notice Verify the flash loan callback only accepts calls from lender
    function test_callbackOnlyLender() public {
        vm.expectRevert(FlashLoanAttacker.OnlyLender.selector);
        attacker.onFlashLoan(address(weth), 100 ether, 1 ether);
    }

    /// @notice Demonstrate price impact scales with borrow amount.
    ///         Larger flash loan = more price manipulation.
    function test_priceImpactScalesWithBorrowAmount() public {
        // Attack with 100 WETH
        vm.prank(attackerEOA);
        attacker.attack(address(weth), 100 ether);
        uint256 dropSmall = attacker.priceBeforeAttack() - attacker.priceDuringAttack();

        // Reset state: redeploy DEX
        dex = new MockDEX(address(weth), address(usdc));
        weth.mint(address(this), 1_000 ether);
        usdc.mint(address(this), 2_000_000e18);
        weth.approve(address(dex), 1_000 ether);
        usdc.approve(address(dex), 2_000_000e18);
        dex.seedLiquidity(uint112(1_000 ether), uint112(2_000_000e18));

        // Deploy new attacker with new DEX
        vm.prank(attackerEOA);
        FlashLoanAttacker attacker2 = new FlashLoanAttacker(address(lender), address(dex));

        // Attack with 500 WETH (5x more)
        vm.prank(attackerEOA);
        attacker2.attack(address(weth), 500 ether);
        uint256 dropLarge = attacker2.priceBeforeAttack() - attacker2.priceDuringAttack();

        // Larger borrow = larger price drop
        assertGt(dropLarge, dropSmall, "Larger borrow should cause larger price drop");

        emit log_named_uint("Price drop with 100 WETH", dropSmall / 1e18);
        emit log_named_uint("Price drop with 500 WETH", dropLarge / 1e18);
    }
}
