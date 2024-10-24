import { PerpsInfo } from 'components/perps/PerpsInfo'
import TradeChart from 'components/trade/TradeChart'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useWhitelistedAssets from 'hooks/assets/useWhitelistedAssets'
import useChainConfig from 'hooks/chain/useChainConfig'
import useHealthComputer from 'hooks/health-computer/useHealthComputer'
import usePerpsAsset from 'hooks/perps/usePerpsAsset'
import usePerpsLimitOrderRows from 'hooks/perps/usePerpsLimitOrdersRows'
import useLiquidationPrice from 'hooks/prices/useLiquidationPrice'
import { useMemo } from 'react'
import { byDenom } from 'utils/array'

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
      />
    </div>
  )
}
