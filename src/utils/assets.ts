import { ASSETS } from 'constants/assets'

export function getAssetByDenom(denom: string): Asset | undefined {
  return ASSETS.find((asset) => asset.denom === denom)
}

export function getAssetBySymbol(symbol: string) {
  return ASSETS.find((asset) => asset.symbol === symbol)
}

export function getEnabledMarketAssets(): Asset[] {
  return ASSETS.filter((asset) => asset.isEnabled && asset.isMarket)
}

export function getBaseAsset() {
  return ASSETS.find((asset) => asset.denom === 'uosmo')!
}

export function getDisplayCurrencies() {
  return ASSETS.filter((asset) => asset.isDisplayCurrency)
}

export function findCoinByDenom(denom: string, coins: BigNumberCoin[]) {
  return coins.find((coin) => coin.denom === denom)
}
