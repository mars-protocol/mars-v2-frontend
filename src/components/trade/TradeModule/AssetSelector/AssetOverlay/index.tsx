import { useCallback, useEffect, useMemo, useState } from 'react'
import { isMobile } from 'react-device-detect'

import EscButton from 'components/common/Button/EscButton'
import { CircularProgress } from 'components/common/CircularProgress'
import Divider from 'components/common/Divider'
import Overlay from 'components/common/Overlay'
import SearchBar from 'components/common/SearchBar'
import Text from 'components/common/Text'
import AssetList from 'components/trade/TradeModule/AssetSelector/AssetList'
import StablesFilter from 'components/trade/TradeModule/AssetSelector/AssetOverlay/StablesFilter'
import PairsList from 'components/trade/TradeModule/AssetSelector/PairsList'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useDepositEnabledAssets from 'hooks/assets/useDepositEnabledAssets'
import useFilteredAssets from 'hooks/assets/useFilteredAssets'
import { useAllPerpsParamsSC } from 'hooks/perps/usePerpsParams'

interface Props {
  state: OverlayState
  buyAsset: Asset
  sellAsset: Asset
  buyAssets: Asset[]
  onChangeBuyAsset?: (asset: Asset) => void
  onChangeSellAsset?: (asset: Asset) => void
  onSwapAssets?: () => void
  onChangeTradingPair?: (tradingPair: TradingPair) => void
  onChangeState: (state: OverlayState) => void
  type: 'pair' | 'single' | 'perps'
}

function MarketSubheadLine(props: { title: string }) {
  return (
    <Text size='sm' className='w-full px-4 py-2 border-b border-white/5 text-white/60 bg-white/5'>
      {props.title}
    </Text>
  )
}

export default function AssetOverlay(props: Props) {
  const [loading, setLoading] = useState<boolean>(true)
  const account = useCurrentAccount()
  const { data: perpsParams } = useAllPerpsParamsSC()

  // Filter assets based on USDC account type and liquidation threshold
  const filteredBuyAssets = useMemo(() => {
    if (account?.kind === 'usdc')
      return props.buyAssets.filter((asset) => {
        const assetParams = perpsParams?.find((param) => param.denom === asset.denom)
        return assetParams?.liquidation_threshold_usdc?.is_enabled === true
      })
    return props.buyAssets.filter((asset) => {
      const assetParams = perpsParams?.find((param) => param.denom === asset.denom)
      return assetParams?.liquidation_threshold.is_enabled === true
    })
  }, [account?.kind, props.buyAssets, perpsParams])

  const { assets, searchString, onChangeSearch } = useFilteredAssets(filteredBuyAssets)
  const whitelistedAssets = useDepositEnabledAssets()
  const stableAssets = useMemo(
    () => whitelistedAssets.filter((asset) => asset.isStable),
    [whitelistedAssets],
  )
  const handleClose = useCallback(() => props.onChangeState('closed'), [props])
  const handleToggle = useCallback(() => props.onChangeState(props.state), [props])
  const [selectedStables, setSelectedStables] = useState<Asset[]>([stableAssets[0]])

  const sellAssets = useMemo(
    () => assets.filter((asset) => asset.denom !== props.buyAsset.denom),
    [assets, props.buyAsset],
  )

  const onChangeBuyAsset = useCallback(
    (asset: AssetPair | Asset) => {
      const selectedAsset = asset as Asset
      if (selectedAsset.denom === props.sellAsset.denom && props.onSwapAssets) {
        props.onSwapAssets()
        handleToggle()
        return
      }
      if (!props.onChangeBuyAsset) return
      props.onChangeBuyAsset(selectedAsset)
      handleToggle()
      onChangeSearch('')
    },
    [onChangeSearch, props, handleToggle],
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
    if (!account) return [[], assets]
    const activePerpsPositions = assets.filter((assets) =>
      account.perps?.find((perp) => perp.denom === assets.denom),
    )
    const availablePerpsMarkets = assets.filter(
      (assets) => !activePerpsPositions.find((perp) => perp.denom === assets.denom),
    )

    return [activePerpsPositions, availablePerpsMarkets]
  }, [assets, account])

  useEffect(() => {
    if (assets.length > 0) {
      setLoading(false)
    }
  }, [assets])

  return (
    <Overlay
      className='left-0 flex flex-col w-full overflow-hidden h-screen-full md:h-auto top-18 md:inset-0'
      show={props.state !== 'closed'}
      setShow={handleClose}
    >
      <div className='flex justify-between p-4'>
        <Text>{props.type !== 'single' ? 'Select a market' : 'Select asset'}</Text>
        <EscButton onClick={handleClose} enableKeyPress />
      </div>
      {loading ? (
        <div className='flex items-center justify-center w-full h-full'>
          <CircularProgress size={80} />
        </div>
      ) : (
        <>
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
              placeholder='Search for e.g. "ATOM" or "Cosmos"'
              autoFocus={!isMobile}
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
                activeAsset={props.buyAsset}
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
                activeAsset={props.buyAsset}
              />
            </>
          )}

          {props.type === 'pair' && (
            <PairsList
              assets={assets}
              stables={selectedStables}
              isOpen={props.state === 'pair'}
              toggleOpen={handleToggle}
              onChangeAssetPair={onChangeAssetPair}
              activeAsset={props.buyAsset}
            />
          )}

          {props.type === 'single' && (
            <>
              <AssetList
                type='buy'
                assets={assets}
                isOpen={props.state === 'buy'}
                toggleOpen={handleToggle}
                onChangeAsset={onChangeBuyAsset}
                activeAsset={props.buyAsset}
              />
              <Divider />
              <AssetList
                type='sell'
                assets={sellAssets}
                isOpen={props.state === 'sell'}
                toggleOpen={handleToggle}
                onChangeAsset={onChangeSellAsset}
                activeAsset={props.sellAsset}
              />
            </>
          )}
        </>
      )}
    </Overlay>
  )
}
