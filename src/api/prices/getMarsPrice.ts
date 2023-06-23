import { BN } from 'utils/helpers'
import getPrice from 'api/prices/getPrice'

const MARS_MAINNET_DENOM = 'ibc/573FCD90FACEE750F55A8864EF7D38265F07E5A9273FA0E8DAFD39951332B580'
const MARS_OSMO_POOL_URL = 'https://lcd-osmosis.blockapsis.com/osmosis/gamm/v1beta1/pools/907'

interface PoolToken {
  denom: string
  amount: string
}

interface PoolAsset {
  token: PoolToken
  weight: string
}

const findPoolAssetByTokenDenom = (assets: PoolAsset[], denom: string) =>
  assets.find((a) => a.token.denom === denom)

async function getMarsPrice() {
  const marsOsmoRate = await getMarsOsmoRate()
  const osmoPrice = await getPrice('uosmo')

  return marsOsmoRate.multipliedBy(osmoPrice.price)
}

const getMarsOsmoRate = async () => {
  const resp = await fetch(MARS_OSMO_POOL_URL).then((res) => res.json())
  const spotPrice = calculateSpotPrice(resp.pool.pool_assets)

  return BN(1).dividedBy(spotPrice)
}

const calculateSpotPrice = (poolAssets: PoolAsset[]) => {
  const assetIn = findPoolAssetByTokenDenom(poolAssets, MARS_MAINNET_DENOM) as PoolAsset

  const assetOut = findPoolAssetByTokenDenom(poolAssets, 'uosmo') as PoolAsset

  const numerator = BN(assetIn.token.amount).div(assetIn.weight)
  const denominator = BN(assetOut.token.amount).div(assetOut.weight)

  return numerator.dividedBy(denominator)
}

export default getMarsPrice
