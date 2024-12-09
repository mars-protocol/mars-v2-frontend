import getOraclePrices from 'api/prices/getOraclePrices'
import fetchPythPrices from 'api/prices/getPythPrices'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'

export default async function getPrices(
  chainConfig: ChainConfig,
  assets: Asset[],
): Promise<BNCoin[]> {
  const pythAndOraclePrices = []

  const assetsWithPythPriceFeedId = assets.filter((asset) => asset.pythPriceFeedId)
  const priceFeedIds = assetsWithPythPriceFeedId.map((asset) => asset.pythPriceFeedId) as string[]
  const feedsToFetch = [...new Set(priceFeedIds)]
  const pythPrices = await fetchPythPrices(feedsToFetch, assetsWithPythPriceFeedId)

  pythAndOraclePrices.push(...pythPrices)

  try {
    const assetsForOracle = assets.filter((asset) => !asset.pythPriceFeedId)
    const oraclePrices: BNCoin[] = await getOraclePrices(chainConfig, assetsForOracle)

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
