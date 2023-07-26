import { ENV } from 'constants/env'
import { byDenom, byTokenDenom, partition } from 'utils/array'
import { BN } from 'utils/helpers'
import getPrice from 'api/prices/getPrice'
import { BNCoin } from 'types/classes/BNCoin'
import { BN_ONE } from 'constants/math'

interface PoolToken {
  denom: string
  amount: string
}

interface PoolAsset {
  token: PoolToken
  weight: string
}

export default async function getPoolPrice(
  asset: Asset,
  lookupPricesForBaseAsset?: BNCoin[],
): Promise<BigNumber> {
  if (!asset.poolId) throw 'given asset should have a poolId to fetch the price'

  const [assetRate, baseAsset] = await getAssetRate(asset)
  const baseAssetPrice =
    (lookupPricesForBaseAsset &&
      lookupPricesForBaseAsset.find(byDenom(baseAsset.token.denom))?.amount) ||
    (await getPrice(baseAsset.token.denom))

  if (!baseAssetPrice) throw 'base asset price must be available on Pyth or in Oracle contract'

  return assetRate.multipliedBy(baseAssetPrice)
}

const getAssetRate = async (asset: Asset) => {
  const url = `${ENV.MAINNET_REST_API}osmosis/gamm/v1beta1/pools/${asset.poolId}`
  const response = await fetch(url).then((res) => res.json())

  return calculateSpotPrice(response.pool.pool_assets, asset)
}

const calculateSpotPrice = (poolAssets: PoolAsset[], asset: Asset): [BigNumber, PoolAsset] => {
  const [assetIn, assetOut] = partition(poolAssets, byTokenDenom(asset.denom)).flat()

  const numerator = BN(assetIn.token.amount).dividedBy(assetIn.weight)
  const denominator = BN(assetOut.token.amount).dividedBy(assetOut.weight)
  const spotPrice = BN_ONE.dividedBy(numerator.dividedBy(denominator))

  return [spotPrice, assetOut]
}
