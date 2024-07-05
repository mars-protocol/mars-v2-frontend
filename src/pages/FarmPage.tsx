import Tab from 'components/earn/Tab'
import { ActiveFarms } from 'components/earn/farm/ActiveFarms'
import { ActiveVaults } from 'components/earn/farm/ActiveVaults'
import { AvailableFarms } from 'components/earn/farm/AvailableFarms'
import { AvailableVaults } from 'components/earn/farm/AvailableVaults'
import FarmIntro from 'components/earn/farm/FarmIntro'
import { EARN_TABS } from 'constants/pages'
import useChainConfig from 'hooks/chain/useChainConfig'

export default function FarmPage() {
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
          <ActiveFarms /> <AvailableFarms />
        </>
      )}
    </div>
  )
}
