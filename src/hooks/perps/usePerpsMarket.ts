import { useMemo } from 'react'

import usePerpsAsset from 'hooks/perps/usePerpsAsset'
import usePerpsMarketState from 'hooks/perps/usePerpsMarketState'
import { BN } from 'utils/helpers'

export default function usePerpsMarket() {
  const { perpsAsset } = usePerpsAsset()

  const perpsMarketState = usePerpsMarketState()

  return useMemo(() => {
    if (!perpsMarketState) return null
    return {
      // Funding rate is per 24h
      fundingRate: BN(perpsMarketState.current_funding_rate as any).times(100),
      asset: perpsAsset,
      openInterest: {
        long: BN(perpsMarketState.long_oi),
        short: BN(perpsMarketState.short_oi),
      },
    } as PerpsMarket
  }, [perpsAsset, perpsMarketState])
}
