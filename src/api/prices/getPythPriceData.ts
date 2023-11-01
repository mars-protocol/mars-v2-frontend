import { cacheFn, pythPriceCache } from 'api/cache'
import { ENV } from 'constants/env'

export default async function fetchPythPriceData(...priceFeedIds: string[]) {
  try {
    const pricesUrl = new URL(`${ENV.PYTH_ENDPOINT}/latest_vaas`)
    priceFeedIds.forEach((id) => pricesUrl.searchParams.append('ids[]', id))

    const pythDataResponse: string[] = await cacheFn(
      () => fetch(pricesUrl).then((res) => res.json()),
      pythPriceCache,
      `pythPricData/${priceFeedIds.flat().join('-')}`,
      30,
    )
    return pythDataResponse
  } catch (ex) {
    throw ex
  }
}
