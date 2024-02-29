import classNames from 'classnames'
import { useMemo } from 'react'

import Wallet from 'components/Wallet'
import AccountMenu from 'components/account/AccountMenu'
import EscButton from 'components/common/Button/EscButton'
import { Coins, CoinsSwap } from 'components/common/Icons'
import Settings from 'components/common/Settings'
import ChainSelect from 'components/header/ChainSelect'
import OracleResyncButton from 'components/header/OracleResyncButton'
import RewardsCenter from 'components/header/RewardsCenter'
import DesktopNavigation from 'components/header/navigation/DesktopNavigation'
import useAccountId from 'hooks/useAccountId'
import useStore from 'store'
import { WalletID } from 'types/enums/wallet'
import { getGovernanceUrl } from 'utils/helpers'

const menuTree = (walletId: WalletID, chainConfig: ChainConfig): MenuTreeEntry[] => [
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

export default function Header() {
  const address = useStore((s) => s.address)
  const focusComponent = useStore((s) => s.focusComponent)
  const isOracleStale = useStore((s) => s.isOracleStale)
  const isHLS = useStore((s) => s.isHLS)
  const accountId = useAccountId()
  const showAccountMenu = address && !isHLS

  function handleCloseFocusMode() {
    if (focusComponent && focusComponent.onClose) focusComponent.onClose()
    useStore.setState({ focusComponent: null })
  }

  const showStaleOracle = useMemo(() => isOracleStale && address, [isOracleStale, address])

  return (
    <header
      className={classNames(
        'fixed left-0 top-0 z-50 w-full max-w-screen-full',
        'before:content-[" "] before:absolute before:inset-0 before:-z-1 before:h-full before:w-full before:rounded-sm before:backdrop-blur-sticky',
      )}
    >
      <div
        className={classNames(
          'flex items-center justify-between px-4 py-4 h-18 border-b border-white/20',
          focusComponent && 'relative isolate md:border-none',
        )}
      >
        <DesktopNavigation menuTree={menuTree} />

        {focusComponent ? (
          <div className='flex justify-between w-full'>
            <div className='flex h-5 w-13' />
            {address && (
              <div className='flex gap-4'>
                <Wallet />
                <ChainSelect />
              </div>
            )}
            <div className='flex gap-4'>
              {!address && <ChainSelect />}
              <EscButton onClick={handleCloseFocusMode} />
            </div>
          </div>
        ) : (
          <div className='flex gap-4'>
            {showStaleOracle && <OracleResyncButton />}
            {accountId && <RewardsCenter className='hidden lg:flex' />}
            {showAccountMenu && <AccountMenu className='hidden md:flex' />}
            <Wallet />
            <ChainSelect className='hidden md:flex' />
            <Settings className='hidden md:flex' />
          </div>
        )}
      </div>
    </header>
  )
}
