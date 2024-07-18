import { useMemo } from 'react'

import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import { byDenom } from 'utils/array'
import useAvailableAstroLps from 'hooks/astroLp/useAvailableAstroLps'

export default function useActiveAstroLps() {
  const account = useCurrentAccount()
  const availableAstroLps = useAvailableAstroLps()
  return useMemo(
    () => availableAstroLps.filter((farm) => account?.stakedAstroLps.find(byDenom(farm.denoms.lp))),
    [availableAstroLps, account?.stakedAstroLps],
  )
}
