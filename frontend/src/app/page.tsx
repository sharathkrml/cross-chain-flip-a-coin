"use client";
import Image from "next/image";
import {
  ConnectButton,
  useActiveAccount,
  useNetworkSwitcherModal,
  useActiveWalletChain,
  useSendTransaction,
} from "thirdweb/react";
import CoverImg from "@public/coinflip-cover.gif";
import heads from "@public/heads.png";
import tails from "@public/tails.png";
import { client } from "./client";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  defineChain,
  eth_getTransactionReceipt,
  getRpcClient,
  prepareContractCall,
  sendTransaction,
} from "thirdweb";
import { sepolia, baseSepolia } from "thirdweb/chains";
import {
  flipACoin,
  getBlockScoutUrl,
  getChain,
  getReceiverContract,
  getSenderContract,
  getTxReceipt,
  supportedChainIds,
  supportedChains,
} from "./utils";
export default function Home() {
  const activeAccount = useActiveAccount();
  const chainMetadata = useActiveWalletChain();
  const networkSwitcher = useNetworkSwitcherModal();
  useEffect(() => {
    if (chainMetadata) {
      if (!supportedChainIds[chainMetadata.id]) {
        networkSwitcher.open({
          client,
          sections: [
            {
              label: "Supported chains",
              chains: supportedChains,
            },
          ],
        });
      }
    }
  }, [chainMetadata]);

  return (
    <main className="p-4 pb-10 min-h-[100vh] flex-row items-center justify-center container max-w-screen-lg mx-auto">
      <NavBar showConnectModel={!!activeAccount} />
      <div className="py-20">
        <Header showConnectModel={!!activeAccount} />
        <div className="flex justify-center mb-20">
          {!activeAccount && (
            <ConnectButton
              client={client}
              appMetadata={{
                name: "Example App",
                url: "https://example.com",
              }}
              chains={supportedChains}
            />
          )}
        </div>
      </div>
    </main>
  );
}

function Header({ showConnectModel }: { showConnectModel: boolean }) {
  const chainMetadata = useActiveWalletChain();
  const account = useActiveAccount();
  const [txHash, setTxHash] = useState("");

  const callHeads = async (isHeads: boolean) => {
    if (!account || !chainMetadata) {
      return;
    }
    let txHash = await flipACoin({
      chainId: chainMetadata.id,
      isHeads,
      account,
    });
    if (!txHash) {
      return;
    }
    setTxHash(txHash);
    getTxReceipt(chainMetadata.id, txHash);
  };

  return (
    <header className="flex flex-col items-center mb-20 md:mb-20">
      <h1 className="text-2xl md:text-6xl font-semibold md:font-bold tracking-tighter mb-6 text-zinc-100">
        Cross Chain
        <span className="inline-block -skew-x-6 text-blue-500">
          Flip-A-Coin
        </span>
      </h1>
      <Image src={CoverImg} alt="" className="w-1/3" />
      {showConnectModel && (
        <>
          {txHash.length == 0 ? (
            <>
              <span className="inline-block -skew-x-6 text-blue-500">
                Choose one!!
              </span>
              <div className="flex items-center justify-around">
                <button
                  onClick={() => {
                    callHeads(true);
                  }}
                  className="flex flex-col items-center justify-center rounded-full w-1/4"
                >
                  <span>Heads</span>
                  <Image src={heads} alt="Heads" />
                </button>
                <button
                  onClick={() => callHeads(false)}
                  className="flex flex-col items-center justify-center rounded-full w-1/4"
                >
                  <span>Tails</span>
                  <Image src={tails} alt="Tails" />
                </button>
              </div>
            </>
          ) : (
            <>
              <span className="inline-block -skew-x-6 text-blue-500 underline">
                Transaction Successful!!, txHash:{" "}
                <a
                  href={getBlockScoutUrl(chainMetadata!.id, txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {txHash}
                </a>
              </span>
              <button
                onClick={() => setTxHash("")}
                className="bg-blue-500 text-white px-4 py-2 rounded-md mt-4"
              >
                GO AGAIN!!!
              </button>
            </>
          )}
        </>
      )}
    </header>
  );
}

const NavBar = ({ showConnectModel }: { showConnectModel: boolean }) => {
  return (
    <ul className="flex flex-row-reverse items-center">
      <li>
        {showConnectModel && (
          <ConnectButton
            client={client}
            appMetadata={{
              name: "Example App",
              url: "https://example.com",
            }}
          />
        )}
      </li>
      <NavBarElement link="/leaderboard" text="Leaderboard" />
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
