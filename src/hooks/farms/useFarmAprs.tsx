import useAvailableFarms from 'hooks/farms/useAvailableFarms'
import { useMemo } from 'react'

export default function useFarmAprs() {
  const availableFarms = useAvailableFarms()
  return useMemo(
    () =>
      availableFarms.map((farm) => {
        return { address: farm.denoms.lp, apr: farm.apr ?? 0 }
      }),
    [availableFarms],
  )
}
