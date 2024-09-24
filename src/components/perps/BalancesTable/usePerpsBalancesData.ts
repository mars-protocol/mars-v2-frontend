import { useMemo } from 'react'

import { BN_ONE, BN_ZERO } from 'constants/math'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'

import useDepositEnabledAssets from 'hooks/assets/useDepositEnabledAssets'
import usePerpsEnabledAssets from 'hooks/assets/usePerpsEnabledAssets'
import usePerpsConfig from 'hooks/perps/usePerpsConfig'
import usePerpsLimitOrders from 'hooks/perps/usePerpsLimitOrders'
import { BNCoin } from 'types/classes/BNCoin'
import { getAccountNetValue } from 'utils/accounts'
import { byDenom } from 'utils/array'
import { demagnify } from 'utils/formatters'
import { BN } from 'utils/helpers'

export default function usePerpsBalancesTable() {
  const currentAccount = useCurrentAccount()
  const perpAssets = usePerpsEnabledAssets()
  const { data: limitOrders } = usePerpsLimitOrders()
  const { data: perpsConfig } = usePerpsConfig()

  const allAssets = useDepositEnabledAssets()

  return useMemo<PerpPositionRow[]>(() => {
    if (!currentAccount || !currentAccount.perps) return []

    const netValue = getAccountNetValue(currentAccount, allAssets)

    const activePerpsPositions = currentAccount.perps.map((position) => {
      const asset = perpAssets.find(byDenom(position.denom))!

      return {
        asset,
        tradeDirection: position.tradeDirection,
        amount: position.amount,
        denom: position.denom,
        baseDenom: perpsConfig.base_denom,
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

    if (!perpsConfig.base_denom) return activePerpsPositions
    const zeroCoin = BNCoin.fromDenomAndBigNumber(perpsConfig.base_denom, BN_ZERO)

    const activeLimitOrders = limitOrders
      .filter((order) => order['account_id'] === currentAccount.id)
      .map((limitOrder) => {
        const assetPrice = prices.find(byDenom(limitOrder.denom))?.amount ?? BN_ZERO
        const asset = perpAssets.find(byDenom(limitOrder.denom))!
        const amount = BN(limitOrder.size)
        return {
          orderId: limitOrder.order_id,
          asset,
          denom: limitOrder.denom,
          baseDenom: perpsConfig.base_denom,
          tradeDirection: BN(limitOrder.size).isGreaterThanOrEqualTo(0) ? 'long' : 'short',
          amount: amount.abs(),
          type: 'limit',
          pnl: {
            net: BNCoin.fromCoin(limitOrder.keeper_fee).negated(),
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
          entryPrice: BN(limitOrder.trigger_price),
          currentPrice: assetPrice,
          liquidationPrice: BN_ONE, // TODO: 📈 Get actual liquidation price from HC
          leverage: 1,
        } as PerpPositionRow
      })

    return [...activePerpsPositions, ...activeLimitOrders]
  }, [currentAccount, perpAssets, limitOrders])
}
