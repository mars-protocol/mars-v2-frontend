import { getManagedVaultConvertToShares } from 'api/cosmwasm-client'
import useChainConfig from 'hooks/chain/useChainConfig'
import useSWR from 'swr'
import { BN } from 'utils/helpers'

export function useManagedVaultConvertToShares(vaultAddress: string, amount: string) {
  const chainConfig = useChainConfig()

  return useSWR(
    !BN(amount).isZero()
      ? `chains/${chainConfig.id}/managedVaults/${vaultAddress}/convertToShares/${amount}`
      : null,
    async () => {
      return await getManagedVaultConvertToShares(chainConfig, vaultAddress, amount)
    },
    {
      revalidateOnFocus: false,
      refreshInterval: 10_000,
      suspense: false,
    },
  )
}
