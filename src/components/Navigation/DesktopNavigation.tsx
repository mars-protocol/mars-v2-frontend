import classNames from 'classnames'
import Link from 'next/link'
import { headers } from 'next/headers'

import AccountMenu from 'components/Account/AccountMenu'
import { Logo } from 'components/Icons'
import { NavLink } from 'components/Navigation/NavLink'
import Settings from 'components/Settings'
import Wallet from 'components/Wallet/Wallet'
import { WalletConnectProvider } from 'components/Wallet/WalletConnectProvider'
import { getRoute, getRouteParams } from 'utils/route'

export const menuTree: { href: RouteSegment; label: string }[] = [
  { href: 'trade', label: 'Trade' },
  { href: 'earn', label: 'Earn' },
  { href: 'borrow', label: 'Borrow' },
  { href: 'portfolio', label: 'Portfolio' },
  { href: 'council', label: 'Council' },
]

export default function DesktopNavigation() {
  const href = headers().get('x-url') || ''
  const params = getRouteParams(href)

  return (
    <header
      className={classNames(
        'fixed left-0 top-0 z-30 hidden w-full',
        'before:content-[" "] before:absolute before:inset-0 before:-z-1 before:h-full before:w-full before:rounded-sm before:backdrop-blur-sticky',
        'lg:block',
      )}
    >
      <div className='flex items-center justify-between border-b border-white/20 py-3 pl-6 pr-4'>
        <div className='flex flex-grow items-center'>
          <Link href={getRoute(href, { page: 'trade' })}>
            <span className='block h-10 w-10'>
              <Logo />
            </span>
          </Link>
          <div className='flex gap-8 px-6'>
            {menuTree.map((item, index) => (
              <NavLink key={index} href={getRoute(href, { page: item.href })} isActive={true}>
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
        <div className='flex gap-4'>
          <AccountMenu params={params} />
          <WalletConnectProvider>
            <Wallet />
          </WalletConnectProvider>
          <Settings />
        </div>
      </div>
    </header>
  )
}
