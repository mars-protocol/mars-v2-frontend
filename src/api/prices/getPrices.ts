import getOraclePrices from 'api/prices/getOraclePrices'
import getPoolPrice from 'api/prices/getPoolPrice'
import fetchPythPrices from 'api/prices/getPythPrices'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { partition } from 'utils/array'

export default async function getPrices(chainConfig: ChainConfig): Promise<BNCoin[]> {
  const usdPrice = new BNCoin({ denom: 'usd', amount: '1' })
  try {
    const assetsToFetchPrices = useStore
      .getState()
      .chainConfig.assets.filter(
        (asset) => (asset.isEnabled && asset.isMarket) || asset.forceFetchPrice,
      )
    const [assetsWithPythPriceFeedId, assetsWithOraclePrices, assetsWithPoolIds] =
      separateAssetsByPriceSources(assetsToFetchPrices)

    const pythAndOraclePrices = (
      await Promise.all([
        requestPythPrices(chainConfig, assetsWithPythPriceFeedId),
        getOraclePrices(chainConfig, assetsWithOraclePrices),
      ])
    ).flat()
    const poolPrices = await requestPoolPrices(chainConfig, assetsWithPoolIds, pythAndOraclePrices)

    useStore.setState({ isOracleStale: false })

    return [...pythAndOraclePrices, ...poolPrices, usdPrice]
  } catch (ex) {
    console.error(ex)
    let message = 'Unknown Error'
    if (ex instanceof Error) message = ex.message
    if (message.includes('price publish time is too old'))
      useStore.setState({ isOracleStale: true })

    throw ex
  }
}

async function requestPythPrices(chainConfig: ChainConfig, assets: Asset[]): Promise<BNCoin[]> {
  if (!assets.length) return []

  const priceFeedIds = assets.map((a) => a.pythPriceFeedId) as string[]
  return await fetchPythPrices(chainConfig, priceFeedIds).then(mapResponseToBnCoin(assets))
}

async function requestPoolPrices(
  chainConfig: ChainConfig,
  assets: Asset[],
  lookupPrices: BNCoin[],
): Promise<BNCoin[]> {
  const requests = assets.map((asset) => getPoolPrice(chainConfig, asset, lookupPrices))

  return await Promise.all(requests).then(mapResponseToBnCoin(assets))
}

const mapResponseToBnCoin = (assets: Asset[]) => (prices: BigNumber[]) =>
  prices.map((price: BigNumber, index: number) =>
    BNCoin.fromDenomAndBigNumber(assets[index].denom, price),
  )

function separateAssetsByPriceSources(assets: Asset[]) {
  // Only fetch Pyth prices for mainnet
  const [assetsWithPythPriceFeedId, assetsWithoutPythPriceFeedId] = partition(
    assets,
    (asset) => !!asset.pythPriceFeedId,
  )

  // Don't get oracle price if it's not mainnet and there is a poolId
  const [assetsWithOraclePrice, assetsWithoutOraclePrice] = partition(
    assetsWithoutPythPriceFeedId,
    (asset) => asset.hasOraclePrice || !asset.poolId,
  )
  const assetsWithPoolId = assetsWithoutOraclePrice.filter((asset) => !!asset.poolId)

  return [assetsWithPythPriceFeedId, assetsWithOraclePrice, assetsWithPoolId]
}
