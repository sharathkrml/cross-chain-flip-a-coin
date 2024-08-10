// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {CCIPReceiver} from "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {Option} from "./Common.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract CrossChainFlipACoinReceiver is CCIPReceiver, Ownable {
    /**
     * MessageReceivedAndResult emits when ccip message is received and the result is determined
     * @param messageId The message identifier
     * @param sourceChainSelector The source chain identifier (aka selector)
     * @param sender The sender contract
     * @param user The user address who sent the message
     * @param isHeads User's choice
     * @param won result of the coin flip
     * @param optionTimestamp The timestamp of option chosen
     */
    event MessageReceivedAndResult(
        bytes32 indexed messageId,
        uint64 indexed sourceChainSelector,
        address indexed sender,
        address user,
        bool isHeads,
        bool won,
        uint256 optionTimestamp
    );

    event FlipResult(address indexed user, bool indexed won, bool isHeads, uint256 indexed optionTimestamp);

    mapping(address user => int256 score) public s_userScores;

    constructor(address _router) CCIPReceiver(_router) Ownable(msg.sender) {}

    function _ccipReceive(Client.Any2EVMMessage memory any2EvmMessage) internal override {
        address sender = abi.decode(any2EvmMessage.sender, (address));
        Option memory option = abi.decode(any2EvmMessage.data, (Option));
        bool won = _chooseOption(option.isHeads, option.user);

        emit MessageReceivedAndResult(
            any2EvmMessage.messageId,
            any2EvmMessage.sourceChainSelector,
            sender,
            option.user,
            option.isHeads,
            won,
            option.timestamp
        );
    }

    /**
     * Users can choose heads or tails (direct call)
     * @param isHeads The user's choice
     */
    function chooseOption(bool isHeads) external returns (bool) {
        return _chooseOption(isHeads, msg.sender);
    }

    function _chooseOption(bool isHeads, address user) internal returns (bool won) {
        won = _generateRandomBoolean() == isHeads;
        if (won) {
            s_userScores[user] += 1;
        } else {
            s_userScores[user] -= 1;
        }
        emit FlipResult(user, won, isHeads, block.timestamp);
    }

    function _generateRandomBoolean() internal view returns (bool) {
        return _generateRandomNumber() % 2 == 0;
    }

    function _generateRandomNumber() internal view returns (uint256) {
        return uint256(
            keccak256(
                abi.encode(
                    keccak256(
                        abi.encodePacked(
                            block.timestamp, block.prevrandao, msg.sender, blockhash(block.number), tx.origin, gasleft()
                        )
                    )
                )
            )
        );
    }
}
