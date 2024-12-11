import { getManagedVaultOwner } from 'api/cosmwasm-client'
import useChainConfig from 'hooks/chain/useChainConfig'
import useStore from 'store'
import useSWR from 'swr'

export function useManagedVaultData(vaultAddress: string | undefined) {
  const chainConfig = useChainConfig()
  const address = useStore((s) => s.address)
  const getManagedVaultDetails = useStore((s) => s.getManagedVaultDetails)

  const {
    data: details,
    error: detailsError,
    isLoading: isDetailsLoading,
  } = useSWR<VaultDetails | null>(
    vaultAddress ? `chains/${chainConfig.id}/vaults/${vaultAddress}/details` : null,
    async () => {
      const details = await getManagedVaultDetails(vaultAddress!)
      return details as VaultDetails
    },
  )

  const {
    data: ownerAddress,
    error: ownerError,
    isLoading: isOwnerLoading,
  } = useSWR(
    vaultAddress && address ? `chains/${chainConfig.id}/vaults/${vaultAddress}/owner` : null,
    async () => {
      return await getManagedVaultOwner(chainConfig, vaultAddress!)
    },
  )

  return {
    details,
    isOwner: ownerAddress === address,
    isLoading: isDetailsLoading || isOwnerLoading,
    error: detailsError || ownerError,
  }
}
