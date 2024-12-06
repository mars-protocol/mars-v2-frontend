import { getOracleQueryClientNeutron, getOracleQueryClientOsmosis } from 'api/cosmwasm-client'
import { BN_ZERO } from 'constants/math'
import { PRICE_ORACLE_DECIMALS } from 'constants/query'
import { BNCoin } from 'types/classes/BNCoin'
import { PriceResponse } from 'types/generated/mars-oracle-osmosis/MarsOracleOsmosis.types'
import { byDenom } from 'utils/array'
import { BN } from 'utils/helpers'
import iterateContractQuery from 'utils/iterateContractQuery'

function getAssetPrice(asset: Asset, priceResult: PriceResponse): BNCoin {
  const price = BN(priceResult?.price ?? BN_ZERO)
  const decimalDiff = asset.decimals - PRICE_ORACLE_DECIMALS
  return BNCoin.fromDenomAndBigNumber(asset.denom, price.shiftedBy(decimalDiff))
}

export default async function getOraclePrices(
  chainConfig: ChainConfig,
  assets: Asset[],
): Promise<BNCoin[]> {
  const oracleQueryClient = chainConfig.isOsmosis
    ? await getOracleQueryClientOsmosis(chainConfig)
    : await getOracleQueryClientNeutron(chainConfig)
  try {
    if (!assets.length) return []

    const priceResults = await iterateContractQuery(oracleQueryClient.prices)

    return assets.map((asset) => {
      const priceResponse = priceResults.find(byDenom(asset.denom)) as PriceResponse
      return getAssetPrice(asset, priceResponse)
    })
  } catch (error) {
    console.error(error)
    try {
      return Promise.all(
        assets.map(async (asset) => {
          const priceResponse = await oracleQueryClient.price({ denom: asset.denom })
          return getAssetPrice(asset, priceResponse)
        }),
      )
    } catch (ex) {
      throw ex
    }
  }
}
