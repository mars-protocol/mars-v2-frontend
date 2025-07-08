import {
  getManagedVaultDetails,
  getManagedVaultOwnerAddress,
  getManagedVaultPerformanceFeeState,
} from 'api/cosmwasm-client'
import getManagedVaults from 'api/managedVaults/getManagedVaults'
import useChainConfig from 'hooks/chain/useChainConfig'
import useStore from 'store'
import useSWR from 'swr'
import { convertAprToApy } from 'utils/parsers'
import BN from 'bignumber.js'

export function useManagedVaultDetails(vaultAddress?: string) {
  const chainConfig = useChainConfig()
  const address = useStore((s) => s.address)

  const { data: ownerAddress } = useSWR(
    vaultAddress && `chains/${chainConfig.id}/managedVaults/${vaultAddress}/owner`,
    async () => {
      return await getManagedVaultOwnerAddress(chainConfig, vaultAddress ?? '')
    },
  )

  const { data: managedVaultData, isLoading: isManagedVaultDataLoading } = useSWR(
    vaultAddress && `chains/${chainConfig.id}/managedVaults/${vaultAddress}/managedVaultData`,
    async () => {
      const { data } = await getManagedVaults(chainConfig, vaultAddress)
      return data[0]
    },
    {
      revalidateOnFocus: false,
      refreshInterval: 60_000,
      suspense: false,
    },
  )

  const { data: details, isLoading: isDetailsLoading } = useSWR(
    vaultAddress && `chains/${chainConfig.id}/managedVaults/${vaultAddress}/details`,
    async () => {
      try {
        return await getManagedVaultDetails(chainConfig, vaultAddress!)
      } catch (error) {
        console.error(`Error fetching details for vault ${vaultAddress}:`, error)
        return null
      }
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
  const isLoading = isDetailsLoading || isPerformanceFeeLoading || isManagedVaultDataLoading

  if ((isLoading && !ownerAddress) || !details || !performanceFeeState)
    return {
      details: undefined,
      isOwner: false,
      isLoading: true,
    }

  const transformedDetailsData: ManagedVaultsData = {
    vault_address: vaultAddress,
    title: details.title,
    subtitle: details.subtitle,
    description: details.description,
    credit_manager: details.credit_manager,
    vault_account_id: details.vault_account_id,
    cooldown_period: details.cooldown_period,
    performance_fee_config: {
      ...details.performance_fee_config,
      fee_rate: BN(details.performance_fee_config.fee_rate)
        .multipliedBy(8760)
        .multipliedBy(100)
        .toFixed(0),
    },
    share_price: details.share_price,
    ownerAddress,
    tvl: managedVaultData?.tvl ?? '0',
    apy: convertAprToApy(Number(managedVaultData?.apr ?? 0), 365),
    performance_fee_state: performanceFeeState ?? {
      accumulated_fee: '0',
      accumulated_pnl: '0',
      base_tokens_amt: '0',
      last_withdrawal: 0,
    },
    base_tokens_denom: details.base_token,
    base_tokens_amount: details.total_base_tokens,
    vault_tokens_denom: details.vault_token,
    vault_tokens_amount: details.total_vault_tokens,
  }

  return {
    details: transformedDetailsData,
    isOwner,
    isLoading: false,
  }
}
