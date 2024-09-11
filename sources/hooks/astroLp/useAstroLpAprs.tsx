import { useMemo } from 'react'
import useAvailableAstroLps from './useAvailableAstroLps'

export default function useAstroLpAprs() {
  const availableAstroLps = useAvailableAstroLps()
  return useMemo(
    () =>
      availableAstroLps.map((farm) => {
        return { address: farm.denoms.lp, apr: farm.apr ?? 0 }
      }),
    [availableAstroLps],
  )
}
