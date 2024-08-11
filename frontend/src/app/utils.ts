import {
  eth_getTransactionReceipt,
  getContract,
  getRpcClient,
  prepareContractCall,
  sendTransaction,
} from "thirdweb";
import { sepolia, baseSepolia } from "thirdweb/chains";
import { client } from "./client";
import { Account } from "thirdweb/wallets";

import { hexToBool } from "thirdweb/utils";
export const supportedChains = [sepolia, baseSepolia];
export const supportedChainIds = {
  [sepolia.id]: true,
  [baseSepolia.id]: true,
};
export const getChain = {
  [sepolia.id]: sepolia,
  [baseSepolia.id]: baseSepolia,
};

export const CROSS_CHAIN_FLIP_A_COIN_RECEIVER =
  "0x96D9E26D3C6f71838aC2DceF23b256ED51a75E1A";

export const getReceiverContract = () => {
  return getContract({
    address: CROSS_CHAIN_FLIP_A_COIN_RECEIVER,
    chain: sepolia,
    client: client,
  });
};

export const CROSS_CHAIN_FLIP_A_COIN_SENDER =
  "0xc49526E786607a4575342f56205F3C49090443A6";

export const getSenderContract = () => {
  return getContract({
    address: CROSS_CHAIN_FLIP_A_COIN_SENDER,
    chain: baseSepolia,
    client: client,
  });
};

export const flipACoin = async ({
  chainId,
  isHeads,
  account,
}: {
  chainId: number;
  isHeads: boolean;
  account: Account;
}) => {
  if (chainId == sepolia.id) {
    const contract = getReceiverContract();
    const transaction = prepareContractCall({
      contract,
      method: "function chooseOption(bool isHeads)",
      params: [isHeads],
      gas: BigInt(1000000),
    });
    const { transactionHash } = await sendTransaction({
      account,
      transaction,
    });
    return transactionHash;
  } else {
    const contract = getSenderContract();
    const transaction = prepareContractCall({
      contract,
      method: "function chooseOption(bool isHeads)",
      params: [isHeads],
    });
    if (!account) return;
    const { transactionHash } = await sendTransaction({
      account,
      transaction,
    });
    return transactionHash;
  }
};

export const getBlockScoutUrl = (chainId: number, txHash: string) => {
  if (chainId === sepolia.id) {
    return `https://eth-sepolia.blockscout.com/tx/${txHash}`;
  } else if (chainId === baseSepolia.id) {
    return `https://base-sepolia.blockscout.com/tx/${txHash}`;
  } else {
    return "";
  }
};

export const getCCIPExplorerUrl = (messageId: string) => {
  return `https://ccip.chain.link/msg/${messageId}`;
};
export const getLiveResponse = async (
  chainId: number,
  txHash: `0x${string}`
) => {
  let chain = getChain[chainId];
  const rpcRequest = getRpcClient({
    client,
    chain,
  });
  let retryCount = 0;
  const maxRetries = 10;
  while (retryCount < maxRetries) {
    try {
      const transactionReceipt = await eth_getTransactionReceipt(rpcRequest, {
        hash: txHash,
      });
      for (const log of transactionReceipt.logs) {
        if (
          log.topics[0] ===
          "0xb75d1869546335486801cab98d39defb78825f6b0dd5da62df53c3414954195b"
        ) {
          // FlipResult(address indexed user, bool indexed won, bool isHeads, uint256 indexed optionTimestamp)
          if (log.topics[2] && log.data) {
            let won: boolean = hexToBool(log.topics[2]);
            let isHeads: boolean = hexToBool(log.data);
            return { won, isHeads, messageId: "" };
          }
        }
        if (
          log.topics[0] ===
          "0xc2622afc28517b0530d70c11de39649823a6ca05411c2d38c85009a35c0b8f3b"
        ) {
          // OptionChosen(bytes32 indexed messageId, address indexed sender, bool indexed isHeads)
          if (log.topics[3] && log.topics[1]) {
            let isHeads: boolean = hexToBool(log.topics[3]);
            return { won: false, isHeads, messageId: log.topics[1] };
          }
        }
      }
    } catch (e) {
      console.log(e);
      retryCount++;
      await sleep(2000); // Sleep for 2 seconds before retrying
    }
  }
  throw new Error("Failed to get transaction receipt after multiple retries");
};

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const convertTimestampToDate = (timestamp: number) => {
  const date: Date = new Date(timestamp * 1000);
  return date.toUTCString();
};

export function trimMiddle(str: string, maxLength: number) {
  if (str.length <= maxLength) {
    return str;
  }
  return (
    str.slice(0, maxLength / 2) + "..." + str.slice(str.length - maxLength / 2)
  );
}

export const PENDING = 845327011155111;

export const getSource = (sourceChainSelector: number) => {
  switch (sourceChainSelector.toString()) {
    case "845327011155111":
      return "Base Sepolia➡️Sepolia 🕢";
    case "10344971235874465080":
      return "Base Sepolia➡️Sepolia ✅";
    default:
      return "Sepolia ✅";
  }
};
