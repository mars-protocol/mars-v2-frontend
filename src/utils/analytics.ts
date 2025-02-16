import { track } from '@vercel/analytics'
import { BNCoin } from 'types/classes/BNCoin'
import { getAssetSymbolByDenom } from 'utils/assets'
import { removeEmptyCoins } from 'utils/accounts'

export function trackAction(type: TrackActionType, coins: BNCoin | BNCoin[], assets: Asset[]) {
  if (
    [
      'Mint HLS Account',
      'Mint Credit Account',
      'Create Limit Order',
      'Cancel Limit Order',
    ].includes(type)
  ) {
    track(type)
    return
  }

  const coinsArray = Array.isArray(coins) ? coins : [coins]
  const validCoins = removeEmptyCoins(coinsArray.map((coin) => coin.toCoin())).map((coin) =>
    BNCoin.fromCoin(coin),
  )

  if (validCoins.length === 0) return

  let eventName = ''

  switch (type) {
    case 'Swap':
      if (validCoins.length >= 2) {
        const [fromCoin, toCoin] = validCoins
        eventName = `${type} ${getAssetSymbolByDenom(fromCoin.denom, assets)} → ${getAssetSymbolByDenom(toCoin.denom, assets)}`
      }
      break

    case 'Provide LP':
    case 'Withdraw LP':
      if (validCoins.length >= 2) {
        const [coin1, coin2] = validCoins
        eventName = `${type} ${getAssetSymbolByDenom(coin1.denom, assets)}-${getAssetSymbolByDenom(coin2.denom, assets)}`
      }
      break

    case 'Switch Position to Long':
    case 'Switch Position to Short':
      if (validCoins.length >= 1) {
        const symbol = getAssetSymbolByDenom(validCoins[0].denom, assets)
        eventName = `Switch ${symbol} to ${type === 'Switch Position to Long' ? 'Long' : 'Short'}`
      }
      break

    case 'Deposit Into Vault':
    case 'Deposit Into Perps Vault':
      if (validCoins.length >= 1) {
        const symbol = getAssetSymbolByDenom(validCoins[0].denom, assets)
        eventName = `${type} ${symbol}`
      }
      break

    default:
      const symbol = getAssetSymbolByDenom(validCoins[0].denom, assets)
      eventName = `${type} ${symbol}`
  }

  if (eventName) {
    track(eventName)
  }
}
