import { cacheFn, pythPriceCache } from 'api/cache'
import { pythEndpoints } from 'constants/pyth'

export default async function fetchPythPriceData(priceFeedIds: string[]) {
  try {
    const pricesUrl = new URL(`${pythEndpoints.api}/latest_vaas`)

    const headers = new Headers()
    headers.set('Method', 'GET')
    headers.set('Content-Type', 'application/json')
    headers.set('Accept-Encoding', 'br')
    if (!!process.env.NEXT_PUBLIC_PYTH_CREDENTIALS) {
      headers.set('Authorization', `Basic ${btoa(process.env.NEXT_PUBLIC_PYTH_CREDENTIALS)}`)
    }
    priceFeedIds.forEach((id) => pricesUrl.searchParams.append('ids[]', id))

    const pythDataResponse: string[] = await cacheFn(
      () => fetch(pricesUrl, { credentials: 'include', headers }).then((res) => res.json()),
      pythPriceCache,
      `pythPricData/${priceFeedIds.flat().join('-')}`,
      30,
    )
    return pythDataResponse
  } catch (ex) {
    throw ex
  }
}
