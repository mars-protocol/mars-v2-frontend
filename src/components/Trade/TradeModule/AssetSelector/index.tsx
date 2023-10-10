import { useCallback, useEffect } from 'react'

import { SwapIcon } from 'components/Icons'
import Text from 'components/Text'
import AssetButton from 'components/Trade/TradeModule/AssetSelector/AssetButton'
import AssetOverlay from 'components/Trade/TradeModule/AssetSelector/AssetOverlay'
import useStore from 'store'

interface Props {
  buyAsset: Asset
  sellAsset: Asset
  onChangeBuyAsset: (asset: Asset) => void
  onChangeSellAsset: (asset: Asset) => void
}

export default function AssetSelector(props: Props) {
  const { buyAsset, sellAsset, onChangeBuyAsset, onChangeSellAsset } = props
  const assetOverlayState = useStore((s) => s.assetOverlayState)

  const handleSwapAssets = useCallback(() => {
    onChangeBuyAsset(sellAsset)
    onChangeSellAsset(buyAsset)
  }, [onChangeBuyAsset, onChangeSellAsset, sellAsset, buyAsset])

  const handleChangeBuyAsset = useCallback(
    (asset: Asset) => {
      onChangeBuyAsset(asset)
      useStore.setState({ assetOverlayState: 'sell' })
    },
    [onChangeBuyAsset],
  )

  const handleChangeSellAsset = useCallback(
    (asset: Asset) => {
      onChangeSellAsset(asset)
      useStore.setState({ assetOverlayState: 'closed' })
    },
    [onChangeSellAsset],
  )

  const handleChangeState = useCallback((state: OverlayState) => {
    useStore.setState({ assetOverlayState: state })
  }, [])

  useEffect(() => {
    if (assetOverlayState === 'closed') {
      onChangeBuyAsset(buyAsset)
      onChangeSellAsset(sellAsset)
    }
  }, [onChangeBuyAsset, onChangeSellAsset, assetOverlayState, buyAsset, sellAsset])

  return (
    <div className='grid-rows-auto grid grid-cols-[1fr_min-content_1fr] gap-y-2 bg-white/5 p-3'>
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
