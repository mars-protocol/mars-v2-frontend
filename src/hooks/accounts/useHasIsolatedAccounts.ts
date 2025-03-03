import { useMemo } from 'react'
import useSWR from 'swr'
import useChainConfig from 'hooks/chain/useChainConfig'
import useStore from 'store'
import { getIsolatedAccounts } from 'utils/accounts'

/**
 * Custom hook to check if a user has any isolated margin accounts
 * Uses SWR for caching to avoid unnecessary refetching
 * @returns An object with hasIsolatedAccounts boolean and isLoading state
 */
export default function useHasIsolatedAccounts() {
  const address = useStore((s) => s.address)
  const chainConfig = useChainConfig()

  const { data: isolatedAccounts, isLoading } = useSWR(
    address ? `isolated-accounts/${chainConfig.id}/${address}` : null,
    () => getIsolatedAccounts(chainConfig, address || ''),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 30000,
      dedupingInterval: 5000,
    },
  )

  const hasIsolatedAccounts = useMemo(() => {
    return !!isolatedAccounts && isolatedAccounts.length > 0
  }, [isolatedAccounts])

  return { hasIsolatedAccounts, isLoading }
}
