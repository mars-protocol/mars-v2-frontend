import { cacheFn, priceCache } from 'api/cache'
import { getOracleQueryClient } from 'api/cosmwasm-client'
import getPoolPrice from 'api/prices/getPoolPrice'
import getPythPrice from 'api/prices/getPythPrices'
import { PRICE_ORACLE_DECIMALS } from 'constants/query'
import { byDenom } from 'utils/array'
import { BN } from 'utils/helpers'

export default async function getPrice(
  chainConfig: ChainConfig,
  denom: string,
): Promise<BigNumber> {
  return cacheFn(() => fetchPrice(chainConfig, denom), priceCache, `price/${denom}`, 60)
}

async function fetchPrice(chainConfig: ChainConfig, denom: string) {
  try {
    const asset = chainConfig.assets.find(byDenom(denom)) as Asset

    if (asset.pythPriceFeedId) {
      return (await getPythPrice(chainConfig, [asset.pythPriceFeedId]))[0]
    }

    if (asset.hasOraclePrice) {
      const oracleQueryClient = await getOracleQueryClient(chainConfig)
      const priceResponse = await oracleQueryClient.price({ denom: asset.denom })
      const decimalDiff = asset.decimals - PRICE_ORACLE_DECIMALS

      return BN(priceResponse.price).shiftedBy(decimalDiff)
    }

    if (asset.poolId) {
      return await getPoolPrice(chainConfig, asset)
    }

    throw `could not fetch the price info for the given denom: ${denom}`
  } catch (ex) {
    throw ex
  }
}
