import { getOracleQueryClient } from 'api/cosmwasm-client'
import { BNCoin } from 'types/classes/BNCoin'
import { BN } from 'utils/helpers'

export default async function getOraclePrices(...assets: Asset[]): Promise<BNCoin[]> {
  try {
    const baseDecimals = 6
    const oracleQueryClient = await getOracleQueryClient()

    const priceQueries = assets.map((asset) =>
      oracleQueryClient.price({
        denom: asset.denom,
      }),
    )
    const priceResults = await Promise.all(priceQueries)

    return priceResults.map(({ denom, price }, index) => {
      const decimalDiff = assets[index].decimals - baseDecimals
      return BNCoin.fromDenomAndBigNumber(denom, BN(price).shiftedBy(decimalDiff))
    })
  } catch (ex) {
    throw ex
  }
}
