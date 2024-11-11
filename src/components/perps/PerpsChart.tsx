import { PerpsInfo } from 'components/perps/PerpsInfo'
import TradeChart from 'components/trade/TradeChart'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useWhitelistedAssets from 'hooks/assets/useWhitelistedAssets'
import useChainConfig from 'hooks/chain/useChainConfig'
import useHealthComputer from 'hooks/health-computer/useHealthComputer'
import usePerpsAsset from 'hooks/perps/usePerpsAsset'
import usePerpsLimitOrderRows from 'hooks/perps/usePerpsLimitOrdersRows'
import { usePerpsOrderForm } from 'hooks/perps/usePerpsOrderForm'
import useLiquidationPrice from 'hooks/prices/useLiquidationPrice'
import { useCallback, useMemo } from 'react'
import { OrderType } from 'types/enums'
import { byDenom } from 'utils/array'
import { BN } from 'utils/helpers'

export function PerpsChart() {
  const chainConfig = useChainConfig()
  const { perpsAsset } = usePerpsAsset()
  const whitlistedAssets = useWhitelistedAssets()
  const stableAsset = whitlistedAssets.find(byDenom(chainConfig.stables[0]))
  const currentAccount = useCurrentAccount()
  const currentPerpPosition = currentAccount?.perps.find(byDenom(perpsAsset.denom))
  const { computeLiquidationPrice } = useHealthComputer(currentAccount)
  const activeLimitOrders = usePerpsLimitOrderRows()

  const currentLimitOrders = useMemo(
    () => activeLimitOrders.filter((order) => order.denom === perpsAsset.denom),
    [activeLimitOrders, perpsAsset.denom],
  )

  const liqPrice = useMemo(() => {
    if (!currentPerpPosition) return 0
    return computeLiquidationPrice(perpsAsset.denom, 'perp')
  }, [currentPerpPosition, computeLiquidationPrice, perpsAsset.denom])

  const { liquidationPrice } = useLiquidationPrice(liqPrice)

  const { setLimitPrice, setOrderType, setSelectedOrderType } = usePerpsOrderForm()

  const onCreateLimitOrder = useCallback(
    (price: number) => {
      const newLimitPrice = BN(price)
      setLimitPrice(newLimitPrice, true)
      setOrderType('limit')
      setSelectedOrderType(OrderType.LIMIT)
    },
    [setLimitPrice, setOrderType, setSelectedOrderType],
  )

  return (
    <div className='order-2 h-full'>
      <TradeChart
        buyAsset={perpsAsset}
        sellAsset={stableAsset ?? whitlistedAssets[0]}
        title={<PerpsInfo />}
        isPerps
        perpsPosition={currentPerpPosition}
        liquidationPrice={liquidationPrice ?? undefined}
        limitOrders={currentLimitOrders}
        onCreateLimitOrder={onCreateLimitOrder}
      />
    </div>
  )
}
