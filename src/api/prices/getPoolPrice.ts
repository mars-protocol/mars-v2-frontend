import { cacheFn, poolPriceCache } from 'api/cache'
import getPrice from 'api/prices/getPrice'
import { BN_ONE } from 'constants/math'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom, byTokenDenom, partition } from 'utils/array'
import { BN } from 'utils/helpers'

interface PoolToken {
  denom: string
  amount: string
}

interface PoolAsset {
  token: PoolToken
  weight: string
}

export default async function getPoolPrice(
  chainConfig: ChainConfig,
  asset: Asset,
  lookupPricesForBaseAsset?: BNCoin[],
): Promise<BigNumber> {
  if (!asset.poolId) throw 'given asset should have a poolId to fetch the price'

  const [assetRate, baseAsset] = await getAssetRate(chainConfig, asset)
  const baseAssetPrice =
    (lookupPricesForBaseAsset &&
      lookupPricesForBaseAsset.find(byDenom(baseAsset.token.denom))?.amount) ||
    (await getPrice(chainConfig, baseAsset.token.denom))

  if (!baseAssetPrice) throw 'base asset price must be available on Pyth or in Oracle contract'

  return assetRate.multipliedBy(baseAssetPrice)
}

const getAssetRate = async (chainConfig: ChainConfig, asset: Asset) => {
  const url = chainConfig.endpoints.pools.replace('POOL_ID', asset.poolId!.toString())
  const response = await cacheFn(
    () => fetch(url).then((res) => res.json()),
    poolPriceCache,
    `poolPrices/${(asset.poolId || 0).toString()}`,
    60,
  )
  const pool = response.pool
  const poolAssets: PoolAsset[] = pool.scaling_factor_controller
    ? [
        {
          token: pool.pool_liquidity[0],
          weight: 1,
        },
        {
          token: pool.pool_liquidity[1],
          weight: 1,
        },
      ]
    : pool.pool_assets

  return calculateSpotPrice(poolAssets, asset)
}

const calculateSpotPrice = (poolAssets: PoolAsset[], asset: Asset): [BigNumber, PoolAsset] => {
  const [assetIn, assetOut] = partition(poolAssets, byTokenDenom(asset.denom)).flat()

  const numerator = BN(assetIn.token.amount).dividedBy(assetIn.weight)
  const denominator = BN(assetOut.token.amount).dividedBy(assetOut.weight)

  const additionalDecimals = asset.decimals - 6
  const spotPrice = BN_ONE.dividedBy(numerator.dividedBy(denominator)).shiftedBy(additionalDecimals)

  return [spotPrice, assetOut]
}
