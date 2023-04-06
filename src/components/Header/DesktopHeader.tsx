import classNames from 'classnames'

import AccountMenu from 'components/Account/AccountMenu'
import DesktopNavigation from 'components/Navigation/DesktopNavigation'
import Settings from 'components/Settings'
import Wallet from 'components/Wallet/Wallet'
import { WalletConnectProvider } from 'components/Wallet/WalletConnectProvider'

export const menuTree: { href: RouteSegment; label: string }[] = [
  { href: 'trade', label: 'Trade' },
  { href: 'earn', label: 'Earn' },
  { href: 'borrow', label: 'Borrow' },
  { href: 'portfolio', label: 'Portfolio' },
  { href: 'council', label: 'Council' },
]

interface Props {
  params: PageParams
}

export default function DesktopHeader(props: Props) {
  return (
    <header
      className={classNames(
        'fixed left-0 top-0 z-30 hidden w-full',
        'before:content-[" "] before:absolute before:inset-0 before:-z-1 before:h-full before:w-full before:rounded-sm before:backdrop-blur-sticky',
        'lg:block',
      )}
    >
      <div className='flex items-center justify-between border-b border-white/20 py-3 pl-6 pr-4'>
        <DesktopNavigation />
        <div className='flex gap-4'>
          <AccountMenu params={props.params} />
          <WalletConnectProvider>
            <Wallet />
          </WalletConnectProvider>
          <Settings />
        </div>
      </div>
    </header>
  )
}
