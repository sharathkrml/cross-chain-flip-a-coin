// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";

contract SenderConfig {
    error UnsupportedChainId();

    struct Config {
        address activeRouter;
        address linkToken;
    }

    Config public activeConfig;
    uint64 public destinationChainSelector = 16015286601757825753; // SEPOLIA chain selector
    address public receiver = 0x17633FFD555b5ddE735006Af7f591E41E1142B25; // will be updated after deployment

    constructor() {
        if (block.chainid == 84532) {
            // base sepolia
            address activeRouter = 0xD3b06cEbF099CE7DA4AcCf578aaebFDBd6e88a93;
            address linkToken = 0xE4aB69C077896252FAFBD49EFD26B5D171A32410;
            activeConfig = Config(activeRouter, linkToken);
        } else {
            revert UnsupportedChainId();
        }
    }
}
