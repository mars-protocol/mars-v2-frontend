import { cacheFn, pythPriceCache } from 'api/cache'
import { pythEndpoints } from 'constants/pyth'
import { FETCH_TIMEOUT } from 'constants/query'
import { fetchWithTimeout } from 'utils/fetch'

export default async function getPythPriceData(priceFeedIds: string[]) {
  try {
    const pricesUrl = new URL(`${pythEndpoints.api}/latest_vaas`)
    priceFeedIds.forEach((id) => pricesUrl.searchParams.append('ids[]', id))

    const pythDataResponse: string[] = await cacheFn(
      () => fetchWithTimeout(pricesUrl.toString(), FETCH_TIMEOUT).then((res) => res.json()),
      pythPriceCache,
      `pythPricData/${priceFeedIds.flat().join('-')}`,
      30,
    )
    return pythDataResponse
  } catch (ex) {
    console.error(ex)
    return []
  }
}
