import useSWR from 'swr'
import useChainConfig from 'hooks/chain/useChainConfig'
import { getManagedVaultPnl } from 'api/cosmwasm-client'

export default function useManagedVaultPnl(vaultAddress: string) {
  const chainConfig = useChainConfig()

  return useSWR(
    vaultAddress && `chains/${chainConfig.id}/managedVaults/${vaultAddress}/pnl`,
    async () => {
      return await getManagedVaultPnl(chainConfig, vaultAddress)
    },
    {
      refreshInterval: 10_000,
      suspense: false,
    },
  )
}
