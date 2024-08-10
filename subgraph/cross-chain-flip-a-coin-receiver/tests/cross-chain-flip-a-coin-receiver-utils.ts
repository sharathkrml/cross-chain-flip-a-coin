import { newMockEvent } from "matchstick-as"
import { ethereum, Bytes, Address } from "@graphprotocol/graph-ts"
import {
  OptionChosen,
  OwnershipTransferred
} from "../generated/CrossChainFlipACoinReceiver/CrossChainFlipACoinReceiver"

export function createOptionChosenEvent(
  messageId: Bytes,
  sender: Address,
  isHeads: boolean
): OptionChosen {
  let optionChosenEvent = changetype<OptionChosen>(newMockEvent())

  optionChosenEvent.parameters = new Array()

  optionChosenEvent.parameters.push(
    new ethereum.EventParam(
      "messageId",
      ethereum.Value.fromFixedBytes(messageId)
    )
  )
  optionChosenEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )
  optionChosenEvent.parameters.push(
    new ethereum.EventParam("isHeads", ethereum.Value.fromBoolean(isHeads))
  )

  return optionChosenEvent
}

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent = changetype<OwnershipTransferred>(
    newMockEvent()
  )

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}
