import { cacheFn, pythPriceCache } from 'cache'
import { pythEndpoints } from 'constants/pyth'

export default async function getPythPriceData(priceFeedIds: string[]) {
  try {
    const pricesUrl = new URL(`${pythEndpoints.api}/latest_vaas`)
    priceFeedIds.forEach((id) => pricesUrl.searchParams.append('ids[]', id))

    const pythDataResponse: string[] = await cacheFn(
      () => fetch(pricesUrl).then((res) => res.json()),
      pythPriceCache,
      `pythPricData/${priceFeedIds.flat().join('-')}`,
      30,
    )
    return pythDataResponse
  } catch (ex) {
    console.log(ex)
    return []
  }
}
