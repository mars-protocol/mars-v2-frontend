import Tab from 'components/earn/Tab'
import { ActiveAstroLps } from 'components/earn/farm/astroLp/ActiveAstroLps'
import { AvailableAstroLps } from 'components/earn/farm/astroLp/AvailableAstroLps'
import FarmIntro from 'components/earn/farm/common/FarmIntro'
import { ActiveVaults } from 'components/earn/farm/vault/ActiveVaults'
import { AvailableVaults } from 'components/earn/farm/vault/AvailableVaults'
import { EARN_TABS } from 'constants/pages'
import useChainConfig from 'hooks/chain/useChainConfig'

export default function AstroLpPage() {
  const chainConfig = useChainConfig()
  return (
    <div className='flex flex-wrap w-full gap-6'>
      <Tab tabs={EARN_TABS} activeTabIdx={1} />
      <FarmIntro />
      {chainConfig.vaults.length > 0 ? (
        <>
          <ActiveVaults /> <AvailableVaults />
        </>
      ) : (
        <>
          <ActiveAstroLps /> <AvailableAstroLps />
        </>
      )}
    </div>
  )
}
