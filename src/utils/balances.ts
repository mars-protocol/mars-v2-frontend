import { Coin } from '@cosmjs/stargate'

import { getTokenTotalUSDValue, lookup } from './formatters'
import { getTokenSymbol } from './tokens'

export const formatBalances = (
  positionData: Coin[],
  tokenPrices: KeyValuePair,
  debt: boolean,
  marketsData?: MarketData,
): PositionsData[] => {
  const balances: PositionsData[] = []

  positionData.forEach((coin) => {
    const dataEntry: PositionsData = {
      asset: {
        amount: getTokenSymbol(coin.denom),
        type: debt ? 'debt' : undefined,
      },
      value: {
        amount: getTokenTotalUSDValue(coin.amount, coin.denom, tokenPrices),
        format: 'number',
        prefix: '$',
      },
      size: {
        amount: lookup(coin.amount, coin.denom),
        format: 'number',
        maxDecimals: 4,
        minDecimals: 0,
      },
      apy: {
        amount: debt ? Number(marketsData?.[coin.denom].borrow_rate) * 100 : '-',
        format: debt ? 'number' : 'string',
        suffix: '%',
        minDecimals: 0,
      },
    }
    balances.push(dataEntry)
  })

  return balances
}
