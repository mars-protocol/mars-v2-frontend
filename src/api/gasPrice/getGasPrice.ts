import { FETCH_TIMEOUT } from 'constants/query'
import { ChainInfoID } from 'types/enums'
import { setNodeError } from 'utils/error'
import { fetchWithTimeout } from 'utils/fetch'

export default async function getGasPrice(chainConfig: ChainConfig) {
  const { id, endpoints, gasPrice, defaultCurrency } = chainConfig

  if (!endpoints.gasPrices) return gasPrice

  const uri =
    id === ChainInfoID.Osmosis1
      ? new URL(endpoints.gasPrices)
      : new URL(endpoints.gasPrices, endpoints.rest)

  try {
    const response = await fetchWithTimeout(uri.toString(), FETCH_TIMEOUT)
    const data = await response.json()

    const price =
      id === ChainInfoID.Osmosis1
        ? (data as { base_fee: string }).base_fee
        : (data as { price: Coin }).price.amount

    return `${price}${defaultCurrency.coinMinimalDenom}`
  } catch (e) {
    setNodeError(uri.toString(), 'Failed to fetch gas prices')
    return gasPrice
  }
}
