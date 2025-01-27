import { getManagedVaultOwner } from 'api/cosmwasm-client'
import getManagedVaults from 'api/managedVaults/getManagedVaults'
import useChainConfig from 'hooks/chain/useChainConfig'
import useStore from 'store'
import useSWR from 'swr'

export function useManagedVaultDetails(vaultAddress: string | undefined) {
  const chainConfig = useChainConfig()
  const address = useStore((s) => s.address)
  const getManagedVaultDetails = useStore((s) => s.getManagedVaultDetails)

  const { data: metrics } = useSWR(
    vaultAddress ? `chains/${chainConfig.id}/managedVaults/${vaultAddress}/metrics` : null,
    async () => {
      const { data } = await getManagedVaults(chainConfig)
      return data.find((v) => v.vault_address === vaultAddress)
    },
    { suspense: true },
  )

  const { data: ownerAddress, isLoading: isOwnerLoading } = useSWR(
    vaultAddress && address ? `chains/${chainConfig.id}/vaults/${vaultAddress}/owner` : null,
    async () => {
      return await getManagedVaultOwner(chainConfig, vaultAddress!)
    },
    { suspense: true },
  )

  const { data: details, isLoading: isDetailsLoading } = useSWR(
    ownerAddress ? `chains/${chainConfig.id}/vaults/${vaultAddress}/details` : null,
    async () => {
      const details = await getManagedVaultDetails(vaultAddress!)
      return details as ManagedVaultDetails
    },
    { suspense: true },
  )

  const isOwner = Boolean(address && ownerAddress && ownerAddress === address)

  return {
    details,
    isOwner,
    isLoading: isDetailsLoading || isOwnerLoading,
    tvl: metrics?.tvl,
    apr: metrics?.apr,
  }
}
