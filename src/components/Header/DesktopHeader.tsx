import classNames from 'classnames'
import { isDesktop } from 'react-device-detect'

import AccountMenu from 'components/Account/AccountMenu'
import EscButton from 'components/Button/EscButton'
import ChainSelect from 'components/Header/ChainSelect'
import OracleResyncButton from 'components/Header/OracleResyncButton'
import { Coins, CoinsSwap } from 'components/Icons'
import DesktopNavigation from 'components/Navigation/DesktopNavigation'
import RewardsCenter from 'components/RewardsCenter'
import Settings from 'components/Settings'
import Wallet from 'components/Wallet'
import useAccountId from 'hooks/useAccountId'
import useStore from 'store'
import { WalletID } from 'types/enums/wallet'
import { getGovernanceUrl } from 'utils/helpers'

export const menuTree = (walletId: WalletID, chainConfig: ChainConfig): MenuTreeEntry[] => [
  {
    pages: ['trade', 'trade-advanced'],
    label: 'Trade',
    submenu: [
      {
        page: 'trade',
        label: 'Spot',
        subtitle: 'Trade assets against stables',
        icon: <Coins className='w-6 h-6' />,
      },
      {
        page: 'trade-advanced',
        label: 'Spot Advanced',
        subtitle: 'Trade any assets',
        icon: <CoinsSwap className='w-6 h-6' />,
      },
    ],
  },
  ...(chainConfig.perps ? [{ pages: ['perps'] as Page[], label: 'Perps' }] : []),
  { pages: chainConfig.farm ? ['lend', 'farm'] : ['lend'], label: 'Earn' },
  { pages: ['borrow'], label: 'Borrow' },
  ...(chainConfig.hls ? [{ pages: ['hls-staking'] as Page[], label: 'High Leverage' }] : []),
  { pages: ['portfolio'], label: 'Portfolio' },
  { pages: ['governance'], label: 'Governance', externalUrl: getGovernanceUrl(walletId) },
]

export default function DesktopHeader() {
  const address = useStore((s) => s.address)
  const focusComponent = useStore((s) => s.focusComponent)
  const isOracleStale = useStore((s) => s.isOracleStale)
  const isHLS = useStore((s) => s.isHLS)
  const accountId = useAccountId()

  function handleCloseFocusMode() {
    if (focusComponent && focusComponent.onClose) focusComponent.onClose()
    useStore.setState({ focusComponent: null })
  }

  if (!isDesktop) return null

  return (
    <header
      className={classNames(
        'fixed left-0 top-0 z-50 w-full',
        'before:content-[" "] before:absolute before:inset-0 before:-z-1 before:h-full before:w-full before:rounded-sm before:backdrop-blur-sticky',
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
            {address && (
              <div className='flex gap-4'>
                <Wallet />
                <ChainSelect />
              </div>
            )}
            <EscButton onClick={handleCloseFocusMode} />
          </div>
        ) : (
          <div className='flex gap-4'>
            {isOracleStale && <OracleResyncButton />}
            {accountId && <RewardsCenter />}
            {address && !isHLS && <AccountMenu />}
            <Wallet />
            <ChainSelect />
            <Settings />
          </div>
        )}
      </div>
    </header>
  )
}
