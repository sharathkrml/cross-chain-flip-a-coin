// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {CCIPReceiver} from "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {Option} from "./Common.sol";
import {console2} from "forge-std/script.sol";
import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {IVRFCoordinatorV2Plus} from "@chainlink/contracts/v0.8/vrf/dev/interfaces/IVRFCoordinatorV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

contract CrossChainFlipACoinReceiverVRF is CCIPReceiver, VRFConsumerBaseV2Plus {
    /**
     * MessageReceivedAndVrfRequestSubmitted emits when ccip message is received and the result is determined
     * @param messageId The message identifier
     * @param sourceChainSelector The source chain identifier (aka selector)
     * @param sender The sender contract
     * @param user The user address who sent the message
     * @param isHeads User's choice
     * @param vrfRequestId The VRF request identifier
     */
    event MessageReceivedAndVrfRequestSubmitted(
        bytes32 indexed messageId,
        uint64 indexed sourceChainSelector,
        address indexed sender,
        address user,
        bool isHeads,
        uint256 vrfRequestId
    );
    /**
     * VrfRequestSubmitted emits when a VRF request is submitted
     * @param requestId The VRF request identifier
     * @param user  The user who made the request
     * @param isHeads The user's choice
     */
    event VrfRequestSubmitted(uint256 indexed requestId, address indexed user, bool isHeads);

    event FlipResult(uint256 indexed requestId, address indexed user, bool isWinner);

    struct UserChoice {
        bool isHeads;
        address user;
    }

    mapping(uint256 requestId => UserChoice) public s_userChoices;

    mapping(address user => int256 score) public s_userScores;

    uint256 public s_subscriptionId;
    bytes32 public s_keyHash;

    uint16 public constant REQUEST_CONFORMATIONS = 3;

    uint32 public s_callbackGasLimit = 100000;

    constructor(address _router, address _vrfCoordinator, uint256 _subscriptionId, bytes32 _keyHash)
        CCIPReceiver(_router)
        VRFConsumerBaseV2Plus(_vrfCoordinator)
    {
        s_subscriptionId = _subscriptionId;
        s_keyHash = _keyHash;
    }

    function setSubscriptionId(uint64 _subscriptionId) external onlyOwner {
        s_subscriptionId = _subscriptionId;
    }

    function setVRFCoordinator(address _vrfCoordinator) external onlyOwner {
        s_vrfCoordinator = IVRFCoordinatorV2Plus(_vrfCoordinator);
    }

    function setKeyHash(bytes32 _keyHash) external onlyOwner {
        s_keyHash = _keyHash;
    }

    function setCallbackGasLimit(uint32 _callbackGasLimit) external onlyOwner {
        s_callbackGasLimit = _callbackGasLimit;
    }

    function _ccipReceive(Client.Any2EVMMessage memory any2EvmMessage) internal override {
        address sender = abi.decode(any2EvmMessage.sender, (address));
        Option memory option = abi.decode(any2EvmMessage.data, (Option));
        // The result of the coin flip is determined by the block timestamp
        uint256 requestId = _chooseOption(option.isHeads, option.user);

        emit MessageReceivedAndVrfRequestSubmitted(
            any2EvmMessage.messageId, any2EvmMessage.sourceChainSelector, sender, option.user, option.isHeads, requestId
        );
    }

    function chooseOption(bool isHeads) public returns (uint256 requestId) {
        // sends a request to the VRF Coordinator
        return _chooseOption(isHeads, msg.sender);
    }

    function _chooseOption(bool isHeads, address user) internal returns (uint256 requestId) {
        // sends a request to the VRF Coordinator
        requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: s_keyHash,
                subId: s_subscriptionId,
                requestConfirmations: REQUEST_CONFORMATIONS,
                callbackGasLimit: s_callbackGasLimit,
                numWords: 1,
                extraArgs: VRFV2PlusClient._argsToBytes(
                    // Set nativePayment to true to pay for VRF requests with Sepolia ETH instead of LINK
                    VRFV2PlusClient.ExtraArgsV1({nativePayment: false})
                )
            })
        );
        s_userChoices[requestId] = UserChoice({isHeads: isHeads, user: user});
        emit VrfRequestSubmitted(requestId, user, isHeads);
    }

    function fulfillRandomWords(uint256 requestId, uint256[] calldata randomWords) internal override {
        bool isHeads = randomWords[0] % 2 == 0;
        UserChoice memory userChoice = s_userChoices[requestId];
        if (userChoice.isHeads == isHeads) {
            s_userScores[userChoice.user] += 1;
        } else {
            s_userScores[userChoice.user] -= 1;
        }

        emit FlipResult(requestId, userChoice.user, userChoice.isHeads == isHeads);
    }
}
