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
        const response = await getManagedVaultUserUnlocks(chainConfig, vaultAddress!, address!)
        return response.map((unlock) => ({
          user_address: unlock.user_address,
          created_at: unlock.created_at,
          cooldown_end: unlock.cooldown_end,
          vault_tokens_amount: unlock.vault_tokens,
          base_tokens_amount: unlock.base_tokens,
        }))
      } catch (error) {
        console.error('Error fetching user unlocks:', error)
        return []
      }
    },
    {
      revalidateOnFocus: false,
      refreshInterval: 10_000,
    },
  )
}
