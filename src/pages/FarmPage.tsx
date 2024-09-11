import Tab from 'components/earn/Tab'
import { ActiveAstroLps } from 'components/earn/farm/astroLp/ActiveAstroLps'
import { AvailableAstroLps } from 'components/earn/farm/astroLp/AvailableAstroLps'
import FarmIntro from 'components/earn/farm/common/FarmIntro'
import { ActiveVaults } from 'components/earn/farm/vault/ActiveVaults'
import { AvailableVaults } from 'components/earn/farm/vault/AvailableVaults'
import { EARN_TABS } from 'constants/pages'
import useIsOsmosis from 'hooks/chain/useIsOsmosis'

export default function AstroLpPage() {
  const isOsmosis = useIsOsmosis()
  return (
    <div className='flex flex-wrap w-full gap-6'>
      <Tab tabs={EARN_TABS} activeTabIdx={1} />
      <FarmIntro />
      {isOsmosis ? (
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
