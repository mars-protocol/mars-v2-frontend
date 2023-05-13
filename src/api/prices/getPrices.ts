import { gql, request as gqlRequest } from 'graphql-request'

import { ASSETS } from 'constants/assets'
import { ENV, ENV_MISSING_MESSAGE } from 'constants/env'
import { getMarketAssets } from 'utils/assets'
import { BN } from 'utils/helpers'

export default async function getPrices(): Promise<Coin[]> {
  if (!ENV.URL_GQL || !ENV.ADDRESS_ORACLE) {
    return new Promise((_, reject) => reject(ENV_MISSING_MESSAGE))
  }

  const marketAssets = getMarketAssets()
  const baseCurrency = ASSETS[0]

  const result = await gqlRequest<TokenPricesResult>(
    ENV.URL_GQL,
    gql`
      query PriceOracle {
        prices: wasm {
          ${marketAssets.map((asset) => {
            return `${asset.id}: contractQuery(
              contractAddress: "${ENV.ADDRESS_ORACLE}"
              query: {
                price: {
                  denom: "${asset.denom}"
                }
              }
            )`
          })}   
        }
      }
      `,
  )

  const data: Coin[] = Object.values(result?.prices).reduce((acc: Coin[], curr) => {
    const asset = marketAssets.find((asset) => asset.denom === curr.denom)
    const additionalDecimals = asset
      ? asset.decimals > baseCurrency.decimals
        ? asset.decimals - baseCurrency.decimals
        : 0
      : 0

    return [
      ...acc,
      {
        denom: curr.denom,
        amount: BN(curr.price).shiftedBy(additionalDecimals).toString(),
      },
    ] as Coin[]
  }, [])

  return data
}

interface TokenPricesResult {
  prices: {
    [key: string]: {
      denom: string
      price: string
    }
  }
}
