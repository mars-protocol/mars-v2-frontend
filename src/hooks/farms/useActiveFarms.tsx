import { useMemo } from 'react'

import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useAvailableFarms from 'hooks/farms/useAvailableFarms'
import { byDenom } from 'utils/array'

export default function useActiveFarms() {
  const account = useCurrentAccount()
  const availableFarms = useAvailableFarms()
  return useMemo(
    () => availableFarms.filter((farm) => account?.stakedAstroLps.find(byDenom(farm.denoms.lp))),
    [availableFarms, account?.stakedAstroLps],
  )
}
