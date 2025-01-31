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

  const { data: ownerAddress } = useSWR(
    vaultAddress && address ? `chains/${chainConfig.id}/vaults/${vaultAddress}/owner` : null,
    async () => {
      return await getManagedVaultOwner(chainConfig, vaultAddress!)
    },
    {
      revalidateOnFocus: false,
      refreshInterval: 10_000,
      suspense: false,
    },
  )

  const { data: metrics, isLoading: isMetricsLoading } = useSWR(
    vaultAddress ? `chains/${chainConfig.id}/managedVaults/${vaultAddress}/metrics` : null,
    async () => {
      const { data } = await getManagedVaults(chainConfig)
      return data.find((v) => v.vault_address === vaultAddress)
    },
    {
      revalidateOnFocus: false,
      refreshInterval: 10_000,
      suspense: false,
    },
  )

  const { data: details, isLoading: isDetailsLoading } = useSWR(
    vaultAddress ? `chains/${chainConfig.id}/vaults/${vaultAddress}/details` : null,
    async () => {
      return await getManagedVaultDetails(chainConfig, vaultAddress!)
    },
    {
      revalidateOnFocus: false,
      refreshInterval: 10_000,
      suspense: false,
    },
  )

  const { data: performanceFeeState, isLoading: isPerformanceFeeLoading } = useSWR(
    vaultAddress ? `chains/${chainConfig.id}/vaults/${vaultAddress}/performanceFee` : null,
    async () => {
      return await getManagedVaultPerformanceFeeState(chainConfig, vaultAddress!)
    },
    {
      revalidateOnFocus: false,
      refreshInterval: 10_000,
      suspense: false,
    },
  )

  const isOwner = Boolean(address && ownerAddress && ownerAddress === address)
  const isLoading = isDetailsLoading || isPerformanceFeeLoading || isMetricsLoading

  if (isLoading || !details || !performanceFeeState) {
    return {
      details: undefined,
      isOwner: false,
      isLoading: true,
    }
  }

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
    isLoading: false,
  }
}
