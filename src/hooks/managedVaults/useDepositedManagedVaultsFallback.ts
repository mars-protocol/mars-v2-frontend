import { getManagedVaultDetails } from 'api/cosmwasm-client'
import useChainConfig from 'hooks/chain/useChainConfig'
import useStore from 'store'
import useSWR from 'swr'
import useWalletBalances from 'hooks/wallet/useWalletBalances'
import BN from 'bignumber.js'
import { useMemo } from 'react'

export function useDepositedManagedVaultsFallback() {
  const chainConfig = useChainConfig()
  const address = useStore((s) => s.address)
  const { data: walletBalances } = useWalletBalances(address)
  const hasBalances = walletBalances && walletBalances.length > 0

  const pendingVault = useMemo(() => {
    try {
      const storedVault = localStorage.getItem('pendingVaultMint')
      if (!storedVault) return null
      const parsedVault = JSON.parse(storedVault)
      if (parsedVault.creatorAddress === address) {
        return parsedVault
      }
      return null
    } catch (error) {
      console.error('Failed to parse pending vault:', error)
      return null
    }
  }, [address])

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

      if (!vaultTokens.length && !pendingVault) return []

      const vaults = await Promise.all(
        vaultTokens.map(async (vaultAddress) => {
          try {
            const details = await getManagedVaultDetails(chainConfig, vaultAddress)
            if (!details) return null
            return {
              vault_address: vaultAddress,
              account_id: details.vault_account_id,
              title: details.title,
              subtitle: details.subtitle || '',
              description: details.description,
              fee_rate: BN(details.performance_fee_config.fee_rate)
                .multipliedBy(8760)
                .multipliedBy(100)
                .integerValue(BN.ROUND_HALF_UP)
                .toNumber(),
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

      const filteredVaults = vaults.filter(Boolean) as ManagedVaultWithDetails[]

      // Add pending vault if it exists
      if (pendingVault && pendingVault.creatorAddress === address) {
        try {
          const pendingVaultData = {
            vault_address: pendingVault.vaultAddress,
            account_id: '',
            title: pendingVault.params.title,
            subtitle: '',
            description: pendingVault.params.description,
            fee_rate: BN(pendingVault.params.performanceFee.fee_rate)
              .multipliedBy(8760)
              .multipliedBy(100)
              .integerValue(BN.ROUND_HALF_UP)
              .toNumber(),
            fee: '0',
            tvl: '0',
            apr: '0',
            base_tokens_denom: pendingVault.params.baseToken,
            base_tokens_amount: '0',
            vault_tokens_denom: pendingVault.params.vaultToken,
            vault_tokens_amount: '0',
            isOwner: true,
            isPending: true,
            ownerAddress: pendingVault.creatorAddress,
          } as ManagedVaultWithDetails
          filteredVaults.push(pendingVaultData)
        } catch (error) {
          console.error(
            `Error fetching details for pending vault ${pendingVault.vaultAddress}:`,
            error,
          )
        }
      }

      return filteredVaults
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
