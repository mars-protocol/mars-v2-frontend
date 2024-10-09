import classNames from 'classnames'
import { useMemo } from 'react'
import { isMobile } from 'react-device-detect'

import AccountMenu from 'components/account/AccountMenu'
import EscButton from 'components/common/Button/EscButton'
import { ArrowChartLineUp, Coins, CoinsSwap, Logo } from 'components/common/Icons'
import Settings from 'components/common/Settings'
import ChainSelect from 'components/header/ChainSelect'
import DesktopNavigation from 'components/header/navigation/desktop/DesktopNavigation'
import { NavLink } from 'components/header/navigation/desktop/NavLink'
import MobileNavigation from 'components/header/navigation/mobile/MobileNavigation'
import MobileNavigationToggle from 'components/header/navigation/mobile/MobileNavigationToggle'
import OracleResyncButton from 'components/header/OracleResyncButton'
import RewardsCenter from 'components/header/RewardsCenter'
import Wallet from 'components/Wallet'
import useAccountId from 'hooks/accounts/useAccountId'
import useChainConfig from 'hooks/chain/useChainConfig'
import useStore from 'store'
import { DocURL } from 'types/enums'

const menuTree = (chainConfig: ChainConfig): MenuTreeEntry[] => [
  {
    pages: ['perps', 'trade', 'trade-advanced'],
    label: 'Trade',
    submenu: [
      ...(chainConfig.perps
        ? [
            {
              page: 'perps' as Page,
              label: 'Perps',
              subtitle: 'Trade perps on leverage',
              icon: <ArrowChartLineUp className='w-6 h-6' />,
            },
          ]
        : []),
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
  {
    pages: chainConfig.farm || chainConfig.perps ? ['lend', 'farm', 'perps-vault'] : ['lend'],
    label: 'Earn',
  },
  { pages: ['borrow'], label: 'Borrow' },
  { pages: ['vaults', 'vaults-community'] as Page[], label: 'Vaults' },
  ...(chainConfig.hls
    ? [{ pages: ['hls-staking', 'hls-farm'] as Page[], label: 'High Leverage' }]
    : []),
  { pages: ['portfolio'], label: 'Portfolio' },
  { pages: ['governance'], label: 'Governance', externalUrl: DocURL.COUNCIL },
]

const menuTreeV1 = (): MenuTreeEntry[] => [
  {
    pages: ['v1'],
    label: 'Red Bank',
  },
  { pages: ['governance'], label: 'Governance', externalUrl: DocURL.COUNCIL },
]

export default function Header() {
  const address = useStore((s) => s.address)
  const chainConfig = useChainConfig()
  const focusComponent = useStore((s) => s.focusComponent)
  const isOracleStale = useStore((s) => s.isOracleStale)
  const isHls = useStore((s) => s.isHls)
  const accountId = useAccountId()
  const isV1 = useStore((s) => s.isV1)
  const showAccountMenu = address && !isHls && !isMobile && !isV1

  function handleCloseFocusMode() {
    if (focusComponent && focusComponent.onClose) focusComponent.onClose()
    useStore.setState({ focusComponent: null })
  }

  const showStaleOracle = useMemo(
    () => (chainConfig.slinky ? false : isOracleStale && address),
    [chainConfig.slinky, isOracleStale, address],
  )
  const showRewardsCenter = useMemo(
    () => (isV1 ? address && !isMobile : accountId && !isMobile),
    [isV1, address, accountId],
  )
  return (
    <>
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
          <div
            className={classNames(
              focusComponent
                ? 'absolute left-4 top-4 z-1 block'
                : 'flex flex-1 items-center relative z-50',
            )}
          >
            <NavLink isHome item={{ pages: ['perps'], label: 'home' }}>
              <span className='block w-10 h-10'>
                <Logo className='text-white' />
              </span>
            </NavLink>
            {!isMobile && <DesktopNavigation menuTree={isV1 ? menuTreeV1 : menuTree} />}
          </div>
          {focusComponent ? (
            <div className='flex justify-between w-full'>
              <div className='flex h-5 w-13' />
              {address && (
                <div className='flex gap-4'>
                  <Wallet />
                  {!isMobile && <ChainSelect />}
                </div>
              )}
              <div className='flex gap-4'>
                {!isMobile && !address && <ChainSelect />}
                <EscButton onClick={handleCloseFocusMode} />
              </div>
            </div>
          ) : (
            <div className='flex gap-4'>
              {showStaleOracle && <OracleResyncButton />}
              {showRewardsCenter && <RewardsCenter className='hidden lg:flex' />}
              {showAccountMenu && <AccountMenu className='hidden md:flex' />}
              <Wallet />
              {!isMobile && <ChainSelect className='hidden md:flex' />}
              {isMobile && <MobileNavigationToggle className='md:hidden' />}
              {!isMobile && <Settings className='hidden md:flex' />}
            </div>
          )}
        </div>
      </header>

      {isMobile && <MobileNavigation menuTree={isV1 ? menuTreeV1 : menuTree} />}
    </>
  )
}
