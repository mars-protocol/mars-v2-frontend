import { PerpsModule } from 'components/perps/Module/PerpsModule'
import PerpsBanner from 'components/perps/PerpsBanner'
import { PerpsChart } from 'components/perps/PerpsChart'
import { PerpsPositions } from 'components/perps/PerpsPositions'
import useWhitelistedAssets from 'hooks/assets/useWhitelistedAssets'
import usePerpsVault from 'hooks/perps/usePerpsVault'

export default function PerpsPage() {
  const { data: vault } = usePerpsVault()
  const whitelistedAssets = useWhitelistedAssets()
  const asset = whitelistedAssets?.find((asset) => asset.denom === vault?.denom)

  if (!asset) return null

  return (
    <div className='flex flex-wrap w-full gap-4 md:grid md:grid-cols-chart'>
      <div className='w-full'>
        <PerpsBanner />
        <PerpsChart />
      </div>
      <div className='w-full row-span-2'>
        <PerpsModule />
      </div>
      <PerpsPositions />
    </div>
  )
}
