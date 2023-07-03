import { useCallback, useMemo, useState } from 'react'

import { SwapIcon } from 'components/Icons'
import Text from 'components/Text'
import { ASSETS } from 'constants/assets'
import AssetButton from 'components/Trade/TradeModule/AssetSelector/AssetButton'
import AssetOverlay, { OverlayState } from 'components/Trade/TradeModule/AssetSelector/AssetOverlay'

export default function AssetSelector() {
  const [overlayState, setOverlayState] = useState<OverlayState>('closed')
  const [buyAsset, setBuyAsset] = useState(ASSETS[0])
  const [sellAsset, setSellAsset] = useState(ASSETS[1])

  function handleSwapAssets() {
    setBuyAsset(sellAsset)
    setSellAsset(buyAsset)
  }

  const handleChangeBuyAsset = useCallback(
    (asset: Asset) => {
      setBuyAsset(asset)
      setOverlayState('sell')
    },
    [setBuyAsset],
  )

  const handleChangeSellAsset = useCallback(
    (asset: Asset) => {
      setSellAsset(asset)
      setOverlayState('closed')
    },
    [setSellAsset],
  )
  const handleChangeState = useCallback(
    (state: OverlayState) => {
      setOverlayState(state)
    },
    [setOverlayState],
  )

  const buyAssets = useMemo(
    () => ASSETS.filter((asset) => asset.denom !== sellAsset.denom),
    [sellAsset],
  )

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
