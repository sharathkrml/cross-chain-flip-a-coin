// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import {ReceiverConfig} from "./ReceiverConfig.sol";
import {CrossChainFlipACoinReceiver} from "../src/CrossChainFlipACoinReceiver.sol";

contract DeployReceiver is Script {
    function run() external {
        ReceiverConfig receiverConfig = new ReceiverConfig();
        address router = receiverConfig.activeRouter();
        vm.startBroadcast();
        CrossChainFlipACoinReceiver sender = new CrossChainFlipACoinReceiver(router);
        vm.stopBroadcast();
        console2.log("Deployed receiver at address: {}", address(sender));
    }
}
