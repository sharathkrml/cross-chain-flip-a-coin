// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";

contract ReceiverConfig {
    error UnsupportedChainId();

    address public activeRouter;

    constructor() {
        if (block.chainid == 11155111) {
            // sepolia
            activeRouter = 0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59;
        } else {
            revert UnsupportedChainId();
        }
    }
}
