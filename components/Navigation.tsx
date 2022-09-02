import React from "react";
import Link from "next/link";

const Navigation = () => {
  return (
    <div>
      <Link href="/">
        <img src="/logo.svg" alt="mars" />
      </Link>
      <Link href="/trade">Trade</Link>
      <Link href="/yield">Yield</Link>
      <Link href="/borrow">Borrow</Link>
      <Link href="/portfolio">Portfolio</Link>
      <Link href="/council">Council</Link>
    </div>
  );
};

export default Navigation;
