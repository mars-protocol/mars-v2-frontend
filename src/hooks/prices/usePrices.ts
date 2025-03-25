import useSWR from 'swr'
import { FETCH_TIMEOUT } from 'constants/query'
import { fetchWithTimeout } from 'utils/fetch'
import { pythEndpoints } from 'constants/pyth'
import { BN } from 'utils/helpers'
import useStore from 'store'
import { logApiError } from 'utils/error'

export default function usePrices() {
  const assetsFromStore = useStore((s) => s?.assets) || []

  return useSWR<PricesResponse>(
    'token-prices',
    async () => {
      try {
        if (assetsFromStore && assetsFromStore.length > 0) {
          try {
            const pythPrices = await fetchPythPrices(assetsFromStore)
            if (pythPrices.prices.length > 0) {
              return pythPrices
            }
          } catch (error) {
            logApiError('pyth-api', error, 'Failed to fetch from Pyth API, trying fallback')
          }
        }

        return await fetchFeeMarketPrices()
      } catch (error) {
        logApiError('price-api', error, 'Failed to fetch token prices')

        return { prices: [] }
      }
    },
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
      suspense: false,
    },
  )
}

async function fetchPythPrices(assets: Asset[]): Promise<PricesResponse> {
  try {
    if (!assets || assets.length === 0) {
      return { prices: [] }
    }

    const priceFeedIds = assets
      .filter((asset) => asset && !!asset.pythPriceFeedId)
      .map((asset) => asset.pythPriceFeedId)

    if (priceFeedIds.length === 0) {
      return { prices: [] }
    }

    const pricesUrl = new URL(`${pythEndpoints.api}/latest_price_feeds`)
    const fallbackUrl = new URL(`${pythEndpoints.fallbackApi}/latest_price_feeds`)

    priceFeedIds.forEach((id) => {
      if (id) {
        pricesUrl.searchParams.append('ids[]', id)
        fallbackUrl.searchParams.append('ids[]', id)
      }
    })

    let pythResponse: PythPriceData[]
    try {
      const response = await fetchWithTimeout(pricesUrl.toString(), FETCH_TIMEOUT)
      pythResponse = await response.json()
    } catch (error) {
      console.warn('Primary Pyth API failed, falling back to fallback API', error)
      const response = await fetchWithTimeout(fallbackUrl.toString(), FETCH_TIMEOUT)
      pythResponse = await response.json()
    }

    const prices: PriceData[] = []

    assets.forEach((asset) => {
      if (!asset) return

      const priceData = pythResponse.find(
        (pythPrice) => asset.pythPriceFeedId === pythPrice.id,
      )?.price

      if (priceData) {
        prices.push({
          denom: asset.denom,
          amount: BN(priceData.price).shiftedBy(priceData.expo).toString(),
        })
      }
    })

    return { prices }
  } catch (error) {
    logApiError(pythEndpoints.api, error, 'Failed to fetch from Pyth API')
    return { prices: [] }
  }
}

async function fetchFeeMarketPrices(): Promise<PricesResponse> {
  const feeMarketUrl = `${process.env.NEXT_PUBLIC_NEUTRON_REST}/feemarket/v1/gas_prices`
  try {
    const response = await fetchWithTimeout(feeMarketUrl, FETCH_TIMEOUT)

    if (!response.ok) {
      throw new Error(
        `Failed to fetch fee market gas prices: ${response.status} ${response.statusText}`,
      )
    }

    const data: GasPricesResponse = await response.json()

    return {
      prices: data.prices.map((price) => ({
        denom: price.denom,
        amount: price.amount,
      })),
    }
  } catch (error) {
    logApiError(feeMarketUrl, error, 'Failed to fetch from fee market API')
    return { prices: [] }
  }
}
