import { getManagedVaultAllUnlocks } from 'api/cosmwasm-client'
import useChainConfig from 'hooks/chain/useChainConfig'
import useSWR from 'swr'

export function useAllUnlocks(vaultAddress: string, limit: number = 10) {
  const chainConfig = useChainConfig()

  return useSWR(
    vaultAddress ? `chains/${chainConfig.id}/vaults/${vaultAddress}/allUnlocks` : null,
    async () => {
      try {
        const response = await getManagedVaultAllUnlocks(chainConfig, vaultAddress!, limit)
        return response.data
      } catch (error) {
        console.error('Error fetching all unlocks:', error)
        return []
      }
    },
    {
      revalidateOnFocus: false,
      refreshInterval: 10_000,
    },
  )
}
