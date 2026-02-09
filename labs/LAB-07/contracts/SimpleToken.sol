// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title SimpleToken
/// @notice Minimal self-contained ERC-20 for LAB-07 indexing exercises.
///         Emits Transfer events that Subsquid and The Graph will index.
///         No OpenZeppelin dependency -- fully standalone implementation.
contract SimpleToken {
    string public constant name = "SimpleToken";
    string public constant symbol = "STK";
    uint8 public constant decimals = 18;

    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /// @param initialSupply Total supply minted to deployer (in wei, 18 decimals).
    constructor(uint256 initialSupply) {
        totalSupply = initialSupply;
        balanceOf[msg.sender] = initialSupply;
        emit Transfer(address(0), msg.sender, initialSupply);
    }

    /// @notice Transfer tokens to a recipient.
    function transfer(address to, uint256 amount) external returns (bool) {
        require(to != address(0), "ERC20: transfer to zero address");
        require(balanceOf[msg.sender] >= amount, "ERC20: insufficient balance");

        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    /// @notice Approve a spender to transfer tokens on your behalf.
    function approve(address spender, uint256 amount) external returns (bool) {
        require(spender != address(0), "ERC20: approve to zero address");

        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    /// @notice Transfer tokens on behalf of the owner (requires prior approval).
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool) {
        require(to != address(0), "ERC20: transfer to zero address");
        require(balanceOf[from] >= amount, "ERC20: insufficient balance");
        require(allowance[from][msg.sender] >= amount, "ERC20: insufficient allowance");

        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
        return true;
    }
}
