import useChainConfig from 'hooks/chain/useChainConfig'
import useClients from 'hooks/chain/useClients'
import { useAllPerpsParams } from 'hooks/perps/usePerpsParams'
import useSWR from 'swr'
import { MarketResponse } from 'types/generated/mars-perps/MarsPerps.types'
import { iteratePaginationQuery } from 'utils/iteratePaginationQuery'

export default function usePerpsMarketStates() {
  const chainConfig = useChainConfig()
  const clients = useClients()
  const perpsParams = useAllPerpsParams()

  return useSWR(
    clients && perpsParams && `chains/${chainConfig.id}/perps/market-states`,
    () => iteratePaginationQuery<MarketResponse>(clients!.perps.markets),
    {
      revalidateOnFocus: true,
      refreshInterval: 10_000,
    },
  )
}
