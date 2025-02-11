import { track } from '@vercel/analytics'
import { BNCoin } from 'types/classes/BNCoin'
import { getAssetSymbolByDenom } from 'utils/assets'

export function trackSwap(fromCoin: BNCoin, toCoin: BNCoin, assets: Asset[]) {
  const fromSymbol = getAssetSymbolByDenom(fromCoin.denom, assets)
  const toSymbol = getAssetSymbolByDenom(toCoin.denom, assets)
  const eventName = `Swap ${fromSymbol} → ${toSymbol}`

  console.log('Analytics Event:', eventName)
  track(eventName)
}

export function trackLend(coin: BNCoin, assets: Asset[]) {
  const symbol = getAssetSymbolByDenom(coin.denom, assets)
  const eventName = `Lend ${symbol}`

  console.log('Analytics Event:', eventName)
  track(eventName)
}

export function trackUnlend(coin: BNCoin, assets: Asset[]) {
  const symbol = getAssetSymbolByDenom(coin.denom, assets)
  const eventName = `Unlend ${symbol}`

  track(eventName)
}

export function trackBorrow(coin: BNCoin, assets: Asset[]) {
  const symbol = getAssetSymbolByDenom(coin.denom, assets)
  const eventName = `Borrow ${symbol}`

  track(eventName)
}

export function trackRepay(coin: BNCoin, assets: Asset[]) {
  const symbol = getAssetSymbolByDenom(coin.denom, assets)
  const eventName = `Repay ${symbol}`

  track(eventName)
}

export function trackDeposit(coin: BNCoin, assets: Asset[]) {
  const symbol = getAssetSymbolByDenom(coin.denom, assets)
  const eventName = `Deposit ${symbol}`

  track(eventName)
}

export function trackWithdraw(coin: BNCoin, assets: Asset[]) {
  const symbol = getAssetSymbolByDenom(coin.denom, assets)
  const eventName = `Withdraw ${symbol}`

  track(eventName)
}
