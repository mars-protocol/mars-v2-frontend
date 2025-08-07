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

  const swrKey = clients && perpsParams && `chains/${chainConfig.id}/perps/market-states`

  return useSWR(
    swrKey,
    async () => {
      try {
        const result = await iteratePaginationQuery<MarketResponse>(clients!.perps.markets)
        return result
      } catch (error) {
        console.error('Market states fetch failed:', error)

        if (
          error instanceof Error &&
          (error.message.includes('Slinky Market') ||
            error.message.includes('price is older than') ||
            error.message.includes('Invalid price'))
        ) {
          const problematicDenoms = ['perps/ufxs', 'perps/uom', 'perps/unil']
          const enabledDenoms =
            perpsParams
              ?.map((param) => param.denom)
              .filter((denom) => !problematicDenoms.includes(denom)) || []
          const individualResults: MarketResponse[] = []
          for (const denom of enabledDenoms) {
            try {
              const marketState = await clients.perps.market({ denom })
              individualResults.push(marketState)
            } catch (individualError) {
              console.warn(`Failed to fetch market state for ${denom}:`, individualError)
            }
          }
          return individualResults
        }

        throw error
      }
    },
    {
      revalidateOnFocus: true,
      refreshInterval: 10_000,
    },
  )
}
