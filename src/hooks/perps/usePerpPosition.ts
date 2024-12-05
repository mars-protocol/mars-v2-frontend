import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import { useMemo } from 'react'
import { byDenom } from 'utils/array'

export default function usePerpPosition(denom: string): PerpsPosition | undefined {
  const account = useCurrentAccount()
  return useMemo(() => account?.perps?.find(byDenom(denom)), [account?.perps, denom])
}
