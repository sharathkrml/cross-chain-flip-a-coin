// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "./SenderConfig.sol";
import {CrossChainFlipACoinSender} from "../src/CrossChainFlipACoinSender.sol";

contract DeploySender is Script, SenderConfig {
    function run() external {
        SenderConfig senderConfig = new SenderConfig();
        (address activeRouter, address linkToken) = senderConfig.activeConfig();
        uint64 destinationChainSelector = senderConfig.destinationChainSelector();
        address receiver = senderConfig.receiver();
        vm.startBroadcast();
        CrossChainFlipACoinSender sender =
            new CrossChainFlipACoinSender(activeRouter, receiver, destinationChainSelector, linkToken);
        vm.stopBroadcast();
        console2.log("Deployed receiver at address: {}", address(sender));
    }
}
