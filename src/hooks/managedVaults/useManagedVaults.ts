import { getManagedVaultDetails, getManagedVaultOwner } from 'api/cosmwasm-client'
import getManagedVaults from 'api/managedVaults/getManagedVaults'
import useChainConfig from 'hooks/chain/useChainConfig'
import useStore from 'store'
import useSWR from 'swr'

export default function useManagedVaults() {
  const chainConfig = useChainConfig()
  const address = useStore((s) => s.address)

  return useSWR(
    `chains/${chainConfig.id}/managedVaults`,
    async () => {
      const managedVaults = await getManagedVaults(chainConfig)

      if (!address) {
        return {
          ownedVaults: [],
          availableVaults: managedVaults.data,
        }
      }

      const vaultsWithDetails = await Promise.all(
        managedVaults.data.map(async (vault) => {
          const [owner, details] = await Promise.all([
            getManagedVaultOwner(chainConfig, vault.vault_address),
            getManagedVaultDetails(chainConfig, vault.vault_address),
          ])

          return {
            ...vault,
            ...details,
            isOwner: owner === address,
          }
        }),
      )

      const ownedVaults = vaultsWithDetails.filter((vault) => vault.isOwner)
      const availableVaults = vaultsWithDetails.filter((vault) => !vault.isOwner)
      return {
        ownedVaults,
        availableVaults,
      } as { ownedVaults: ManagedVaultsData[]; availableVaults: ManagedVaultsData[] }
    },
    {
      fallbackData: {
        ownedVaults: [],
        availableVaults: [],
      },
      revalidateOnFocus: false,
    },
  )
}
