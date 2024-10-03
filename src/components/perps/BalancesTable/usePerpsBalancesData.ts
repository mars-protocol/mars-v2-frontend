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
import { demagnify, getCoinValue } from 'utils/formatters'
import { BN } from 'utils/helpers'
import { PRICE_ORACLE_DECIMALS } from 'constants/query'

export default function usePerpsBalancesTable() {
  const currentAccount = useCurrentAccount()
  const perpAssets = usePerpsEnabledAssets()
  const { data: limitOrders } = usePerpsLimitOrders()
  const { data: perpsConfig } = usePerpsConfig()

  const allAssets = useDepositEnabledAssets()

  return useMemo<PerpPositionRow[]>(() => {
    if (!currentAccount || !currentAccount.perps || !perpsConfig) return []

    const netValue = getAccountNetValue(currentAccount, allAssets)

    const activePerpsPositions = currentAccount.perps.map((position) => {
      const asset = perpAssets.find(byDenom(position.denom))!

      return {
        asset,
        tradeDirection: position.tradeDirection,
        amount: position.amount,
        denom: position.denom,
        baseDenom: position.baseDenom,
        type: 'market',
        pnl: position.pnl,
        entryPrice: position.entryPrice,
        currentPrice: position.currentPrice,
        liquidationPrice: position.entryPrice, // TODO: 📈 Get actual liquidation price from HC
        leverage: position.currentPrice
          .times(demagnify(position.amount.abs(), asset))
          .div(netValue)
          .shiftedBy(asset.decimals - PRICE_ORACLE_DECIMALS)
          .toNumber(),
      } as PerpPositionRow
    })

    if (!limitOrders) return activePerpsPositions

    if (!perpsConfig?.base_denom) return activePerpsPositions
    const zeroCoin = BNCoin.fromDenomAndBigNumber(perpsConfig.base_denom, BN_ZERO)
    const activeLimitOrders: PerpPositionRow[] = []
    limitOrders
      .filter((order) => order['account_id'] === currentAccount.id)
      .forEach((limitOrder) => {
        const limitOrderAction = limitOrder.order.actions.find((action) =>
          action.toString().includes('execute_perp_order'),
        ) as ExceutePerpsOrder | undefined
        const limitOrderCondition = limitOrder.order.conditions.find((condition) =>
          condition.toString().includes('oracle_price'),
        ) as TriggerCondition | undefined

        if (!limitOrderAction || !limitOrderCondition) return
        const perpOrder = limitOrderAction.execute_perp_order
        const perpTrigger = limitOrderCondition.oracle_price
        const asset = perpAssets.find(byDenom(perpOrder.denom))!
        const amount = BN(perpOrder.order_size)
        if (!asset) return
        activeLimitOrders.push({
          orderId: limitOrder.order.order_id,
          asset,
          denom: perpOrder.denom,
          baseDenom: perpsConfig.base_denom,
          tradeDirection: BN(perpOrder.order_size).isGreaterThanOrEqualTo(0) ? 'long' : 'short',
          amount: amount.abs(),
          type: 'limit',
          pnl: {
            net: BNCoin.fromCoin(limitOrder.order.keeper_fee).negated(),
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
          entryPrice: BN(perpTrigger.price),
          currentPrice: asset.price?.amount ?? BN_ZERO,
          liquidationPrice: BN_ONE, // TODO: 📈 Get actual liquidation price from HC
          leverage: 1,
        })
      })

    return [...activePerpsPositions, ...activeLimitOrders]
  }, [currentAccount, perpsConfig, allAssets, limitOrders, perpAssets])
}
