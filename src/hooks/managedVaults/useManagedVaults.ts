import { getManagedVaultDetails, getManagedVaultOwner } from 'api/cosmwasm-client'
import getManagedVaults from 'api/managedVaults/getManagedVaults'
import { useManagedVaultDeposits } from 'hooks/managedVaults/useManagedVaultDeposits'
import useChainConfig from 'hooks/chain/useChainConfig'
import useStore from 'store'
import useSWR from 'swr'
import { useMemo } from 'react'

const FALLBACK_RESULT = {
  ownedVaults: [],
  depositedVaults: [],
  availableVaults: [],
}

export default function useManagedVaults() {
  const chainConfig = useChainConfig()
  const address = useStore((s) => s.address)

  const { data: vaultsResponse, isLoading } = useSWR(
    `chains/${chainConfig.id}/managedVaults`,
    async () => {
      try {
        const managedVaults = await getManagedVaults(chainConfig)
        const vaultsWithDetails = await Promise.all(
          managedVaults.data.map(async (vault) => {
            const details = await getManagedVaultDetails(chainConfig, vault.vault_address)
            let owner = null
            if (address) {
              owner = await getManagedVaultOwner(chainConfig, vault.vault_address)
            }

            return {
              ...vault,
              ...details,
              isOwner: owner === address,
            }
          }),
        )
        return vaultsWithDetails
      } catch (error) {
        console.error('Error fetching vaults:', error)
        return []
      }
    },
  )

  const vaultDeposits = useManagedVaultDeposits(address, vaultsResponse ?? [])
  const result = useMemo(() => {
    if (!vaultsResponse) return FALLBACK_RESULT

    return {
      ownedVaults: address ? vaultsResponse.filter((vault) => vault.isOwner) : [],
      depositedVaults: address
        ? vaultsResponse.filter(
            (vault) => !vault.isOwner && vaultDeposits.get(vault.vault_token) === true,
          )
        : [],
      availableVaults: address
        ? vaultsResponse.filter(
            (vault) => !vault.isOwner && vaultDeposits.get(vault.vault_token) !== true,
          )
        : vaultsResponse,
    }
  }, [vaultsResponse, vaultDeposits, address])

  return {
    data: result,
    isLoading,
  }
}
