import getPoolPrice from 'api/prices/getPoolPrice'
import { bySymbol } from 'utils/array'

async function getMarsPrice(chainConfig: ChainConfig) {
  const marsAsset = chainConfig.assets.find(bySymbol('MARS'))
  if (!marsAsset) return 0
  return await getPoolPrice(chainConfig, marsAsset)
}

export default getMarsPrice
