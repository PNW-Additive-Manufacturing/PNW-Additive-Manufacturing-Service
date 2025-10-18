

import Link from "next/link";
import { MouseEventHandler } from "react";


interface NavbarLinkProps {
  name: string;
  path: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}

export default function NavbarLink({ name, path, onClick }: NavbarLinkProps) {
  return (
    <Link
      onClick={onClick}
      href={path}
      className="rounded-md whitespace-nowrap xl:rounded-none text-base w-full p-3 xl:p-0 bg-gray-100 sm:bg-transparent xl:w-fit offset border-b-black border-opacity-5 hover:text-pnw-gold hover:border-b-pnw-gold hover:border-opacity-100 active:text-pnw-gold"
      style={{ fontSize: "16px" }}
    >
      {name}
    </Link>
  );
}
