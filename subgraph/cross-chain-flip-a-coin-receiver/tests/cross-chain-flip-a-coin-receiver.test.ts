import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Bytes, Address } from "@graphprotocol/graph-ts"
import { ExampleEntity } from "../generated/schema"
import { OptionChosen } from "../generated/CrossChainFlipACoinReceiver/CrossChainFlipACoinReceiver"
import { handleOptionChosen } from "../src/cross-chain-flip-a-coin-receiver"
import { createOptionChosenEvent } from "./cross-chain-flip-a-coin-receiver-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let messageId = Bytes.fromI32(1234567890)
    let sender = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let isHeads = "boolean Not implemented"
    let newOptionChosenEvent = createOptionChosenEvent(
      messageId,
      sender,
      isHeads
    )
    handleOptionChosen(newOptionChosenEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("ExampleEntity created and stored", () => {
    assert.entityCount("ExampleEntity", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "ExampleEntity",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a",
      "messageId",
      "1234567890"
    )
    assert.fieldEquals(
      "ExampleEntity",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a",
      "sender",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "ExampleEntity",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a",
      "isHeads",
      "boolean Not implemented"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
