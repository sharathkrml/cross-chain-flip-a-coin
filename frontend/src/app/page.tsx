"use client";
import Image from "next/image";
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import CoverImg from "@public/coinflip-cover.gif";
import { client } from "./client";
import { defineChain } from "thirdweb";
import Link from "next/link";
let sepolia = defineChain(84532);
export default function Home() {
  const activeAccount = useActiveAccount();
  return (
    <main className="p-4 pb-10 min-h-[100vh] flex-row items-center justify-center container max-w-screen-lg mx-auto">
      <NavBar showConnectModel={!!activeAccount} />
      <div className="py-20">
        <Header />

        <div className="flex justify-center mb-20">
          {!activeAccount && (
            <ConnectButton
              client={client}
              chains={[sepolia]}
              appMetadata={{
                name: "Example App",
                url: "https://example.com",
              }}
            />
          )}
        </div>
      </div>
    </main>
  );
}

function Header() {
  return (
    <header className="flex flex-col items-center mb-20 md:mb-20">
      <h1 className="text-2xl md:text-6xl font-semibold md:font-bold tracking-tighter mb-6 text-zinc-100">
        Cross Chain
        <span className="inline-block -skew-x-6 text-blue-500">
          Flip-A-Coin
        </span>
      </h1>
      <Image src={CoverImg} alt="" className="w-1/3" />
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
