import { PerpsInfo } from 'components/perps/PerpsInfo'
import TradeChart from 'components/trade/TradeChart'
import useAllWhitelistedAssets from 'hooks/assets/useAllWhitelistedAssets'
import usePerpsAsset from 'hooks/perps/usePerpsAsset'

export function PerpsChart() {
  const assets = useAllWhitelistedAssets()
  const { perpsAsset } = usePerpsAsset()

  return (
    <div className='order-2 h-full'>
      <TradeChart buyAsset={perpsAsset} sellAsset={assets[1]} title={<PerpsInfo />} />
    </div>
  )
}
