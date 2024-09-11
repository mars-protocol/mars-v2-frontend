import { PerpsInfo } from 'components/perps/PerpsInfo'
import TradeChart from 'components/trade/TradeChart'
import useDepositEnabledAssets from 'hooks/assets/useDepositEnabledAssets'
import usePerpsAsset from 'hooks/perps/usePerpsAsset'

export function PerpsChart() {
  const assets = useDepositEnabledAssets()
  const { perpsAsset } = usePerpsAsset()

  return (
    <div className='order-2 h-full'>
      <TradeChart buyAsset={perpsAsset} sellAsset={assets[1]} title={<PerpsInfo />} />
    </div>
  )
}
