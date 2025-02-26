import {
  getManagedVaultDetails,
  getManagedVaultOwner,
  getManagedVaultPerformanceFeeState,
} from 'api/cosmwasm-client'
import getManagedVaults from 'api/managedVaults/getManagedVaults'
import useChainConfig from 'hooks/chain/useChainConfig'
import useStore from 'store'
import useSWR from 'swr'

export function useManagedVaultDetails(vaultAddress?: string) {
  const chainConfig = useChainConfig()
  const address = useStore((s) => s.address)

  const { data: ownerAddress } = useSWR(
    vaultAddress && `chains/${chainConfig.id}/managedVaults/${vaultAddress}/owner`,
    async () => {
      return await getManagedVaultOwner(chainConfig, vaultAddress ?? '')
    },
  )

  const { data: metrics, isLoading: isMetricsLoading } = useSWR(
    vaultAddress && `chains/${chainConfig.id}/managedVaults/${vaultAddress}/metrics`,
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
    vaultAddress && `chains/${chainConfig.id}/managedVaults/${vaultAddress}/details`,
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
    vaultAddress && `chains/${chainConfig.id}/managedVaults/${vaultAddress}/performanceFee`,
    async () => {
      return await getManagedVaultPerformanceFeeState(chainConfig, vaultAddress!)
    },
    {
      revalidateOnFocus: false,
      refreshInterval: 10_000,
      suspense: false,
    },
  )

  if (!vaultAddress) return { details: undefined, isOwner: false, isLoading: false }

  const isOwner = Boolean(address && ownerAddress && ownerAddress === address)
  const isLoading = isDetailsLoading || isPerformanceFeeLoading || isMetricsLoading

  if ((isLoading && !ownerAddress) || !details || !performanceFeeState)
    return {
      details: undefined,
      isOwner: false,
      isLoading: true,
    }

  return {
    details: {
      ...details,
      owner: ownerAddress,
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
