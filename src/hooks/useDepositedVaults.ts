import useSWR from 'swr'

import getDepositedVaults from 'api/vaults/getDepositedVaults'
import useChainConfig from 'hooks/useChainConfig'

export default function useDepositedVaults(accountId: string) {
  const chainConfig = useChainConfig()
  return useSWR(
    `chains/${chainConfig.id}/vaults/${accountId}/deposited`,
    () => getDepositedVaults(accountId, chainConfig),
    {
      suspense: true,
      revalidateOnFocus: false,
    },
  )
}
