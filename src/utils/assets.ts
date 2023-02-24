import { ASSETS } from 'constants/assets'

export function getAssetByDenom(denom: string) {
  return ASSETS.find((asset) => asset.denom === denom)
}

export function getAssetBySymbol(symbol: string) {
  return ASSETS.find((asset) => asset.symbol === symbol)
}

export function getMarketAssets(): Asset[] {
  return ASSETS.filter((asset) => asset.isEnabled && asset.isMarket)
}

export function getBaseAsset() {
  return ASSETS.find((asset) => asset.denom === 'uosmo')!
}
