import { getOracleQueryClient } from 'api/cosmwasm-client'
import { ASSETS } from 'constants/assets'
import { byDenom } from 'utils/array'
import getPythPrice from 'api/prices/getPythPrices'
import getPoolPrice from 'api/prices/getPoolPrice'
import { BN } from 'utils/helpers'
import { PRICE_ORACLE_DECIMALS } from 'constants/query'

export default async function getPrice(denom: string): Promise<BigNumber> {
  try {
    const asset = ASSETS.find(byDenom(denom)) as Asset

    if (asset.pythPriceFeedId) {
      return (await getPythPrice(asset.pythPriceFeedId))[0]
    }

    if (asset.hasOraclePrice) {
      const oracleQueryClient = await getOracleQueryClient()
      const priceResponse = await oracleQueryClient.price({ denom: asset.denom })
      const decimalDiff = asset.decimals - PRICE_ORACLE_DECIMALS

      return BN(priceResponse.price).shiftedBy(decimalDiff)
    }

    if (asset.poolId) {
      return await getPoolPrice(asset)
    }

    throw `could not fetch the price info for the given denom: ${denom}`
  } catch (ex) {
    throw ex
  }
}
