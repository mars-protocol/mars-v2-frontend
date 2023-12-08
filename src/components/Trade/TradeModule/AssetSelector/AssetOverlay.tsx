import { useCallback, useMemo } from 'react'

import EscButton from 'components/Button/EscButton'
import Divider from 'components/Divider'
import Overlay from 'components/Overlay'
import SearchBar from 'components/SearchBar'
import Text from 'components/Text'
import AssetList from 'components/Trade/TradeModule/AssetSelector/AssetList'
import PairsList from 'components/Trade/TradeModule/AssetSelector/PairsList'
import useFilteredAssets from 'hooks/useFilteredAssets'

interface Props {
  state: OverlayState
  buyAsset: Asset
  sellAsset: Asset
  onChangeBuyAsset?: (asset: Asset) => void
  onChangeSellAsset?: (asset: Asset) => void
  onChangeTradingPair?: (tradingPair: TradingPair) => void
  onChangeState: (state: OverlayState) => void
}

export default function AssetOverlay(props: Props) {
  const { assets, searchString, onChangeSearch } = useFilteredAssets()
  const handleClose = useCallback(() => props.onChangeState('closed'), [props])

  const handleToggle = useCallback(() => props.onChangeState(props.state), [props])

  const buyAssets = useMemo(
    () => assets.filter((asset) => asset.denom !== props.sellAsset.denom),
    [assets, props.sellAsset],
  )

  const sellAssets = useMemo(
    () => assets.filter((asset) => asset.denom !== props.buyAsset.denom),
    [assets, props.buyAsset],
  )

  function onChangeBuyAsset(asset: Asset) {
    if (!props.onChangeBuyAsset) return
    props.onChangeBuyAsset(asset)
    props.onChangeState('sell')
    onChangeSearch('')
  }

  function onChangeSellAsset(asset: Asset) {
    if (!props.onChangeSellAsset) return
    props.onChangeSellAsset(asset)
    onChangeSearch('')
  }

  function onChangeAssetPair(assetPair: AssetPair) {
    if (!props.onChangeTradingPair) return
    props.onChangeTradingPair({ buy: assetPair.buy.denom, sell: assetPair.sell.denom })
    props.onChangeState('closed')
    onChangeSearch('')
  }

  return (
    <Overlay
      className='inset-0 w-full overflow-y-scroll scrollbar-hide'
      show={props.state !== 'closed'}
      setShow={handleClose}
    >
      <div className='flex justify-between p-4 overflow-hidden'>
        <Text>{props.onChangeTradingPair ? 'Select market' : 'Select asset'}</Text>
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
      {props.onChangeBuyAsset && (
        <AssetList
          type='buy'
          assets={buyAssets}
          isOpen={props.state === 'buy'}
          toggleOpen={handleToggle}
          onChangeAsset={onChangeBuyAsset}
        />
      )}
      {props.onChangeSellAsset && (
        <AssetList
          type='sell'
          assets={sellAssets}
          isOpen={props.state === 'sell'}
          toggleOpen={handleToggle}
          onChangeAsset={onChangeSellAsset}
        />
      )}
      {props.onChangeTradingPair && (
        <PairsList
          assets={buyAssets}
          stables={sellAssets.filter((asset) => asset.isStable)}
          isOpen={props.state === 'pair'}
          toggleOpen={handleToggle}
          onChangeAssetPair={onChangeAssetPair}
        />
      )}
    </Overlay>
  )
}
