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
  getBlockScoutUrl,
  getLiveResponse,
  supportedChainIds,
  supportedChains,
  getCCIPExplorerUrl,
  flipACoin,
} from "./utils";
import { Spinner } from "@nextui-org/spinner";
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
  const [liveResponse, setLiveResponse] = useState({
    optionChosen: false,
    isHeads: false,
    won: false,
    loading: false,
    txHash: "",
    messageId: "",
  });
  const callHeads = async (isHeads: boolean) => {
    if (!account || !chainMetadata) {
      return;
    }
    setLiveResponse({
      optionChosen: false,
      isHeads: isHeads,
      won: false,
      loading: true,
      txHash: "",
      messageId: "",
    });
    let txHash = await flipACoin({
      chainId: chainMetadata.id,
      isHeads,
      account,
    });
    if (!txHash) {
      return;
    }
    setLiveResponse({
      optionChosen: true,
      isHeads: isHeads,
      won: false,
      loading: true,
      txHash: txHash,
      messageId: "",
    });

    let resp = await getLiveResponse(chainMetadata.id, txHash);
    // let resp = await getLiveResponse(chainMetadata.id, txHash);
    setLiveResponse({
      ...resp,
      loading: false,
      txHash: txHash,
      optionChosen: true,
    });
  };

  const reset = () => {
    setLiveResponse({
      optionChosen: false,
      isHeads: false,
      won: false,
      loading: false,
      txHash: "",
      messageId: "",
    });
  };

  return (
    <header className="flex flex-col items-center mb-20 md:mb-20">
      <h1 className="text-2xl md:text-6xl font-semibold md:font-bold tracking-tighter mb-6 text-zinc-100">
        Cross Chain
        <span className="inline-block -skew-x-6 text-blue-500">
          Flip-A-Coin
        </span>
      </h1>
      {liveResponse.optionChosen ? (
        <>
          <span className="inline-block -skew-x-6 text-blue-500">
            You chose
          </span>
          <Image src={liveResponse.isHeads ? heads : tails} alt="" />
        </>
      ) : (
        <Image src={CoverImg} alt="" className="w-1/3" />
      )}
      {liveResponse.loading ? (
        <Spinner label="Loading..." color="warning" />
      ) : (
        <>
          {liveResponse.optionChosen && !liveResponse.messageId && (
            <>
              {liveResponse.won ? (
                <span className="inline-block -skew-x-6 text-blue-500">
                  You won!!
                </span>
              ) : (
                <span className="inline-block -skew-x-6 text-blue-500">
                  You lost!!
                </span>
              )}
            </>
          )}
        </>
      )}
      {liveResponse.txHash && (
        <>
          <span className="inline-block -skew-x-6 text-blue-500 underline">
            txHash:{" "}
            <a
              href={getBlockScoutUrl(chainMetadata!.id, liveResponse.txHash)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {liveResponse.txHash}
            </a>
          </span>
        </>
      )}
      {liveResponse.messageId && (
        <>
          <span className="inline-block -skew-x-6 text-blue-500 underline">
            <a
              href={getCCIPExplorerUrl(liveResponse.messageId)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {getCCIPExplorerUrl(liveResponse.messageId)}
            </a>
          </span>
        </>
      )}
      {showConnectModel && (
        <>
          {!liveResponse.optionChosen ? (
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
            <button
              onClick={() => reset()}
              className="bg-blue-500 text-white px-4 py-2 rounded-md mt-4"
            >
              GO AGAIN!!!
            </button>
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
      <NavBarElement link="/transactions" text="Transactions" />
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
