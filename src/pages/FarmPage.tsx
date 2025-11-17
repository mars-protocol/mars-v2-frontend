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
  const showHLS = chainConfig.hls && !isOsmosis

  return (
    <div className='flex flex-wrap w-full gap-2 py-8'>
      <FarmIntro />
      
      {/* Active Tables First */}
      {/* Regular Farm Section (Astroport LPs or Osmosis Vaults) */}
      {isOsmosis ? <ActiveVaults /> : <ActiveAstroLps />}

      {/* HLS Staking Section - Active */}
      {showHLS && <ActiveStakingAccounts />}

      {/* HLS Farm Section - Active */}
      {showHLS && <ActiveHlsFarms />}

      {/* Available Tables */}
      {/* Regular Farm Section */}
      {isOsmosis ? <AvailableVaults /> : <AvailableAstroLps />}

      {/* Available High Leverage Staking */}
      {showHLS && <AvailableHlsStakingAssets />}

      {/* Available High Leverage Farms */}
      {showHLS && <AvailableHlsFarms />}
    </div>
  )
}
