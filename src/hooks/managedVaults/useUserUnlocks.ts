import { getManagedVaultUserUnlocks } from 'api/cosmwasm-client'
import useChainConfig from 'hooks/chain/useChainConfig'
import useStore from 'store'
import useSWR from 'swr'

export function useUserUnlocks(vaultAddress: string) {
  const chainConfig = useChainConfig()
  const address = useStore((s) => s.address)

  return useSWR(
    vaultAddress && address
      ? `chains/${chainConfig.id}/vaults/${vaultAddress}/unlocks/${address}`
      : null,
    async () => {
      try {
        return await getManagedVaultUserUnlocks(chainConfig, vaultAddress!, address!)
      } catch (error) {
        console.error('Error fetching user unlocks:', error)
        return []
      }
    },
    {
      revalidateOnFocus: false,
    },
  )
}
