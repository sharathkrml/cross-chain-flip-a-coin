// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console2} from "forge-std/Test.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {IRouterClient, CCIPLocalSimulator, LinkToken} from "@chainlink/local/src/ccip/CCIPLocalSimulator.sol";
import {CrossChainFlipACoinSender} from "../src/CrossChainFlipACoinSender.sol";
import {CrossChainFlipACoinReceiver} from "../src/CrossChainFlipACoinReceiver.sol";

contract CCIPTest is Test {
    event OptionChosen(bytes32 indexed messageId, address indexed sender, bool indexed isHeads);
    event FlipResult(address indexed user, bool indexed isWinner, uint256 indexed timestamp);
    event MessageReceivedAndResult(
        bytes32 indexed messageId,
        uint64 indexed sourceChainSelector,
        address indexed sender,
        address user,
        bool isHeads,
        bool won
    );

    CCIPLocalSimulator public ccipLocalSimulator;
    CrossChainFlipACoinSender public crossChainFlipACoinSender;
    CrossChainFlipACoinReceiver public crossChainFlipACoinReceiver;
    uint64 public s_chainSelector;

    function setUp() public {
        ccipLocalSimulator = new CCIPLocalSimulator();
        (uint64 chainSelector, IRouterClient sourceRouter, IRouterClient destinationRouter,,,,) =
            ccipLocalSimulator.configuration();
        crossChainFlipACoinReceiver = new CrossChainFlipACoinReceiver(address(destinationRouter));
        crossChainFlipACoinSender =
            new CrossChainFlipACoinSender(address(sourceRouter), address(crossChainFlipACoinReceiver), chainSelector);
        s_chainSelector = chainSelector;
    }

    function test_prepareMessageAndGetFees() public {
        address user1 = makeAddr("user1");
        vm.deal(user1, 1000000000000000000);
        vm.startPrank(user1);
        (, uint256 fees) = crossChainFlipACoinSender.prepareMessageAndGetFees(false, user1);
        vm.stopPrank();
        assertEq(fees, 0);
    }

    function test_chooseOption() public {
        address user1 = makeAddr("user1");
        vm.deal(user1, 1000000000000000000);
        vm.startPrank(user1);
        crossChainFlipACoinSender.chooseOption(true);
        console2.log("direct call", crossChainFlipACoinReceiver.chooseOption(true));
        console2.log("address(this)", address(this));
        console2.log(crossChainFlipACoinReceiver.s_userScores(user1));
        vm.stopPrank();
    }

    function test_balance() public {
        address user1 = makeAddr("user1");
        vm.deal(user1, 1000000000000000000);
        vm.startPrank(user1);
        (bool success,) = address(crossChainFlipACoinSender).call{value: 1000000000000000000}("");
        assert(success);
        uint256 balance = crossChainFlipACoinSender.balance();
        assertEq(balance, 1000000000000000000);
        vm.stopPrank();
    }

    function test_withdraw() public {
        uint256 oldBalance = address(this).balance;
        address user1 = makeAddr("user1");
        vm.deal(user1, 1000000000000000000);
        vm.startPrank(user1);
        (bool success,) = address(crossChainFlipACoinSender).call{value: 1000000000000000000}("");
        assert(success);
        vm.stopPrank();
        crossChainFlipACoinSender.withdraw();
        uint256 balance = crossChainFlipACoinSender.balance();
        assertEq(balance, 0);
        assertEq(address(this).balance - oldBalance, 1000000000000000000);
    }

    receive() external payable {}
    fallback() external payable {}
}
