import { ENV } from 'constants/env'
import { BN } from 'utils/helpers'

import { cacheFn, pythPriceCache } from '../cache'

export default async function fetchPythPrices(...priceFeedIds: string[]) {
  try {
    const pricesUrl = new URL(`${ENV.PYTH_ENDPOINT}/latest_price_feeds`)
    priceFeedIds.forEach((id) => pricesUrl.searchParams.append('ids[]', id))

    const pythResponse: PythPriceData[] = await cacheFn(
      () => fetch(pricesUrl).then((res) => res.json()),
      pythPriceCache,
      `pythPrices/${priceFeedIds.flat().join('-')}`,
      30,
    )

    return pythResponse.map(({ price }) => BN(price.price).shiftedBy(price.expo))
  } catch (ex) {
    throw ex
  }
}
