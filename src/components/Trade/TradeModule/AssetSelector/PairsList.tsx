import { useMemo } from 'react'

import Text from 'components/Text'
import PairItem from 'components/Trade/TradeModule/AssetSelector/PairItem'
import { ASSETS } from 'constants/assets'
import { BN_ZERO } from 'constants/math'
import useCurrentAccount from 'hooks/useCurrentAccount'
import useMarketAssets from 'hooks/useMarketAssets'
import useMarketDeposits from 'hooks/useMarketDeposits'
import usePrices from 'hooks/usePrices'
import { getMergedBalancesForAsset } from 'utils/accounts'
import { byDenom } from 'utils/array'
import { getEnabledMarketAssets } from 'utils/assets'
import { demagnify } from 'utils/formatters'

interface Props {
  assets: Asset[]
  stables: Asset[]
  isOpen: boolean
  toggleOpen: () => void
  onChangeAssetPair: (assetPair: AssetPair) => void
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

  const sortedPairs = useMemo(() => {
    if (prices.length === 0 || marketDeposits.length === 0) return pairs

    return pairs.sort((a, b) => {
      const aDenom = a.buy.denom
      const bDenom = b.buy.denom
      const aBalance = balances?.find(byDenom(aDenom))?.amount ?? BN_ZERO
      const aPrice = prices?.find(byDenom(aDenom))?.amount ?? BN_ZERO
      const bBalance = balances?.find(byDenom(bDenom))?.amount ?? BN_ZERO
      const bPrice = prices?.find(byDenom(bDenom))?.amount ?? BN_ZERO

      const aValue = demagnify(aBalance, a.buy) * aPrice.toNumber()
      const bValue = demagnify(bBalance, b.buy) * bPrice.toNumber()
      if (aValue > 0 || bValue > 0) return bValue - aValue
      if (aDenom === baseDenom) return -1
      if (bDenom === baseDenom) return 1

      const aMarketDeposit = marketDeposits?.find(byDenom(aDenom))?.amount ?? BN_ZERO
      const bMarketDeposit = marketDeposits?.find(byDenom(bDenom))?.amount ?? BN_ZERO
      const aMarketValue = demagnify(aMarketDeposit, a.buy) * aPrice.toNumber()
      const bMarketValue = demagnify(bMarketDeposit, b.buy) * bPrice.toNumber()

      return bMarketValue - aMarketValue
    })
  }, [balances, prices, pairs, marketDeposits])

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
              <PairItem
                balances={balances}
                key={`${assetPair.buy.symbol}-${assetPair.sell.symbol}`}
                assetPair={assetPair}
                onSelectAssetPair={props.onChangeAssetPair}
                depositCap={marketAssets?.find(byDenom(assetPair.buy.denom))?.cap}
              />
            ))}
          </ul>
        ))}
    </section>
  )
}
