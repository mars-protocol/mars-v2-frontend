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

export function trackProvideLiquidity(coin1: BNCoin, coin2: BNCoin, assets: Asset[]) {
  const symbol1 = getAssetSymbolByDenom(coin1.denom, assets)
  const symbol2 = getAssetSymbolByDenom(coin2.denom, assets)
  const eventName = `Provide LP ${symbol1}-${symbol2}`

  track(eventName)
}

export function trackWithdrawLiquidity(coin1: BNCoin, coin2: BNCoin, assets: Asset[]) {
  const symbol1 = getAssetSymbolByDenom(coin1.denom, assets)
  const symbol2 = getAssetSymbolByDenom(coin2.denom, assets)
  const eventName = `Withdraw LP ${symbol1}-${symbol2}`

  track(eventName)
}

export function trackMintAccount(accountType: 'credit_account' | 'hls') {
  const eventName = accountType === 'hls' ? 'Mint HLS Account' : 'Mint Credit Account'

  track(eventName)
}

export function trackPerpsOpen(coin: BNCoin, isLong: boolean, assets: Asset[]) {
  const symbol = getAssetSymbolByDenom(coin.denom, assets)
  const eventName = `Open ${symbol} ${isLong ? 'Long' : 'Short'}`

  track(eventName)
}

export function trackPerpsClose(coin: BNCoin, isLong: boolean, assets: Asset[]) {
  const symbol = getAssetSymbolByDenom(coin.denom, assets)
  const eventName = `Close ${symbol} ${isLong ? 'Long' : 'Short'}`
  track(eventName)
}

export function trackClaimRewards(coin: BNCoin, assets: Asset[]) {
  const symbol = getAssetSymbolByDenom(coin.denom, assets)
  const eventName = `Claim ${symbol} Rewards`
  track(eventName)
}
