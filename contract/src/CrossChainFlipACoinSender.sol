// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {IRouterClient} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {Option} from "./Common.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {LinkTokenInterface} from "@chainlink/contracts/v0.8/shared/interfaces/LinkTokenInterface.sol";

contract CrossChainFlipACoinSender is Ownable {
    error NotEnoughBalance(uint256 balance, uint256 fees);
    error WithdrawReverted();

    event OptionChosen(bytes32 indexed messageId, address indexed sender, bool indexed isHeads);

    IRouterClient public immutable i_router;
    uint64 public immutable i_destinationChainSelector;
    address public immutable i_receiver;
    LinkTokenInterface public immutable i_linkToken;

    constructor(address _router, address _receiver, uint64 _destinationChainSelector, address _link)
        Ownable(msg.sender)
    {
        i_router = IRouterClient(_router);
        i_receiver = _receiver;
        i_destinationChainSelector = _destinationChainSelector;
        i_linkToken = LinkTokenInterface(_link);
    }

    function chooseOption(bool isHeads) external {
        (Client.EVM2AnyMessage memory message, uint256 fees) = prepareMessageAndGetFees(isHeads, msg.sender);
        if (fees > i_linkToken.balanceOf(address(this))) {
            revert NotEnoughBalance(address(this).balance, fees);
        }
        // approve the Router to transfer LINK tokens on contract's behalf. It will spend the fees in LINK
        i_linkToken.approve(address(i_router), fees);
        bytes32 messageId = i_router.ccipSend{value: fees}(i_destinationChainSelector, message);

        emit OptionChosen(messageId, msg.sender, isHeads);
    }

    function prepareMessageAndGetFees(bool isHeads, address user)
        public
        view
        returns (Client.EVM2AnyMessage memory, uint256)
    {
        Option memory option = Option({isHeads: isHeads, user: user, timestamp: block.timestamp});
        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(i_receiver), // ABI-encoded receiver address
            data: abi.encode(option), // ABI-encoded string
            tokenAmounts: new Client.EVMTokenAmount[](0), // Empty array aas no tokens are transferred
            extraArgs: Client._argsToBytes(
                // Additional arguments, setting gas limit
                Client.EVMExtraArgsV1({gasLimit: 200_000})
            ),
            // Set the feeToken to a feeTokenAddress, indicating specific asset will be used for fees
            feeToken: address(i_linkToken)
        });
        uint256 fees = i_router.getFee(i_destinationChainSelector, message);
        return (message, fees);
    }

    function withdraw() public onlyOwner {
        uint256 linkBalance = i_linkToken.balanceOf(address(this));
        bool success = i_linkToken.transfer(owner(), linkBalance);
        if (!success) {
            revert WithdrawReverted();
        }
    }

    function balance() public view returns (uint256) {
        return i_linkToken.balanceOf(address(this));
    }

    receive() external payable {}
    fallback() external payable {}
}
