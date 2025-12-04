import Text from 'components/common/Text'
import { ActiveAstroLps } from 'components/earn/farm/astroLp/ActiveAstroLps'
import { AvailableAstroLps } from 'components/earn/farm/astroLp/AvailableAstroLps'
import { ActiveVaults } from 'components/earn/farm/vault/ActiveVaults'
import { AvailableVaults } from 'components/earn/farm/vault/AvailableVaults'
import FarmIntro from 'components/farm/FarmIntro'
import { ActiveHlsFarms } from 'components/hls/Farm/ActiveHlsFarms'
import { AvailableHlsFarms } from 'components/hls/Farm/AvailableHlsFarms'
import ActiveStakingAccounts from 'components/hls/Staking/ActiveStakingAccounts'
import AvailableHlsStakingAssets from 'components/hls/Staking/AvailableHlsStakingAssets'
import useChainConfig from 'hooks/chain/useChainConfig'
import useIsOsmosis from 'hooks/chain/useIsOsmosis'

export default function FarmPage() {
  const isOsmosis = useIsOsmosis()
  const chainConfig = useChainConfig()
  const showHLS = chainConfig.hls

  return (
    <div className='flex flex-col w-full gap-2 py-8'>
      <FarmIntro />

      {/* Farm Section */}
      <div className='w-full mt-6'>
        <Text size='2xl' className='mb-4 text-white'>
          Farm
        </Text>
        {isOsmosis ? <ActiveVaults /> : <ActiveAstroLps />}
        {isOsmosis ? <AvailableVaults /> : <AvailableAstroLps />}
      </div>

      {/* High Leverage Farms Section */}
      {showHLS && (
        <div className='w-full mt-6'>
          <Text size='2xl' className='mb-4 text-white'>
            High Leverage Farms
          </Text>
          <ActiveStakingAccounts />
          <AvailableHlsStakingAssets />
          <ActiveHlsFarms />
          <AvailableHlsFarms />
        </div>
      )}
    </div>
  )
}
