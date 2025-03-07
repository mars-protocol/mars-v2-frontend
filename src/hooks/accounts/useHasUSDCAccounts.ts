import { useMemo } from 'react'
import useSWR from 'swr'
import useChainConfig from 'hooks/chain/useChainConfig'
import useStore from 'store'
import { getUSDCAccounts } from 'utils/accounts'

/**
 * Custom hook to check if a user has any usdc margin accounts
 * Uses SWR for caching to avoid unnecessary refetching
 * @returns An object with hasUSDCAccounts boolean and isLoading state
 */
export default function useHasUSDCAccounts() {
  const address = useStore((s) => s.address)
  const chainConfig = useChainConfig()

  const { data: usdcAccounts, isLoading } = useSWR(
    address ? `usdc-accounts/${chainConfig.id}/${address}` : null,
    () => getUSDCAccounts(chainConfig, address || ''),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 30000,
      dedupingInterval: 5000,
    },
  )

  const hasUSDCAccounts = useMemo(() => {
    return !!usdcAccounts && usdcAccounts.length > 0
  }, [usdcAccounts])

  return { hasUSDCAccounts, isLoading }
}
