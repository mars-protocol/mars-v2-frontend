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

function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize))
  }
  return chunks
}

export default async function getOraclePrices(
  chainConfig: ChainConfig,
  assets: Asset[],
): Promise<BNCoin[]> {
  if (!assets.length) return []
  try {
    let priceResults: PriceResponse[] = []
    if (chainConfig.isOsmosis) {
      const osmosisOracleQueryClient = await getOracleQueryClientOsmosis(chainConfig)
      priceResults = await iterateContractQuery(osmosisOracleQueryClient.prices)
    } else {
      const neutronOracleQueryClient = await getOracleQueryClientNeutron(chainConfig)
      const denoms = assets.map((asset) => asset.denom)

      const denomChunks = chunkArray(denoms, 3)

      const chunkResults = await Promise.all(
        denomChunks.map(async (chunk) => {
          console.log('querying', { denoms: chunk })
          return await neutronOracleQueryClient.pricesByDenoms({ denoms: chunk })
        }),
      )

      priceResults = chunkResults.reduce((acc: PriceResponse[], result) => {
        if (result && typeof result === 'object') {
          const priceEntries = Object.entries(result).map(([denom, price]) => ({
            denom,
            price: String(price),
          })) as PriceResponse[]
          return [...acc, ...priceEntries]
        }
        return acc
      }, [])
    }

    return assets.map((asset) => {
      const priceResponse = priceResults.find(byDenom(asset.denom)) as PriceResponse
      return getAssetPrice(asset, priceResponse)
    })
  } catch (error) {
    console.error(error)
    try {
      const queryClient = chainConfig.isOsmosis
        ? await getOracleQueryClientOsmosis(chainConfig)
        : await getOracleQueryClientNeutron(chainConfig)
      return Promise.all(
        assets.map(async (asset) => {
          const priceResponse = await queryClient.price({ denom: asset.denom })
          return getAssetPrice(asset, priceResponse)
        }),
      )
    } catch (ex) {
      throw ex
    }
  }
}
