import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";

import SearchInput from "components/SearchInput";
import Wallet from "./Wallet";

const mockedAccounts = [
  {
    label: "Subaccount 1",
  },
  {
    label: "Subaccount 2",
  },
  {
    label: "Subaccount 3",
  },
  {
    label: "Subaccount 4",
  },
];

const NavLink = ({ href, children }: { href: string; children: string }) => {
  const router = useRouter();

  return (
    <Link href={href} passHref>
      <a
        className={`${
          router.pathname === href ? "text-white" : ""
        } hover:text-white`}
      >
        {children}
      </a>
    </Link>
  );
};

const Navigation = () => {
  return (
    <div>
      {/* Main navigation bar */}
      <div className="flex justify-between items-center px-6 py-3 border-b border-white/20">
        <Link href="/" passHref>
          <a>
            <img src="/logo.svg" alt="mars" />
          </a>
        </Link>
        <div className="flex px-12 gap-5 text-white/40">
          <NavLink href="/trade">Trade</NavLink>
          <NavLink href="/yield">Yield</NavLink>
          <NavLink href="/borrow">Borrow</NavLink>
          <NavLink href="/portfolio">Portfolio</NavLink>
          <NavLink href="/council">Council</NavLink>
        </div>
        <Wallet />
      </div>
      {/* Sub navigation bar */}
      <div className="flex justify-between px-6 py-3 text-sm text-white/40">
        <div className="flex items-center">
          <SearchInput />
          {mockedAccounts.map((account, index) => (
            <div key={index} className="px-4 hover:text-white cursor-pointer">
              {account.label}
            </div>
          ))}
          <div className="px-3">More</div>
          <div className="px-3">Manage</div>
        </div>
        <div className="flex gap-4 items-center">
          <p>$: 2500</p>
          <div>Lvg Gauge</div>
          <div>Risk Gauge</div>
        </div>
      </div>
    </div>
  );
};

export default Navigation;
