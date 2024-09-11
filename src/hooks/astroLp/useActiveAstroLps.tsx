import { useMemo } from 'react'

import useCurrentAccount from 'accounts/useCurrentAccount'
import { byDenom } from 'utils/array'
import useAvailableAstroLps from './useAvailableAstroLps'

export default function useActiveAstroLps() {
  const account = useCurrentAccount()
  const availableAstroLps = useAvailableAstroLps()
  return useMemo(
    () => availableAstroLps.filter((farm) => account?.stakedAstroLps.find(byDenom(farm.denoms.lp))),
    [availableAstroLps, account?.stakedAstroLps],
  )
}
