import { useMemo } from 'react'

import MigrationBanner from 'components/MigrationBanner'
import AccountDetailsCard from 'components/Trade/AccountDetailsCard'
import TradeChart from 'components/Trade/TradeChart'
import TradeModule from 'components/Trade/TradeModule'
import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useLocalStorage from 'hooks/useLocalStorage'
import useStore from 'store'
import { byDenom } from 'utils/array'
import { getEnabledMarketAssets } from 'utils/assets'

export default function TradePage() {
  const [tradingPair] = useLocalStorage<string[]>(
    LocalStorageKeys.TRADING_PAIR,
    DEFAULT_SETTINGS.tradingPair,
  )
  const enabledMarketAssets = getEnabledMarketAssets()
  const assetOverlayState = useStore((s) => s.assetOverlayState)

  const buyAsset = useMemo(
    () => enabledMarketAssets.find(byDenom(tradingPair[0])) ?? enabledMarketAssets[0],
    [tradingPair, enabledMarketAssets],
  )
  const sellAsset = useMemo(
    () => enabledMarketAssets.find(byDenom(tradingPair[1])) ?? enabledMarketAssets[1],
    [tradingPair, enabledMarketAssets],
  )

  if (!tradingPair) return null

  return (
    <div className='flex flex-col w-full h-full gap-4'>
      <MigrationBanner />
      <div className='grid h-full w-full grid-cols-[346px_auto] gap-4'>
        <TradeModule buyAsset={buyAsset} sellAsset={sellAsset} />
        <TradeChart buyAsset={buyAsset} sellAsset={sellAsset} />
        <div />
        <AccountDetailsCard />
      </div>
      {assetOverlayState !== 'closed' && (
        <div
          className='fixed top-0 left-0 z-40 block w-full h-full hover:cursor-pointer'
          onClick={() => useStore.setState({ assetOverlayState: 'closed' })}
          role='button'
        />
      )}
    </div>
  )
}
