import { cacheFn, priceCache } from 'api/cache'
import getPrices from 'api/prices/getPrices'
import { BN_ZERO } from 'constants/math'
import { byDenom } from 'utils/array'

export default async function getPrice(
  chainConfig: ChainConfig,
  denom: string,
): Promise<BigNumber> {
  return cacheFn(() => fetchPrice(chainConfig, denom), priceCache, `price/${denom}`, 60)
}

async function fetchPrice(chainConfig: ChainConfig, denom: string) {
  try {
    const prices = await getPrices(chainConfig)

    return prices.find(byDenom(denom))?.amount ?? BN_ZERO
  } catch (ex) {
    throw ex
  }
}
