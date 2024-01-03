import { cacheFn, pythPriceCache } from 'api/cache'
import { BN } from 'utils/helpers'

export default async function fetchPythPrices(chainConfig: ChainConfig, priceFeedIds: string[]) {
  try {
    const pricesUrl = new URL(`${chainConfig.endpoints.pyth}/latest_price_feeds`)
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
