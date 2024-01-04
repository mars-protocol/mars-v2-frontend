import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'

import MigrationBanner from 'components/MigrationBanner'
import AccountDetailsCard from 'components/Trade/AccountDetailsCard'
import TradeChart from 'components/Trade/TradeChart'
import TradeModule from 'components/Trade/TradeModule'
import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useMarketEnabledAssets from 'hooks/assets/useMarketEnabledAssets'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import useChainConfig from 'hooks/useChainConfig'
import useStore from 'store'
import { byDenom } from 'utils/array'
import { getPage } from 'utils/route'

export default function TradePage() {
  const { pathname } = useLocation()
  const chainConfig = useChainConfig()
  const page = getPage(pathname)
  const isAdvanced = useMemo(() => page === 'trade-advanced', [page])

  const [tradingPairAdvanced] = useLocalStorage<Settings['tradingPairAdvanced']>(
    chainConfig.id + '/' + LocalStorageKeys.TRADING_PAIR_ADVANCED,
    DEFAULT_SETTINGS.tradingPairAdvanced,
  )
  const [tradingPairSimple] = useLocalStorage<Settings['tradingPairSimple']>(
    chainConfig.id + '/' + LocalStorageKeys.TRADING_PAIR_SIMPLE,
    DEFAULT_SETTINGS.tradingPairSimple,
  )

  const enabledMarketAssets = useMarketEnabledAssets()
  const assetOverlayState = useStore((s) => s.assetOverlayState)
  const buyAsset = useMemo(
    () =>
      enabledMarketAssets.find(
        byDenom(isAdvanced ? tradingPairAdvanced.buy : tradingPairSimple.buy),
      ) ?? enabledMarketAssets[0],
    [tradingPairAdvanced, tradingPairSimple, enabledMarketAssets, isAdvanced],
  )
  const sellAsset = useMemo(
    () =>
      enabledMarketAssets.find(
        byDenom(isAdvanced ? tradingPairAdvanced.sell : tradingPairSimple.sell),
      ) ?? enabledMarketAssets[1],
    [tradingPairAdvanced, tradingPairSimple, enabledMarketAssets, isAdvanced],
  )
  return (
    <div className='flex flex-col w-full h-full gap-4'>
      <MigrationBanner />
      <div className='grid w-full grid-cols-[auto_346px] gap-4'>
        <TradeChart buyAsset={buyAsset} sellAsset={sellAsset} />
        <TradeModule buyAsset={buyAsset} sellAsset={sellAsset} isAdvanced={isAdvanced} />
        <AccountDetailsCard />
      </div>
      {assetOverlayState !== 'closed' && (
        <div
          className='fixed top-0 left-0 z-20 block w-full h-full hover:cursor-pointer'
          onClick={() => useStore.setState({ assetOverlayState: 'closed' })}
          role='button'
        />
      )}
    </div>
  )
}
