import getOraclePrices from 'api/prices/getOraclePrices'
import fetchPythPrices from 'api/prices/getPythPrices'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'

export default async function getPrices(
  chainConfig: ChainConfig,
  assets: Asset[],
): Promise<BNCoin[]> {
  const pythAndOraclePrices = []

  const lendingMarketAssets = assets.filter(
    (asset) => asset.isWhitelisted && asset.isDepositEnabled && !asset.isPerpsEnabled,
  )

  const perpsAssets = assets.filter((asset) => asset.isPerpsEnabled)

  const assetsWithPythPriceFeedId = lendingMarketAssets.filter((asset) => asset.pythPriceFeedId)
  const priceFeedIds = assetsWithPythPriceFeedId.map((asset) => asset.pythPriceFeedId) as string[]
  const pythPrices = await fetchPythPrices(priceFeedIds, assetsWithPythPriceFeedId)

  pythAndOraclePrices.push(...pythPrices)

  try {
    const assetsForOracle = [
      ...perpsAssets,
      ...lendingMarketAssets.filter((asset) => !asset.pythPriceFeedId),
    ]
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
