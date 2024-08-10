import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import { MessageReceivedAndResult, FlipResult } from "../generated/CrossChainFlipACoinReceiver/CrossChainFlipACoinReceiver"
import { FlipResultTxn, User } from "../generated/schema"

export function handleMessageReceivedAndResult(event: MessageReceivedAndResult): void {
  let entityId = event.transaction.hash.toHexString()
  let flipResultTxn = new FlipResultTxn(entityId)
  flipResultTxn.messageId = event.params.messageId
  flipResultTxn.sourceChainSelector = event.params.sourceChainSelector
  flipResultTxn.sender = event.params.sender
  if (event.params.isHeads) {
    flipResultTxn.option = "HEADS"
  } else {
    flipResultTxn.option = "TAILS"
  }
  flipResultTxn.won = event.params.won
  let user = getOrCreateUser(event.params.sender)
  if (event.params.won) {
    user.score = user.score.plus(BigInt.fromI32(1))
  } else {
    user.score = user.score.minus(BigInt.fromI32(1))
  }
  user.save()
  flipResultTxn.user = user.id
  flipResultTxn.optionTimestamp = event.params.optionTimestamp
  flipResultTxn.save()
}

export function handleFlipResult(event: FlipResult): void {
  let entityId = event.transaction.hash.toHexString()
  if (FlipResultTxn.load(entityId)) {
    return
  }
  let flipResultTxn = new FlipResultTxn(entityId)

  flipResultTxn.messageId = Bytes.empty()
  flipResultTxn.sourceChainSelector = BigInt.zero()
  flipResultTxn.sender = Address.zero()
  if (event.params.isHeads) {
    flipResultTxn.option = "HEADS"
  } else {
    flipResultTxn.option = "TAILS"
  }
  flipResultTxn.won = event.params.won
  let user = getOrCreateUser(event.params.user)
  if (event.params.won) {
    user.score = user.score.plus(BigInt.fromI32(1))
  } else {
    user.score = user.score.minus(BigInt.fromI32(1))
  }
  user.save()
  flipResultTxn.user = user.id
  flipResultTxn.optionTimestamp = event.params.optionTimestamp
  flipResultTxn.save()
}

function getOrCreateUser(user: Address): User {
  let userEntity = User.load(user.toHexString())
  if (!userEntity) {
    userEntity = new User(user.toHexString())
    userEntity.score = BigInt.fromI32(0)
    userEntity.save()
  }
  return userEntity as User
}
