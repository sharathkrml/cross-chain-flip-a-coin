"use client";
import Image from "next/image";
import CoverImg from "@public/coinflip-cover.gif";
import Link from "next/link";
export default function Home() {
  return (
    <main className="p-4 pb-10 min-h-[100vh] flex-row items-center justify-center container max-w-screen-lg mx-auto">
      <NavBar />
      <div className="py-20">
        <Header />
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
