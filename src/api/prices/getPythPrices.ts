import { cacheFn, pythPriceCache } from 'api/cache'
import { pythEndpoints } from 'constants/pyth'
import { BNCoin } from 'types/classes/BNCoin'
import { BN } from 'utils/helpers'

export default async function fetchPythPrices(priceFeedIds: string[], assets: Asset[]) {
  try {
    const pricesUrl = new URL(`${pythEndpoints.api}/latest_price_feeds`)
    const headers = new Headers()
    headers.set('Method', 'GET')
    headers.set('Content-Type', 'application/json')
    headers.set('Accept-Encoding', 'br')
    if (!!process.env.NEXT_PUBLIC_PYTH_CREDENTIALS) {
      headers.set('Authorization', `Basic ${btoa(process.env.NEXT_PUBLIC_PYTH_CREDENTIALS)}`)
    }
    priceFeedIds.forEach((id) => pricesUrl.searchParams.append('ids[]', id))

    const pythResponse: PythPriceData[] = await cacheFn(
      () =>
        fetch(pricesUrl, { credentials: 'include', headers })
          .then((res) => res as any)
          .catch((err) => console.log(err)),
      pythPriceCache,
      `pythPrices/${priceFeedIds.flat().join('-')}`,
      30,
    )

    const mappedPriceData = [] as BNCoin[]
    console.log('pythResponse', pythResponse)
    assets.forEach((asset) => {
      const price = pythResponse.find((pythPrice) => asset.pythPriceFeedId === pythPrice.id)?.price
      console.log('price', price)
      if (price)
        mappedPriceData.push(
          BNCoin.fromDenomAndBigNumber(asset.denom, BN(price.price).shiftedBy(price.expo)),
        )
      return
    })

    return mappedPriceData
  } catch (ex) {
    throw ex
  }
}
