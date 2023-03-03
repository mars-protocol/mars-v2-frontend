'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { AccountNavigation } from 'components/Account/AccountNavigation'
import { Logo } from 'components/Icons'
import { NavLink } from 'components/Navigation/NavLink'
import Wallet from 'components/Wallet/Wallet'
import { getRoute } from 'utils/route'

export const menuTree: { href: RouteSegment; label: string }[] = [
  { href: 'trade', label: 'Trade' },
  { href: 'earn', label: 'Earn' },
  { href: 'borrow', label: 'Borrow' },
  { href: 'portfolio', label: 'Portfolio' },
  { href: 'council', label: 'Council' },
]

export default function DesktopNavigation() {
  const pathname = usePathname() || ''

  return (
    <div className='fixed top-0 left-0 z-40 hidden w-full backdrop-blur-sticky lg:block'>
      <div className='flex items-center justify-between border-b border-white/20 py-3 pl-6 pr-4'>
        <div className='flex flex-grow items-center'>
          <Link href={getRoute(pathname, { page: 'trade' })}>
            <span className='block h-10 w-10'>
              <Logo />
            </span>
          </Link>
          <div className='flex gap-8 px-6'>
            {menuTree.map((item, index) => (
              <NavLink key={index} href={getRoute(pathname, { page: item.href })}>
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
        <div className='flex gap-4'>
          <AccountNavigation />
          <Wallet />
        </div>
      </div>
    </div>
  )
}
