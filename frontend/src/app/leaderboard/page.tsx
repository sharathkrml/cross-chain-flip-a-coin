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
      <Table aria-label="Example static collection table" className="dark">
        <TableHeader>
          <TableColumn>NAME</TableColumn>
          <TableColumn>ROLE</TableColumn>
          <TableColumn>STATUS</TableColumn>
        </TableHeader>
        <TableBody>
          <TableRow key="1">
            <TableCell>Tony Reichert</TableCell>
            <TableCell>CEO</TableCell>
            <TableCell>Active</TableCell>
          </TableRow>
          <TableRow key="2">
            <TableCell>Zoey Lang</TableCell>
            <TableCell>Technical Lead</TableCell>
            <TableCell>Paused</TableCell>
          </TableRow>
          <TableRow key="3">
            <TableCell>Jane Fisher</TableCell>
            <TableCell>Senior Developer</TableCell>
            <TableCell>Active</TableCell>
          </TableRow>
          <TableRow key="4">
            <TableCell>William Howard</TableCell>
            <TableCell>Community Manager</TableCell>
            <TableCell>Vacation</TableCell>
          </TableRow>
        </TableBody>
      </Table>
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
