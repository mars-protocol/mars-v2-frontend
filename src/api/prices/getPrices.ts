import { ASSETS } from 'constants/assets'
import { ENV } from 'constants/env'
import { getEnabledMarketAssets } from 'utils/assets'
import { BN } from 'utils/helpers'
import { getClient } from 'api/cosmwasm-client'

export default async function getPrices(): Promise<Coin[]> {
  try {
    const enabledAssets = getEnabledMarketAssets()
    const client = await getClient()
    const baseCurrency = ASSETS[0]

    const priceQueries = enabledAssets.map((asset) =>
      client.queryContractSmart(ENV.ADDRESS_ORACLE, {
        price: {
          denom: asset.denom,
        },
      }),
    )
    const priceResults: PriceResult[] = await Promise.all(priceQueries)

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
