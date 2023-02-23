import { Coin } from '@cosmjs/stargate'

import { convertFromGwei, getTokenTotalUSDValue } from 'utils/formatters'
import { getTokenSymbol } from 'utils/tokens'

export const formatBalances = (
  positionData: Coin[],
  tokenPrices: KeyValuePair,
  debt: boolean,
  marketAssets: Asset[],
  marketsData?: MarketData,
): PositionsData[] => {
  const balances: PositionsData[] = []

  positionData.forEach((coin) => {
    const dataEntry: PositionsData = {
      asset: {
        amount: getTokenSymbol(coin.denom, marketAssets),
        type: debt ? 'debt' : undefined,
      },
      value: {
        amount: getTokenTotalUSDValue(coin.amount, coin.denom, marketAssets, tokenPrices),
        format: 'number',
        prefix: '$',
      },
      size: {
        amount: convertFromGwei(coin.amount, coin.denom, marketAssets),
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
