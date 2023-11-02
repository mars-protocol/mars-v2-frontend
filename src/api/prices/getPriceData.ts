import fetchPythPriceData from 'api/prices/getPythPriceData'
import { getPythAssets } from 'utils/assets'

export default async function getPricesData(): Promise<string[]> {
  try {
    const assetsWithPythPriceFeedId = getPythAssets()
    const pythAndOraclePriceData = await requestPythPriceData(assetsWithPythPriceFeedId)
    return pythAndOraclePriceData
  } catch (ex) {
    console.error(ex)
    throw ex
  }
}

async function requestPythPriceData(assets: Asset[]): Promise<string[]> {
  if (!assets.length) return []

  const priceFeedIds = assets.map((a) => a.pythPriceFeedId) as string[]
  return await fetchPythPriceData(...priceFeedIds)
}
