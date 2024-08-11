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
import { fetchUser, User } from "../api";
import { useEffect, useState } from "react";

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  useEffect(() => {
    fetchUser()
      .then((resp) => {
        setUsers(resp.users);
      })
      .catch((e) => console.log(e));
  }, []);

  return (
    <main className="p-4 pb-10 min-h-[100vh] flex-row items-center justify-center container max-w-screen-lg mx-auto">
      <NavBar />
      <div className="py-20">
        <header className="flex flex-col items-center mb-20 md:mb-20">
          <Table aria-label="Example static collection table" className="dark">
            <TableHeader>
              <TableColumn>User</TableColumn>
              <TableColumn>Score</TableColumn>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.score}</TableCell>
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
