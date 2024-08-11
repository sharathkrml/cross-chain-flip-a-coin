"use client";
import Image from "next/image";
import CoverImg from "@public/coinflip-cover.gif";
import Link from "next/link";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/react";
import {
  fetchAllTransactions,
  fetchOptionChosenTxns,
  fetchReceiverTransactions,
  fetchUserReceiverTransactions,
  ReceiverTransaction,
} from "../api";
import { useEffect, useState } from "react";
import {
  convertTimestampToDate,
  getBlockScoutUrl,
  getCCIPExplorerUrl,
  getSource,
  PENDING,
  trimMiddle,
} from "../utils";
import { useSearchParams } from "next/navigation";

export default function Home() {
  const searchParams = useSearchParams();
  const address = searchParams.get("address");
  const [receiverTransactions, setReceiverTransactions] = useState<
    ReceiverTransaction[]
  >([]);
  useEffect(() => {
    if (address === null) {
      fetchAllTransactions()
        .then((resp) => {
          setReceiverTransactions(resp);
        })
        .catch((e) => console.log(e));
    } else {
      fetchUserReceiverTransactions(address)
        .then((resp) => {
          setReceiverTransactions(resp.flipResultTxns);
        })
        .catch((e) => console.log(e));
    }
  }, [address]);

  return (
    <main className="pt-4 pb-10 min-h-[100vh] flex-row items-center justify-center container  mx-auto">
      <NavBar />
      {address && (
        <div>
          Transactions by user <span className="text-blue-500">{address}</span>
        </div>
      )}
      <div className="py-20">
        <header className="flex flex-col items-center mb-20 md:mb-20">
          <Table aria-label="Example static collection table" className="dark">
            <TableHeader>
              <TableColumn>User</TableColumn>
              <TableColumn>CCIP</TableColumn>
              <TableColumn>SOURCE</TableColumn>
              <TableColumn>Status</TableColumn>
              <TableColumn>OPTION</TableColumn>
              <TableColumn>WON</TableColumn>
              <TableColumn>Time</TableColumn>
              <TableColumn>TxHash</TableColumn>
            </TableHeader>
            <TableBody>
              {receiverTransactions.map((txn) => (
                <TableRow key={txn.id}>
                  <TableCell>
                    <Link
                      href={"transactions?address=" + txn.user.id}
                      className="text-blue-500 underline"
                    >
                      {trimMiddle(txn.user.id, 8)}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <a
                      href={getCCIPExplorerUrl(txn.messageId)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline"
                    >
                      {trimMiddle(txn.messageId, 8)} ↗️
                    </a>
                  </TableCell>
                  <TableCell>{getSource(txn.sourceChainSelector)}</TableCell>
                  <TableCell>
                    {txn.sourceChainSelector === PENDING
                      ? "PENDING"
                      : "COMPLETED"}
                  </TableCell>
                  <TableCell>{txn.option}</TableCell>
                  <TableCell>
                    {txn.sourceChainSelector === PENDING ? (
                      <span>_</span>
                    ) : (
                      <span>{txn.won ? "WON" : "LOST"}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {convertTimestampToDate(txn.optionTimestamp)}
                  </TableCell>
                  <TableCell>
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href={
                        txn.sourceChainSelector !== PENDING
                          ? getBlockScoutUrl(11155111, txn.id)
                          : getBlockScoutUrl(84532, txn.id)
                      }
                    >
                      {trimMiddle(txn.id, 8)}
                    </a>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </header>
      </div>
    </main>
  );
}

const NavBar = () => {
  return (
    <ul className="flex flex-row-reverse items-center">
      <NavBarElement link="/" text="Home" />
    </ul>
  );
};

const NavBarElement = ({ link, text }: { link: string; text: string }) => {
  return (
    <li className="px-5 py-4 border-[1px] border-solid border-[#272831] bg-[#131418] hover:bg-[#1B1C22] cursor-pointer rounded-[12px] mr-2">
      <Link href={link}>{text}</Link>
    </li>
  );
};
