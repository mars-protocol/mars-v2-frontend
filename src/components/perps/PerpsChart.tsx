import { PerpsInfo } from 'components/perps/PerpsInfo'
import TradeChart from 'components/trade/TradeChart'
import usePerpsEnabledAssets from 'hooks/assets/usePerpsEnabledAssets'
import useWhitelistedAssets from 'hooks/assets/useWhitelistedAssets'
import useChainConfig from 'hooks/chain/useChainConfig'
import { useSearchParams } from 'react-router-dom'
import { byDenom } from 'utils/array'

export function PerpsChart() {
  const [searchParams, _] = useSearchParams()
  const chainConfig = useChainConfig()
  const perpsAssets = usePerpsEnabledAssets()
  const whitlistedAssets = useWhitelistedAssets()
  const perpsAssetInParams = searchParams.get('perpsMarket')
  const perpsAsset = perpsAssets.find(byDenom(perpsAssetInParams ?? ''))
  const stableAsset = whitlistedAssets.find(byDenom(chainConfig.stables[0]))

  if (!perpsAsset || !stableAsset) return null

  return (
    <div className='order-2 h-full'>
      <TradeChart buyAsset={perpsAsset} sellAsset={stableAsset} title={<PerpsInfo />} />
    </div>
  )
}
