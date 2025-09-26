import { useCallback } from 'react'
import { useSWRConfig } from 'swr'
import { calculateTier } from 'hooks/staking/useTierSystem'
import { convertToNeutronAddress } from 'utils/wallet'

/**
 * Hook to get the staking tier of a vault owner from the SWR cache
 * This is useful for sorting and display purposes where we need tier information
 * but don't want to trigger new API calls
 */
export default function useVaultOwnerTier() {
  const { cache } = useSWRConfig()

  const getVaultOwnerTier = useCallback(
    (ownerAddress?: string): number => {
      if (!ownerAddress) return 1 // No owner = lowest tier

      try {
        const neutronAddress = convertToNeutronAddress(ownerAddress)
        const cacheKey = `neutron-staked-mars/${neutronAddress}`
        const cachedData = cache.get(cacheKey)

        if (cachedData?.data?.stakedAmount) {
          const stakedAmount = cachedData.data.stakedAmount.toNumber()
          const tier = calculateTier(stakedAmount)
          return tier.id
        }
      } catch (error) {
        // If there's any error getting cached data, default to tier 1
        console.warn('Failed to get tier for vault owner:', ownerAddress, error)
      }

      return 1 // Default to lowest tier if no cached data
    },
    [cache],
  )

  return { getVaultOwnerTier }
}
