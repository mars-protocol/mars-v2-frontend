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

    const activeLimitOrders: PerpPositionRow[] = []
    limitOrders.forEach((limitOrder) => {
      const perpsLimitOrder = convertTriggerOrderResponseToPerpPosition(
        limitOrder,
        perpAssets,
        perpsConfig,
        computeLiquidationPrice,
      )

      if (perpsLimitOrder) activeLimitOrders.push(perpsLimitOrder)
    })

    return activeLimitOrders
  }, [currentAccount, perpsConfig, limitOrders, perpAssets, computeLiquidationPrice])
}
