import getPoolPrice from 'api/prices/getPoolPrice'
import { ASSETS } from 'constants/assets'
import { bySymbol } from 'utils/array'

async function getMarsPrice() {
  const marsAsset = ASSETS.find(bySymbol('MARS'))
  if (!marsAsset) return 0
  return await getPoolPrice(marsAsset)
}

export default getMarsPrice
