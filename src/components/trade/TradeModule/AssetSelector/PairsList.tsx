import { useMemo } from 'react'

import Text from 'components/common/Text'
import AssetSelectorItem from 'components/trade/TradeModule/AssetSelector/AssetSelectorItem'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useBaseAsset from 'hooks/assets/useBasetAsset'
import useMarketEnabledAssets from 'hooks/assets/useMarketEnabledAssets'
import useMarkets from 'hooks/markets/useMarkets'
import usePrices from 'hooks/usePrices'
import { getMergedBalancesForAsset } from 'utils/accounts'
import { byDenom } from 'utils/array'
import { sortAssetsOrPairs } from 'utils/assets'

interface Props {
  assets: Asset[]
  stables: Asset[]
  isOpen: boolean
  toggleOpen: () => void
  onChangeAssetPair: (assetPair: AssetPair | Asset) => void
}

export default function PairsList(props: Props) {
  const account = useCurrentAccount()
  const markets = useMarkets()
  const { data: prices } = usePrices()
  const baseDenom = useBaseAsset().denom
  const marketEnabledAssets = useMarketEnabledAssets()
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
    () => sortAssetsOrPairs(pairs, prices, markets, balances, baseDenom) as AssetPair[],
    [pairs, prices, markets, balances, baseDenom],
  )

  return (
    <section>
      {props.isOpen &&
        (props.assets.length === 0 ? (
          <Text size='xs' className='p-4'>
            No available assets found
          </Text>
        ) : (
          <ul>
            {sortedPairs.map((assetPair) => (
              <AssetSelectorItem
                balances={balances}
                key={`${assetPair.buy.symbol}-${assetPair.sell.symbol}`}
                onSelect={props.onChangeAssetPair}
                depositCap={markets?.find(byDenom(assetPair.buy.denom))?.cap}
                asset={assetPair.buy}
                sellAsset={assetPair.sell}
              />
            ))}
          </ul>
        ))}
    </section>
  )
}
