import Tab from 'components/earn/Tab'
import VaultsOfficialIntro from 'components/vaults/official/VaultsOfficialIntro'
import { VAUTLS_TABS } from 'constants/pages'
import { AvailableVaults } from 'components/vaults/common/AvailableVaults'
import { vaultsOfficialDummyData } from 'components/vaults/dummyData'

export default function VaultsOfficialPage() {
  return (
    <div className='flex flex-wrap w-full gap-6'>
      <Tab tabs={VAUTLS_TABS} activeTabIdx={0} />
      <VaultsOfficialIntro />
      <AvailableVaults data={vaultsOfficialDummyData} />
    </div>
  )
}
