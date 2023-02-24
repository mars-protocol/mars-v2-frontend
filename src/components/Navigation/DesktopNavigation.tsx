'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

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
    <div className='relative hidden bg-header lg:block'>
      <div className='flex items-center justify-between border-b border-white/20 px-6 py-3'>
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
        <Wallet />
      </div>
    </div>
  )
}
