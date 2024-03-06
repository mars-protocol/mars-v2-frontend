import useSWR from 'swr'

import getDepositedVaults from 'api/vaults/getDepositedVaults'
import useChainConfig from 'hooks/useChainConfig'
import { VaultStatus } from 'types/enums/vault'

export default function useDepositedVaults(accountId: string) {
  const chainConfig = useChainConfig()
  return useSWR(
    `chains/${chainConfig.id}/vaults/${accountId}/deposited`,
    async () => {
      const vaults = await getDepositedVaults(accountId, chainConfig)
      return [{ ...vaults[0], status: VaultStatus.UNLOCKED }]
    },
    {
      suspense: true,
      revalidateOnFocus: false,
    },
  )
}
