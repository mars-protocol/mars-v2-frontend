import getOraclePrices from 'api/prices/getOraclePrices'
import getPoolPrice from 'api/prices/getPoolPrice'
import fetchPythPrices from 'api/prices/getPythPrices'
import chains from 'configs/chains'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { partition } from 'utils/array'
import { getAllAssetsWithPythId } from 'utils/assets'

export default async function getPrices(chainConfig: ChainConfig): Promise<BNCoin[]> {
  const usdPrice = new BNCoin({ denom: 'usd', amount: '1' })

  const pythAndOraclePrices = []
  const assetsToFetchPrices = useStore
    .getState()
    .chainConfig.assets.filter(
      (asset) => (asset.isEnabled && asset.isMarket) || asset.forceFetchPrice,
    )

  const assetsWithPythPriceFeedId = getAllAssetsWithPythId(chains)
  const pythPrices = await requestPythPrices(assetsWithPythPriceFeedId)
  pythAndOraclePrices.push(...pythPrices)

  try {
    const [assetsWithOraclePrices, assetsWithPoolIds] =
      separateAssetsByPriceSources(assetsToFetchPrices)
    const oraclePrices = await getOraclePrices(chainConfig, assetsWithOraclePrices)
    const poolPrices = await requestPoolPrices(chainConfig, assetsWithPoolIds, pythAndOraclePrices)

    useStore.setState({ isOracleStale: false })

    return [...pythAndOraclePrices, ...oraclePrices, ...poolPrices, usdPrice]
  } catch (ex) {
    console.error(ex)
    let message = 'Unknown Error'
    if (ex instanceof Error) message = ex.message
    if (message.includes('price publish time is too old'))
      useStore.setState({ isOracleStale: true })

    return [...pythAndOraclePrices, usdPrice]
  }
}

async function requestPythPrices(assets: Asset[]): Promise<BNCoin[]> {
  if (!assets.length) return []

  const priceFeedIds = assets
    .map((a) => a.pythPriceFeedId)
    .filter((priceFeedId, index, array) => array.indexOf(priceFeedId) === index) as string[]
  return await fetchPythPrices(priceFeedIds, assets)
}

async function requestPoolPrices(
  chainConfig: ChainConfig,
  assets: Asset[],
  lookupPrices: BNCoin[],
): Promise<BNCoin[]> {
  const requests = assets.map((asset) => getPoolPrice(chainConfig, asset, lookupPrices))

  return await Promise.all(requests).then(mapResponseToBnCoin(assets))
}

const mapResponseToBnCoin = (assets: Asset[]) => (prices: BigNumber[]) => {
  return prices.map((price: BigNumber, index: number) =>
    BNCoin.fromDenomAndBigNumber(assets[index].denom, price),
  )
}

function separateAssetsByPriceSources(assets: Asset[]) {
  const assetsWithoutPythPriceFeedId = assets.filter((asset) => !asset.pythPriceFeedId)

  const [assetsWithOraclePrice, assetsWithoutOraclePrice] = partition(
    assetsWithoutPythPriceFeedId,
    (asset) => asset.hasOraclePrice || !asset.poolId,
  )
  const assetsWithPoolId = assetsWithoutOraclePrice.filter((asset) => !!asset.poolId)

  return [assetsWithOraclePrice, assetsWithPoolId]
}
