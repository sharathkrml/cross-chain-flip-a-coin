import { GraphQLClient, gql } from "graphql-request";
import { PENDING } from "../utils";

const receiverUrl = process.env.NEXT_PUBLIC_RECEIVER_SUBGRAPH || "";
const receiverGraphQLClient = new GraphQLClient(receiverUrl);

const UserQuery = gql`
  query getUser {
    users(orderBy: score, orderDirection: desc) {
      id
      score
    }
  }
`;

type UserResult = {
  users: User[];
};

export type User = {
  id: string;
  score: number;
};
export const fetchUser = async () => {
  let response = await receiverGraphQLClient.request(UserQuery);
  return response as UserResult;
};

const ReceiverTransactionsQuery = gql`
  query getReceiverTransactions {
    flipResultTxns(orderBy: optionTimestamp, orderDirection: desc) {
      won
      user {
        id
      }
      sourceChainSelector
      sender
      optionTimestamp
      option
      messageId
      id
    }
  }
`;

type ReceiverTransactionResult = {
  flipResultTxns: ReceiverTransaction[];
};

export type ReceiverTransaction = {
  won: boolean;
  user: {
    id: string;
  };
  sourceChainSelector: number;
  sender: string;
  optionTimestamp: number;
  option: boolean;
  messageId: string;
  id: string;
};

export const fetchReceiverTransactions = async () => {
  let response = await receiverGraphQLClient.request(ReceiverTransactionsQuery);
  return response as ReceiverTransactionResult;
};

const userReceiverTransactionsQuery = (address: string) => gql`
  query getReceiverTransactions {
    flipResultTxns(
      where: { user: "${address}" }
      orderBy: optionTimestamp
      orderDirection: desc
    ) {
      won
      user {
        id
      }
      sourceChainSelector
      sender
      optionTimestamp
      option
      messageId
      id
    }
  }
`;

export const fetchUserReceiverTransactions = async (address: string) => {
  let query = userReceiverTransactionsQuery(address);
  let response = await receiverGraphQLClient.request(query);
  return response as ReceiverTransactionResult;
};

const optionChosenTxnsQuery = (messageId_not_in: string[]) => {
  return gql`
    query OptionChosenTxns {
      optionChosenTxns(
        where: {
          messageId_not_in: [
            ${messageId_not_in.map((id) => `"${id}"`).join(", ")}
          ]
        }
        orderBy: timestamp
        orderDirection: desc
      ) {
        txHash
        timestamp
        sender
        option
        messageId
        id
      }
    }
  `;
};

type OptionChosenTxnsResult = {
  optionChosenTxns: OptionChosenTxns[];
};

export type OptionChosenTxns = {
  txHash: string;
  timestamp: number;
  sender: string;
  option: boolean;
  messageId: string;
  id: string;
};

const senderUrl = process.env.NEXT_PUBLIC_SENDER_SUBGRAPH || "";
const senderGraphQLClient = new GraphQLClient(senderUrl);

export const fetchOptionChosenTxns = async (messageId_not_in: string[]) => {
  let query = optionChosenTxnsQuery(messageId_not_in);
  console.log(query);
  let response = await senderGraphQLClient.request(query);
  return response as OptionChosenTxnsResult;
};

export const fetchAllTransactions = async () => {
  let receiverTransactions = await fetchReceiverTransactions();

  let messageIds = receiverTransactions.flipResultTxns.map(
    (txn) => txn.messageId
  );
  let optionsChosen = await fetchOptionChosenTxns(messageIds);
  let txns: ReceiverTransaction[] = [];
  for (let txn of optionsChosen.optionChosenTxns) {
    txns.push({
      won: false,
      user: {
        id: txn.sender,
      },
      sourceChainSelector: PENDING,
      sender: "",
      optionTimestamp: txn.timestamp,
      option: txn.option,
      messageId: txn.messageId,
      id: txn.txHash,
    });
  }

  return receiverTransactions.flipResultTxns.concat(txns).sort((a, b) => {
    return b.optionTimestamp - a.optionTimestamp;
  });
};
