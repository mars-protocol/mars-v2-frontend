import Banner from 'components/common/Banner'
import usePerpsVault from 'hooks/perps/usePerpsVault'
import { PerpsModule } from 'components/perps/Module/PerpsModule'
import { PerpsChart } from 'components/perps/PerpsChart'
import { PerpsPositions } from 'components/perps/PerpsPositions'
import { Deposit } from 'components/earn/farm/common/Table/Columns/Deposit'
import useWhitelistedAssets from 'hooks/assets/useWhitelistedAssets'

export default function PerpsPage() {
  const { data: vault } = usePerpsVault()
  const whitelistedAssets = useWhitelistedAssets()
  const asset = whitelistedAssets?.find((asset) => asset.denom === vault?.denom)

  return (
    <div className='md:grid flex flex-wrap w-full md:grid-cols-[auto_346px] gap-4'>
      <div>
        <Banner
          asset={asset}
          title={
            <>
              Counterparty vault: earn up to <span className='text-purple'>{vault?.apy}% APY.</span>
            </>
          }
          description={`Earn perps trading fees by depositing ${asset?.symbol} into the counterparty vault, with deposits subject to a ${vault?.lockup.duration}-${vault?.lockup.timeframe} lockup.`}
          button={
            <Deposit vault={vault as PerpsVault} isLoading={false} isPerps buttonColor='primary' />
          }
        />
        <PerpsChart />
      </div>
      <div className='row-span-2'>
        <PerpsModule />
      </div>
      <PerpsPositions />
    </div>
  )
}
