// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title LegacyOverflow
/// @notice Demonstrates integer overflow behaviors in Solidity 0.8+.
///         Used in SEC-03 to show safe defaults, unchecked risks, and unsafe downcasting.
///
/// @dev Three scenarios:
///      1. Safe (default): arithmetic overflow reverts with Panic(0x11)
///      2. Unchecked: explicit opt-out via unchecked{} -- wraps silently
///      3. Unsafe downcast: type casting truncates without checking
contract LegacyOverflow {
    /// @notice Attempts safe addition on uint8. Reverts on overflow.
    /// @param a First operand (uint8)
    /// @param b Second operand (uint8)
    /// @return result The sum (reverts if overflow)
    function safeAdd(uint8 a, uint8 b) external pure returns (uint8 result) {
        // Default Solidity 0.8+: overflow check enabled
        // If a + b > 255, this reverts with Panic(0x11)
        result = a + b;
    }

    /// @notice Unchecked addition on uint8. Wraps on overflow.
    /// @param a First operand (uint8)
    /// @param b Second operand (uint8)
    /// @return result The wrapped sum (e.g., 255 + 1 = 0)
    function uncheckedAdd(uint8 a, uint8 b) external pure returns (uint8 result) {
        unchecked {
            result = a + b;
        }
    }

    /// @notice Unsafe downcast from uint256 to uint8. Truncates silently.
    /// @param value The uint256 value to downcast
    /// @return result The truncated uint8 value (only lower 8 bits)
    function unsafeDowncast(uint256 value) external pure returns (uint8 result) {
        // WARNING: This silently truncates! uint8(256) = 0
        // Solidity 0.8+ does NOT check downcasting -- only arithmetic overflow.
        // Use OpenZeppelin SafeCast for safe downcasting.
        result = uint8(value);
    }

    /// @notice Demonstrates the BatchOverflow pattern.
    ///         In unchecked{}, amount * count can overflow to a small value
    ///         while each recipient gets the full 'amount'.
    /// @param amount Amount per recipient
    /// @param count Number of recipients
    /// @return total The (potentially overflowed) total
    /// @return perRecipient The amount each recipient would receive
    function batchOverflowDemo(uint256 amount, uint256 count)
        external
        pure
        returns (uint256 total, uint256 perRecipient)
    {
        unchecked {
            total = amount * count;
        }
        perRecipient = amount;
    }
}
