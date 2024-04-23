import { cacheFn, oraclePriceCache } from 'api/cache'
import { getOracleQueryClient } from 'api/cosmwasm-client'
import { BN_ZERO } from 'constants/math'
import { PRICE_ORACLE_DECIMALS } from 'constants/query'
import { BNCoin } from 'types/classes/BNCoin'
import { PriceResponse } from 'types/generated/mars-oracle-osmosis/MarsOracleOsmosis.types'
import { byDenom } from 'utils/array'
import { BN } from 'utils/helpers'
import iterateContractQuery from 'utils/iterateContractQuery'

export default async function getOraclePrices(
  chainConfig: ChainConfig,
  assets: Asset[],
): Promise<BNCoin[]> {
  const oracleQueryClient = await getOracleQueryClient(chainConfig)
  try {
    if (!assets.length) return []

    const priceResults = await cacheFn(
      () => iterateContractQuery(oracleQueryClient.prices),
      oraclePriceCache,
      `${chainConfig.id}/oraclePrices`,
      60,
    )

    return assets.map((asset) => {
      const priceResponse = priceResults.find(byDenom(asset.denom)) as PriceResponse
      const price = BN(priceResponse?.price ?? BN_ZERO)
      const decimalDiff = asset.decimals - PRICE_ORACLE_DECIMALS
      return BNCoin.fromDenomAndBigNumber(asset.denom, price.shiftedBy(decimalDiff))
    })
  } catch (error) {
    console.error(error)
    try {
      const assetPrices = assets.map(async (asset) => {
        const assetPrice = await oracleQueryClient.price({ denom: asset.denom })
        const price = BN(assetPrice?.price ?? BN_ZERO)

        const decimalDiff = asset.decimals - PRICE_ORACLE_DECIMALS
        return BNCoin.fromDenomAndBigNumber(asset.denom, price.shiftedBy(decimalDiff))
      })
      return Promise.all(assetPrices)
    } catch (ex) {
      throw ex
    }
  }
}
