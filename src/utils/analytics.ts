import { track } from '@vercel/analytics'
import { BNCoin } from 'types/classes/BNCoin'
import { getAssetSymbolByDenom } from 'utils/assets'
import { removeEmptyCoins } from 'utils/accounts'

export function trackAction(type: TrackActionType, coins: BNCoin | BNCoin[], assets: Asset[]) {
  // Handle account creation events that don't need coins
  if (type === 'Mint HLS Account' || type === 'Mint Credit Account') {
    console.log('Analytics Event:', type)
    track(type)
    return
  }

  const coinsArray = Array.isArray(coins) ? coins : [coins]
  const validCoins = removeEmptyCoins(coinsArray.map((coin) => coin.toCoin())).map((coin) =>
    BNCoin.fromCoin(coin),
  )

  if (validCoins.length === 0) return

  let eventName = ''

  // Handle different event name formats based on type
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

    default:
      // Handle single coin events
      const symbol = getAssetSymbolByDenom(validCoins[0].denom, assets)
      eventName = `${type} ${symbol}`
  }

  if (eventName) {
    console.log('Analytics Event:', eventName)
    track(eventName)
  }
}
