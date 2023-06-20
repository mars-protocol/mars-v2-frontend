import { ASSETS } from 'constants/assets'
import { getEnabledMarketAssets } from 'utils/assets'
import { BN } from 'utils/helpers'
import { getOracleQueryClient } from 'api/cosmwasm-client'

export default async function getPrices(): Promise<Coin[]> {
  try {
    const enabledAssets = getEnabledMarketAssets()
    const oracleQueryClient = await getOracleQueryClient()
    const baseCurrency = ASSETS[0]

    const priceQueries = enabledAssets.map((asset) =>
      oracleQueryClient.price({
        denom: asset.denom,
      }),
    )
    const priceResults = await Promise.all(priceQueries)

    const assetPrices = priceResults.map(({ denom, price }, index) => {
      const asset = enabledAssets[index]
      const decimalDiff = asset.decimals - baseCurrency.decimals

      return {
        denom,
        amount: BN(price).shiftedBy(decimalDiff).toString(),
      }
    })

    return assetPrices
  } catch (ex) {
    throw ex
  }
}
