import { getOracleQueryClient } from 'api/cosmwasm-client'
import { PRICE_ORACLE_DECIMALS } from 'constants/query'
import { BNCoin } from 'types/classes/BNCoin'
import { PriceResponse } from 'types/generated/mars-oracle-osmosis/MarsOracleOsmosis.types'
import { byDenom } from 'utils/array'
import { BN } from 'utils/helpers'
import iterateContractQuery from 'utils/iterateContractQuery'

export default async function getOraclePrices(...assets: Asset[]): Promise<BNCoin[]> {
  try {
    if (!assets.length) return []

    const oracleQueryClient = await getOracleQueryClient()
    const priceResults = await iterateContractQuery(oracleQueryClient.prices)

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
