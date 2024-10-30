import { cacheFn, pythPriceCache } from 'api/cache'
import { pythEndpoints } from 'constants/pyth'
import { FETCH_TIMEOUT } from 'constants/query'
import { BNCoin } from 'types/classes/BNCoin'
import { setApiError } from 'utils/error'
import { fetchWithTimeout } from 'utils/fetch'
import { BN } from 'utils/helpers'

export default async function fetchPythPrices(priceFeedIds: string[], assets: Asset[]) {
  const pricesUrl = new URL(`${pythEndpoints.api}/latest_price_feeds`)
  const fallbackUrl = new URL(`${pythEndpoints.fallbackApi}/latest_price_feeds`)

  try {
    priceFeedIds.forEach((id) => {
      pricesUrl.searchParams.append('ids[]', id)
      fallbackUrl.searchParams.append('ids[]', id)
    })

    const pythResponse: PythPriceData[] = await cacheFn(
      async () => {
        try {
          return await fetchWithTimeout(pricesUrl.toString(), FETCH_TIMEOUT).then((res) =>
            res.json(),
          )
        } catch (error) {
          console.warn('Primary Pyth API failed, falling back to fallback API', error)

          return await fetchWithTimeout(fallbackUrl.toString(), FETCH_TIMEOUT).then((res) =>
            res.json(),
          )
        }
      },
      pythPriceCache,
      `pythPrices/${priceFeedIds.flat().join('-')}`,
      30,
    )

    const mappedPriceData = [] as BNCoin[]

    assets.forEach((asset) => {
      const price = pythResponse.find((pythPrice) => asset.pythPriceFeedId === pythPrice.id)?.price
      if (price)
        mappedPriceData.push(
          BNCoin.fromDenomAndBigNumber(asset.denom, BN(price.price).shiftedBy(price.expo)),
        )
      return
    })

    return mappedPriceData
  } catch (ex) {
    setApiError(pricesUrl.toString(), ex)
    throw ex
  }
}
