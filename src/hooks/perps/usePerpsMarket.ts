import { useMemo } from 'react'

import usePerpsAsset from 'hooks/perps/usePerpsAsset'
import usePerpsMarketState from 'hooks/perps/usePerpsMarketState'
import { BN } from 'utils/helpers'
import { BN_ZERO } from 'constants/math'

export default function usePerpsMarket() {
  const { perpsAsset } = usePerpsAsset()
  const perpsMarketState = usePerpsMarketState()

  return useMemo(() => {
    if (!perpsMarketState) return null

    const longOI = BN(perpsMarketState.long_oi)
    const shortOI = BN(perpsMarketState.short_oi)
    const totalOI = longOI.plus(shortOI)

    const skewPercentage = totalOI.isZero()
      ? BN_ZERO
      : longOI.minus(shortOI).div(totalOI).shiftedBy(2)

    return {
      // Funding rate is per 24h
      fundingRate: BN(perpsMarketState.current_funding_rate as any).shiftedBy(2),
      asset: perpsAsset,
      openInterest: {
        long: longOI,
        short: shortOI,
        total: totalOI,
        skewPercentage: skewPercentage,
      },
    } as PerpsMarket
  }, [perpsAsset, perpsMarketState])
}
