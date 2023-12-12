import { useMemo } from 'react'

import Text from 'components/Text'
import AssetSelectorItem from 'components/Trade/TradeModule/AssetSelector/AssetSelectorItem'
import { ASSETS } from 'constants/assets'
import useCurrentAccount from 'hooks/useCurrentAccount'
import useMarketAssets from 'hooks/useMarketAssets'
import useMarketDeposits from 'hooks/useMarketDeposits'
import usePrices from 'hooks/usePrices'
import { getMergedBalancesForAsset } from 'utils/accounts'
import { byDenom } from 'utils/array'
import { getEnabledMarketAssets, sortAssetsOrPairs } from 'utils/assets'

interface Props {
  assets: Asset[]
  stables: Asset[]
  isOpen: boolean
  toggleOpen: () => void
  onChangeAssetPair: (assetPair: AssetPair | Asset) => void
}

const baseDenom = ASSETS[0].denom

export default function PairsList(props: Props) {
  const account = useCurrentAccount()
  const { data: marketAssets } = useMarketAssets()
  const { data: marketDeposits } = useMarketDeposits()
  const { data: prices } = usePrices()
  const balances = useMemo(() => {
    if (!account) return []
    return getMergedBalancesForAsset(account, getEnabledMarketAssets())
  }, [account])

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
    () => sortAssetsOrPairs(pairs, prices, marketDeposits, balances, baseDenom) as AssetPair[],
    [balances, prices, pairs, marketDeposits],
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
                depositCap={marketAssets?.find(byDenom(assetPair.buy.denom))?.cap}
                asset={assetPair.buy}
                sellAsset={assetPair.sell}
              />
            ))}
          </ul>
        ))}
    </section>
  )
}
