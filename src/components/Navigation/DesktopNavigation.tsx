'use client'

import Link from 'next/link'

import { AccountNavigation } from 'components/Account/AccountNavigation'
import { Logo } from 'components/Icons'
import { menuTree } from 'components/Navigation/menuTree'
import { NavLink } from 'components/Navigation/NavLink'
import Wallet from 'components/Wallet/Wallet'

export default function DesktopNavigation() {
  return (
    <div className='relative hidden bg-header lg:block'>
      <div className='flex items-center justify-between border-b border-white/20 px-6 py-3'>
        <div className='flex flex-grow items-center'>
          <Link href='/trade'>
            <span className='inline-block h-10 w-10'>
              <Logo />
            </span>
          </Link>
          <div className='flex gap-8 px-6'>
            {menuTree.map((item, index) => (
              <NavLink key={index} href={item.href}>
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
        <Wallet />
      </div>
      <AccountNavigation />
    </div>
  )
}
