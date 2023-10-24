import { useCallback, useMemo } from 'react'

import EscButton from 'components/Button/EscButton'
import Divider from 'components/Divider'
import Overlay from 'components/Overlay'
import SearchBar from 'components/SearchBar'
import Text from 'components/Text'
import AssetList from 'components/Trade/TradeModule/AssetSelector/AssetList'
import useFilteredAssets from 'hooks/useFilteredAssets'

interface Props {
  state: OverlayState
  buyAsset: Asset
  sellAsset: Asset
  onChangeBuyAsset: (asset: Asset) => void
  onChangeSellAsset: (asset: Asset) => void
  onChangeState: (state: OverlayState) => void
}

export default function AssetOverlay(props: Props) {
  const { assets, searchString, onChangeSearch } = useFilteredAssets()
  const handleClose = useCallback(() => props.onChangeState('closed'), [props])

  const handleToggle = useCallback(
    () => props.onChangeState(props.state === 'buy' ? 'sell' : 'buy'),
    [props],
  )

  const buyAssets = useMemo(
    () => assets.filter((asset) => asset.denom !== props.sellAsset.denom),
    [assets, props.sellAsset],
  )

  const sellAssets = useMemo(
    () => assets.filter((asset) => asset.denom !== props.buyAsset.denom),
    [assets, props.buyAsset],
  )

  function onChangeBuyAsset(asset: Asset) {
    props.onChangeBuyAsset(asset)
    props.onChangeState('sell')
    onChangeSearch('')
  }

  function onChangeSellAsset(asset: Asset) {
    props.onChangeSellAsset(asset)
    onChangeSearch('')
  }

  return (
    <Overlay
      className='inset-0 w-full overflow-y-scroll scrollbar-hide'
      show={props.state !== 'closed'}
      setShow={handleClose}
    >
      <div className='flex justify-between p-4 overflow-hidden'>
        <Text>Select asset</Text>
        <EscButton onClick={handleClose} enableKeyPress />
      </div>
      <Divider />
      <div className='p-4'>
        <SearchBar
          key={props.state}
          value={searchString}
          onChange={onChangeSearch}
          placeholder='Search for e.g. "ETH" or "Ethereum"'
          autoFocus
        />
      </div>
      <Divider />
      <AssetList
        type='buy'
        assets={buyAssets}
        isOpen={props.state === 'buy'}
        toggleOpen={handleToggle}
        onChangeAsset={onChangeBuyAsset}
      />
      <AssetList
        type='sell'
        assets={sellAssets}
        isOpen={props.state === 'sell'}
        toggleOpen={handleToggle}
        onChangeAsset={onChangeSellAsset}
      />
    </Overlay>
  )
}
