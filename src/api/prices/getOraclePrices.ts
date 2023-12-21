import { cacheFn, oraclePriceCache } from 'api/cache'
import { getOracleQueryClient } from 'api/cosmwasm-client'
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
  try {
    if (!assets.length) return []

    const oracleQueryClient = await getOracleQueryClient(chainConfig)
    const priceResults = await cacheFn(
      () => iterateContractQuery(oracleQueryClient.prices),
      oraclePriceCache,
      'oraclePrices',
      60,
    )

    return assets.map((asset) => {
      const priceResponse = priceResults.find(byDenom(asset.denom)) as PriceResponse
      const decimalDiff = asset.decimals - PRICE_ORACLE_DECIMALS
      return BNCoin.fromDenomAndBigNumber(
        asset.denom,
        BN(priceResponse.price).shiftedBy(decimalDiff),
      )
    })
  } catch (ex) {
    throw ex
  }
}
