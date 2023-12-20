import { cacheFn, pythPriceCache } from 'api/cache'

export default async function fetchPythPriceData(chainConfig: ChainConfig, priceFeedIds: string[]) {
  try {
    const pricesUrl = new URL(`${chainConfig.endpoints.pyth}/latest_vaas`)
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
