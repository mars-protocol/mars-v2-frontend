import { useMemo } from 'react'

import { byDenom } from '../../utils/array'
import useCurrentAccount from '../accounts/useCurrentAccount'
import useAvailableAstroLps from './useAvailableAstroLps'

export default function useActiveAstroLps() {
  const account = useCurrentAccount()
  const availableAstroLps = useAvailableAstroLps()
  return useMemo(
    () => availableAstroLps.filter((farm) => account?.stakedAstroLps.find(byDenom(farm.denoms.lp))),
    [availableAstroLps, account?.stakedAstroLps],
  )
}
