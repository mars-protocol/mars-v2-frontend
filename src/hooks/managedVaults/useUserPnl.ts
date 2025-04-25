import useSWR from 'swr'
import useChainConfig from 'hooks/chain/useChainConfig'
import { getManagedVaultUserPnl } from 'api/cosmwasm-client'

export default function useUserPnl(vaultAddress: string, userAddress: string) {
  const chainConfig = useChainConfig()

  return useSWR(
    vaultAddress && userAddress && `chains/${chainConfig.id}/managedVaults/${vaultAddress}/userPnl`,
    async () => {
      return await getManagedVaultUserPnl(chainConfig, vaultAddress!, userAddress!)
    },
    {
      refreshInterval: 10_000,
      suspense: false,
    },
  )
}
