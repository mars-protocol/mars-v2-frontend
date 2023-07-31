import classNames from 'classnames'

import AccountMenu from 'components/Account/AccountMenu'
import EscButton from 'components/Button/EscButton'
import DesktopNavigation from 'components/Navigation/DesktopNavigation'
import Settings from 'components/Settings'
import Wallet from 'components/Wallet'
import useStore from 'store'

export const menuTree: { page: Page; label: string }[] = [
  { page: 'trade', label: 'Trade' },
  { page: 'lend', label: 'Earn' },
  { page: 'borrow', label: 'Borrow' },
  { page: 'portfolio', label: 'Portfolio' },
  { page: 'council', label: 'Council' },
]

export default function DesktopHeader() {
  const address = useStore((s) => s.address)
  const focusComponent = useStore((s) => s.focusComponent)

  function handleCloseFocusMode() {
    useStore.setState({ focusComponent: null })
  }

  return (
    <header
      className={classNames(
        'fixed left-0 top-0 z-30 hidden w-full',
        'before:content-[" "] before:absolute before:inset-0 before:-z-1 before:h-full before:w-full before:rounded-sm before:backdrop-blur-sticky',
        'lg:block',
      )}
    >
      <div
        className={classNames(
          'flex items-center justify-between px-4 py-4',
          focusComponent ? 'relative isolate' : 'border-b border-white/20',
        )}
      >
        <DesktopNavigation />
        {focusComponent ? (
          <div className='flex w-full justify-between'>
            <div className='flex h-5 w-13' />
            {address && <Wallet />}
            <EscButton onClick={handleCloseFocusMode} />
          </div>
        ) : (
          <div className='flex gap-4'>
            {address && <AccountMenu />}
            <Wallet />
            <Settings />
          </div>
        )}
      </div>
    </header>
  )
}
