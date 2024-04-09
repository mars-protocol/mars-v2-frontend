import useSWR from 'swr'

import getLimitOrders from 'api/perps/getLimitOrders'
import useChainConfig from 'hooks/useChainConfig'

export default function usePerpsLimitOrders() {
  const chainConfig = useChainConfig()
  return useSWR(`chains/${chainConfig.id}/perps/limit-orders}`, () => getLimitOrders(chainConfig), {
    revalidateOnFocus: false,
  })
}
