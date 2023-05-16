import classNames from 'classnames'

import AccountMenu from 'components/Account/AccountMenu'
import DesktopNavigation from 'components/Navigation/DesktopNavigation'
import Settings from 'components/Settings'
import Wallet from 'components/Wallet/Wallet'
import useStore from 'store'

export const menuTree: { page: Page; label: string }[] = [
  { page: 'trade', label: 'Trade' },
  { page: 'farm', label: 'Earn' },
  { page: 'borrow', label: 'Borrow' },
  { page: 'portfolio', label: 'Portfolio' },
  { page: 'council', label: 'Council' },
]

export default function DesktopHeader() {
  const address = useStore((s) => s.address)
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
          {address && <AccountMenu />}
          <Wallet />
          <Settings />
        </div>
      </div>
    </header>
  )
}
