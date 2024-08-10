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
    LinkToken public s_linkToken;
    uint256 linkInitialSupply = 1000000000000000000;

    function setUp() public {
        ccipLocalSimulator = new CCIPLocalSimulator();
        (uint64 chainSelector, IRouterClient sourceRouter, IRouterClient destinationRouter,, LinkToken linkToken,,) =
            ccipLocalSimulator.configuration();
        crossChainFlipACoinReceiver = new CrossChainFlipACoinReceiver(address(destinationRouter));
        crossChainFlipACoinSender = new CrossChainFlipACoinSender(
            address(sourceRouter), address(crossChainFlipACoinReceiver), chainSelector, address(linkToken)
        );
        s_chainSelector = chainSelector;
        s_linkToken = linkToken;

        ccipLocalSimulator.requestLinkFromFaucet(address(crossChainFlipACoinSender), linkInitialSupply);
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

    function test_balance() public view {
        uint256 balance = crossChainFlipACoinSender.balance();
        assertEq(balance, linkInitialSupply);
    }

    function test_withdraw() public {
        uint256 balance = crossChainFlipACoinSender.balance();
        assertEq(balance, linkInitialSupply);
        assertEq(s_linkToken.balanceOf(address(this)), 0);
        crossChainFlipACoinSender.withdraw();
        balance = crossChainFlipACoinSender.balance();
        assertEq(balance, 0);
        assertEq(s_linkToken.balanceOf(address(this)), linkInitialSupply);
    }
}
