import { useMemo } from 'react'

import usePerpsAsset from 'hooks/perps/usePerpsAsset'
import usePerpsDenomState from 'hooks/perps/usePerpsDenomState'
import { BN } from 'utils/helpers'

export default function usePerpsMarket() {
  const { perpsAsset } = usePerpsAsset()

  const { data: perpsDenomState } = usePerpsDenomState()

  return useMemo(() => {
    if (!perpsDenomState) return null
    return {
      // Funding rate is per 24h
      fundingRate: BN(perpsDenomState.rate as any).times(100),
      asset: perpsAsset,
      openInterest: {
        long: BN(perpsDenomState.long_oi),
        short: BN(perpsDenomState.short_oi),
      },
    } as PerpsMarket
  }, [perpsAsset, perpsDenomState])
}
