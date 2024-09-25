import { PerpsInfo } from 'components/perps/PerpsInfo'
import TradeChart from 'components/trade/TradeChart'
import useWhitelistedAssets from 'hooks/assets/useWhitelistedAssets'
import useChainConfig from 'hooks/chain/useChainConfig'
import usePerpsAsset from 'hooks/perps/usePerpsAsset'
import { byDenom } from 'utils/array'

export function PerpsChart() {
  const chainConfig = useChainConfig()
  const { perpsAsset } = usePerpsAsset()
  const whitlistedAssets = useWhitelistedAssets()
  const stableAsset = whitlistedAssets.find(byDenom(chainConfig.stables[0]))

  return (
    <div className='order-2 h-full'>
      <TradeChart
        buyAsset={perpsAsset}
        sellAsset={stableAsset ?? whitlistedAssets[0]}
        title={<PerpsInfo />}
      />
    </div>
  )
}
