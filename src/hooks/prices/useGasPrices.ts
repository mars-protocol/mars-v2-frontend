import useSWR from 'swr'
import useChainConfig from 'hooks/chain/useChainConfig'
import { logApiError } from 'utils/error'

interface GasPrice {
  denom: string
  amount: string
}

interface GasPricesResponse {
  prices: GasPrice[]
}

const FEE_MARKET_API_ROUTE = `${process.env.NEXT_PUBLIC_NEUTRON_REST}/feemarket/v1/gas_prices`

export default function useGasPrices() {
  const chainConfig = useChainConfig()

  return useSWR<GasPricesResponse>(
    [FEE_MARKET_API_ROUTE, chainConfig.id, chainConfig.isOsmosis],
    async ([url]) => {
      if (chainConfig.isOsmosis) {
        return {
          prices: [
            {
              denom: 'uosmo',
              amount: '0.002500000000000000',
            },
          ],
        }
      }

      try {
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`Failed to fetch gas prices: ${response.status} ${response.statusText}`)
        }
        return response.json()
      } catch (error) {
        logApiError(url, error, 'Failed to fetch gas prices')
        return {
          prices: [
            {
              denom: chainConfig.defaultCurrency.coinMinimalDenom,
              amount: chainConfig.gasPrice,
            },
          ],
        }
      }
    },
    {
      refreshInterval: 60000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    },
  )
}
