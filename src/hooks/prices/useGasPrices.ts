import useAssets from 'hooks/assets/useAssets'
import useChainConfig from 'hooks/chain/useChainConfig'
import useSWR from 'swr'
import { byDenom } from 'utils/array'
import { BN } from 'utils/helpers'

export default function useGasPrices() {
  const chainConfig = useChainConfig()
  const { data: assets } = useAssets()
  const apiUrl = chainConfig.endpoints.gasPrices

  return useSWR<GasPricesResponse>(
    apiUrl && assets && `chains/${chainConfig.id}/getGasPrices`,
    async () => {
      try {
        const response = await fetch(apiUrl)
        const gasPrices = [] as Coin[]

        if (chainConfig.isOsmosis) {
          const data = (await response.json()) as OsmosisGasPriceResponse
          data.fee_tokens.forEach((feeToken) => {
            if (assets.find(byDenom(feeToken.denom))) {
              gasPrices.push({
                denom: feeToken.denom,
                amount: BN(feeToken.low_gas_price).toString(),
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
        return {
          prices: [
            {
              denom: chainConfig.defaultCurrency.coinMinimalDenom,
              amount: chainConfig.defaultCurrency.gasPriceStep.average.toString(),
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
