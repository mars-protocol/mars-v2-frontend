import usePerpsAsset from 'hooks/perps/usePerpsAsset'
import usePerpsMarketStates from 'hooks/perps/usePerpsMarketStates'
import { useMemo } from 'react'
import { byDenom } from 'utils/array'

export default function usePerpsMarketState() {
  const { perpsAsset } = usePerpsAsset()
  const { data: perpsMarketStates } = usePerpsMarketStates()

  return useMemo(
    () => perpsMarketStates?.find(byDenom(perpsAsset.denom)),
    [perpsMarketStates, perpsAsset],
  )
}
