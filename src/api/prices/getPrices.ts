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

    const pricesResponse: PriceResult[] = await client.queryContractSmart(ENV.ADDRESS_ORACLE, {
      prices: { limit: 500 },
    })

    const assetPrices = enabledAssets.map((asset) => {
      const price = pricesResponse.find((response) => response.denom === asset.denom)?.price ?? '0'
      const decimalDiff = asset.decimals - baseCurrency.decimals

      return {
        denom: asset.denom,
        amount: BN(price).shiftedBy(decimalDiff).toString(),
      }
    })

    return assetPrices
  } catch (ex) {
    throw ex
  }
}
