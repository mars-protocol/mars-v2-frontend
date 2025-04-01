import { DEFAULT_GAS_MULTIPLIER } from '@skip-go/client'
import useAssets from 'hooks/assets/useAssets'
import useChainConfig from 'hooks/chain/useChainConfig'
import useSWR from 'swr'
import { byDenom } from 'utils/array'
import { logApiError } from 'utils/error'
import { BN } from 'utils/helpers'
import { getUrl } from 'utils/url'

export default function useGasPrices() {
  const chainConfig = useChainConfig()
  const { data: assets } = useAssets()

  const apiUrl = chainConfig.isOsmosis
    ? chainConfig.endpoints.gasPrices
    : getUrl(chainConfig.endpoints.rest, chainConfig.endpoints.gasPrices)
  return useSWR<GasPricesResponse>(
    [apiUrl, chainConfig.id, assets],
    async ([url]) => {
      try {
        const response = await fetch(url)
        const gasPrices = [] as Coin[]

        if (chainConfig.isOsmosis) {
          const data = (await response.json()) as OsmosisGasPriceResponse
          data.fee_tokens.forEach((feeToken) => {
            if (assets.find(byDenom(feeToken.denom))) {
              gasPrices.push({
                denom: feeToken.denom,
                amount: BN(feeToken.low_gas_price).times(DEFAULT_GAS_MULTIPLIER).toString(),
              })
            }
          })
          return {
            prices: gasPrices,
          }
        } else {
          const data = (await response.json()) as GasPricesResponse
          data.prices.forEach((price) => {
            if (assets.find(byDenom(price.denom))) {
              gasPrices.push(price)
            }
          })
          return {
            prices: gasPrices,
          }
        }
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
