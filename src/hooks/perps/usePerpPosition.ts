import useCurrentAccount from 'accounts/useCurrentAccount'

export default function usePerpPosition(denom: string): PerpsPosition | undefined {
  const account = useCurrentAccount()
  /* PERPS
  return useMemo(() => account?.perps.find(byDenom(denom)), [account?.perps, denom])
*/
  return
}
