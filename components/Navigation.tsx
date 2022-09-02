import React from "react";
import Link from "next/link";

const Navigation = () => {
  return (
    <div className="flex items-center px-6 py-2">
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
    </div>
  );
};

export default Navigation;
