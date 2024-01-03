import fetchPythPriceData from 'api/prices/getPythPriceData'

export default async function getPricesData(
  chainConfig: ChainConfig,
  assets: Asset[],
): Promise<string[]> {
  try {
    const assetsWithPythPriceFeedId = assets.filter((asset) => !!asset.pythPriceFeedId)
    return await requestPythPriceData(chainConfig, assetsWithPythPriceFeedId)
  } catch (ex) {
    console.error(ex)
    throw ex
  }
}

async function requestPythPriceData(chainConfig: ChainConfig, assets: Asset[]): Promise<string[]> {
  if (!assets.length) return []

  const priceFeedIds = assets.map((a) => a.pythPriceFeedId) as string[]
  return await fetchPythPriceData(chainConfig, priceFeedIds)
}
