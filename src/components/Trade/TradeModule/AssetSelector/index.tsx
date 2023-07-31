import { useCallback, useEffect, useState } from 'react'

import { SwapIcon } from 'components/Icons'
import Text from 'components/Text'
import AssetButton from 'components/Trade/TradeModule/AssetSelector/AssetButton'
import AssetOverlay, { OverlayState } from 'components/Trade/TradeModule/AssetSelector/AssetOverlay'

interface Props {
  buyAsset: Asset
  sellAsset: Asset
  onChangeBuyAsset: (asset: Asset) => void
  onChangeSellAsset: (asset: Asset) => void
}

export default function AssetSelector(props: Props) {
  const { buyAsset, sellAsset, onChangeBuyAsset, onChangeSellAsset } = props
  const [overlayState, setOverlayState] = useState<OverlayState>('closed')

  const handleSwapAssets = useCallback(() => {
    onChangeBuyAsset(sellAsset)
    onChangeSellAsset(buyAsset)
  }, [onChangeBuyAsset, onChangeSellAsset, sellAsset, buyAsset])

  const handleChangeBuyAsset = useCallback(
    (asset: Asset) => {
      onChangeBuyAsset(asset)
      setOverlayState('sell')
    },
    [onChangeBuyAsset],
  )

  const handleChangeSellAsset = useCallback(
    (asset: Asset) => {
      onChangeSellAsset(asset)
      setOverlayState('closed')
    },
    [onChangeSellAsset],
  )

  const handleChangeState = useCallback(
    (state: OverlayState) => {
      setOverlayState(state)
    },
    [setOverlayState],
  )

  useEffect(() => {
    if (overlayState === 'closed') {
      onChangeBuyAsset(buyAsset)
      onChangeSellAsset(sellAsset)
    }
  }, [onChangeBuyAsset, onChangeSellAsset, overlayState, buyAsset, sellAsset])

  return (
    <div className='grid-rows-auto relative grid grid-cols-[1fr_min-content_1fr] gap-y-2 bg-white/5 p-3'>
      <Text size='sm'>Buy</Text>
      <Text size='sm' className='col-start-3'>
        Sell
      </Text>
      <AssetButton onClick={() => setOverlayState('buy')} asset={buyAsset} />
      <button onClick={handleSwapAssets}>
        <SwapIcon className='mx-2 w-4 place-self-center' />
      </button>
      <AssetButton onClick={() => setOverlayState('sell')} asset={sellAsset} />
      <AssetOverlay
        state={overlayState}
        onChangeState={handleChangeState}
        buyAsset={buyAsset}
        sellAsset={sellAsset}
        onChangeBuyAsset={handleChangeBuyAsset}
        onChangeSellAsset={handleChangeSellAsset}
      />
    </div>
  )
}
