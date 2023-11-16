import classNames from 'classnames'
import { isDesktop } from 'react-device-detect'

import AccountMenu from 'components/Account/AccountMenu'
import EscButton from 'components/Button/EscButton'
import OracleResyncButton from 'components/Header/OracleResyncButton'
import DesktopNavigation from 'components/Navigation/DesktopNavigation'
import RewardsCenter from 'components/RewardsCenter'
import Settings from 'components/Settings'
import Wallet from 'components/Wallet'
import useAccountId from 'hooks/useAccountId'
import useStore from 'store'
import { ENABLE_HLS, ENABLE_PERPS } from 'utils/constants'

export const menuTree: { pages: Page[]; label: string }[] = [
  { pages: ['trade'], label: 'Trade' },
  ...(ENABLE_PERPS ? [{ pages: ['perps'] as Page[], label: 'Perps' }] : []),
  { pages: ['lend', 'farm'], label: 'Earn' },
  { pages: ['borrow'], label: 'Borrow' },
  { pages: ['portfolio'], label: 'Portfolio' },
  ...(ENABLE_HLS ? [{ pages: ['hls-staking'] as Page[], label: 'High Leverage' }] : []),
]

export default function DesktopHeader() {
  const address = useStore((s) => s.address)
  const focusComponent = useStore((s) => s.focusComponent)
  const isOracleStale = useStore((s) => s.isOracleStale)
  const accountId = useAccountId()

  function handleCloseFocusMode() {
    if (focusComponent && focusComponent.onClose) focusComponent.onClose()
    useStore.setState({ focusComponent: null })
  }

  if (!isDesktop) return null

  return (
    <header
      className={classNames(
        'fixed left-0 top-0 z-50 hidden w-full',
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
          <div className='flex justify-between w-full'>
            <div className='flex h-5 w-13' />
            {address && <Wallet />}
            <EscButton onClick={handleCloseFocusMode} />
          </div>
        ) : (
          <div className='flex gap-4'>
            {isOracleStale && <OracleResyncButton />}
            {accountId && <RewardsCenter />}
            {address && <AccountMenu />}
            <Wallet />
            <Settings />
          </div>
        )}
      </div>
    </header>
  )
}
