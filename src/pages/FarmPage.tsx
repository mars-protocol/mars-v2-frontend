import Tab from 'components/earn/Tab'
import { ActiveAstroLps } from 'components/earn/farm/astroLp/ActiveAstroLps'
import { AvailableAstroLps } from 'components/earn/farm/astroLp/AvailableAstroLps'
import FarmIntro from 'components/earn/farm/common/FarmIntro'
import { ActiveVaults } from 'components/earn/farm/vault/ActiveVaults'
import { AvailableVaults } from 'components/earn/farm/vault/AvailableVaults'
import { getEarnTabs } from 'constants/pages'
import useChainConfig from 'hooks/chain/useChainConfig'
import useIsOsmosis from 'hooks/chain/useIsOsmosis'

export default function AstroLpPage() {
  const isOsmosis = useIsOsmosis()
  const chainConfig = useChainConfig()
  const tabs = getEarnTabs(chainConfig)

  return (
    <div className='flex flex-wrap w-full gap-6'>
      <Tab tabs={tabs} activeTabIdx={1} />
      <FarmIntro />
      {isOsmosis ? (
        <>
          <ActiveVaults />
          <AvailableVaults />
        </>
      ) : (
        <>
          <ActiveAstroLps />
          <AvailableAstroLps />
        </>
      )}
    </div>
  )
}
