import { getManagedVaultDetails } from 'api/cosmwasm-client'
import useChainConfig from 'hooks/chain/useChainConfig'
import useStore from 'store'
import useSWR from 'swr'
import useWalletBalances from 'hooks/wallet/useWalletBalances'

export function useDepositedManagedVaultsFallback() {
  const chainConfig = useChainConfig()
  const address = useStore((s) => s.address)
  const { data: walletBalances } = useWalletBalances(address)
  const hasBalances = walletBalances && walletBalances.length > 0

  const { data: userVaults, isLoading } = useSWR(
    address && hasBalances ? `chains/${chainConfig.id}/managedVaults/fallback/${address}` : null,
    async () => {
      if (!address || !walletBalances) return []

      const vaultTokens = walletBalances
        .filter(
          (balance) => balance.denom.startsWith('factory/') && balance.denom.includes('/vault_'),
        )
        .map((balance) => {
          const parts = balance.denom.split('/')
          return parts[1]
        })

      console.log('vaultTokens', vaultTokens)
      if (!vaultTokens.length) return []

      const vaults = await Promise.all(
        vaultTokens.map(async (vaultAddress) => {
          try {
            const details = await getManagedVaultDetails(chainConfig, vaultAddress)
            return {
              vault_address: vaultAddress,
              account_id: details.vault_account_id,
              title: details.title,
              subtitle: details.subtitle || '',
              description: details.description,
              fee_rate: details.performance_fee_config.fee_rate,
              fee: '0',
              tvl: '0',
              apr: '0',
              base_tokens_denom: details.base_token,
              base_tokens_amount: details.total_base_tokens,
              vault_tokens_denom: details.vault_token,
              vault_tokens_amount: details.total_vault_tokens,
              isOwner: false,
            } as ManagedVaultWithDetails
          } catch (error) {
            console.error(`Error fetching details for vault ${vaultAddress}:`, error)
            return null
          }
        }),
      )

      return vaults.filter(Boolean) as ManagedVaultWithDetails[]
    },
    {
      refreshInterval: 60_000,
      suspense: false,
    },
  )

  return {
    data: userVaults ?? [],
    isLoading,
  }
}
