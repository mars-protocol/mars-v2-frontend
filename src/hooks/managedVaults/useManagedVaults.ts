import { getManagedVaultDetails, getManagedVaultOwner } from 'api/cosmwasm-client'
import getManagedVaults from 'api/managedVaults/getManagedVaults'
import useChainConfig from 'hooks/chain/useChainConfig'
import useStore from 'store'
import useSWR from 'swr'

export default function useManagedVaults() {
  const chainConfig = useChainConfig()
  const address = useStore((s) => s.address)

  const fallbackData = {
    ownedVaults: [],
    availableVaults: [],
  }

  return useSWR(
    `chains/${chainConfig.id}/managedVaults`,
    async () => {
      const managedVaults = await getManagedVaults(chainConfig)

      try {
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

        const result = {
          ownedVaults: address ? vaultsWithDetails.filter((vault) => vault.isOwner) : [],
          availableVaults: address
            ? vaultsWithDetails.filter((vault) => !vault.isOwner)
            : vaultsWithDetails,
        }

        return result
      } catch (error) {
        console.error('Error processing vaults:', error)
        return fallbackData
      }
    },
    {
      fallbackData,
      revalidateOnFocus: false,
    },
  )
}
