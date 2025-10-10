import useSWR from 'swr'
import useChainConfig from 'hooks/chain/useChainConfig'
import getManagedVaultDepositors from 'api/managedVaults/getManagedVaultDepositors'

export default function useManagedVaultDepositors(vaultTokensDenom: string) {
  const chainConfig = useChainConfig()

  return useSWR(
    vaultTokensDenom && `chains/${chainConfig.id}/managedVaults/${vaultTokensDenom}/depositors`,
    async () => {
      const data = await getManagedVaultDepositors(vaultTokensDenom)
      return data
    },
    {
      suspense: false,
      revalidateOnFocus: false,
    },
  )
}
