import React from "react";
import Link from "next/link";

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
        <div className="flex px-12 gap-5">
          <Link href="/trade">Trade</Link>
          <Link href="/yield">Yield</Link>
          <Link href="/borrow">Borrow</Link>
          <Link href="/portfolio">Portfolio</Link>
          <Link href="/council">Council</Link>
        </div>
        <button
          className="rounded-3xl bg-green-500 py-2 px-3 font-semibold"
          onClick={() => alert("TODO")}
        >
          Connect Wallet
        </button>
      </div>
      {/* Sub navigation bar */}
      <div className="flex justify-between px-6 py-3 text-sm text-white/40">
        <div className="flex">
          {mockedAccounts.map((account, index) => (
            <div key={index} className="px-4">
              {account.label}
            </div>
          ))}
          <div className="px-3 ">More</div>
          <div className="px-3">Manage</div>
        </div>
        <div className="flex gap-4">
          <p>$: 2500</p>
          <div>Lvg Gauge</div>
          <div>Risk Gauge</div>
        </div>
      </div>
    </div>
  );
};

export default Navigation;
