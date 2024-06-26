import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'

import AccountDetailsCard from 'components/trade/AccountDetailsCard'
import TradeChart from 'components/trade/TradeChart'
import TradeModule from 'components/trade/TradeModule'
import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useTradeEnabledAssets from 'hooks/assets/useTradeEnabledAssets'
import useChainConfig from 'hooks/chain/useChainConfig'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import useStore from 'store'
import { byDenom } from 'utils/array'
import { getPage } from 'utils/route'

export default function TradePage() {
  const { pathname } = useLocation()
  const chainConfig = useChainConfig()
  const page = getPage(pathname)
  const isAdvanced = useMemo(() => {
    useStore.setState({ assetOverlayState: 'closed' })
    return page === 'trade-advanced'
  }, [page])

  const [tradingPairAdvanced] = useLocalStorage<Settings['tradingPairAdvanced']>(
    chainConfig.id + '/' + LocalStorageKeys.TRADING_PAIR_ADVANCED,
    DEFAULT_SETTINGS.tradingPairAdvanced,
  )
  const [tradingPairSimple] = useLocalStorage<Settings['tradingPairSimple']>(
    chainConfig.id + '/' + LocalStorageKeys.TRADING_PAIR_SIMPLE,
    DEFAULT_SETTINGS.tradingPairSimple,
  )

  const assets = useTradeEnabledAssets()
  const assetOverlayState = useStore((s) => s.assetOverlayState)
  const buyAsset = useMemo(
    () =>
      assets.find(byDenom(isAdvanced ? tradingPairAdvanced.buy : tradingPairSimple.buy)) ??
      assets[0],
    [tradingPairAdvanced, tradingPairSimple, assets, isAdvanced],
  )
  const sellAsset = useMemo(
    () =>
      assets.find(byDenom(isAdvanced ? tradingPairAdvanced.sell : tradingPairSimple.sell)) ??
      assets[1],
    [tradingPairAdvanced, tradingPairSimple, assets, isAdvanced],
  )

  return (
    <div className='flex flex-col w-full h-full gap-4'>
      <div className='md:grid flex flex-wrap w-full md:grid-cols-[auto_346px] gap-4'>
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
