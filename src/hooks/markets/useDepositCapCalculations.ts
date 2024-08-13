import { useMemo } from 'react'
import { BNCoin } from 'types/classes/BNCoin'
import { WrappedBNCoin } from 'types/classes/WrappedBNCoin'
import { getCapLeftWithBuffer } from 'utils/generic'
import useMarkets from 'hooks/markets/useMarkets'

export function useDepositCapCalculations(fundingAssets: WrappedBNCoin[]) {
  const markets = useMarkets()

  const depositCapReachedCoins = useMemo(() => {
    const depositCapReachedCoins: WrappedBNCoin[] = []
    fundingAssets.forEach((wrappedAsset) => {
      const asset = wrappedAsset.coin
      const marketAsset = markets.find((market) => market.asset.denom === asset.denom)
      if (!marketAsset || !marketAsset.cap) return

      const capLeft = getCapLeftWithBuffer(marketAsset.cap)

      if (asset.amount.isLessThanOrEqualTo(capLeft)) return

      const capReachedCoin = BNCoin.fromDenomAndBigNumber(asset.denom, capLeft)
      depositCapReachedCoins.push(WrappedBNCoin.fromBNCoin(capReachedCoin, wrappedAsset.chain))
    })
    return depositCapReachedCoins
  }, [fundingAssets, markets])

  return { depositCapReachedCoins }
}
