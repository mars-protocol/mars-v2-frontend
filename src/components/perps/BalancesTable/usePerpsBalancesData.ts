import { useMemo } from 'react'

import { BN_ONE, BN_ZERO } from 'constants/math'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import usePerpsEnabledAssets from 'hooks/assets/usePerpsEnabledAssets'
import usePerpsLimitOrders from 'hooks/perps/usePerpsLimitOrders'
import useChainConfig from 'hooks/useChainConfig'
import usePrices from 'hooks/usePrices'
import { BNCoin } from 'types/classes/BNCoin'
import { getAccountNetValue } from 'utils/accounts'
import { byDenom } from 'utils/array'
import { demagnify } from 'utils/formatters'
import { BN } from 'utils/helpers'

export default function usePerpsBalancesTable() {
  const currentAccount = useCurrentAccount()
  const perpAssets = usePerpsEnabledAssets()
  const chainConfig = useChainConfig()
  const { data: prices } = usePrices()
  const { data: limitOrders } = usePerpsLimitOrders()

  return useMemo<PerpPositionRow[]>(() => {
    if (!currentAccount) return []

    const netValue = getAccountNetValue(currentAccount, prices, chainConfig.assets)

    const activePerpsPositions = currentAccount.perps.map((position) => {
      const asset = perpAssets.find(byDenom(position.denom))!

      return {
        asset,
        tradeDirection: position.tradeDirection,
        amount: position.amount,
        type: 'market',
        pnl: position.pnl,
        entryPrice: position.entryPrice,
        currentPrice: position.currentPrice,
        liquidationPrice: position.entryPrice, // TODO: 📈 Get actual liquidation price from HC
        leverage: position.currentPrice
          .times(demagnify(position.amount.abs(), asset))
          .div(netValue)
          .plus(1)
          .toNumber(),
      } as PerpPositionRow
    })

    if (!limitOrders) return activePerpsPositions
    const ntrn = chainConfig.assets.find((asset) => asset.symbol === 'NTRN')
    const usdc = chainConfig.assets.find((asset) => asset.symbol === 'USDC')

    if (!ntrn || !usdc) return activePerpsPositions
    const assetPrice = prices.find((price) => price.denom == ntrn.denom)?.amount ?? BN_ZERO

    const zeroCoin = BNCoin.fromDenomAndBigNumber(usdc.denom, BN_ZERO)

    const activeLimitOrders = limitOrders
      .filter((order) => order['account_id'] === currentAccount.id)
      .map((limitOrder) => {
        return {
          orderId: limitOrder.order_id,
          asset: ntrn,
          denom: ntrn.denom,
          baseDenom: usdc.denom,
          tradeDirection: 'long',
          amount: BN(100000),
          type: 'limit',
          pnl: {
            net: zeroCoin,
            realized: {
              fees: zeroCoin,
              funding: zeroCoin,
              net: zeroCoin,
              price: zeroCoin,
            },
            unrealized: {
              fees: zeroCoin,
              funding: zeroCoin,
              net: zeroCoin,
              price: zeroCoin,
            },
          },
          entryPrice: BN_ONE,
          currentPrice: assetPrice,
          liquidationPrice: BN_ONE, // TODO: 📈 Get actual liquidation price from HC
          leverage: 1,
        } as PerpPositionRow
      })

    return [...activePerpsPositions, ...activeLimitOrders]
  }, [chainConfig, currentAccount, perpAssets, prices])
}
