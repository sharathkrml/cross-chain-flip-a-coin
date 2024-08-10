import { OptionChosen } from "../generated/CrossChainFlipACoinSender/CrossChainFlipACoinSender"
import { OptionChosenTxn } from "../generated/schema"

export function handleOptionChosen(event: OptionChosen): void {
  let sender = event.params.sender
  let messageId = event.params.messageId
  let isHeads = event.params.isHeads

  let entityId = event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  let entity = new OptionChosenTxn(entityId)
  entity.txHash = event.transaction.hash
  entity.sender = sender
  entity.messageId = messageId
  if (isHeads) {
    entity.option = "HEADS"
  } else {
    entity.option = "TAILS"
  }
  entity.timestamp = event.block.timestamp
  entity.save()
}
