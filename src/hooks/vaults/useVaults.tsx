import useSWR from 'swr'

import getVaults from 'api/vaults/getVaults'
import useAccountId from 'hooks/accounts/useAccountId'
import useChainConfig from 'hooks/chain/useChainConfig'
import useDepositedVaults from 'hooks/vaults/useDepositedVaults'

export default function useVaults(suspense: boolean = true, address?: string) {
  const accountId = useAccountId()
  const chainConfig = useChainConfig()
  const { data: activeVaults } = useDepositedVaults(accountId || '')

  return useSWR(
    address ? `chains/${chainConfig.id}/vaults/${address}` : `chains/${chainConfig.id}/vaults`,
    () => getVaults(chainConfig),
    {
      suspense,
      revalidateOnFocus: false,
    },
  )
}
