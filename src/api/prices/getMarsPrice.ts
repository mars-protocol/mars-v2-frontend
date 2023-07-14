import { ASSETS, MARS_MAINNET_DENOM } from 'constants/assets'
import { bySymbol } from 'utils/array'
import getPoolPrice from 'api/prices/getPoolPrice'

async function getMarsPrice() {
  const marsAsset = {
    ...(ASSETS.find(bySymbol('MARS')) as Asset),
    denom: MARS_MAINNET_DENOM,
  }

  return await getPoolPrice(marsAsset)
}

export default getMarsPrice
