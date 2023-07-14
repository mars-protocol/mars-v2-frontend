import { getOracleQueryClient } from 'api/cosmwasm-client'
import { ITEM_LIMIT_PER_QUERY, PRICE_ORACLE_DECIMALS } from 'constants/query'
import { BNCoin } from 'types/classes/BNCoin'
import { PriceResponse } from 'types/generated/mars-oracle-osmosis/MarsOracleOsmosis.types'
import { byDenom } from 'utils/array'
import { BN } from 'utils/helpers'

export default async function getOraclePrices(...assets: Asset[]): Promise<BNCoin[]> {
  try {
    if (!assets.length) return []

    const priceResults = await queryPrices()

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

async function queryPrices(queried?: PriceResponse[]): Promise<PriceResponse[]> {
  const oracleQueryClient = await getOracleQueryClient()
  const query = { limit: ITEM_LIMIT_PER_QUERY, startAfter: queried && queried.at(-1)?.denom }

  const prices = await oracleQueryClient.prices(query)
  const totalQueried = (queried ?? []).concat(prices)

  if (prices.length < ITEM_LIMIT_PER_QUERY) {
    return totalQueried
  } else {
    return await queryPrices(totalQueried)
  }
}
