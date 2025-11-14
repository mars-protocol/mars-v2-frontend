import { Suspense, useMemo } from 'react'

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
  assets: Asset[]
  stables: Asset[]
  isOpen: boolean
  activeAsset: Asset
  toggleOpen: () => void
  onChangeAssetPair: (assetPair: AssetPair | Asset) => void
}

export default function PairsList(props: Props) {
  const account = useCurrentAccount()
  const markets = useMarkets()
  const [favoriteAssetsDenoms, _] = useFavoriteAssets()
  const marketEnabledAssets = useTradeEnabledAssets()
  const balances = useMemo(() => {
    if (!account) return []
    return getMergedBalancesForAsset(account, marketEnabledAssets)
  }, [account, marketEnabledAssets])

  const pairs = useMemo(() => {
    const tradingPairs: AssetPair[] = []
    props.stables.forEach((stable) => {
      props.assets.forEach((buyAsset) => {
        if (buyAsset.denom === stable.denom) return
        tradingPairs.push({ buy: buyAsset, sell: stable })
      })
    })
    return tradingPairs
  }, [props.stables, props.assets])

  const sortedPairs = useMemo(
    () => sortAssetsOrPairs(pairs, markets, balances, favoriteAssetsDenoms) as AssetPair[],
    [pairs, markets, balances, favoriteAssetsDenoms],
  )

  return (
    <section className='flex flex-wrap grow w-full overflow-hidden'>
      {props.isOpen &&
        (props.assets.length === 0 ? (
          <Text size='xs' className='p-4'>
            No available assets found
          </Text>
        ) : (
          <div className='flex items-start w-full h-full overflow-y-scroll scrollbar-hide'>
            <ul className='w-full'>
              {sortedPairs.map((assetPair) => (
                <Suspense
                  fallback={<AssetSelectorItemLoading />}
                  key={`${assetPair.buy.denom}-${assetPair.sell.denom}`}
                >
                  <AssetSelectorItem
                    balances={balances}
                    onSelect={props.onChangeAssetPair}
                    depositCap={markets?.find(byDenom(assetPair.buy.denom))?.cap}
                    asset={assetPair.buy}
                    sellAsset={assetPair.sell}
                    isActive={props.activeAsset.denom === assetPair.buy.denom}
                  />
                </Suspense>
              ))}
            </ul>
          </div>
        ))}
    </section>
  )
}
