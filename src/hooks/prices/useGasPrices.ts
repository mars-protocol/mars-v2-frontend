import useSWR from 'swr'
import useChainConfig from 'hooks/chain/useChainConfig'

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

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch gas prices')
      }
      return response.json()
    },
    { refreshInterval: 60000 },
  )
}
