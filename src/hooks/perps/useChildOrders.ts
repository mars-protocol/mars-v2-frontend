import { useMemo } from 'react'
import { TriggerOrderResponse } from 'types/generated/mars-credit-manager/MarsCreditManager.types'

/**
 * Hook to determine if a position has child orders (SL/TP orders)
 */
export default function useChildOrders() {
  /**
   * Check if a position has existing SL/TP orders
   * @param limitOrders Array of trigger orders
   * @param assetDenom Denom of the asset to check orders for
   * @returns Object with hasChildOrders flag
   */
  const hasChildOrders = useMemo(() => {
    return (limitOrders: TriggerOrderResponse[] | undefined, assetDenom?: string) => {
      if (!limitOrders || !assetDenom) return false

      return limitOrders.some((order) => {
        const actions = order.order.actions
        return actions.some(
          (action) =>
            'execute_perp_order' in action &&
            action.execute_perp_order.denom === assetDenom &&
            action.execute_perp_order.reduce_only,
        )
      })
    }
  }, [])

  return { hasChildOrders }
}
