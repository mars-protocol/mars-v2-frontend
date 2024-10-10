import { useMemo } from 'react'
import { BN_ONE, BN_ZERO } from 'constants/math'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import { PRICE_ORACLE_DECIMALS } from 'constants/query'
import usePerpsEnabledAssets from 'hooks/assets/usePerpsEnabledAssets'
import usePerpsConfig from 'hooks/perps/usePerpsConfig'
import usePerpsLimitOrders from 'hooks/perps/usePerpsLimitOrders'
import useHealthComputer from 'hooks/health-computer/useHealthComputer'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import { BN } from 'utils/helpers'
import { LiquidationPriceKind } from 'utils/health_computer'

export default function usePerpsLimitOrdersData() {
  const currentAccount = useCurrentAccount()
  const perpAssets = usePerpsEnabledAssets()
  const { data: limitOrders } = usePerpsLimitOrders()
  const { data: perpsConfig } = usePerpsConfig()
  const { computeLiquidationPrice } = useHealthComputer()

  return useMemo<PerpPositionRow[]>(() => {
    if (!currentAccount || !perpsConfig || !limitOrders) return []

    const zeroCoin = BNCoin.fromDenomAndBigNumber(perpsConfig.base_denom, BN_ZERO)
    const activeLimitOrders: PerpPositionRow[] = []
    limitOrders.forEach((limitOrder) => {
      const limitOrderAction = limitOrder.order.actions[0] as ExceutePerpsOrder | undefined
      const limitOrderCondition = limitOrder.order.conditions[0] as TriggerCondition | undefined

      if (!limitOrderAction || !limitOrderCondition) return
      const perpOrder = limitOrderAction.execute_perp_order
      const perpTrigger = limitOrderCondition.oracle_price
      const asset = perpAssets.find(byDenom(perpOrder.denom))!
      const amount = BN(perpOrder.order_size)
      if (!asset) return

      const tradeDirection = BN(perpOrder.order_size).isGreaterThanOrEqualTo(0) ? 'long' : 'short'
      const liquidationPriceKind: LiquidationPriceKind =
        tradeDirection === 'long' ? 'asset' : 'debt'

      const liquidationPrice = computeLiquidationPrice(perpOrder.denom, liquidationPriceKind)
      activeLimitOrders.push({
        orderId: limitOrder.order.order_id,
        asset,
        denom: perpOrder.denom,
        baseDenom: perpsConfig.base_denom,
        tradeDirection,
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
        currentPrice: BN(asset.price?.amount ?? 0).shiftedBy(
          -asset.decimals + PRICE_ORACLE_DECIMALS,
        ),
        liquidationPrice: liquidationPrice !== null ? BN(liquidationPrice) : BN_ONE,
        leverage: 1,
      })
    })

    return activeLimitOrders
  }, [currentAccount, perpsConfig, limitOrders, perpAssets, computeLiquidationPrice])
}
