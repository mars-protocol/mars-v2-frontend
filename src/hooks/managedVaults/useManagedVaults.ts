import { getManagedVaultOwner } from 'api/cosmwasm-client'
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

      const vaultsWithOwnership = await Promise.all(
        managedVaults.data.map(async (vault) => {
          const owner = await getManagedVaultOwner(chainConfig, vault.vault_address)
          return {
            ...vault,
            isOwner: owner === address,
          }
        }),
      )

      const ownedVaults = vaultsWithOwnership.filter((vault) => vault.isOwner)
      const availableVaults = vaultsWithOwnership.filter((vault) => !vault.isOwner)

      return {
        ownedVaults,
        availableVaults,
      }
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
