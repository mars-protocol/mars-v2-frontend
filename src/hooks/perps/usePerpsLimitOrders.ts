import useSWR from 'swr'

import getLimitOrders from 'api/perps/getAccountLimitOrders'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useChainConfig from 'hooks/chain/useChainConfig'

export default function usePerpsLimitOrders() {
  const chainConfig = useChainConfig()
  const currentAccount = useCurrentAccount()
  const accountId = currentAccount?.id
  return useSWR(
    accountId && `chains/${chainConfig.id}/perps/limit-orders/${accountId}`,
    () => getLimitOrders(chainConfig, accountId),
    {
      refreshInterval: 10_000,
      revalidateOnFocus: true,
    },
  )
}
