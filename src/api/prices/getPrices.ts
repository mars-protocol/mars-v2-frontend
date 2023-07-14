import { getAssetsMustHavePriceInfo } from 'utils/assets'
import { partition } from 'utils/array'
import getPoolPrice from 'api/prices/getPoolPrice'
import fetchPythPrices from 'api/prices/getPythPrices'
import { BNCoin } from 'types/classes/BNCoin'
import getOraclePrices from 'api/prices/getOraclePrices'

export default async function getPrices(): Promise<BNCoin[]> {
  try {
    const assetsToFetchPrices = getAssetsMustHavePriceInfo()
    const [assetsWithPythPriceFeedId, assetsWithOraclePrices, assetsWithPoolIds] =
      separateAssetsByPriceSources(assetsToFetchPrices)

    const pythAndOraclePrices = (
      await Promise.all([
        requestPythPrices(assetsWithPythPriceFeedId),
        getOraclePrices(...assetsWithOraclePrices),
      ])
    ).flat()
    const poolPrices = await requestPoolPrices(assetsWithPoolIds, pythAndOraclePrices)

    return [...pythAndOraclePrices, ...poolPrices]
  } catch (ex) {
    console.error(ex)
    throw ex
  }
}

async function requestPythPrices(assets: Asset[]): Promise<BNCoin[]> {
  const priceFeedIds = assets.map((a) => a.pythPriceFeedId) as string[]

  return await fetchPythPrices(...priceFeedIds).then(mapResponseToBnCoin(assets))
}

async function requestPoolPrices(assets: Asset[], lookupPrices: BNCoin[]): Promise<BNCoin[]> {
  const requests = assets.map((asset) => getPoolPrice(asset, lookupPrices))

  return await Promise.all(requests).then(mapResponseToBnCoin(assets))
}

const mapResponseToBnCoin = (assets: Asset[]) => (prices: BigNumber[]) =>
  prices.map((price: BigNumber, index: number) =>
    BNCoin.fromDenomAndBigNumber(assets[index].denom, price),
  )

function separateAssetsByPriceSources(assets: Asset[]) {
  const [assetsWithPythPriceFeedId, assetsWithoutPythPriceFeedId] = partition(
    assets,
    (asset) => !!asset.pythPriceFeedId,
  )
  const [assetsWithOraclePrice, assetsWithoutOraclePrice] = partition(
    assetsWithoutPythPriceFeedId,
    (asset) => asset.hasOraclePrice,
  )
  const assetsWithPoolId = assetsWithoutOraclePrice.filter((asset) => !!asset.poolId)

  return [assetsWithPythPriceFeedId, assetsWithOraclePrice, assetsWithPoolId]
}
