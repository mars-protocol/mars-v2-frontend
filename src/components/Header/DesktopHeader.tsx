import classNames from 'classnames'

import AccountMenu from 'components/Account/AccountMenu'
import EscButton from 'components/Button/EscButton'
import DesktopNavigation from 'components/Navigation/DesktopNavigation'
import Settings from 'components/Settings'
import Wallet from 'components/Wallet'
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
  const focusMode = useStore((s) => s.focusMode)

  function handleCloseFocusMode() {
    useStore.setState({ focusMode: null})
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
          'flex items-center justify-between py-3 pl-6 pr-4',
          !focusMode && ' border-b border-white/20',
        )}
      >
        <DesktopNavigation />
        {focusMode ? (
          <EscButton onClick={handleCloseFocusMode} />
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
