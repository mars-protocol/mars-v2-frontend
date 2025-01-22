import { getManagedVaultOwner } from 'api/cosmwasm-client'
import useChainConfig from 'hooks/chain/useChainConfig'
import useStore from 'store'
import useSWR from 'swr'

export function useManagedVaultDetails(vaultAddress: string | undefined) {
  const chainConfig = useChainConfig()
  const address = useStore((s) => s.address)
  const getManagedVaultDetails = useStore((s) => s.getManagedVaultDetails)

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
  }
}
