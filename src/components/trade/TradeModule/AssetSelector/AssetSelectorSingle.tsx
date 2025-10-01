import { useCallback } from 'react'

import { SwapIcon } from 'components/common/Icons'
import Text from 'components/common/Text'
import AssetButton from 'components/trade/TradeModule/AssetSelector/AssetButton'
import AssetOverlay from 'components/trade/TradeModule/AssetSelector/AssetOverlay'
import { getDefaultChainSettings } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useTradeEnabledAssets from 'hooks/assets/useTradeEnabledAssets'
import useChainConfig from 'hooks/chain/useChainConfig'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import useStore from 'store'

interface Props {
  buyAsset: Asset
  sellAsset: Asset
}

export default function AssetSelectorSingle(props: Props) {
  const chainConfig = useChainConfig()
  const [_, setTradingPairAdvanced] = useLocalStorage<Settings['tradingPairAdvanced']>(
    chainConfig.id + '/' + LocalStorageKeys.TRADING_PAIR_ADVANCED,
    getDefaultChainSettings(chainConfig).tradingPairAdvanced,
  )
  const { buyAsset, sellAsset } = props
  const assetOverlayState = useStore((s) => s.assetOverlayState)
  const allAssets = useTradeEnabledAssets()

  const handleSwapAssets = useCallback(() => {
    setTradingPairAdvanced({ buy: sellAsset.denom, sell: buyAsset.denom })
  }, [setTradingPairAdvanced, sellAsset, buyAsset])

  const handleChangeBuyAsset = useCallback(
    (asset: Asset) => {
      setTradingPairAdvanced({ buy: asset.denom, sell: sellAsset.denom })
      useStore.setState({ assetOverlayState: 'sell' })
    },
    [setTradingPairAdvanced, sellAsset],
  )

  const handleChangeSellAsset = useCallback(
    (asset: Asset) => {
      setTradingPairAdvanced({ buy: buyAsset.denom, sell: asset.denom })
      useStore.setState({ assetOverlayState: 'closed' })
    },
    [setTradingPairAdvanced, buyAsset],
  )

  const handleChangeState = useCallback((state: OverlayState) => {
    if (state === 'buy') useStore.setState({ assetOverlayState: 'sell' })
    if (state === 'sell') useStore.setState({ assetOverlayState: 'buy' })
    if (state === 'closed') useStore.setState({ assetOverlayState: 'closed' })
  }, [])

  return (
    <div className='grid-rows-auto grid grid-cols-[1fr_min-content_1fr] gap-y-2 bg-card-bg p-3 w-full'>
      <Text size='sm'>Buy</Text>
      <Text size='sm' className='col-start-3'>
        Sell
      </Text>
      <AssetButton
        onClick={() => useStore.setState({ assetOverlayState: 'buy' })}
        asset={buyAsset}
      />
      <button onClick={handleSwapAssets}>
        <SwapIcon className='w-4 mx-2 place-self-center' />
      </button>
      <AssetButton
        onClick={() => useStore.setState({ assetOverlayState: 'sell' })}
        asset={sellAsset}
      />
      {(assetOverlayState === 'buy' || assetOverlayState === 'sell') && (
        <AssetOverlay
          state={assetOverlayState}
          onChangeState={handleChangeState}
          buyAsset={buyAsset}
          sellAsset={sellAsset}
          onChangeBuyAsset={handleChangeBuyAsset}
          onChangeSellAsset={handleChangeSellAsset}
          onSwapAssets={handleSwapAssets}
          buyAssets={allAssets}
          type='single'
        />
      )}
    </div>
  )
}
