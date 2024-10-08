import getOraclePrices from 'api/prices/getOraclePrices'
import fetchPythPrices from 'api/prices/getPythPrices'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'

export default async function getPrices(
  chainConfig: ChainConfig,
  assets: Asset[],
): Promise<BNCoin[]> {
  const isSlinky = chainConfig.slinky
  const isPerps = chainConfig.perps
  const pythAndOraclePrices = []
  const assetsToFetchPrices = assets.filter((asset) =>
    isPerps ? asset.isWhitelisted || asset.isPerpsEnabled : asset.isWhitelisted,
  )

  const assetsWithPythPriceFeedId = isSlinky ? [] : assets.filter((asset) => asset.pythPriceFeedId)
  const assetsWithOraclePrices = isSlinky
    ? assetsToFetchPrices
    : assetsToFetchPrices.filter((asset) => !asset.pythPriceFeedId)
  const pythPrices = isSlinky ? [] : await requestPythPrices(assetsWithPythPriceFeedId)

  pythAndOraclePrices.push(...pythPrices)

  try {
    const oraclePrices: BNCoin[] = await getOraclePrices(chainConfig, assetsWithOraclePrices)

    if (oraclePrices) useStore.setState({ isOracleStale: false })

    return [...pythAndOraclePrices, ...oraclePrices]
  } catch (ex) {
    console.error(ex)
    let message = 'Unknown Error'
    if (ex instanceof Error) message = ex.message
    if (message.includes('price publish time is too old'))
      useStore.setState({ isOracleStale: true })

    return [...pythAndOraclePrices]
  }
}

async function requestPythPrices(assets: Asset[]): Promise<BNCoin[]> {
  if (!assets.length) return []

  const priceFeedIds = assets
    .map((a) => a.pythPriceFeedId)
    .filter((priceFeedId, index, array) => array.indexOf(priceFeedId) === index) as string[]
  return await fetchPythPrices(priceFeedIds, assets)
}
