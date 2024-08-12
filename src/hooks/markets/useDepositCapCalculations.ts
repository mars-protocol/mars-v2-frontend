import { useMemo } from 'react'
import { BNCoin } from 'types/classes/BNCoin'
import { getCapLeftWithBuffer } from 'utils/generic'
import useMarkets from 'hooks/markets/useMarkets'

export function useDepositCapCalculations(fundingAssets: BNCoin[]) {
  const markets = useMarkets()

  const depositCapReachedCoins = useMemo(() => {
    const depositCapReachedCoins: BNCoin[] = []
    fundingAssets.forEach((asset) => {
      const marketAsset = markets.find((market) => market.asset.denom === asset.denom)
      if (!marketAsset || !marketAsset.cap) return

      const capLeft = getCapLeftWithBuffer(marketAsset.cap)

      if (asset.amount.isLessThanOrEqualTo(capLeft)) return

      depositCapReachedCoins.push(BNCoin.fromDenomAndBigNumber(asset.denom, capLeft))
    })
    return depositCapReachedCoins
  }, [fundingAssets, markets])

  return { depositCapReachedCoins }
}
