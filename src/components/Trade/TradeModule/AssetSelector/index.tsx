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
  const [overlayState, setOverlayState] = useState<OverlayState>('closed')
  const [cachedBuyAsset, setCachedBuyAsset] = useState<Asset>(props.buyAsset)
  const [cachedSellAsset, setCachedSellAsset] = useState<Asset>(props.sellAsset)

  function handleSwapAssets() {
    props.onChangeBuyAsset(props.sellAsset)
    props.onChangeSellAsset(props.buyAsset)
  }

  const handleChangeBuyAsset = useCallback((asset: Asset) => {
    setCachedBuyAsset(asset)
    setOverlayState('sell')
  }, [])

  const handleChangeSellAsset = useCallback((asset: Asset) => {
    setCachedSellAsset(asset)
    setOverlayState('closed')
  }, [])
  const handleChangeState = useCallback(
    (state: OverlayState) => {
      setOverlayState(state)
    },
    [setOverlayState],
  )

  useEffect(() => {
    if (overlayState === 'closed') {
      props.onChangeBuyAsset(cachedBuyAsset)
      props.onChangeSellAsset(cachedSellAsset)
    }
  }, [overlayState, cachedBuyAsset, cachedSellAsset, props])

  return (
    <div className='grid-rows-auto relative grid grid-cols-[1fr_min-content_1fr] gap-y-2 bg-white/5 p-3'>
      <Text size='sm'>Buy</Text>
      <Text size='sm' className='col-start-3'>
        Sell
      </Text>
      <AssetButton onClick={() => setOverlayState('buy')} asset={props.buyAsset} />
      <button onClick={handleSwapAssets}>
        <SwapIcon className='mx-2 w-4 place-self-center' />
      </button>
      <AssetButton onClick={() => setOverlayState('sell')} asset={props.sellAsset} />
      <AssetOverlay
        state={overlayState}
        onChangeState={handleChangeState}
        buyAsset={cachedBuyAsset}
        sellAsset={cachedSellAsset}
        onChangeBuyAsset={handleChangeBuyAsset}
        onChangeSellAsset={handleChangeSellAsset}
      />
    </div>
  )
}
