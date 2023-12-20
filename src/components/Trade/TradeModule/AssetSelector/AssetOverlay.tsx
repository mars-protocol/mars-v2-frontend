import { useCallback, useMemo, useState } from 'react'

import Button from 'components/Button'
import EscButton from 'components/Button/EscButton'
import Divider from 'components/Divider'
import Overlay from 'components/Overlay'
import SearchBar from 'components/SearchBar'
import Text from 'components/Text'
import AssetList from 'components/Trade/TradeModule/AssetSelector/AssetList'
import PairsList from 'components/Trade/TradeModule/AssetSelector/PairsList'
import useAllAssets from 'hooks/assets/useAllAssets'
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

interface StablesFilterProps {
  stables: Asset[]
  selectedStables: Asset[]
  onFilter: (stables: Asset[]) => void
}

function StablesFilter(props: StablesFilterProps) {
  const { stables, selectedStables, onFilter } = props
  const isAllSelected = selectedStables.length > 1
  return (
    <>
      <Divider />
      <div className='flex items-center w-full py-2 justify-evenly'>
        <Button
          onClick={() => onFilter(stables)}
          text='All'
          color={isAllSelected ? 'secondary' : 'quaternary'}
          variant='transparent'
          className={isAllSelected ? '!text-white !bg-white/10 border-white' : ''}
        />
        {stables.map((stable) => {
          const isCurrent = !isAllSelected && selectedStables[0].denom === stable.denom
          return (
            <Button
              key={stable.symbol}
              onClick={() => onFilter([stable])}
              text={stable.symbol}
              color={isCurrent ? 'secondary' : 'quaternary'}
              variant='transparent'
              className={isCurrent ? '!text-white !bg-white/10 border-white' : ''}
            />
          )
        })}
      </div>
    </>
  )
}

export default function AssetOverlay(props: Props) {
  const isPairSelector = !!props.onChangeTradingPair
  const { assets, searchString, onChangeSearch } = useFilteredAssets()
  const allAssets = useAllAssets()
  const stableAssets = useMemo(() => allAssets.filter((asset) => asset.isStable), [allAssets])
  const handleClose = useCallback(() => props.onChangeState('closed'), [props])
  const handleToggle = useCallback(() => props.onChangeState(props.state), [props])
  const [selectedStables, setSelectedStables] = useState<Asset[]>([stableAssets[0]])

  const buyAssets = useMemo(
    () =>
      isPairSelector ? assets : assets.filter((asset) => asset.denom !== props.sellAsset.denom),
    [assets, props.sellAsset, isPairSelector],
  )

  const sellAssets = useMemo(
    () => assets.filter((asset) => asset.denom !== props.buyAsset.denom),
    [assets, props.buyAsset],
  )

  function onChangeBuyAsset(asset: AssetPair | Asset) {
    const selectedAsset = asset as Asset
    if (!props.onChangeBuyAsset) return
    props.onChangeBuyAsset(selectedAsset)
    props.onChangeState('sell')
    onChangeSearch('')
  }

  function onChangeSellAsset(asset: AssetPair | Asset) {
    const selectedAsset = asset as Asset
    if (!props.onChangeSellAsset) return
    props.onChangeSellAsset(selectedAsset)
    onChangeSearch('')
  }

  function onChangeAssetPair(assetPair: AssetPair | Asset) {
    const selectedPair = assetPair as AssetPair
    if (!props.onChangeTradingPair) return
    props.onChangeTradingPair({ buy: selectedPair.buy.denom, sell: selectedPair.sell.denom })
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
        <Text>{isPairSelector ? 'Select a market' : 'Select asset'}</Text>
        <EscButton onClick={handleClose} enableKeyPress />
      </div>
      {isPairSelector && (
        <StablesFilter
          stables={stableAssets}
          selectedStables={selectedStables}
          onFilter={setSelectedStables}
        />
      )}
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
      {isPairSelector ? (
        <PairsList
          assets={buyAssets}
          stables={selectedStables}
          isOpen={props.state === 'pair'}
          toggleOpen={handleToggle}
          onChangeAssetPair={onChangeAssetPair}
        />
      ) : (
        <>
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
        </>
      )}
    </Overlay>
  )
}
