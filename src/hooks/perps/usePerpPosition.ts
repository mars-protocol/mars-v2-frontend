import { useMemo } from 'react'

import useCurrentAccount from 'hooks/useCurrentAccount'
import { byDenom } from 'utils/array'

export default function usePerpPosition(denom: string): PerpsPosition | undefined {
  const account = useCurrentAccount()

  return useMemo(() => account?.perps.find(byDenom(denom)), [account?.perps, denom])
}
