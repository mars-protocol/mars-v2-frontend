import { useCallback } from 'react'

import { SwapIcon } from 'components/Icons'
import Text from 'components/Text'
import AssetButton from 'components/Trade/TradeModule/AssetSelector/AssetButton'
import AssetOverlay from 'components/Trade/TradeModule/AssetSelector/AssetOverlay'
import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import useStore from 'store'

interface Props {
  buyAsset: Asset
  sellAsset: Asset
}

export default function AssetSelectorSingle(props: Props) {
  const [tradingPairAdvanced, settradingPairAdvanced] = useLocalStorage<
    Settings['tradingPairAdvanced']
  >(LocalStorageKeys.TRADING_PAIR_ADVANCED, DEFAULT_SETTINGS.tradingPairAdvanced)
  const { buyAsset, sellAsset } = props
  const assetOverlayState = useStore((s) => s.assetOverlayState)

  const handleSwapAssets = useCallback(() => {
    settradingPairAdvanced({ buy: sellAsset.denom, sell: buyAsset.denom })
  }, [settradingPairAdvanced, sellAsset, buyAsset])

  const handleChangeBuyAsset = useCallback(
    (asset: Asset) => {
      settradingPairAdvanced({ buy: asset.denom, sell: sellAsset.denom })
      useStore.setState({ assetOverlayState: 'sell' })
    },
    [settradingPairAdvanced, sellAsset],
  )

  const handleChangeSellAsset = useCallback(
    (asset: Asset) => {
      settradingPairAdvanced({ buy: buyAsset.denom, sell: asset.denom })
      useStore.setState({ assetOverlayState: 'closed' })
    },
    [settradingPairAdvanced, buyAsset],
  )

  const handleChangeState = useCallback((state: OverlayState) => {
    useStore.setState({ assetOverlayState: state })
  }, [])

  return (
    <div className='grid-rows-auto grid grid-cols-[1fr_min-content_1fr] gap-y-2 bg-white/5 p-3 w-full'>
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
      <AssetOverlay
        state={assetOverlayState}
        onChangeState={handleChangeState}
        buyAsset={buyAsset}
        sellAsset={sellAsset}
        onChangeBuyAsset={handleChangeBuyAsset}
        onChangeSellAsset={handleChangeSellAsset}
      />
    </div>
  )
}
