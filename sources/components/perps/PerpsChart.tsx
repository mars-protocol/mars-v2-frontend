import useDepositEnabledAssets from '../../hooks/assets/useDepositEnabledAssets'
import usePerpsAsset from '../../hooks/perps/usePerpsAsset'
import TradeChart from '../trade/TradeChart'
import { PerpsInfo } from './PerpsInfo'

export function PerpsChart() {
  const assets = useDepositEnabledAssets()
  const { perpsAsset } = usePerpsAsset()

  return (
    <div className='order-2 h-full'>
      <TradeChart buyAsset={perpsAsset} sellAsset={assets[1]} title={<PerpsInfo />} />
    </div>
  )
}
