import { getManagedVaultDetails, getManagedVaultOwnerAddress } from 'api/cosmwasm-client'
import getManagedVaults from 'api/managedVaults/getManagedVaults'
import { useManagedVaultDeposits } from 'hooks/managedVaults/useManagedVaultDeposits'
import { useDepositedManagedVaultsFallback } from 'hooks/managedVaults/useDepositedManagedVaultsFallback'
import useChainConfig from 'hooks/chain/useChainConfig'
import useStore from 'store'
import useSWR from 'swr'
import { useMemo } from 'react'
import { BN } from 'utils/helpers'

export default function useManagedVaults() {
  const chainConfig = useChainConfig()
  const address = useStore((s) => s.address)
  const { data: fallbackUserVaults, isLoading: isFallbackLoading } =
    useDepositedManagedVaultsFallback()

  const {
    data: vaultsResponse,
    isLoading,
    error,
  } = useSWR(
    `chains/${chainConfig.id}/managedVaults`,
    async () => {
      try {
        const managedVaults = await getManagedVaults(chainConfig)
        const vaultsWithDetails = await Promise.all(
          managedVaults.data.map(async (vault) => {
            const details = await getManagedVaultDetails(chainConfig, vault.vault_address)
            let owner = null
            if (address) {
              owner = await getManagedVaultOwnerAddress(chainConfig, vault.vault_address)
            }

            return {
              ...vault,
              fee_rate: BN(details.performance_fee_config.fee_rate)
                .multipliedBy(8760)
                .multipliedBy(100)
                .toNumber(),
              base_tokens_denom: details.base_token,
              base_tokens_amount: details.total_base_tokens,
              vault_tokens_denom: details.vault_token,
              vault_tokens_amount: details.total_vault_tokens,
              isOwner: owner === address,
            } as ManagedVaultWithDetails
          }),
        )
        return vaultsWithDetails
      } catch (error) {
        console.error('Error fetching vaults:', error)
        return []
      }
    },
    {
      revalidateOnFocus: false,
      refreshInterval: 60_000,
      suspense: false,
    },
  )

  const vaultDeposits = useManagedVaultDeposits(address, vaultsResponse ?? [])
  const result = useMemo(() => {
    if (error || !vaultsResponse || vaultsResponse.length === 0) {
      return {
        ownedVaults: [],
        depositedVaults: fallbackUserVaults || [],
        availableVaults: [],
      }
    }

    // Filter out unfunded vaults (those with zero total_base_tokens)
    const fundedVaults = vaultsResponse.filter((vault) =>
      BN(vault.base_tokens_amount).isGreaterThan(0),
    )

    return {
      ownedVaults: address ? fundedVaults.filter((vault) => vault.isOwner) : [],
      depositedVaults: address
        ? fundedVaults.filter(
            (vault) => !vault.isOwner && vaultDeposits.get(vault.vault_tokens_denom) === true,
          )
        : [],
      availableVaults: address
        ? fundedVaults.filter(
            (vault) => !vault.isOwner && vaultDeposits.get(vault.vault_tokens_denom) !== true,
          )
        : fundedVaults,
    }
  }, [vaultsResponse, vaultDeposits, address, error, fallbackUserVaults])

  return {
    data: result,
    isLoading: isLoading || isFallbackLoading,
  }
}
