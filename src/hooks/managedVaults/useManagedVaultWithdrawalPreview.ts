import useSWR from 'swr'
import useChainConfig from 'hooks/chain/useChainConfig'
import { getManagedVaultPreviewRedeem } from 'api/cosmwasm-client'
import { BN } from 'utils/helpers'

export function useManagedVaultWithdrawalPreview(vaultAddress: string, amount: string) {
  const chainConfig = useChainConfig()

  return useSWR(
    !BN(amount).isZero()
      ? `chains/${chainConfig.id}/managedVaults/${vaultAddress}/previewRedeem/${amount}`
      : null,
    async () => {
      return await getManagedVaultPreviewRedeem(chainConfig, vaultAddress, amount)
    },
    {
      revalidateOnFocus: false,
      refreshInterval: 10_000,
      suspense: false,
    },
  )
}
