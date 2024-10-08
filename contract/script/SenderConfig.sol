// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";

contract SenderConfig {
    error UnsupportedChainId();

    struct Config {
        address activeRouter;
    }

    Config public activeConfig;
    uint64 public destinationChainSelector = 16015286601757825753; // SEPOLIA chain selector
    address public receiver = 0x96D9E26D3C6f71838aC2DceF23b256ED51a75E1A; // will be updated after deployment

    constructor() {
        if (block.chainid == 84532) {
            // base sepolia
            address activeRouter = 0xD3b06cEbF099CE7DA4AcCf578aaebFDBd6e88a93;
            activeConfig = Config(activeRouter);
        } else {
            revert UnsupportedChainId();
        }
    }
}
