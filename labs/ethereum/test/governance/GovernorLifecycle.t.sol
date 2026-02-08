// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// Governance Lifecycle Test (GOV-05, LAB-07)
// Run: forge test --match-path test/governance/GovernorLifecycle.t.sol -vvvv
//
// Tests:
// 1. Full lifecycle: propose -> vote -> queue -> execute (with vm.warp)
// 2. Delegation required: verify 0 voting power before delegation

import "forge-std/Test.sol";
import {GovernanceToken} from "../../contracts/governance/GovernanceToken.sol";
import {MyGovernor} from "../../contracts/governance/MyGovernor.sol";
import {Treasury} from "../../contracts/governance/Treasury.sol";
import {TimelockController} from "@openzeppelin/contracts/governance/TimelockController.sol";
import {IGovernor} from "@openzeppelin/contracts/governance/IGovernor.sol";

contract GovernorLifecycleTest is Test {
    GovernanceToken token;
    TimelockController timelock;
    MyGovernor governor;
    Treasury treasury;

    address deployer = makeAddr("deployer");
    address voter1 = makeAddr("voter1");
    address voter2 = makeAddr("voter2");
    address recipient = makeAddr("recipient");

    uint256 constant TIMELOCK_DELAY = 1 days;

    function setUp() public {
        vm.startPrank(deployer);

        // 1. Deploy governance token (1M tokens to deployer)
        token = new GovernanceToken();

        // 2. Deploy timelock (no proposers yet; anyone can execute)
        address[] memory proposers = new address[](0);
        address[] memory executors = new address[](1);
        executors[0] = address(0); // Anyone can execute
        timelock = new TimelockController(TIMELOCK_DELAY, proposers, executors, deployer);

        // 3. Deploy governor with token and timelock
        governor = new MyGovernor(token, timelock);

        // 4. Grant governor the PROPOSER_ROLE on timelock
        timelock.grantRole(timelock.PROPOSER_ROLE(), address(governor));

        // 5. Renounce admin role (timelock governs itself now)
        timelock.renounceRole(timelock.DEFAULT_ADMIN_ROLE(), deployer);

        // 6. Deploy treasury, transfer ownership to timelock
        treasury = new Treasury();
        treasury.transferOwnership(address(timelock));

        // 7. Fund timelock with ETH for governance proposals
        vm.deal(address(timelock), 10 ether);

        // 8. Distribute tokens: voter1=400K, voter2=100K, deployer=500K
        token.transfer(voter1, 400_000 * 1e18);
        token.transfer(voter2, 100_000 * 1e18);

        vm.stopPrank();

        // CRITICAL: Voters must delegate to themselves to activate voting power.
        // Without delegation, getVotes() returns 0 even if balanceOf() > 0.
        vm.prank(voter1);
        token.delegate(voter1);

        vm.prank(voter2);
        token.delegate(voter2);

        vm.prank(deployer);
        token.delegate(deployer);
    }

    /// @dev Full governance lifecycle: propose -> vote -> queue -> execute
    function test_fullGovernanceLifecycle() public {
        // === PROPOSE ===
        // Create proposal to release 1 ETH from treasury to recipient
        bytes memory transferCall = abi.encodeWithSignature(
            "release(address,uint256)", recipient, 1 ether
        );
        address[] memory targets = new address[](1);
        targets[0] = address(treasury);
        uint256[] memory values = new uint256[](1);
        bytes[] memory calldatas = new bytes[](1);
        calldatas[0] = transferCall;

        vm.prank(deployer);
        uint256 proposalId = governor.propose(
            targets, values, calldatas, "Send 1 ETH to recipient"
        );
        assertEq(
            uint256(governor.state(proposalId)),
            uint256(IGovernor.ProposalState.Pending)
        );

        // === WAIT FOR VOTING DELAY (1 day) ===
        vm.warp(block.timestamp + governor.votingDelay() + 1);
        assertEq(
            uint256(governor.state(proposalId)),
            uint256(IGovernor.ProposalState.Active)
        );

        // === VOTE ===
        // voter1 votes For (400K), voter2 votes Against (100K)
        vm.prank(voter1);
        governor.castVote(proposalId, 1); // 1 = For

        vm.prank(voter2);
        governor.castVote(proposalId, 0); // 0 = Against

        // === WAIT FOR VOTING PERIOD (1 week) ===
        vm.warp(block.timestamp + governor.votingPeriod() + 1);
        assertEq(
            uint256(governor.state(proposalId)),
            uint256(IGovernor.ProposalState.Succeeded)
        );

        // === QUEUE ===
        bytes32 descriptionHash = keccak256(bytes("Send 1 ETH to recipient"));
        governor.queue(targets, values, calldatas, descriptionHash);
        assertEq(
            uint256(governor.state(proposalId)),
            uint256(IGovernor.ProposalState.Queued)
        );

        // === WAIT FOR TIMELOCK DELAY (1 day) ===
        vm.warp(block.timestamp + TIMELOCK_DELAY + 1);

        // === EXECUTE ===
        governor.execute(targets, values, calldatas, descriptionHash);
        assertEq(
            uint256(governor.state(proposalId)),
            uint256(IGovernor.ProposalState.Executed)
        );

        // Verify recipient received 1 ETH
        assertEq(recipient.balance, 1 ether);
    }

    /// @dev Demonstrate delegation requirement: tokens != voting power
    function test_delegationRequired() public {
        // Create a fresh address with no delegation
        address newVoter = makeAddr("newVoter");

        vm.prank(deployer);
        token.transfer(newVoter, 200_000 * 1e18);

        // Before delegation: balance > 0 but voting power = 0
        assertEq(token.balanceOf(newVoter), 200_000 * 1e18);
        assertEq(token.getVotes(newVoter), 0); // No voting power!

        // After delegation: voting power matches balance
        vm.prank(newVoter);
        token.delegate(newVoter);
        assertEq(token.getVotes(newVoter), 200_000 * 1e18); // Now has voting power!
    }
}
