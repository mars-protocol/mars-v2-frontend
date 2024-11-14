import { useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'

import AccountDetailsCard from 'components/trade/AccountDetailsCard'
import TradeChart from 'components/trade/TradeChart'
import TradeModule from 'components/trade/TradeModule'
import { getDefaultChainSettings } from 'constants/defaultSettings'
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
  const page = getPage(pathname, chainConfig)
  const isAdvanced = useMemo(() => {
    return page === 'trade-advanced'
  }, [page])

  const [tradingPairAdvanced, setTradingPairAdvanced] = useLocalStorage<
    Settings['tradingPairAdvanced']
  >(
    chainConfig.id + '/' + LocalStorageKeys.TRADING_PAIR_ADVANCED,
    getDefaultChainSettings(chainConfig).tradingPairAdvanced,
  )
  const [tradingPairSimple, setTraidingPairSimple] = useLocalStorage<Settings['tradingPairSimple']>(
    chainConfig.id + '/' + LocalStorageKeys.TRADING_PAIR_SIMPLE,
    getDefaultChainSettings(chainConfig).tradingPairSimple,
  )
  const assets = useTradeEnabledAssets()

  useEffect(() => {
    if (localStorage.getItem(LocalStorageKeys.CURRENT_CHAIN_ID) !== chainConfig.id) return
    if (
      !assets.find(byDenom(tradingPairSimple.buy)) ||
      !assets.find(byDenom(tradingPairSimple.sell))
    )
      setTraidingPairSimple(getDefaultChainSettings(chainConfig).tradingPairSimple)
    if (
      !assets.find(byDenom(tradingPairAdvanced.buy)) ||
      !assets.find(byDenom(tradingPairAdvanced.sell))
    )
      setTradingPairAdvanced(getDefaultChainSettings(chainConfig).tradingPairSimple)
  }, [
    assets,
    tradingPairSimple,
    setTraidingPairSimple,
    chainConfig,
    tradingPairAdvanced.buy,
    tradingPairAdvanced.sell,
    setTradingPairAdvanced,
    tradingPairAdvanced,
  ])

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

  useEffect(() => {
    useStore.setState({ assetOverlayState: 'closed' })
  }, [])

  return (
    <div className='flex flex-col w-full h-full gap-4'>
      <div className='flex flex-wrap w-full gap-4 md:grid md:grid-cols-chart'>
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
