import classNames from 'classnames'
import { Suspense, useMemo } from 'react'

import { ChevronDown } from 'components/common/Icons'
import Text from 'components/common/Text'
import AssetSelectorItem from 'components/trade/TradeModule/AssetSelector/AssetSelectorItem'
import AssetSelectorItemLoading from 'components/trade/TradeModule/AssetSelector/AssetSelectorItemLoading'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useTradeEnabledAssets from 'hooks/assets/useTradeEnabledAssets'
import useFavoriteAssets from 'hooks/localStorage/useFavoriteAssets'
import useMarkets from 'hooks/markets/useMarkets'
import { getMergedBalancesForAsset } from 'utils/accounts'
import { byDenom } from 'utils/array'
import { sortAssetsOrPairs } from 'utils/assets'

interface Props {
  type: 'buy' | 'sell' | 'perps'
  assets: Asset[]
  isOpen: boolean
  toggleOpen: () => void
  onChangeAsset: (asset: Asset | AssetPair) => void
  activeAsset: Asset
}

export default function AssetList(props: Props) {
  const { assets, type, isOpen, toggleOpen, onChangeAsset } = props
  const account = useCurrentAccount()
  const markets = useMarkets()
  const marketEnabledAssets = useTradeEnabledAssets()
  const [favoriteAssetsDenoms, _] = useFavoriteAssets()
  const balances = useMemo(() => {
    if (!account) return []
    return getMergedBalancesForAsset(account, marketEnabledAssets)
  }, [account, marketEnabledAssets])

  const sortedAssets = useMemo(() => {
    const sorted = sortAssetsOrPairs(assets, markets, balances, favoriteAssetsDenoms) as Asset[]
    return sorted.filter(
      (asset, index, self) => index === self.findIndex((t) => t.denom === asset.denom),
    )
  }, [assets, markets, balances, favoriteAssetsDenoms])

  return (
    <section
      className={classNames('flex flex-wrap w-full overflow-hidden', type !== 'perps' && 'pb-12')}
    >
      {type !== 'perps' && (
        <button
          className='flex items-center justify-between w-full p-4 bg-black/20'
          onClick={toggleOpen}
        >
          <Text>{type === 'buy' ? 'Buy asset' : 'Sell asset'}</Text>
          <ChevronDown className={classNames(isOpen && '-rotate-180', 'w-4')} />
        </button>
      )}
      {isOpen &&
        (sortedAssets.length === 0 ? (
          <Text size='xs' className='p-4'>
            No available assets found
          </Text>
        ) : (
          <ul className='flex flex-wrap items-start w-full h-full overflow-y-scroll scrollbar-hide'>
            {sortedAssets.map((asset) => (
              <Suspense fallback={<AssetSelectorItemLoading />}>
                <AssetSelectorItem
                  balances={balances}
                  key={`${type}-${asset.denom}`}
                  onSelect={onChangeAsset}
                  depositCap={type === 'buy' ? markets?.find(byDenom(asset.denom))?.cap : undefined}
                  asset={asset}
                  isActive={props.activeAsset.denom === asset.denom}
                />
              </Suspense>
            ))}
          </ul>
        ))}
    </section>
  )
}
