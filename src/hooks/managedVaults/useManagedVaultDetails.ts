import {
  getManagedVaultDetails,
  getManagedVaultOwner,
  getManagedVaultPerformanceFeeState,
} from 'api/cosmwasm-client'
import getManagedVaults from 'api/managedVaults/getManagedVaults'
import useChainConfig from 'hooks/chain/useChainConfig'
import useStore from 'store'
import useSWR from 'swr'

export function useManagedVaultDetails(vaultAddress: string | undefined) {
  const chainConfig = useChainConfig()
  const address = useStore((s) => s.address)

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
    vaultAddress ? `chains/${chainConfig.id}/vaults/${vaultAddress}/details` : null,
    async () => {
      return await getManagedVaultDetails(chainConfig, vaultAddress!)
    },
    { suspense: true },
  )

  const { data: performanceFeeState, isLoading: isPerformanceFeeLoading } = useSWR(
    ownerAddress ? `chains/${chainConfig.id}/vaults/${vaultAddress}/performanceFee` : null,
    async () => {
      return await getManagedVaultPerformanceFeeState(chainConfig, vaultAddress!)
    },
    { suspense: true },
  )

  const isOwner = Boolean(address && ownerAddress && ownerAddress === address)

  return {
    details: {
      ...details,
      metrics: metrics ?? { apr: '0', tvl: '0' },
      performance_fee_state: performanceFeeState ?? {
        accumulated_fee: '0',
        accumulated_pnl: '0',
        base_tokens_amt: '0',
        last_withdrawal: 0,
      },
    },
    isOwner,
    isLoading: isDetailsLoading || isOwnerLoading || isPerformanceFeeLoading,
  }
}
