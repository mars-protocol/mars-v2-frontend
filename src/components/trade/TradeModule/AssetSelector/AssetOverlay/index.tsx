import { useCallback, useMemo, useState } from 'react'

import EscButton from 'components/common/Button/EscButton'
import Divider from 'components/common/Divider'
import Overlay from 'components/common/Overlay'
import SearchBar from 'components/common/SearchBar'
import Text from 'components/common/Text'
import AssetList from 'components/trade/TradeModule/AssetSelector/AssetList'
import StablesFilter from 'components/trade/TradeModule/AssetSelector/AssetOverlay/StablesFilter'
import PairsList from 'components/trade/TradeModule/AssetSelector/PairsList'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useAllAssets from 'hooks/assets/useAllAssets'
import useFilteredAssets from 'hooks/useFilteredAssets'

interface Props {
  state: OverlayState
  buyAsset: Asset
  sellAsset: Asset
  buyAssets: Asset[]
  onChangeBuyAsset?: (asset: Asset) => void
  onChangeSellAsset?: (asset: Asset) => void
  onChangeTradingPair?: (tradingPair: TradingPair) => void
  onChangeState: (state: OverlayState) => void
  type: 'pair' | 'single' | 'perps'
}

function MarketSubheadLine(props: { title: string }) {
  return (
    <Text size='sm' className='px-4 py-2 border-b border-white/5 text-white/60 bg-white/5'>
      {props.title}
    </Text>
  )
}

export default function AssetOverlay(props: Props) {
  const { assets, searchString, onChangeSearch } = useFilteredAssets(props.buyAssets)
  const account = useCurrentAccount()
  const allAssets = useAllAssets()
  const stableAssets = useMemo(() => allAssets.filter((asset) => asset.isStable), [allAssets])
  const handleClose = useCallback(() => props.onChangeState('closed'), [props])
  const handleToggle = useCallback(() => props.onChangeState(props.state), [props])
  const [selectedStables, setSelectedStables] = useState<Asset[]>([stableAssets[0]])

  const buyAssets = useMemo(
    () =>
      props.type === 'pair'
        ? assets
        : assets.filter((asset) => asset.denom !== props.sellAsset.denom),
    [assets, props.sellAsset, props.type],
  )

  const sellAssets = useMemo(
    () => assets.filter((asset) => asset.denom !== props.buyAsset.denom),
    [assets, props.buyAsset],
  )

  const onChangeBuyAsset = useCallback(
    (asset: AssetPair | Asset) => {
      const selectedAsset = asset as Asset
      if (!props.onChangeBuyAsset) return
      props.onChangeBuyAsset(selectedAsset)
      props.onChangeState('sell')
      onChangeSearch('')
    },
    [onChangeSearch, props],
  )

  const onChangeSellAsset = useCallback(
    (asset: AssetPair | Asset) => {
      const selectedAsset = asset as Asset
      if (!props.onChangeSellAsset) return
      props.onChangeSellAsset(selectedAsset)
      onChangeSearch('')
    },
    [onChangeSearch, props],
  )

  const onChangeAssetPair = useCallback(
    (assetPair: AssetPair | Asset) => {
      const selectedPair = assetPair as AssetPair
      if (!props.onChangeTradingPair) return
      props.onChangeTradingPair({ buy: selectedPair.buy.denom, sell: selectedPair.sell.denom })
      props.onChangeState('closed')
      onChangeSearch('')
    },
    [onChangeSearch, props],
  )

  const [activePerpsPositions, availablePerpsMarkets] = useMemo(() => {
    const activePerpsPositions =
      account?.perps.length === 0
        ? []
        : assets.filter((assets) => account?.perps.find((perp) => perp.denom === assets.denom))
    const availablePerpsMarkets = assets.filter(
      (assets) => !activePerpsPositions.find((perp) => perp.denom === assets.denom),
    )

    return [activePerpsPositions, availablePerpsMarkets]
  }, [assets, account])

  return (
    <Overlay
      className='inset-0 w-full overflow-y-scroll scrollbar-hide'
      show={props.state !== 'closed'}
      setShow={handleClose}
    >
      <div className='flex justify-between p-4 overflow-hidden'>
        <Text>{props.type !== 'single' ? 'Select a market' : 'Select asset'}</Text>
        <EscButton onClick={handleClose} enableKeyPress />
      </div>
      {props.type === 'pair' && (
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
      {props.type === 'perps' && activePerpsPositions.length > 0 && (
        <>
          <MarketSubheadLine title='Active Positions' />
          <AssetList
            assets={activePerpsPositions}
            type='perps'
            onChangeAsset={onChangeBuyAsset}
            isOpen
            toggleOpen={() => {}}
          />
        </>
      )}
      {props.type === 'perps' && availablePerpsMarkets.length > 0 && (
        <>
          <MarketSubheadLine title='Available Markets' />
          <AssetList
            assets={availablePerpsMarkets}
            type='perps'
            onChangeAsset={onChangeBuyAsset}
            isOpen
            toggleOpen={() => {}}
          />
        </>
      )}

      {props.type === 'pair' && (
        <PairsList
          assets={buyAssets}
          stables={selectedStables}
          isOpen={props.state === 'pair'}
          toggleOpen={handleToggle}
          onChangeAssetPair={onChangeAssetPair}
        />
      )}

      {props.type === 'single' && (
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
