import classNames from 'classnames'
import { useMemo } from 'react'
import { isMobile } from 'react-device-detect'
import { useNavigate, useSearchParams } from 'react-router-dom'

import AccountMenu from 'components/account/AccountMenu'
import EscButton from 'components/common/Button/EscButton'
import {
  ArrowChartLineUp,
  Coins,
  CoinsSwap,
  Discord,
  MarsToken,
  Telegram,
  Twitter,
} from 'components/common/Icons'
import Settings from 'components/common/Settings'
import ChainSelect from 'components/header/ChainSelect'
import DesktopNavigation from 'components/header/navigation/desktop/DesktopNavigation'
import { NavLink } from 'components/header/navigation/desktop/NavLink'
import MobileNavigation from 'components/header/navigation/mobile/MobileNavigation'
import MobileNavigationToggle from 'components/header/navigation/mobile/MobileNavigationToggle'
import OracleResyncInfo from 'components/header/OracleResyncInfo'
import RewardsCenter from 'components/header/RewardsCenter'
import Wallet from 'components/Wallet'
import useAccountId from 'hooks/accounts/useAccountId'
import useChainConfig from 'hooks/chain/useChainConfig'
import useInitFeeToken from 'hooks/wallet/useInitFeeToken'
import useStore from 'store'
import { DocURL } from 'types/enums'
import { getRoute } from 'utils/route'
import AssetSearch from 'components/common/AssetSearch'

const menuTree = (chainConfig: ChainConfig): MenuTreeEntry[] => [
  {
    pages: chainConfig.perps ? ['perps', 'trade', 'trade-advanced'] : ['trade', 'trade-advanced'],
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
  ...(chainConfig.managedVaults ? [{ pages: ['vaults'] as Page[], label: 'Vaults' }] : []),
  { pages: ['portfolio'], label: 'Portfolio' },
  ...(chainConfig.hls
    ? [{ pages: ['hls-staking', 'hls-farm'] as Page[], label: 'High Leverage' }]
    : []),
  {
    pages: ['portfolio', 'governance', 'hls-staking', 'hls-farm'],
    label: 'More',
    submenu: [
      ...(chainConfig.hls
        ? [
            {
              page: 'hls-staking' as Page,
              label: 'High Leverage',
              hideOnDesktop: true,
            },
          ]
        : []),
      {
        label: 'Governance',
        externalUrl: DocURL.COUNCIL,
      },
      {
        label: 'Stats',
        externalUrl: DocURL.STATS_URL,
      },
      {
        label: 'Docs',
        externalUrl: DocURL.DOCS_URL,
      },
      {
        label: 'MARS Token',
        externalUrl: DocURL.TOKENOMICS_URL,
      },
      {
        label: '',
        isSeparator: true,
      },
      {
        label: 'X (Twitter)',
        externalUrl: DocURL.X_URL,
        icon: <Twitter className='w-4 h-4' />,
      },
      {
        label: 'Telegram',
        externalUrl: DocURL.TELEGRAM_URL,
        icon: <Telegram className='w-4 h-4' />,
      },
      {
        label: 'Discord',
        externalUrl: DocURL.DISCORD_URL,
        icon: <Discord className='w-4 h-4' />,
      },
    ],
  },
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
  const isVaults = useStore((s) => s.isVaults)
  const accountId = useAccountId()
  const isV1 = useStore((s) => s.isV1)
  const showAccountMenu = address && !isHls && !isVaults && !isMobile && !isV1
  const feeTokenInitiated = useInitFeeToken()
  function handleCloseFocusMode() {
    focusComponent?.onClose?.()
    useStore.setState({ focusComponent: null })
  }

  const showStaleOracle = useMemo(() => isOracleStale && address, [isOracleStale, address])
  const showRewardsCenter = useMemo(
    () => (isV1 ? address && !isMobile : accountId && !isMobile),
    [isV1, address, accountId],
  )

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const handleSelectAsset = (asset: Asset) => {
    const encodedSymbol = encodeURIComponent(asset.symbol)
    const route = getRoute(`assets/${encodedSymbol}` as Page, searchParams, address, accountId)
    navigate(route)
  }

  return (
    <>
      <header className='fixed left-0 top-0 z-80 w-full max-w-screen-full bg-surface-dark'>
        <div
          className={classNames(
            'flex items-center justify-between px-4 py-4 h-18',
            focusComponent && 'relative isolate md:border-none',
          )}
        >
          <div
            className={classNames(
              focusComponent
                ? 'absolute left-4 top-4 z-1 block'
                : 'flex flex-1 items-center relative z-80',
            )}
          >
            <NavLink
              isHome
              item={{ pages: chainConfig.perps ? ['perps'] : ['trade'], label: 'home' }}
            >
              <span className='block w-10 h-10'>
                <MarsToken className='text-white' />
              </span>
            </NavLink>
            {!isMobile && <DesktopNavigation menuTree={isV1 ? menuTreeV1 : menuTree} />}
          </div>
          {focusComponent ? (
            <div className='flex justify-between w-full'>
              <div className='flex h-5 w-13' />
              {address && (
                <div className='flex gap-4'>
                  <Wallet initiated={feeTokenInitiated} />
                  {!isMobile && <ChainSelect />}
                </div>
              )}
              <div className='flex gap-4'>
                {!isMobile && !address && <ChainSelect />}
                <EscButton onClick={handleCloseFocusMode} />
              </div>
            </div>
          ) : (
            <div className='flex gap-2'>
              {showStaleOracle && <OracleResyncInfo />}
              <AssetSearch onSelectAsset={handleSelectAsset} />
              {showRewardsCenter && <RewardsCenter className='hidden lg:flex' />}
              {showAccountMenu && <AccountMenu className='hidden md:flex' />}
              <Wallet initiated={feeTokenInitiated} />
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
