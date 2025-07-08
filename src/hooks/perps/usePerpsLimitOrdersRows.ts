import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import usePerpsEnabledAssets from 'hooks/assets/usePerpsEnabledAssets'
import useHealthComputer from 'hooks/health-computer/useHealthComputer'
import usePerpsConfig from 'hooks/perps/usePerpsConfig'
import usePerpsLimitOrders from 'hooks/perps/usePerpsLimitOrders'
import { useMemo } from 'react'
import { convertTriggerOrderResponseToPerpPosition } from 'utils/perps'

export default function usePerpsLimitOrderRows() {
  const currentAccount = useCurrentAccount()
  const perpAssets = usePerpsEnabledAssets()
  const { data: limitOrders } = usePerpsLimitOrders()
  const { data: perpsConfig } = usePerpsConfig()
  const { computeLiquidationPrice } = useHealthComputer(currentAccount)

  return useMemo<PerpPositionRow[]>(() => {
    if (!currentAccount || !perpsConfig || !limitOrders) return []

    const allOrderIds = new Set<string>()
    limitOrders.forEach((order) => {
      allOrderIds.add(order.order.order_id)
    })

    const filteredOrders = limitOrders.filter((order) => {
      const triggerCondition = order.order.conditions.find(
        (triggerCondition) => 'trigger_order_executed' in triggerCondition,
      )
      if (triggerCondition && 'trigger_order_executed' in triggerCondition) {
        const parentId = triggerCondition.trigger_order_executed.trigger_order_id
        if (parentId && allOrderIds.has(parentId)) {
          return false
        }
      }
      return true
    })

    const activeLimitOrders: PerpPositionRow[] = []
    filteredOrders.forEach((order) => {
      const perpsLimitOrder = convertTriggerOrderResponseToPerpPosition(
        order,
        perpAssets,
        perpsConfig,
        computeLiquidationPrice,
      )
      if (perpsLimitOrder) activeLimitOrders.push(perpsLimitOrder)
    })

    return activeLimitOrders
  }, [currentAccount, perpsConfig, limitOrders, perpAssets, computeLiquidationPrice])
}
