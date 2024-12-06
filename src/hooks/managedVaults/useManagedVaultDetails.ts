import useChainConfig from 'hooks/chain/useChainConfig'
import useStore from 'store'
import useSWR from 'swr'

interface VaultDetails {
  base_token: string
  vault_token: string
  title: string
  subtitle: string | null
  description: string
  credit_manager: string
  vault_account_id: string | null
  cooldown_period: number
  performance_fee_config: {
    fee_rate: string
    withdrawal_interval: number
  }
}

export default function useManagedVaultDetails(vaultAddress: string) {
  const chainConfig = useChainConfig()
  const enabled = !!vaultAddress
  const getManagedVaultDetails = useStore((s) => s.getManagedVaultDetails)

  return useSWR<VaultDetails | null>(
    enabled ? `chains/${chainConfig.id}/vaults/${vaultAddress}/details` : null,
    async () => {
      const details = await getManagedVaultDetails(vaultAddress)

      console.log('details:', details)
      return details as VaultDetails
    },
    {
      revalidateOnFocus: true,
    },
  )
}
